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

// Load the face mesh model
async function loadFaceMeshModel() {
    const model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
    console.log("Face Mesh Model Loaded");
    detectFace(model);
}

// Detect face function
async function detectFace(model) {
    const webcamElement = document.getElementById('webcam');
    const predictions = await model.estimateFaces({input: webcamElement});
    
    if (predictions.length > 0) {
        console.log("Face detected:", predictions);
    }
    
    requestAnimationFrame(() => detectFace(model));
}

// Start the process
document.addEventListener('DOMContentLoaded', async () => {
    await setupWebcam();
    await loadFaceMeshModel();
});
