import Camera from "../components/Camera";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../auth";

export default function Login() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const loginFace = async (images) => {
        setLoading(true);
        setResult(null);

        if (!username || !images?.length) {
            setResult({ success: false, error: "Please enter username and capture a face image." });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/login-face", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, image: images[0] }),
            });

            const data = await res.json();
            setResult(data);
            if (data.success && data.access_token) {
                setToken(data.access_token);
                navigate("/success");
            }
        } catch (err) {
            setResult({ success: false, error: "Network error. Is the backend running?" });
        } finally {
            setLoading(false);
        }
    };

    const loginPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        if (!username || !password) {
            setResult({ success: false, error: "Enter username and password." });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/login-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (res.ok && data.access_token) {
                setToken(data.access_token);
                navigate("/success");
            } else {
                setResult({ success: false, error: data.detail || data.error || "Login failed" });
            }
        } catch (err) {
            setResult({ success: false, error: "Network error. Is the backend running?" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <Link to="/" className="text-sm text-blue-600 hover:underline">
                        ← Home
                    </Link>
                    <span className="text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold">
                        Login
                    </span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                <p className="text-slate-600 mb-6">Use password or face login. Webcam preview is mirrored.</p>

                <div className="grid md:grid-cols-2 gap-6">
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
                    <button
                        onClick={loginPassword}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
                    >
                        {loading ? "Logging in..." : "Login with Password"}
                    </button>

                    <div>
                        <Camera
                            onCapture={loginFace}
                            buttonText={loading ? "Verifying..." : "Login with Face"}
                            disabled={loading}
                        />
                    </div>
                </div>

                {result && (
                    <p
                        className={`text-center mt-6 font-medium ${
                            result.success ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {result.success ? "✅ Login successful" : result.error || "❌ Login failed"}
                    </p>
                )}
            </div>
        </div>
    );
}
