const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
// encrypt model data
function encryptData(data) {
    return CryptoJS.AES.encrypt(data, 'secret key 123').toString();
}
// decrypt model data
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
    // Example of how to encrypt some dummy model data
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
    predictions.forEach(prediction => {
        const topLeft = prediction.boundingBox.topLeft;
        const bottomRight = prediction.boundingBox.bottomRight;
        const x = canvas.width - bottomRight[0]; 
        const y = topLeft[1];
        const width = bottomRight[0] - topLeft[0];
        const height = bottomRight[1] - topLeft[1];
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        prediction.scaledMesh.forEach(point => {
            const mirroredX = canvas.width - point[0]; 
            const mirroredY = point[1];

            ctx.fillStyle = 'blue';
            ctx.fillRect(mirroredX, mirroredY, 2, 2); 
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
main();
