let facemesh;
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output');
const ctx = canvasElement.getContext('2d');

async function setupWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve(videoElement);
        };
    });
}

async function loadFaceMeshModel() {
    facemesh = await facemesh.load();
    console.log("Face Mesh Model Loaded");
}

async function detectFace() {
    const predictions = await facemesh.estimateFaces(videoElement);
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    if (predictions.length > 0) {
        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.boundingBox.topLeft;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'green';
            ctx.stroke();
        });
    }

    requestAnimationFrame(detectFace);
}

document.addEventListener('DOMContentLoaded', async () => {
    await setupWebcam();
    await loadFaceMeshModel();
    detectFace();
});
