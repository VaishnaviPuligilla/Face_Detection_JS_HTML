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
    const modelInfo = 'faceMeshModelInfo'; 
    const encryptedModelData = encryptData(modelInfo);
    console.log('Encrypted Model Data:', encryptedModelData); // show the encrypted data
    const decryptedModelInfo = decryptData(encryptedModelData);
    console.log('Decrypted Model Info:', decryptedModelInfo); // show the original data after decryption
    return model;
}

async function detectFaces(model) {
    const predictions = await model.estimateFaces(video);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    if (predictions.length === 0) {
        alert("Face not visible");
    } else if (predictions.length > 0) {
        // Only process the first detected face
        const prediction = predictions[0];
        const topLeft = prediction.boundingBox.topLeft;
        const bottomRight = prediction.boundingBox.bottomRight;

        const adjustmentFactor = 0.85; 
        const x = topLeft[0] + (1 - adjustmentFactor) * (bottomRight[0] - topLeft[0]) / 2;
        const y = topLeft[1] + (1 - adjustmentFactor) * (bottomRight[1] - topLeft[1]) / 2;
        const width = (bottomRight[0] - topLeft[0]) * adjustmentFactor;
        const height = (bottomRight[1] - topLeft[1]) * adjustmentFactor;

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        const horizontalScalingFactor = 0.7; 

        prediction.scaledMesh.forEach(point => {
            const pointX = (point[0] - x) * horizontalScalingFactor + x;
            const pointY = point[1];

            if (pointX >= x && pointX <= x + width && pointY >= y && pointY <= y + height) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(pointX, pointY, 2, 2);
            }
        });
    }

    ctx.restore(); 
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
