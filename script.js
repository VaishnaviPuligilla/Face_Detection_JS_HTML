let facemesh; // Declare the global variable for the Face Mesh model

// Load the face mesh model
async function loadFaceMeshModel() {
    facemesh = await facemesh.load(); // Load the Face Mesh model
    console.log("Face Mesh Model Loaded");
    detectFace(); // Start detecting faces after the model is loaded
}

// Initialize webcam
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

// Detect face function
async function detectFace() {
    const webcamElement = document.getElementById('webcam');

    const predictions = await facemesh.estimateFaces(webcamElement);
    if (predictions.length > 0) {
        console.log("Face detected:", predictions);
    }

    requestAnimationFrame(detectFace); // Continue detecting faces
}

// Start the process when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    await setupWebcam(); // Setup webcam first
    await loadFaceMeshModel(); // Load the model after the webcam is ready
});
