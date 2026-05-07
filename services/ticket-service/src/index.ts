import express from "express";

const app = express();

app.use(express.json());

app.get("/tickets", (req, res) => {
  res.json({
    success: true,
    tickets: [],
  });
});

app.listen(4002, () => {
  console.log("Ticket Service Running");
});