// const res = await fetch("https://v2.jokeapi.dev/joke/Dark");
// const data = await res.json();

// console.log(" ");
// console.log(data.setup);
// console.log(" ");
// console.log(data.delivery);

// export const joke1 = data.setup;
// export const joke2 = data.delivery

import { tool } from "@langchain/core/tools";
import * as z from "zod";

export const getJoke = tool(
  async ({ category }) => {

    const res = await fetch(
      `https://v2.jokeapi.dev/joke/${category}`
    );

    const data = await res.json();

    if (data.type === "single") {
      return data.joke;
    }

    if (data.type === "twopart") {
      return `${data.setup} - ${data.delivery}`;
    }

    return "Couldn't fetch a joke right now.";
  },
  {
    name: "getjoke",
    description: "Get a random joke. Use when the user asks for a joke or something funny.",
    schema: z.object({
      category: z.string().describe("Joke category like Programming, Dark, Pun, Misc")
    }),
  }
);