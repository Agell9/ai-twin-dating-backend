const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Send message
router.post("/", async (req, res) => {
  try {
    const { sender_id, receiver_id, content, message_type = "text" } = req.body;

    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({ error: "sender_id, receiver_id, and content are required" });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id,
        receiver_id,
        content,
        message_type,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get conversation between two users
router.get("/conversation/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
      .order("sent_at", { ascending: true })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

// Get user's conversations list
router.get("/conversations/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:user_profiles!sender_id(*),
        receiver:user_profiles!receiver_id(*)
      `)
      .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
      .order("sent_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Group by conversation partner
    const conversations = {};
    data.forEach(message => {
      const partnerId = message.sender_id === user_id ? message.receiver_id : message.sender_id;
      if (!conversations[partnerId] || new Date(message.sent_at) > new Date(conversations[partnerId].sent_at)) {
        conversations[partnerId] = message;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

// Mark messages as read
router.put("/read", async (req, res) => {
  try {
    const { user_id, conversation_partner_id } = req.body;

    const { data, error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("sender_id", conversation_partner_id)
      .eq("receiver_id", user_id)
      .is("read_at", null);

    if (error) {
      throw error;
    }

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

module.exports = router;