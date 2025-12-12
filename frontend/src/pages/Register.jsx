import Camera from "../components/Camera";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../auth";

export default function Register() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const registerFace = async (images) => {
        setLoading(true);
        setMessage("");

        if (!username || !password) {
            setMessage("Please enter a username and password first.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, images }),
            });

            const data = await res.json();
            if (res.ok && data.access_token) {
                setToken(data.access_token);
                navigate("/success");
            } else {
                setMessage(data.detail || data.error || "Registration failed");
            }
        } catch (err) {
            setMessage("Network error. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <Link to="/" className="text-sm text-blue-600 hover:underline">
                        ← Home
                    </Link>
                    <span className="text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold">
                        Register
                    </span>
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h2>
                <p className="text-slate-600 mb-6">Set a username/password and capture your face.</p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                        <div className="text-sm text-slate-500">
                            Tip: Use a strong password; your face login remains available as well.
                        </div>
                </div>

                    <div>
                        <Camera
                            onCapture={registerFace}
                            buttonText={loading ? "Registering..." : "Capture & Register"}
                            disabled={loading}
                        />
                    </div>
                </div>

                {message && (
                    <p
                        className={`text-center mt-6 font-medium ${
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
