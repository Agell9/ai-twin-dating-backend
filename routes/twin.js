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

// Generate digital twin
router.post("/generate", async (req, res) => {
  try {
    const { user_id, user_profile } = req.body;

    if (!user_id || !user_profile) {
      return res.status(400).json({ error: "user_id and user_profile are required" });
    }

    const prompt = `Create a comprehensive AI digital twin personality profile based on this user data:
    ${JSON.stringify(user_profile)}
    
    Generate a detailed twin profile with personality traits, emotional insights, relationship guidance style, protective instincts, growth encouragement, and communication tone.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert AI personality architect. Create detailed, emotionally intelligent digital twin profiles that capture the essence of a person's personality for dating assistance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const twinProfile = JSON.parse(response.choices[0].message.content);

    // Store in Supabase
    const { data, error } = await supabase
      .from("twin_states")
      .insert({
        user_id,
        twin_profile: twinProfile,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      user_id,
      twin_profile: twinProfile,
      generated_at: new Date().toISOString(),
      stored: true
    });
  } catch (error) {
    console.error("Twin generation error:", error);
    res.status(500).json({ error: "Failed to generate digital twin" });
  }
});

// Get twin profile
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("twin_states")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Get twin error:", error);
    res.status(500).json({ error: "Failed to get twin profile" });
  }
});

// Update twin profile
router.put("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { twin_profile } = req.body;

    const { data, error } = await supabase
      .from("twin_states")
      .update({ twin_profile })
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Update twin error:", error);
    res.status(500).json({ error: "Failed to update twin profile" });
  }
});

module.exports = router;