import express from "express";

import { createProxyMiddleware } from
  "http-proxy-middleware";

const app = express();

app.use(
  "/auth",
  createProxyMiddleware({
    target:
      "http://localhost:4001",

    changeOrigin: true,
  })
);

app.use(
  "/tickets",
  createProxyMiddleware({
    target:
      "http://localhost:4002",

    changeOrigin: true,
  })
);

app.listen(4000, () => {
  console.log("API Gateway running");
});