import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";

const apiKey = "AIzaSyDUGv7dhQmN4XPUGfCQf8T-8NnOM8eHNNY";

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}

const model = new ChatGoogleGenerativeAI({
  apiKey,
  model: "gemini-2.5-flash",
  temperature: 0,
});

const add = tool(
  async ({ a, b }) => a + b,
  {
    name: "add",
    description: "Add two numbers.",
    schema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
  },
);

const tools = [add];
const modelWithTools = model.bindTools(tools);

async function callModel(state) {
  const response = await modelWithTools.invoke([
    new SystemMessage(
      "You are a helpful assistant. Use the add tool for addition questions."
    ),
    ...state.messages,
  ]);

  return { messages: [response] };
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition)
  .addEdge("tools", "agent")
  .compile();

async function runAgent(prompt) {
  const result = await graph.invoke({
    messages: [new HumanMessage(prompt)],
  });

  return result.messages.at(-1);
}

async function main() {
  const promptFromArgs = process.argv.slice(2).join(" ").trim();

  if (promptFromArgs) {
    const finalMessage = await runAgent(promptFromArgs);
    console.log(finalMessage?.content);
    return;
  }

  const rl = readline.createInterface({ input, output });

  try {
    const prompt = await rl.question("Ask something: ");
    const finalMessage = await runAgent(prompt);
    console.log(finalMessage?.content);
  } finally {
    rl.close();
  }
}

await main();
