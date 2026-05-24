require("dotenv").config();

const express = require("express");
const cors = require("cors");

const researchRoutes = require("./routes/research.routes");
const savedIdeasRoutes = require("./routes/savedIdeas.routes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "YouTube AI Research API is running",
  });
});

app.use("/api/research", researchRoutes);
app.use("/api/saved-ideas", savedIdeasRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});