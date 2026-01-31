import { Client, Functions } from 'node-appwrite';

export async function queueAIProcessor(data) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const functions = new Functions(client);

  try {
    await functions.createExecution(
      process.env.AI_PROCESSOR_FUNCTION_ID,
      JSON.stringify(data),
      false, // not async (we want it to run now)
      '/',
      'POST'
    );
  } catch (err) {
    console.error('Failed to queue AI processor:', err.message);
    // Don't throw - we don't want to fail the webhook
  }
}
