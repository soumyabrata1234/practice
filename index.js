import { GoogleGenAI } from "@google/genai";
import readline from "readline";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBtu3kJoIZ8KIjREBFONHtmu2Bng9erQNY",
});

async function main(content) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: content,
  });
  //console.log(response.text);
  return response.text;
}

//main();



const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

 while(true){
  rl.question("You: ", async (name) => {

    if (name === "bye") {
      rl.close();
      return;
    }

    const reply = await main(name);
    console.log("AI:", reply);

    //ask();
  });
 // break;
 }
// function ask() {
//   rl.question("You: ", async (name) => {

//     if (name === "bye") {
//       rl.close();
//       return;
//     }

//     const reply = await main(name);
//     console.log("AI:", reply);

//     ask();
//   });
// }

