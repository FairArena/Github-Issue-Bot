import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';

let pineconeClient = null;
let genAI = null;

function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
  }
  return pineconeClient;
}

function getGeminiClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

async function generateEmbedding(text) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function searchPinecone(query, namespace, topK = 3) {
  try {
    const pc = getPineconeClient();
    const index = pc.index(process.env.PINECONE_INDEX || 'github-repos');

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Search
    const results = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true
    });

    return results.matches || [];
  } catch (err) {
    console.error('Pinecone search error:', err.message);
    return [];
  }
}

export async function upsertToPinecone(namespace, vectors) {
  const pc = getPineconeClient();
  const index = pc.index(process.env.PINECONE_INDEX || 'github-repos');

  await index.namespace(namespace).upsert(vectors);
}

export { generateEmbedding };
