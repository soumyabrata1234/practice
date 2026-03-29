import "dotenv/config";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

const loader = new TextLoader("./xx.txt");

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 250,
  chunkOverlap: 40,
});
const texts = await splitter.splitDocuments(docs);

//console.log(texts);


if (!process.env.GEMINI_API_KEY) {
  console.error(
    "Please set the GEMINI_API_KEY environment variable before running this script.",
  );
  process.exit(1);
}

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-001",
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "xx.txt chunks",
});

const chunks = texts.map((d) => d.pageContent);
console.log(`Found ${chunks.length} chunks, embedding now...`);
console.log(" ");


const vectors = await embeddings.embedDocuments(chunks);


//console.log("Embedding complete.");
//console.log("First vector length:", vectors[0]?.length);
//console.log("First vector (first 10 dims):", vectors[0]?.slice(0, 10));

//console.log(chunks);