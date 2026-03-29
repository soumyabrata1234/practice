import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "Please set the GOOGLE_API_KEY environment variable (see docs).",
    );
    process.exit(1);
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001", // recommended embedding model
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Demo document",
  });

  const text =
    "LangChain is the framework for building context-aware reasoning applications";
  const text2 =
    "LangGraph is a library for building stateful, multi-actor applications with LLMs";

  console.log("Embedding a query...");
  const queryVec = await embeddings.embedQuery("What is LangChain?");
  console.log("Query vector length:", queryVec.length);
  console.log("Query vector (first 10 dims):", queryVec.slice(0, 10));

  console.log("Embedding documents and creating a MemoryVectorStore...");
  const vectorstore = await MemoryVectorStore.fromDocuments(
    [
      { pageContent: text, metadata: {} },
      { pageContent: text2, metadata: {} },
    ],
    embeddings,
  );

  const retriever = vectorstore.asRetriever(1);
  const retrieved = await retriever.invoke("What is LangChain?");
  console.log("Retrieved content:", retrieved[0].pageContent);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
