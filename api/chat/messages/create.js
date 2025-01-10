import OpenAI from "openai";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow specific headers
  try {
    // Initialize OpenAI client with API key from environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get thread ID from query parameters
    const threadId = req.query.threadId;

    if (!threadId) {
      throw new Error("Thread ID is required in query params");
    }

    // Retrieve thread messages
    const threadMessages = await openai.beta.threads.messages.create(threadId);

    // Return thread messages
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(threadMessages);
  } catch (error) {
    console.error("Error retrieving thread messages:", error);

    // Return appropriate error response
    res.status(error.status || 500).json({
      error: error.message,
      type: error.type || "internal_server_error",
    });
  }
}
