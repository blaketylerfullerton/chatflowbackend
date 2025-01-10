import { OpenAI } from "openai";
import dotenv from "dotenv";
import cors from "cors"; // Add this import

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const threadMap = new Map();

async function getOrCreateThread(botId) {
  if (!threadMap.has(botId)) {
    const thread = await openai.beta.threads.create();
    threadMap.set(botId, thread.id);
    return thread.id;
  }
  return threadMap.get(botId);
}

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

// Apply CORS middleware correctly
export default async function handler(req, res) {
  cors()(req, res, async () => {
    // Ensure CORS is applied here
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { message } = req.body;
      const { botId } = req.query;

      const threadId = await getOrCreateThread(botId);

      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      });

      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: "asst_MqaYvbBh8MIb1H7aCecubN1n",
      });

      await waitForRunCompletion(threadId, run.id);

      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data[0];

      res.json({
        response: lastMessage.content[0].text.value,
        threadId,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
