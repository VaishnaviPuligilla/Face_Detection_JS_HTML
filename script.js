async function setupWebcam() {
    const webcamElement = document.getElementById('webcam');
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });
    webcamElement.srcObject = stream;

    return new Promise((resolve) => {
        webcamElement.onloadedmetadata = () => {
            resolve(webcamElement);
        };
    });
}

async function loadFaceMeshModel() {
    const model = await facemesh.load();
    console.log("Face Mesh Model Loaded");
    detectFace(model);
}

async function detectFace(model) {
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const ctx = canvasElement.getContext('2d');

    const predictions = await model.estimateFaces(webcamElement);

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Clear the canvas before drawing

    if (predictions.length > 0) {
        console.log("Face detected:", predictions);
        predictions.forEach(prediction => {
            const { topLeft, bottomRight } = prediction.boundingBox; // Get bounding box coordinates
            ctx.beginPath();
            ctx.rect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red'; // Box color
            ctx.stroke();
        });
    }

    requestAnimationFrame(() => detectFace(model));
}

document.addEventListener('DOMContentLoaded', async () => {
    await setupWebcam();
    await loadFaceMeshModel();
});
