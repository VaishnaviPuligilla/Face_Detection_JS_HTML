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
            const start = prediction.boundingBox.topLeft;
            const end = prediction.boundingBox.bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];

            ctx.beginPath();
            ctx.rect(start[0], start[1], size[0], size[1]);
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
