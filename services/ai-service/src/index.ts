import express from "express";

const app = express();

app.post("/classify", (req, res) => {
  res.json({
    category: "Electrical Issue",
  });
});

app.listen(4003, () => {
  console.log("AI Service Running");
});