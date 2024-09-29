const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

let lastPredictions = [];
let staticImageDetected = false;
const staticImageThreshold = 10; // Number of frames to confirm a static image

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
        lastPredictions.push(predictions); // Store current predictions for comparison

        // Draw predictions
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

        // Check for static image detection
        if (lastPredictions.length > staticImageThreshold) {
            const isStatic = lastPredictions.slice(-staticImageThreshold).every(pred => {
                return pred.length === predictions.length &&
                       pred.every((p, index) => {
                           return Math.abs(p.boundingBox.topLeft[0] - predictions[index].boundingBox.topLeft[0]) < 5 &&
                                  Math.abs(p.boundingBox.topLeft[1] - predictions[index].boundingBox.topLeft[1]) < 5;
                       });
            });

            if (isStatic && !staticImageDetected) {
                alert('Static image detected!'); // Alert if static image is detected
                staticImageDetected = true; // Set the flag to avoid repeated alerts
            }
        }

    } else {
        // If no face is detected
        if (!staticImageDetected) {
            console.log('No face detected!'); // Log if no live face is detected
        }
    }

    // Keep only the last N predictions
    if (lastPredictions.length > staticImageThreshold) {
        lastPredictions.shift();
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
