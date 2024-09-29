const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// Encrypt model data
function encryptData(data) {
    return CryptoJS.AES.encrypt(data, 'secret key 123').toString();
}

// Decrypt model data
function decryptData(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, 'secret key 123');
    return bytes.toString(CryptoJS.enc.Utf8);
}

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
        video.srcObject = stream;

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (error) {
        console.error("Error accessing the camera: ", error);
        alert("Could not access the camera. Please check permissions and ensure your camera is working.");
    }
}

async function loadFaceMeshModel() {
    const model = await facemesh.load();
    console.log('Face Mesh model loaded');
    // Example of how to encrypt some dummy model data
    const modelInfo = 'faceMeshModelInfo'; 
    const encryptedModelData = encryptData(modelInfo);
    console.log('Encrypted Model Data:', encryptedModelData);
    const decryptedModelInfo = decryptData(encryptedModelData);
    console.log('Decrypted Model Info:', decryptedModelInfo);
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

        // Adjust bounding box values
        const adjustmentFactor = 0.85; // Reduce the bounding box size by 15%
        const x = topLeft[0] + (1 - adjustmentFactor) * (bottomRight[0] - topLeft[0]) / 2;
        const y = topLeft[1] + (1 - adjustmentFactor) * (bottomRight[1] - topLeft[1]) / 2;
        const width = (bottomRight[0] - topLeft[0]) * adjustmentFactor;
        const height = (bottomRight[1] - topLeft[1]) * adjustmentFactor;

        // Draw bounding box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Set a horizontal scaling factor to reduce width of the mesh
        const horizontalScalingFactor = 0.7; // Scale horizontal size down to 70%

        // Draw mesh points with adjusted horizontal scaling
        prediction.scaledMesh.forEach(point => {
            const pointX = (point[0] - x) * horizontalScalingFactor + x; // Adjust only horizontal
            const pointY = point[1];

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
