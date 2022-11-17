const save = require("./utils/saveFile");
const path = require("path");

const tf = require("@tensorflow/tfjs-node");

const canvas = require("canvas");

const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
const modelPathRoot = "./models";

let optionsSSDMobileNet;

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function image(file) {
  const decoded = tf.node.decodeImage(file);
  const casted = decoded.toFloat();
  const result = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  return result;
}

async function detect(tensor) {
  const result = await faceapi.detectSingleFace(tensor, optionsSSDMobileNet)
    .withFaceLandmarks().withFaceDescriptor().withAgeAndGender();
  return result;
}

async function main(file) {
  console.log("FaceAPI single-process test");

  await faceapi.tf.setBackend("tensorflow");
  await faceapi.tf.enableProdMode();
  await faceapi.tf.ENV.set("DEBUG", false);
  await faceapi.tf.ready();

  console.log(
    `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${faceapi.version.faceapi
    } Backend: ${faceapi.tf?.getBackend()}`
  );

  console.log("Loading FaceAPI models");
  const modelPath = path.join(__dirname, modelPathRoot);
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);
  await faceapi.nets.ageGenderNet.loadFromDisk(modelPath)
  
  optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5,
  });
  ;

  // const tensor = faceapi.tf.node.decodeImage(file);
  const tensor = await image(file);
  const result = await detect(tensor);

  // const canvasImg = await canvas.loadImage(file);
  // const out = await faceapi.createCanvasFromMedia(canvasImg);
  // faceapi.draw.drawDetections(out, result);
  const out = await _draw_face(file, result)
  // save.saveFile(filename, out.toBuffer("image/jpeg"));
  // console.log(`done, saved results to ${filename}`);

  tensor.dispose();


  result.image_detection = out.toDataURL().split(',')[1]
  result.descriptor = convertBase64(result.descriptor)

  return result;
}

async function _draw_face(image, detections) {
  const canvasImg = await canvas.loadImage(image);
  const canvasResult = await faceapi.createCanvasFromMedia(canvasImg);
  const displaySize = { width: canvasImg.naturalWidth, height: canvasImg.naturalHeight };
  await faceapi.matchDimensions(canvasResult, displaySize);
  const resizedDetections = await faceapi.resizeResults(detections, displaySize);
  canvasResult.getContext("2d").clearRect(0, 0, canvasResult.width, canvasResult.height);
  await faceapi.draw.drawDetections(canvasResult, resizedDetections);
  await faceapi.draw.drawFaceLandmarks(canvasResult, resizedDetections);
  return canvasResult;
}

function convertBase64 (descriptor) {
  let f32base64 = btoa(String.fromCharCode(...(new Uint8Array(descriptor.buffer))));
  return f32base64;
}

module.exports = {
  detect: main,
};
