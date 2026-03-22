import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDUGv7dhQmN4XPUGfCQf8T-8NnOM8eHNNY",
});

async function main(content) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: content,
  });
  //console.log(response.text);
  return response.text;
}

const rl = readline.createInterface({ input, output });
let promt="";

while (true) {
  const promtt = await rl.question("You: ");
  if(promtt === "end") break;
  promt += promtt;
  const reply = await main(promt);
  
  console.log(`AI: ${reply}`);
}

// const promt = await rl.question("You: ");
// const reply = await main(promt);
// console.log(`AI: ${reply}`);

rl.close();
