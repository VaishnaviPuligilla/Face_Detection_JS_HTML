const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output');
const ctx = canvasElement.getContext('2d');

// Load the OpenCV.js library
let isOpenCvReady = false;
cv.onRuntimeInitialized = () => {
    isOpenCvReady = true;
    console.log("OpenCV.js is ready.");
};

async function setupWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        
        return new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                resolve(videoElement);
            };
        });
    } catch (error) {
        console.error("Error accessing webcam: ", error);
    }
}

async function detectFace() {
    if (!isOpenCvReady) {
        requestAnimationFrame(detectFace);
        return;
    }

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    let src = cv.imread(canvasElement);
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Load Haar Cascade for face detection
    let faceCascade = new cv.CascadeClassifier();
    faceCascade.load('haarcascade_frontalface_default.xml'); // Ensure this file is available

    let faces = new cv.RectVector();
    let size = new cv.Size(30, 30);
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, size);

    // Draw rectangles around detected faces
    for (let i = 0; i < faces.size(); i++) {
        let rect = faces.get(i);
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'green';
        ctx.stroke();
    }

    // Clean up
    src.delete();
    gray.delete();
    faces.delete();

    requestAnimationFrame(detectFace);
}

document.addEventListener('DOMContentLoaded', async () => {
    await setupWebcam();
    detectFace();
});
