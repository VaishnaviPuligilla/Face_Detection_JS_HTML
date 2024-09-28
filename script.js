const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

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
    predictions.forEach(prediction => {
        const x = canvas.width - prediction.boundingBox.bottomRight[0]; // Invert x coordinate
        const y = prediction.boundingBox.topLeft[1];
        const width = prediction.boundingBox.bottomRight[0] - prediction.boundingBox.topLeft[0];
        const height = prediction.boundingBox.bottomRight[1] - prediction.boundingBox.topLeft[1];

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - width, y, width, height); // Adjust x position
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
