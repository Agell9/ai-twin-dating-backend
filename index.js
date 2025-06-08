const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import routes
const compatibilityRoutes = require("./routes/compatibility");
const twinRoutes = require("./routes/twin");
const userRoutes = require("./routes/user");
const emotionalRoutes = require("./routes/emotional");
const deepSelfRoutes = require("./routes/deepself");
const matchmakingRoutes = require("./routes/matchmaking");
const messagesRoutes = require("./routes/messages");
const subscriptionRoutes = require("./routes/subscription");

// API Routes
app.use("/api/compatibility", compatibilityRoutes);
app.use("/api/twin", twinRoutes);
app.use("/api/user", userRoutes);
app.use("/api/emotional", emotionalRoutes);
app.use("/api/deepself", deepSelfRoutes);
app.use("/api/matchmaking", matchmakingRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`AI Twin Dating Backend running on port ${port}`);
});