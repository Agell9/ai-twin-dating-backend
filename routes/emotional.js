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

// Create emotional profile
router.post("/profile", async (req, res) => {
  try {
    const { user_id, responses } = req.body;

    if (!user_id || !responses) {
      return res.status(400).json({ error: "user_id and responses are required" });
    }

    const prompt = `Analyze these emotional responses and create a comprehensive emotional profile:
    ${JSON.stringify(responses)}
    
    Generate emotional intelligence metrics, attachment style, communication patterns, and relationship preferences.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert emotional intelligence analyst. Create detailed emotional profiles for dating compatibility."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const emotionalProfile = JSON.parse(response.choices[0].message.content);

    const { data, error } = await supabase
      .from("emotional_profiles")
      .insert({
        user_id,
        emotional_intelligence_score: emotionalProfile.ei_score || 0,
        attachment_style: emotionalProfile.attachment_style || "",
        communication_patterns: emotionalProfile.communication_patterns || [],
        relationship_preferences: emotionalProfile.relationship_preferences || {},
        emotional_triggers: emotionalProfile.triggers || [],
        support_needs: emotionalProfile.support_needs || []
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Emotional profile error:", error);
    res.status(500).json({ error: "Failed to create emotional profile" });
  }
});

// Get emotional profile
router.get("/profile/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("emotional_profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Get emotional profile error:", error);
    res.status(500).json({ error: "Failed to get emotional profile" });
  }
});

module.exports = router;