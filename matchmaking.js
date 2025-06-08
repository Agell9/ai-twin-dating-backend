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

// Generate match feed for user
router.post("/feed/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 10 } = req.body;

    // Get user's profile for matching
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get potential matches (excluding self)
    const { data: potentialMatches, error: matchesError } = await supabase
      .from("user_profiles")
      .select("*")
      .neq("user_id", user_id)
      .limit(limit * 3);

    if (matchesError) {
      throw matchesError;
    }

    // Generate compatibility scores using AI
    const matchPromises = potentialMatches.map(async (match) => {
      const prompt = `Analyze compatibility between these two users and provide a compatibility score (0-100):
      
      User 1: ${JSON.stringify(userProfile)}
      User 2: ${JSON.stringify(match)}
      
      Consider personality compatibility, shared values, life goals, and relationship preferences.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert matchmaking analyst. Provide compatibility scores and brief explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const compatibility = JSON.parse(response.choices[0].message.content);

      return {
        user_profile: match,
        compatibility_score: compatibility.score || 0,
        compatibility_summary: compatibility.summary || ""
      };
    });

    const matches = await Promise.all(matchPromises);

    // Sort by compatibility score and take top results
    const topMatches = matches
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, limit);

    // Store match feed entries
    const feedEntries = topMatches.map(match => ({
      user_id,
      potential_match_id: match.user_profile.user_id,
      compatibility_score: match.compatibility_score,
      summary_text: match.compatibility_summary,
      created_at: new Date().toISOString()
    }));

    const { data: feedData, error: feedError } = await supabase
      .from("user_match_feed")
      .insert(feedEntries)
      .select();

    if (feedError) {
      throw feedError;
    }

    res.json({
      user_id,
      matches: topMatches,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Matchmaking error:", error);
    res.status(500).json({ error: "Failed to generate match feed" });
  }
});

// Get user's match feed
router.get("/feed/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from("user_match_feed")
      .select(`
        *,
        user_profiles!potential_match_id (*)
      `)
      .eq("user_id", user_id)
      .order("compatibility_score", { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Get match feed error:", error);
    res.status(500).json({ error: "Failed to get match feed" });
  }
});

module.exports = router;