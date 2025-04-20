"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CarPanel from "@/components/CarPanel";

interface Car {
    _id: string;
    make: string;
    model: string;
    year: number;
    rentalPrice: number;
    available?: boolean;
}

export default function CarPage() {
    const [searchParams, setSearchParams] = useState({
        make: "",
        model: "",
        minPrice: "",
        maxPrice: "",
        available: "",
    });
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(false);
    const [carMakes, setCarMakes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCars();
    }, []);

    useEffect(() => {
        const uniqueMakes = [...new Set(cars.map((car) => car.make))];
        setCarMakes(uniqueMakes);
    }, [cars]);

    async function fetchCars() {
        setLoading(true);
        setError(null);
        try {
            let url = "https://back-end-car.vercel.app/api/cars/search";

            const params = new URLSearchParams();
            if (searchParams.make) params.append("make", searchParams.make);
            if (searchParams.model) params.append("model", searchParams.model);
            if (searchParams.minPrice) params.append("minPrice", searchParams.minPrice);
            if (searchParams.maxPrice) params.append("maxPrice", searchParams.maxPrice);
            if (searchParams.available !== "") {
                params.append("available", searchParams.available);
            }

            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch cars");
            const data: Car[] = await response.json();
            setCars(data);
        } catch (err) {
            console.error("Error fetching cars:", err);
            setError("Failed to load cars. Please try again later.");
            setCars([]);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSearchParams((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSearch = async () => {
        await fetchCars();
    };

    return (
        <main className="p-5">
            <h1 className="text-2xl font-bold text-center mb-5">Available Cars</h1>

            <form className="flex flex-wrap gap-4 justify-center mb-6">
                <select
                    name="make"
                    value={searchParams.make}
                    onChange={handleChange}
                    className="px-4 py-2 border rounded"
                >
                    <option value="">All Makes</option>
                    {carMakes.map((make) => (
                        <option key={make} value={make}>
                            {make}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    name="model"
                    placeholder="Car Model (e.g. Civic)"
                    value={searchParams.model}
                    onChange={handleChange}
                    className="px-4 py-2 border rounded"
                />

                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={searchParams.minPrice}
                    onChange={handleChange}
                    className="px-4 py-2 border rounded"
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={searchParams.maxPrice}
                    onChange={handleChange}
                    className="px-4 py-2 border rounded"
                />

                <select
                    name="available"
                    value={searchParams.available}
                    onChange={handleChange}
                    className="px-4 py-2 border rounded"
                >
                    <option value="">All</option>
                    <option value="true">Available</option>
                    <option value="false">Booked</option>
                </select>

                <button
                    type="button"
                    onClick={handleSearch}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Search
                </button>
            </form>

            {error && <p className="text-center text-red-500">{error}</p>}
            {loading ? (
                <p className="text-center">Loading cars...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cars.map((car) => (
                        <Link key={car._id} href={`/car/${car._id}`} legacyBehavior>
                            <a className="block p-4 border rounded hover:shadow-lg">
                        
                                    <h2 className="text-lg font-bold">
                                        {car.make} {car.model} ({car.year})
                                    </h2>
                                    <p className="text-gray-600">
                                        Rental Price:{" "}
                                        <span className="text-green-600 font-semibold">
                                            {car.rentalPrice?.toLocaleString() || "N/A"} THB/day
                                        </span>
                                    </p>
                                    <p className={car.available ? "text-green-500" : "text-red-500"}>
                                        {car.available ? "Available" : "Booked"}
                                    </p>
                            </a>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
