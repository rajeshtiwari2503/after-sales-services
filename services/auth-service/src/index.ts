import express from "express";

const app = express();

app.use(express.json());

app.post("/login", (req, res) => {
  res.json({
    success: true,
    message: "Login API",
  });
});

app.listen(4001, () => {
  console.log("Auth Service Running");
});