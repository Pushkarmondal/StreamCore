import express from "express";
import path from "path";

const app = express();
const PORT = 3008;

app.use(express.static(path.join(process.cwd(), "public")));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
