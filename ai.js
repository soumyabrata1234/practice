import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  SystemMessage,
  HumanMessage,
  ToolMessage,
  AIMessage
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import * as z from "zod";
import console from "node:console";

function f(x) {
  console.log(x);
}

const systemMsg = new SystemMessage(
  `You are a helpful Coding Assistent.

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

const addNumbers = tool(
  ({ a, b }) => {
    // return as string so the model sees readable output
    return (a + b);
  },
  {
    name: "add_numbers", // prefer snake_case
    description: "Add two numbers and return the sum.",
    schema: z.object({
      a: z.number().describe("first addend"),
      b: z.number().describe("second addend"),
    }),
  },
);

const getWeather = tool(
  ({ city }) => {
    return `It's sunny in ${city}.`;
  },
  {
    name: "get_weather",
    description: "Get the weather for a city",
    schema: z.object({
      city: z.string().describe("City name"),
    }),
  },
);

const validJokeCategories = ["Any", "Programming", "Misc", "Dark", "Pun", "Spooky", "Christmas"];

const getJoke = tool(
  async ({ category }) => {
    // Default to "Any" if the category is not valid
    const safeCategory = validJokeCategories.includes(category) ? category : "Any";

    const res = await fetch(
      `https://v2.jokeapi.dev/joke/${safeCategory}`
    );

    const data = await res.json();

    if (data.type === "single") {
      return data.joke;
    }

    if (data.type === "twopart") {
      return `${data.setup}\n${data.delivery}`;
    }

    return "Couldn't fetch a joke.";
  },
  {
    name: "get_Joke",
    description: "Use this tool when the user asks for a joke. Valid categories are: Any, Programming, Misc, Dark, Pun, Spooky, Christmas. Use 'Any' if unsure.",
    schema: z.object({
      category: z.string().describe("Joke category. Must be one of: Any, Programming, Misc, Dark, Pun, Spooky, Christmas"),
    }),
  }
);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
}).bindTools([getWeather, getJoke, addNumbers]);

const rl = readline.createInterface({ input, output });

let msg = [systemMsg];

while (true) {
  const userInput = await rl.question("👱🏼: ");

  if (userInput === "end") break;

  msg.push(new HumanMessage(userInput));

  const response = await model.invoke(msg);
  
 //console.log(response);

  if (response.tool_calls?.length) {
    const toolCall = response.tool_calls[0];

    let toolResult;

    if (toolCall.name === "get_weather") {
      toolResult = await getWeather.invoke(toolCall.args);
    }

    if (toolCall.name === "get_Joke") {
      toolResult = await getJoke.invoke(toolCall.args);
    }

    if(toolCall.name === "add_numbers") toolResult = await addNumbers.invoke(toolCall.args);



    // 👇 push AI response (tool call)
    msg.push(new AIMessage (response.content));

    // 👇 push tool result
    const toolMessage = new ToolMessage({
      content: toolResult,
      tool_call_id: toolCall.id,
       name: toolCall.name
    });

    msg.push(toolMessage);

    // 👇 NOW call model with FULL CONTEXT
    const finalResponse = await model.invoke(msg);

    console.log("⚙️: ", finalResponse.content);

    // 👇 store final AI reply
    msg.push(new AIMessage(finalResponse));

  } else {
    console.log("🤖:", response.content);

    msg.push(new AIMessage(response.content)); // simpler, no need to wrap
  }

  console.log(" ");
}

rl.close();
