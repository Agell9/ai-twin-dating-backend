const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate compatibility evaluation
router.post("/evaluate", async (req, res) => {
  try {
    const { userA, userB } = req.body;

    if (!userA || !userB) {
      return res.status(400).json({ error: "userA and userB are required" });
    }

    const prompt = `Analyze compatibility between two users and provide a detailed evaluation. 
    User A: ${userA}
    User B: ${userB}
    
    Provide a compatibility score (1-100) and detailed analysis.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert relationship compatibility analyst. Provide detailed, insightful compatibility evaluations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const evaluation = JSON.parse(response.choices[0].message.content);

    // Store in Supabase
    const { data, error } = await supabase
      .from("compatibility_evaluations")
      .insert({
        user_a: userA,
        user_b: userB,
        evaluation_output: evaluation,
        summary_text: evaluation.summary || "",
        compatibility_score: evaluation.score || 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Compatibility evaluation error:", error);
    res.status(500).json({ error: "Failed to generate compatibility evaluation" });
  }
});

// Get compatibility evaluation
router.get("/evaluation/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("compatibility_evaluations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Get evaluation error:", error);
    res.status(500).json({ error: "Failed to get compatibility evaluation" });
  }
});

module.exports = router;