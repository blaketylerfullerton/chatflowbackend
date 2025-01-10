export default async function handler(req, res) {
  console.log("Health endpoint hit"); // Add logging
  try {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}
