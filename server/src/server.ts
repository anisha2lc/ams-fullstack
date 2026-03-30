import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("My AMS API running 🚀");
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});