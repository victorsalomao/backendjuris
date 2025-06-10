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

const basePrompt = `Prompt de Análise Jurídico-Processual Preliminar – Unidade Jurisdicional:

Solicito análise técnico-jurídica estruturada sobre o seguinte processo:

Número do Processo: [informar]

Classe Processual e Assunto: [ex: ação de cobrança, revisão contratual, guarda, alimentos, improbidade administrativa]

Documentos Relevantes Anexados: [ex: petição inicial, contestação, réplica, provas documentais, laudos, pareceres]

Partes Envolvidas: [ex: autor Fulano, réu Sicrano, advogados, intervenientes]

Momento Processual: [ex: fase postulatória, instrução, decisão interlocutória pendente, sentença, fase de cumprimento]

Pedidos Formulados: [resumo objetivo dos pedidos do autor e eventual reconvenção ou defesa do réu]

Prazos ou Questões Urgentes: [ex: risco de perecimento de direito, prazo de contestação, prescrição, pedido de tutela antecipada]

Questão Central: [ex: validade de cláusula contratual, necessidade de alimentos provisórios, competência, litispendência, interesse de agir]

Requer-se que o parecer contenha:

Identificação das questões controvertidas;

Exame da presença de pressupostos processuais e condições da ação;

Fundamentos jurídicos aplicáveis (legislação, doutrina e jurisprudência);

Sugestão fundamentada para eventual despacho, decisão ou sentença (se for o caso);

Análise de possíveis incidentes processuais (ex: tutela, incidente de desconsideração, provas pendentes, etc.).

Finalidade: subsidiar tecnicamente o(a) juiz(a) na condução processual, com fundamento jurídico claro, objetivo e respeitando os princípios da imparcialidade e da função jurisdicional.`

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
