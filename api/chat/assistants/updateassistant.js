import OpenAI from "openai";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow specific headers

  console.log("trying to get assistant");
  try {
    console.log("assistant hit");
    // Initialize OpenAI client with API key from environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get assistant ID from query parameters or use default
    const assistantId =
      req.query.assistantId || process.env.DEFAULT_ASSISTANT_ID;

    if (!assistantId) {
      throw new Error(
        "Assistant ID is required either in query params or environment variables"
      );
    }

    // Retrieve assistant details
    const assistant = await openai.beta.assistants.update(assistantId);

    // Return assistant details
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(assistant);
  } catch (error) {
    console.error("Error retrieving assistant:", error);

    // Return appropriate error response
    res.status(error.status || 500).json({
      error: error.message,
      type: error.type || "internal_server_error",
    });
  }
}
