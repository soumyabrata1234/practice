import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const systemMsg = new SystemMessage(
  `You are a helpful ICDS Supervisior.

Your goal is to help students understand programming and data structures clearly.

Instructions:
- Give simple explanations before technical definitions.
- Keep answers concise (3–6 sentences by default).
- Prefer intuition and small examples over long textbook explanations.
- Avoid very long bullet lists unless the user asks for detailed notes.
- When explaining programming concepts, include a small code example if useful.
- Assume the student is a beginner and learning step-by-step.
- If the question is simple, answer in 2–3 sentences.
- If the student asks for deeper explanation, then provide more details. `,
);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: "AIzaSyDXrdcw9oWH3cllYXRwOwyYjska4mdCJAM",
});

const rl = readline.createInterface({ input, output });
let promt = "";
let msg=[systemMsg];

while (true) {

  const promtt = await rl.question("👱🏼: ");
  if (promtt === "end") break;
  const messages = [systemMsg, promtt];
  msg.push(promtt);
  const stream = await model.invoke(msg);
  console.log("🤖: " + stream.text);
  console.log(" ");
}
//console.log(typeof (systemMsg));
rl.close();
