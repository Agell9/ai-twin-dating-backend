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

// Create deep self profile
router.post("/profile", async (req, res) => {
  try {
    const { user_id, responses } = req.body;

    if (!user_id || !responses) {
      return res.status(400).json({ error: "user_id and responses are required" });
    }

    const prompt = `Analyze these deep self-reflection responses and create a comprehensive psychological profile:
    ${JSON.stringify(responses)}
    
    Generate core values, life philosophy, personal growth areas, relationship patterns, and authentic self insights.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert depth psychology analyst. Create detailed self-awareness profiles for authentic relationship matching."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const deepProfile = JSON.parse(response.choices[0].message.content);

    const { data, error } = await supabase
      .from("deep_self_profiles")
      .insert({
        user_id,
        core_values: deepProfile.core_values || [],
        life_philosophy: deepProfile.life_philosophy || "",
        personal_growth_areas: deepProfile.growth_areas || [],
        relationship_patterns: deepProfile.relationship_patterns || {},
        authentic_self_description: deepProfile.authentic_self || "",
        life_goals: deepProfile.life_goals || [],
        deal_breakers: deepProfile.deal_breakers || []
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Deep self profile error:", error);
    res.status(500).json({ error: "Failed to create deep self profile" });
  }
});

// Get deep self profile
router.get("/profile/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("deep_self_profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Get deep self profile error:", error);
    res.status(500).json({ error: "Failed to get deep self profile" });
  }
});

module.exports = router;