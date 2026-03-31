import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import artistRoutes from "./routes/artists.routes";
import "./config/db";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "AMS API healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);

app.get("/", (_req, res) => {
  res.send("My AMS API running");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});