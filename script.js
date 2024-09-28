async function setupWebcam() {
    const webcamElement = document.getElementById('webcam');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
        webcamElement.srcObject = stream;
    } catch (error) {
        console.error("Error accessing the webcam:", error);
    }
}

setupWebcam();
