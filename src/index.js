import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidV4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
const app = express();

const PORT = process.env.PORT || 8000;

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/upload", upload.single("file"), (req, res) => {
  const generateId = uuidV4();
  const videoPath = req.file.path;
  const outputPath = `uploads/courses/${generateId}.mp4`;
  const hlsPath = `${outputPath}/index.m3u8`;
  console.log(videoPath, "hls path", hlsPath);
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  //   const ffmpegCommand = `-i ${videoPath} -codec:v libx264 -codec:a aac -hls_time| 10 −hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  //   exec(ffmpeg(ffmpegCommand), (error, stdout, stderr) => {
  //     if (error) {
  //       console.error(`Error: ${error.message}`);
  //       return;
  //     }

  ffmpeg(videoPath)
    .outputOptions([
      "-codec:v libx264",
      "-codec:a aac",
      "-hls_time 6",
      "-hls_playlist_type vod",
      `-hls_segment_filename ${outputPath}/segment%03d.ts`,
    ])
    .output(hlsPath)
    .on("start", (cmd) => console.log(`Started: ${cmd}`))
    .on("progress", (p) =>
      console.log(`Progress: ${p.percent}%`)
    )
    .on("end", () => console.log("✅ HLS conversion completed!"))
    .on("error", (err) => console.error("❌ Error:", err.message))
    .run();

  const videoUrl = `http://localhost:${PORT}/${hlsPath}`;

  res.json({
    message: "video converted to hls format",
    videoUrl,
    generateId,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
