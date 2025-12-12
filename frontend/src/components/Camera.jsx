import { useEffect, useRef } from "react";

export default function Camera({ onCapture, buttonText, disabled = false }) {
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
        <div className="space-y-4">
            <div className="relative w-full">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full aspect-3/4 object-cover rounded-2xl border border-slate-200 shadow-sm"
                    style={{ transform: "scaleX(-1)" }} // mirror preview
                />

                {/* Face guide overlay */}
                <div className="pointer-events-none absolute inset-3 flex items-center justify-center">
                    <div className="w-40 h-56 sm:w-48 sm:h-64 border-4 border-blue-500/70 rounded-2xl shadow-inner"></div>
                </div>
            </div>

            <canvas ref={canvasRef} hidden />

            <button
                onClick={capture}
                disabled={disabled || buttonText.includes("...")}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
                {buttonText}
            </button>
        </div>
    );
}
