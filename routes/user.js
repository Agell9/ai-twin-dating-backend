const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create user profile
router.post("/profile", async (req, res) => {
  try {
    const profileData = req.body;

    const { data, error } = await supabase
      .from("user_profiles")
      .insert(profileData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({ error: "Failed to create user profile" });
  }
});

// Get user profile
router.get("/profile/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

// Update user profile
router.put("/profile/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

// Delete user profile
router.delete("/profile/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", user_id);

    if (error) {
      throw error;
    }

    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ error: "Failed to delete user profile" });
  }
});

module.exports = router;