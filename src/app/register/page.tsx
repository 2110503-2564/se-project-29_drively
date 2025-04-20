"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", telephone: "" });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCarOwner, setIsCarOwner] = useState(false); // State for the checkbox

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsCarOwner(e.target.checked);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(""); // Clear previous messages
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5003/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    telephone: form.telephone,
                    role: isCarOwner ? "car-owner" : "car-renter", // Set role based on checkbox
                }),
            });

            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setMessage("Registration successful! Redirecting to Sign-In...");
                setTimeout(() => router.push("/api/auth/signin"), 2000);
            } else {
                setMessage(data.error || "Registration failed.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setMessage("Server error. Please try again later.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
            <h1 className="text-xl font-bold mb-4">Register</h1>
            {message && <p className="text-red-500 mb-4">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
                <input
                    type="text"
                    name="telephone"
                    placeholder="Phone Number"
                    value={form.telephone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="car-owner"
                        checked={isCarOwner}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                    />
                    <label htmlFor="car-owner">I want to be a car rent provider</label>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            <p className="mt-4 text-center">
                Already have an account? <a href="/api/auth/signin" className="text-blue-500">Sign in</a>
            </p>
        </div>
    );
}
