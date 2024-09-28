const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output');
const ctx = canvasElement.getContext('2d');

// Load the face detection model
let model;
async function loadModel() {
    model = await faceDetection.SupportedModels.MediaPipeFaceDetection;
    console.log("Model loaded.");
}

async function setupWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve(videoElement);
        };
    });
}

async function detectFaces() {
    const predictions = await model.estimateFaces(videoElement);

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Clear the canvas
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    if (predictions.length > 0) {
        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.boundingBox;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'green';
            ctx.stroke();
        });
    }

    requestAnimationFrame(detectFaces);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadModel();
    await setupWebcam();
    detectFaces();
});
