const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output');
const ctx = canvasElement.getContext('2d');
let ortSession;

async function setupWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve(videoElement);
        };
    });
}

async function loadModel() {
    ortSession = await ort.InferenceSession.create("D:\face-authentication\ONNX_HUB_MANIFEST.json");
    console.log("ONNX Model Loaded");
}

async function detectFace() {
    const tensor = preprocess(videoElement);
    const output = await ortSession.run({ input: tensor });
    const boxes = output.outputName; // Adjust based on your model's output

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    boxes.forEach(box => {
        const [x, y, width, height] = box; // Adjust based on your model's output
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'green';
        ctx.stroke();
    });

    requestAnimationFrame(detectFace);
}

function preprocess(video) {
    // Convert video frame to tensor
    const width = video.videoWidth;
    const height = video.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = new Float32Array(imageData.data.length / 4 * 3);

    for (let i = 0; i < imageData.data.length; i += 4) {
        data[i / 4 * 3] = imageData.data[i] / 255;       // R
        data[i / 4 * 3 + 1] = imageData.data[i + 1] / 255; // G
        data[i / 4 * 3 + 2] = imageData.data[i + 2] / 255; // B
    }

    return new ort.Tensor('float32', data, [1, 3, height, width]);
}

document.addEventListener('DOMContentLoaded', async () => {
    await setupWebcam();
    await loadModel();
    detectFace();
});
