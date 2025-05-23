import express from "express";

const app = express();

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    Credentials: true,
  })
);



app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
