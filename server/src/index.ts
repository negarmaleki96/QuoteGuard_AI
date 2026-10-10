import cors from "cors"; import dotenv from "dotenv"; import express from "express"; import { analyzeRfq } from "./services/analyze.js";

dotenv.config();

const app = express(); app.use(express.json({ limit: "16kb" })); app.use(   cors({     origin: process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()).filter(Boolean) ?? ["http://localhost:5173"],     methods: ["GET", "POST", "OPTIONS"],   }), );

app.get("/health", (_req, res) => {   res.json({ ok: true, service: "quoteguard-server" }); });

app.post("/api/analyze", async (req, res) => {   try {     const result = await analyzeRfq(req.body);     res.json(result);   } catch (error) {     const message = error instanceof Error ? error.message : "Unknown error";     res.status(400).json({ ok: false, error: message });   } });

const port = Number(process.env.PORT ?? 8787); app.listen(port, "0.0.0.0", () => {   console.log(`QuoteGuard backend listening on http://0.0.0.0:${port}`); });
