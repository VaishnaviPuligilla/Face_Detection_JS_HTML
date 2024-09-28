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
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    
    // Example of how to encrypt some dummy model data
    const modelInfo = 'faceMeshModelInfo'; 
    const encryptedModelData = encryptData(modelInfo);
    console.log('Encrypted Model Data:', encryptedModelData); // Show the encrypted data
    const decryptedModelInfo = decryptData(encryptedModelData);
    console.log('Decrypted Model Info:', decryptedModelInfo); // Show the original data after decryption
    return model;
}

async function detectFaces(model) {
    const predictions = await model.estimateFaces(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for each frame

    // Check if predictions are made
    if (predictions.length > 0) {
        predictions.forEach(prediction => {
            const topLeft = prediction.boundingBox.topLeft;
            const bottomRight = prediction.boundingBox.bottomRight;

            // Use original coordinates since we are mirroring the video
            const x = topLeft[0];
            const y = topLeft[1];
            const width = bottomRight[0] - topLeft[0];
            const height = bottomRight[1] - topLeft[1];

            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // Draw the keypoints
            prediction.scaledMesh.forEach(point => {
                ctx.fillStyle = 'blue';
                ctx.fillRect(point[0], point[1], 2, 2); // Draw each keypoint
            });
        });
    }

    requestAnimationFrame(() => detectFaces(model)); // Continue detecting faces
}

async function main() {
    await setupCamera();

    // Ensure the canvas dimensions match the video dimensions after metadata is loaded
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    };

    const model = await loadFaceMeshModel();
    detectFaces(model);
}

main();
