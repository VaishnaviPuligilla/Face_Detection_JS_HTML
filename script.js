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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (err) {
        console.error('Error accessing camera: ', err);
    }
}

async function loadFaceMeshModel() {
    const model = await facemesh.load();
    console.log('Face Mesh model loaded');
    
    // Example of how to encrypt some dummy model data
    const modelInfo = 'faceMeshModelInfo'; 
    const encryptedModelData = encryptData(modelInfo);
    console.log('Encrypted Model Data:', encryptedModelData); // show the encrypted data
    const decryptedModelInfo = decryptData(encryptedModelData);
    console.log('Decrypted Model Info:', decryptedModelInfo); // show the original data after decryption
    return model;
}

// Detect faces in live video
async function detectFacesLive(model) {
    const predictions = await model.estimateFaces(video);

    // Clear the canvas and apply mirroring transformation
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1); // Mirror the canvas horizontally
    ctx.translate(-canvas.width, 0); // Adjust position after mirroring

    predictions.forEach(prediction => {
        const topLeft = prediction.boundingBox.topLeft;
        const bottomRight = prediction.boundingBox.bottomRight;

        // Draw bounding box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]);

        // Draw mesh points
        prediction.scaledMesh.forEach(point => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(point[0], point[1], 2, 2); // Draw each point of the mesh
        });
    });

    ctx.restore(); // Restore the canvas to remove the mirroring effect for the next frame

    requestAnimationFrame(() => detectFacesLive(model));
}

async function main() {
    // Load model
    const model = await loadFaceMeshModel();

    // Setup video camera
    await setupCamera();

    // Adjust canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Detect faces in live video
    detectFacesLive(model);
}

main();
