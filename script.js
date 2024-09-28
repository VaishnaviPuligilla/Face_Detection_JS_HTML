let facemesh;

async function loadFaceMeshModel() {
    facemesh = await facemesh.load(); // Load the Face Mesh model
    console.log("Face Mesh Model Loaded");
}

async function setupWebcam() {
    const webcamElement = document.getElementById('webcam');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamElement.srcObject = stream;

    return new Promise((resolve) => {
        webcamElement.onloadedmetadata = () => {
            resolve(webcamElement);
        };
    });
}

async function detectFace() {
    const webcamElement = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Estimate faces from the webcam feed
    const predictions = await facemesh.estimateFaces(webcamElement);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check if any faces are detected
    if (predictions.length > 0) {
        console.log("Face detected:", predictions);

        predictions.forEach(prediction => {
            const topLeft = prediction.boundingBox.topLeft;
            const bottomRight = prediction.boundingBox.bottomRight;

            // Draw bounding box
            ctx.beginPath();
            ctx.rect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'green'; // Color of the bounding box
            ctx.stroke();

            // Optional: Display additional info (e.g., confidence)
            ctx.font = '16px Arial';
            ctx.fillStyle = 'green';
            ctx.fillText(`Confidence: ${(prediction.score * 100).toFixed(2)}%`, topLeft[0], topLeft[1] > 10 ? topLeft[1] - 5 : 10);
        });
    } else {
        console.log("No face detected.");
    }

    // Repeat detection
    requestAnimationFrame(detectFace);
}

// Start the process
document.addEventListener('DOMContentLoaded', async (event) => {
    await loadFaceMeshModel();
    await setupWebcam();
    detectFace(); // Start detecting faces
});
