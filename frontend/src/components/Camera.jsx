import { useEffect, useRef } from "react";

export default function Camera({ onCapture, buttonText }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        let stream;

        navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
            stream = s;
            videoRef.current.srcObject = stream;
        });

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const capture = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const frames = [];

        for (let i = 0; i < 3; i++) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            frames.push(canvas.toDataURL("image/jpeg"));

            await new Promise((r) => setTimeout(r, 300));
        }

        onCapture(frames);
    };

    return (
        <div className="relative space-y-4">
            {/* Camera */}
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" />

            {/* Face guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-4 border-blue-400 rounded-xl opacity-70"></div>
            </div>

            <canvas ref={canvasRef} hidden />

            <button
                onClick={capture}
                disabled={buttonText.includes("...")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
                {buttonText}
            </button>
        </div>
    );
}
