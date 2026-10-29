import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../lib/gemini.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const models=[{id:'model-a',key:'model-a'},{id:'model-b',key:'model-b'}];
const fakeKey='test-only-placeholder';
function load(fetchImpl,key=fakeKey){
 const exports={};
 vm.runInNewContext(source,{exports,require:(name)=>{assert.equal(name,'server-only');return {};},process:{env:{GEMINI_API_KEY:key}},fetch:fetchImpl,AbortSignal,Date,setTimeout:(callback)=>{callback();}});
 return exports;
}
function response(status,text,tokens){return {ok:status===200,status,json:async()=>({candidates:text?[{content:{parts:[{text}]}}]:[],usageMetadata:tokens,error:{message:fakeKey}})};}
const attempts=[];let calls=0;
const retry=load(async()=>++calls===1?response(429):response(200,'"A real test caption"',{promptTokenCount:21,candidatesTokenCount:5}));
assert.deepEqual(JSON.parse(JSON.stringify(await retry.createCaption('Test prompt',undefined,models,async a=>attempts.push(a)))),{caption:'A real test caption',model:'model-a'});
assert.equal(attempts.length,2);assert.equal(attempts[0].http_status,429);assert.equal(attempts[1].input_tokens,21);assert.equal(attempts[1].output_tokens,5);
assert.ok(!JSON.stringify(attempts).includes(fakeKey),'Diagnostics leaked raw provider error data');
const fallback=[];
await load(async url=>url.includes('model-a')?response(404):response(200,'Fallback caption')).createCaption('Test prompt',undefined,models,async a=>fallback.push(a));
assert.equal(fallback.length,2);assert.equal(fallback[1].model_key,'model-b');
const network=[];
await assert.rejects(load(async()=>{throw new Error(fakeKey);}).createCaption('Test prompt',undefined,[models[0]],async a=>network.push(a)),/study break/);
assert.equal(network.length,2);assert.ok(network.every(a=>a.http_status===null&&!a.success));assert.ok(!JSON.stringify(network).includes(fakeKey));
await assert.rejects(load(async()=>{throw new Error('Should not call provider');},'').createCaption('Test prompt',undefined,models,async()=>{}),/not configured/);
console.log('PASS: retry, fallback, network failure, token counts, safe diagnostics, and missing-key handling');
