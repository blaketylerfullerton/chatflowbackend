require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store thread mappings (botId -> threadId)
const threadMap = new Map();

// Helper to get or create thread
async function getOrCreateThread(botId) {
  if (!threadMap.has(botId)) {
    const thread = await openai.beta.threads.create();
    threadMap.set(botId, thread.id);
    return thread.id;
  }
  return threadMap.get(botId);
}

// Helper to wait for run completion
async function waitForRunCompletion(threadId, runId) {
  let run;
  do {
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (run.status === "failed") {
      throw new Error(`Run failed: ${run.last_error}`);
    }
    if (run.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (run.status !== "completed");
  return run;
}

// ChatGPT API endpoint using Assistants API
app.post("/api/chat/:botId", async (req, res) => {
  try {
    const { message } = req.body;
    const botId = req.params.botId;

    // Get or create thread
    const threadId = await getOrCreateThread(botId);

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Create a run with the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_MqaYvbBh8MIb1H7aCecubN1n",
    });

    // Wait for run completion
    await waitForRunCompletion(threadId, run.id);

    // Retrieve messages
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0];

    // Send response back to client
    res.json({
      response: lastMessage.content[0].text.value,
      threadId: threadId,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred while processing your request",
      details: error.message,
    });
  }
});

// Endpoint to create a new assistant
app.post("/api/assistants", async (req, res) => {
  try {
    const { name, instructions, model = "gpt-4-1106-preview" } = req.body;

    const assistant = await openai.beta.assistants.create({
      name,
      instructions,
      model,
      tools: [{ type: "code_interpreter" }],
    });

    res.json({ assistant });
  } catch (error) {
    console.error("Error creating assistant:", error);
    res.status(500).json({
      error: "Failed to create assistant",
      details: error.message,
    });
  }
});

// Endpoint to update an assistant
app.put("/api/assistants/:assistantId", async (req, res) => {
  try {
    const { assistantId } = req.params;
    const { name, instructions } = req.body;

    const assistant = await openai.beta.assistants.update(assistantId, {
      name,
      instructions,
    });

    res.json({ assistant });
  } catch (error) {
    console.error("Error updating assistant:", error);
    res.status(500).json({
      error: "Failed to update assistant",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
