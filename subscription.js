const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create subscription
router.post("/", async (req, res) => {
  try {
    const { user_id, plan_name, plan_price, billing_cycle } = req.body;

    if (!user_id || !plan_name || !plan_price) {
      return res.status(400).json({ error: "user_id, plan_name, and plan_price are required" });
    }

    const { data, error } = await supabase
      .from("payment_subscriptions")
      .insert({
        user_id,
        plan_name,
        plan_price,
        billing_cycle: billing_cycle || "monthly",
        subscription_status: "active",
        start_date: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + (billing_cycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

// Get user subscription
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("payment_subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("subscription_status", "active")
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

// Update subscription
router.put("/:subscription_id", async (req, res) => {
  try {
    const { subscription_id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from("payment_subscriptions")
      .update(updateData)
      .eq("id", subscription_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({ error: "Failed to update subscription" });
  }
});

// Cancel subscription
router.delete("/:subscription_id", async (req, res) => {
  try {
    const { subscription_id } = req.params;

    const { data, error } = await supabase
      .from("payment_subscriptions")
      .update({ 
        subscription_status: "cancelled",
        cancelled_at: new Date().toISOString()
      })
      .eq("id", subscription_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

module.exports = router;