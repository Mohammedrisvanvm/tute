import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidV4 } from "uuid";
import path from "path";

const app = express();

const PORT = process.env.PORT || 8000;

const store = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + uuidV4() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: store,
});

app.use(
  cors({
    origin: ["http://localhost:3000"],
    Credentials: true,
  })
);

app.use(
  (req,
  res,
  next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
  res.json({
    filePath: req.file.path,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
