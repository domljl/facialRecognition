import Camera from "../components/Camera";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const registerFace = async (image) => {
        setLoading(true);
        setMessage("");

        const res = await fetch("http://localhost:8000/register-face", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: image }),
        });

        const data = await res.json();
        setMessage(data.message || data.error);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <Link to="/" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                    ← Back to Home
                </Link>

                <h2 className="text-2xl font-bold text-center mb-2">Register Face</h2>

                <p className="text-gray-600 text-center mb-4">Move your head slightly before capturing.</p>

                <Camera onCapture={registerFace} buttonText={loading ? "Registering..." : "Register Face"} />

                {message && (
                    <p
                        className={`text-center mt-4 font-medium ${
                            message.includes("registered") ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
