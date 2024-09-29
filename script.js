const img = document.getElementById('image'); // Use an <img> tag to hold the static image
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

// Load Face Mesh model
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

// Detect faces in the static image
async function detectFaces(model) {
    // Estimate faces in the static image instead of video
    const predictions = await model.estimateFaces(img);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the static image on canvas

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
}

async function main() {
    const model = await loadFaceMeshModel();
    detectFaces(model);
}

main();
