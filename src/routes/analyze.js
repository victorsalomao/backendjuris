const express = require("express");
const multer = require("multer");
const { analyzePrompt, fetchGPTResponse} = require("../utils/extractText");
const fs = require("fs");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { area, description } = req.body;
    const file = req.file;

    // Se tiver arquivo, extrai o conteúdo, senão usa a descrição
    const content = file
      ? await analyzePrompt({ file, description })
      : description;

    if (!content || content.trim().length < 20) {
      return res.status(400).json({ error: "Descrição insuficiente." });
    }

    const response = await fetchGPTResponse(area, content);

    res.json({ reply: response });
  } catch (error) {
    console.error("Erro interno:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

module.exports = router;
