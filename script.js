const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// Function to set up the camera
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

// Load the FaceMesh model
async function loadFaceMeshModel() {
    const model = await facemesh.load();
    console.log('Face Mesh model loaded');
    return model;
}

// Detect faces in live video or static image
async function detectFaces(model) {
    let predictions;

    // Check if video is playing and get predictions
    if (!video.paused) {
        predictions = await model.estimateFaces(video);
        console.log("Live video detected");
    } else {
        // When a static image is provided, display it and get predictions
        const staticImage = document.getElementById('static-image'); // Ensure you have a static image element in your HTML
        ctx.drawImage(staticImage, 0, 0, canvas.width, canvas.height);
        predictions = await model.estimateFaces(staticImage);
        console.log("Static image detected");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    predictions.forEach(prediction => {
        const topLeft = prediction.boundingBox.topLeft;
        const bottomRight = prediction.boundingBox.bottomRight;

        // Calculate bounding box coordinates
        const x = canvas.width - bottomRight[0]; // Adjust x for mirroring
        const y = topLeft[1];
        const width = bottomRight[0] - topLeft[0];
        const height = bottomRight[1] - topLeft[1];

        // Draw the bounding box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw key points on the face mesh with mirroring adjustment
        prediction.scaledMesh.forEach(point => {
            const mirroredX = canvas.width - point[0]; // Adjust x for mirroring
            const mirroredY = point[1];

            ctx.fillStyle = 'blue';
            ctx.fillRect(mirroredX, mirroredY, 2, 2); // Draw points on the face mesh
        });
    });

    requestAnimationFrame(() => detectFaces(model));
}

async function main() {
    await setupCamera();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const model = await loadFaceMeshModel();
    detectFaces(model);
}

// Run the main function
main();
