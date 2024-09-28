let facemesh;

async function loadFaceMeshModel() {
    facemesh = await facemesh.load(); // Make sure this line is correct
    console.log("Face Mesh Model Loaded");
    detectFace();
}

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

async function detectFace() {
    const webcamElement = document.getElementById('webcam');

    const predictions = await facemesh.estimateFaces(webcamElement);
    if (predictions.length > 0) {
        console.log("Face detected:", predictions);
    }

    requestAnimationFrame(detectFace);
}

document.addEventListener('DOMContentLoaded', async () => {
    await setupWebcam(); // Setup webcam first
    await loadFaceMeshModel(); // Then load the model
});
