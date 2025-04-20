"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddCarPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [form, setForm] = useState({
        make: "",
        model: "",
        year: "",
        rentalPrice: "",
        available: true,
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "available" ? value === "true" : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.token) {
            setMessage("You must be logged in to add a car");
            return;
        }
        
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("https://back-end-car.vercel.app/api/cars/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.token}`,
                },
                body: JSON.stringify({
                    make: form.make,
                    model: form.model,
                    year: parseInt(form.year, 10),
                    rentalPrice: parseFloat(form.rentalPrice),
                    available: form.available,
                }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                setMessage("Car listing added successfully!");
                setForm({ make: "", model: "", year: "", rentalPrice: "", available: true });
                router.push("/car"); // Redirect to car listing page
            } else {
                setMessage(data.error || "Failed to add car listing.");
            }
        } catch (error) {
            console.error("Error adding car listing:", error);
            setMessage("Server error. Please try again later.");
            setLoading(false);
        }
    };

    if (!session) {
        return <div className="text-center mt-10">Please sign in to add a car listing.</div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
            <h1 className="text-xl font-bold mb-4">Add Car Listing</h1>
            {message && <p className="text-red-500 mb-4">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="make"
                    placeholder="Make (e.g., Honda)"
                    value={form.make}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
                <input
                    type="text"
                    name="model"
                    placeholder="Model (e.g., Accord)"
                    value={form.model}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
                <input
                    type="number"
                    name="year"
                    placeholder="Year (e.g., 2021)"
                    value={form.year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
                <input
                    type="number"
                    name="rentalPrice"
                    placeholder="Rental Price (e.g., 55)"
                    value={form.rentalPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                />
                <select
                    name="available"
                    value={form.available.toString()}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                </select>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Car"}
                </button>
            </form>
        </div>
    );
}
