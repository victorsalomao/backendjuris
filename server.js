const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const analyzeRouter = require("./src/routes/analyze");



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