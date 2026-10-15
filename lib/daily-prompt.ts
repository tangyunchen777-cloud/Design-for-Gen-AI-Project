const prompts = [
  "The 1 train pauses between stations the moment your professor starts taking attendance.",
  "You carried groceries up six flights and realized the ice cream was the only thing that survived.",
  "Your study group opened the document, chose a font, and called it a productive night.",
  "A campus squirrel makes stronger eye contact than anyone in your seminar.",
  "You dressed for fall in the morning and summer by lunchtime.",
  "The library is silent except for one person typing like they are defusing a bomb.",
  "Your weekend itinerary says museum; your screen-time report says otherwise.",
] as const;

export function getDailyPrompt(date = new Date()) {
  const dayNumber = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
  return prompts[dayNumber % prompts.length];
}
