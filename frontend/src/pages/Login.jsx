import Camera from "../components/Camera";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const loginFace = async (image) => {
        setLoading(true);
        setResult(null);

        const res = await fetch("http://localhost:8000/login-face", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: image }),
        });

        const data = await res.json();
        setResult(data);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <Link to="/" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                    ← Back to Home
                </Link>
                <h2 className="text-2xl font-bold text-center mb-2">Login</h2>

                <p className="text-gray-600 text-center mb-4">Move your head slightly before capturing.</p>

                <Camera onCapture={loginFace} buttonText={loading ? "Verifying..." : "Login with Face"} />

                {result && (
                    <p
                        className={`text-center mt-4 font-medium ${
                            result.success ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {result.success ? "✅ Login successful" : "❌ Login failed"}
                    </p>
                )}
            </div>
        </div>
    );
}
