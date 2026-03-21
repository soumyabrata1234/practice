import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyDRfGWS0C2wQTEiuVhPq7nEa87Kki6yM1E" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "hii, can u solve 5778 +887 without using any extra tool",
  });
  console.log(response.text);
}

main();