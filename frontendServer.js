import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// app.get("/another", (req, res) => {
//   res.sendFile(path.join(__dirname, "anotherFile.html"));
// });

app.listen(5000, () => {
  console.log("Frontend server running at http://localhost:5000");
});
