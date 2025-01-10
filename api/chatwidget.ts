import { createClient } from "@supabase/supabase-js";
import express from "express";
import cors from "cors";

const router = express.Router();

const supabase = createClient(
  "https://zghvrpwozcmfdbkgueic.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaHZycHdvemNtZmRia2d1ZWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NTA5NDUsImV4cCI6MjA1MTUyNjk0NX0.fvX-_KThLaPPWMy81-dgWqSpF-78WFOnHDDMTeNimr0" // Move this to environment variables for security
);

// Apply CORS middleware at the router level
router.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Simplify the handler
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("chatbots").select("*");
    if (error) {
      return res.status(500).json({ error });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
