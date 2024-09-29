const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
let staticImageDetected = false;

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

async function loadFaceMeshModel() {
    const model = await facemesh.load();
    console.log('Face Mesh model loaded');
    return model;
}

async function detectFaces(model) {
    const predictions = await model.estimateFaces(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (predictions.length > 0) {
        staticImageDetected = false; // Reset the flag if a face is detected
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
    } else {
        // If no face is detected
        if (!staticImageDetected) {
            alert('Static image detected!'); // Alert if no live face is detected
            staticImageDetected = true; // Set the flag to avoid repeated alerts
        }
    }

    requestAnimationFrame(() => detectFaces(model));
}

async function main() {
    await setupCamera();
    video.play(); // Start playing the video
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    };
    const model = await loadFaceMeshModel();
    detectFaces(model);
}

main();
