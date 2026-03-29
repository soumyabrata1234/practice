import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// ========== STORING CODE (already done, commented out) ==========
// import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// const loader = new TextLoader("./xx.txt");
// const docs = await loader.load();
// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 250,
//   chunkOverlap: 40,
// });
// const texts = await splitter.splitDocuments(docs);
// const vectorStore = await PineconeStore.fromDocuments(texts, embeddings, {
//   pineconeIndex,
//   maxConcurrency: 5,
// });
// console.log("✅ All chunks embedded and stored in Pinecone successfully!");
// =================================================================

if (!process.env.GEMINI_API_KEY) {
  console.error("Please set the GEMINI_API_KEY environment variable.");
  process.exit(1);
}

// Embeddings model (for query embedding — use RETRIEVAL_QUERY for searching)
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-001",
  taskType: TaskType.RETRIEVAL_QUERY,
});

// Chat model for generating answers
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

// Connect to existing Pinecone index
const pinecone = new PineconeClient();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

//console.log("✅ Connected to Pinecone vector store!");
console.log("Ask questions about the text file (type 'exit' to quit)\n");

const rl = readline.createInterface({ input, output });

while (true) {
  const question = await rl.question("❓ You: ");
  if (question.toLowerCase() === "exit") break;

  // Retrieve relevant chunks from Pinecone
  const relevantDocs = await vectorStore.similaritySearch(question, 8);

  const results = await vectorStore.similaritySearchWithScore(question, 5);
  const filteredDocs = results
    .filter(([doc, score]) => score > 0.7)
    .slice(0, 4);
  const context = filteredDocs
    .map(([doc, score], i) => {
      return `[Source ${i + 1} | Score: ${score.toFixed(2)}]
${doc.pageContent}`;
    })
    .join("\n\n");

  // const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

  // Build the prompt with retrieved context
//   const prompt = `You are a helpful assistant. Answer the question based ONLY on the following context. If the answer is not in the context, say "I don't have enough information to answer that."

// Context:
// ${context}

// Question: ${question}

// Answer:`;

  const prompt = `
You are an intelligent assistant answering questions based ONLY on the provided context.

Instructions:
- Use only the given context
- If unsure, say "I don't have enough information"
- Prefer higher scoring sources
- Cite sources like [Source 1]

Context:
${context}

Question: ${question}

Answer:
`;

  //const response = await llm.invoke(prompt);

  const response = await llm.invoke(
  prompt
);

  console.log(`\n🤖 AI: ${response.content}\n`);
}

rl.close();