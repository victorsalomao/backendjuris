const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const { OpenAI } = require("openai");

const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY
});

async function extractTextFromFile(file) {
  const ext = file.originalname.split(".").pop().toLowerCase();
  const buffer = file.buffer;

  if (ext === "pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (ext === "txt") {
    return buffer.toString("utf-8");
  } else {
    throw new Error("Formato de arquivo não suportado");
  }
}

const basePrompt = `Prompt Resumido para Análise Jurídico-Processual – Cível/Família/Admin
Solicito análise técnico-jurídica sobre o processo abaixo, com foco na triagem e apoio à decisão judicial.

Dados:
Nº do Processo: [inserir]
Classe/Assunto: [ex: cobrança, alimentos, improbidade]
Partes: [autor, réu, advogados]
Momento Processual: [inicial, contestação, saneamento, instrução, sentença, recurso, cumprimento]
Pedidos: [resumo dos pedidos e defesas]
Prazos Urgentes: [ex: tutela, prescrição, prazo para manifestação]
Questão Central: [ex: validade de cláusula, guarda, responsabilidade civil]
Solicita-se que a análise contenha:
Pontos controvertidos e riscos processuais;
Fundamentos jurídicos aplicáveis (lei e jurisprudência);
Sugestão técnica de despacho, decisão ou sentença, se cabível.
Finalidade: apoiar o juiz com subsídio jurídico claro, objetivo e alinhado à legalidade e eficiência da prestação jurisdicional.`

async function fetchGPTResponse(area, content) {
  const userPrompt = `
Área jurídica: ${area}
Descrição do caso: ${content}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: basePrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return completion.choices[0].message.content;
}

async function analyzePrompt({ file, description}) {
    console.log("DEBUG - arquivo:", file);
    console.log("DEBUG - descrição:", description);
  if (file) {
    const text = await extractTextFromFile(file);
    return text;
  }

  return description;

}

module.exports = { analyzePrompt, fetchGPTResponse };
