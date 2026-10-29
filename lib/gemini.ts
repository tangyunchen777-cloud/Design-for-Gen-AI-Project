import "server-only";
type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  usageMetadata?: { promptTokenCount?:number; candidatesTokenCount?:number };
};
export type CaptionImage = {base64:string;mimeType:"image/jpeg"|"image/png"|"image/webp"};
export type ModelConfig = {id:string;key:string};
export type Attempt = {model_id:string;model_key:string;attempt:number;http_status:number|null;success:boolean;output_text:string;error_message:string|null;latency_ms:number;input_tokens:number|null;output_tokens:number|null};
export function captionInstruction(prompt:string,hasImage:boolean){
  return [hasImage?"Look closely at the attached image and write one original, concise, campus-friendly caption about what is visibly happening.":"Write one original, concise, campus-friendly caption for the scene in the prompt.",
    "Be playful, not cruel. Never target protected traits, reveal private information, or explain the joke.",
    "Do not identify real people or infer sensitive traits.","Return only the caption, with no quotation marks.",prompt].join("\n");
}
export async function createCaption(prompt:string,image:CaptionImage|undefined,models:ModelConfig[],record:(attempt:Attempt)=>Promise<void>){
  const apiKey=process.env.GEMINI_API_KEY;
  if(!apiKey)throw new Error("AI captioning is not configured yet.");
  const parts:Array<Record<string,unknown>>=[{text:prompt}];
  if(image)parts.push({inlineData:{mimeType:image.mimeType,data:image.base64}});
  let attemptNumber=0;
  for(const model of models.slice(0,3)){
    if(!/^[a-zA-Z0-9._-]{1,100}$/.test(model.key))continue;
    for(let retry=0;retry<2;retry++){
      const started=Date.now();let status:number|null=null,payload:GeminiResponse={},caption="";
      try{
        const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.key)}:generateContent`,{
          method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},
          body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{temperature:1.1,maxOutputTokens:80}}),
          cache:"no-store",signal:AbortSignal.timeout(12_000),
        });
        status=response.status;payload=await response.json() as GeminiResponse;
        if(response.ok)caption=payload.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim().replace(/^['\"]|['\"]$/g,"").slice(0,280)||"";
      }catch{/* Do not persist raw provider errors, image bytes, headers, or credentials. */}
      await record({model_id:model.id,model_key:model.key,attempt:++attemptNumber,http_status:status,success:Boolean(caption),output_text:caption,
        error_message:caption?null:status===null?"Network error or provider timeout.":status===200?"Provider returned no usable caption.":`Provider returned HTTP ${status}.`,
        latency_ms:Date.now()-started,input_tokens:payload.usageMetadata?.promptTokenCount??null,output_tokens:payload.usageMetadata?.candidatesTokenCount??null});
      if(caption)return {caption,model:model.key};
      if(retry===0&&(status===null||status===429||status>=500)){await new Promise(resolve=>setTimeout(resolve,650));}else break;
    }
  }
  throw new Error("The AI is taking a study break. Please try again shortly.");
}
