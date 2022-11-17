const express = require("express");
const fileUpload = require("express-fileupload");
const faceApiService = require("./faceApiService");

const app = express();
const port = process.env.PORT || 3000;

app.use(fileUpload());

app.post("/detect", async (req, res) => {
 try {
  const { file } = req.files;

  const result = await faceApiService.detect(file.data);

  res.json({
    gender: result.gender,
    age: result.age,
    draw: result.image_detection,
    descriptor: result.descriptor,
  });
 } catch (error) {
  res.status(500).json({
    message: error
  })
 }
});

app.listen(port, () => {
  console.log("Server started on port" + port);
});
