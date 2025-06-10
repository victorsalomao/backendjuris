const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const analyzeRouter = require("routes/analyze");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/juris-analyze", analyzeRouter);

app.get("/", (req, res) => {
  res.send("JurisGPT API está no ar!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});