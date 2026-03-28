import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { initChatModel, createAgent, providerStrategy } from "langchain";
import "dotenv/config";



const contactInfoSchema = {
  "type": "object",
  "description": "Contact information for a person.",
  "properties": {
    "name": { "type": "string", "description": "The name of the person" },
    "email": { "type": "string", "description": "The email address of the person" },
    "phone": { "type": "string", "description": "The phone number of the person" }
  },
  "required": ["name", "email", "phone"]
}

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 1.8,
   responseFormat: providerStrategy(contactInfoSchema)
});

const agent = createAgent({
    model: model,
    tools: [],
    responseFormat: providerStrategy(contactInfoSchema)
});



const result = await agent.invoke({
    messages: [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
});

console.log("AI:", result);
//const response = await model.invoke("Hii, what is RAM in a processor, in 20 words");

//console.log(response.content);

