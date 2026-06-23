const {
  analyzeViralPotential,
} = require("../services/viralCheck.service");

async function analyzeViralCheck(req, res) {
  try {
    const result = await analyzeViralPotential(req.body || {});

    return res.status(200).json(result);
  } catch (error) {
    console.error("Viral check error:", error.message);

    return res.status(Number(error.statusCode) || 500).json({
      message: error.message || "Failed to analyze viral potential.",
    });
  }
}

module.exports = {
  analyzeViralCheck,
};
