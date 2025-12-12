import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4">Face Authentication</h1>

                <p className="text-gray-600 mb-6">
                    Register your face and login securely using facial recognition.
                </p>

                <Link to="/register">
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                        Register Face
                    </button>
                </Link>

                <Link to="/login">
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition mt-4">
                        Login
                    </button>
                </Link>
            </div>
        </div>
    );
}
