require("dotenv").config();

const express = require("express");
const cors = require("cors");

const researchRoutes = require("./routes/research.routes");
const savedIdeasRoutes = require("./routes/savedIdeas.routes");
const dataPrivacyRoutes = require("./routes/dataPrivacy.routes");
const youtubeRoutes = require("./routes/youtube.routes");
const {
  startDataPrivacyPurgeCron,
} = require("./jobs/dataPrivacyPurgeCron");

const app = express();

function normalizeOrigin(origin) {
  return String(origin || "").trim().replace(/\/$/, "");
}

function getAllowedOrigins() {
  const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
  ];

  const envOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map(normalizeOrigin)
    .filter(Boolean);

  return [...new Set([...defaultOrigins, ...envOrigins])];
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman, mobile apps, server-to-server calls, and curl.
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", cleanOrigin);
      console.error("Allowed origins:", allowedOrigins);

      return callback(new Error(`CORS blocked for origin: ${cleanOrigin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "YouTube AI Research API is running",
  });
});

app.use("/api/research", researchRoutes);
app.use("/api/saved-ideas", savedIdeasRoutes);
app.use("/api/data-privacy", dataPrivacyRoutes);
app.use("/api/youtube", youtubeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startDataPrivacyPurgeCron();
});