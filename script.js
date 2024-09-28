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

// Initialize webcam
setupWebcam();

// Load the face mesh model
async function loadFaceMeshModel() {
    const model = await facemesh.load();
    detectFace(model);
}

// Detect face function
async function detectFace(model) {
    const webcamElement = document.getElementById('webcam');

    const predictions = await model.estimateFaces(webcamElement);
    if (predictions.length > 0) {
        console.log("Face detected:", predictions);
    }

    requestAnimationFrame(() => detectFace(model));
}

// Start the process
loadFaceMeshModel();
