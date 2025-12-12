import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center border border-slate-100">
                <p className="text-sm uppercase tracking-[0.25em] text-blue-600 font-semibold mb-3">
                    Secure Access
                </p>
                <h1 className="text-3xl font-bold mb-3 text-slate-900">Face & Password Login</h1>

                <p className="text-slate-600 mb-8">
                    Register once, then sign in with your face or your password. Webcam preview is mirrored for a natural feel.
                </p>

                <div className="grid grid-cols-1 gap-3">
                    <Link to="/register">
                        <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition shadow">
                            Register
                        </button>
                    </Link>

                    <Link to="/login">
                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition shadow">
                            Login
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
