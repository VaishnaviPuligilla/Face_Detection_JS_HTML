const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// Encrypt model data
function encryptData(data) {
    return CryptoJS.AES.encrypt(data, 'secret key 123').toString();
}

// Decrypt model data
function decryptData(encryptedData) {
    return CryptoJS.AES.decrypt(encryptedData, 'secret key 123').toString(CryptoJS.enc.Utf8);
}

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

    // Clear the canvas and apply mirroring transformation
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1); // Mirror the canvas horizontally
    ctx.translate(-canvas.width, 0); // Adjust position after mirroring

    predictions.forEach(prediction => {
        const topLeft = prediction.boundingBox.topLeft;
        const bottomRight = prediction.boundingBox.bottomRight;

        // More aggressive adjustment factor to make the bounding box smaller
        const adjustmentFactor = 0.8; // Reduce the bounding box size by 20%
        const x = topLeft[0] + (1 - adjustmentFactor) * (bottomRight[0] - topLeft[0]) / 2;
        const y = topLeft[1] + (1 - adjustmentFactor) * (bottomRight[1] - topLeft[1]) / 2;
        const width = (bottomRight[0] - topLeft[0]) * adjustmentFactor;
        const height = (bottomRight[1] - topLeft[1]) * adjustmentFactor;

        // Draw bounding box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw mesh points with further adjustments to keep them within the bounding box
        prediction.scaledMesh.forEach(point => {
            let pointX = point[0];
            let pointY = point[1];

            // Scale down each point slightly to keep it within the face boundaries
            pointX = x + (pointX - x) * 0.8; // Reduce the spread of X values by 20%
            pointY = y + (pointY - y) * 0.8; // Reduce the spread of Y values by 20%

            // Ensure points are within bounding box
            if (pointX >= x && pointX <= x + width && pointY >= y && pointY <= y + height) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(pointX, pointY, 2, 2);
            }
        });
    });

    ctx.restore(); // Restore the canvas to remove the mirroring effect for the next frame

    requestAnimationFrame(() => detectFaces(model));
}

async function main() {
    await setupCamera();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const model = await loadFaceMeshModel();
    detectFaces(model);
}

main();
