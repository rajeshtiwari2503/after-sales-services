import express from "express";

const app = express();

app.post("/create-order", (req, res) => {
  res.json({
    success: true,
  });
});

app.listen(4005, () => {
  console.log("Billing Service Running");
});