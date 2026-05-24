const express = require("express");
const router = express.Router();

const {
  createSavedIdea,
  getSavedIdeas,
  deleteSavedIdea,
} = require("../controllers/savedIdeas.controller");

router.post("/", createSavedIdea);
router.get("/", getSavedIdeas);
router.delete("/:id", deleteSavedIdea);

module.exports = router;