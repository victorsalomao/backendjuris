const express = require("express");
const multer = require("multer");
const { analyzePrompt, fetchGPTResponse} = require("../utils/extractText");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { area, description } = req.body;
    const file = req.file;

    const content = file
      ? await analyzePrompt({ file })
      : description;

    if (!content || content.trim().length < 20) {
      return res.status(400).json({ error: "Descrição insuficiente." });
    }

    const response = await fetchGPTResponse(area, content);

    if (file) fs.unlinkSync(file.path);

    res.json({ reply: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

module.exports = router;
