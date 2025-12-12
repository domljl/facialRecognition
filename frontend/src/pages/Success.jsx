import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getToken, clearToken, authHeader } from "../auth";

export default function Success() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }

        fetch("http://localhost:8000/me", {
            headers: {
                "Content-Type": "application/json",
                ...authHeader(),
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((data) => setUsername(data.username))
            .catch(() => {
                clearToken();
                navigate("/login");
            });
    }, [navigate]);

    const logout = () => {
        clearToken();
        navigate("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center space-y-4 border border-slate-100">
                <div className="text-4xl">✅</div>
                <h1 className="text-3xl font-bold text-slate-900">Login Successful</h1>
                <p className="text-slate-700">
                    {username ? `Welcome, ${username}!` : "You're in."}
                </p>
                <button
                    onClick={logout}
                    className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition shadow"
                >
                    Logout
                </button>
                <Link to="/" className="text-blue-600 hover:underline block">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

