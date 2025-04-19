"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
        console.log("🚀 Component mounted. Fetching initial cars...");
        fetchCars();
    }, []);

    useEffect(() => {
        fetchCarMakes();
    }, [cars]);

    async function fetchCars() {
        setLoading(true);
        try {
            let url = "https://back-end-car.vercel.app/api/cars/search";

            const params = new URLSearchParams();
            if (searchParams.make) params.append("make", searchParams.make);
            if (searchParams.model) params.append("model", searchParams.model);
            if (searchParams.minPrice) params.append("minPrice", searchParams.minPrice);
            if (searchParams.maxPrice) params.append("maxPrice", searchParams.maxPrice);
            if (searchParams.available !== "") {
                params.append("available", searchParams.available); // ✅ Ensure available filter is passed
            }

            if (params.toString()) url += `?${params.toString()}`;

            console.log("🌐 Fetching from:", url);

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch cars");
            const data: Car[] = await response.json();
            console.log("✅ Cars fetched from API:", data);

            // ✅ Only update filteredCars (no need for applyFilters)
            setCars(data);
        } catch (error) {
            console.error("❌ Error fetching cars:", error);
            setCars([]);
        } finally {
            setLoading(false);
        }
    }

    function fetchCarMakes() {
        const uniqueMakes = [...new Set(cars.map((car) => car.make))];
        setCarMakes(uniqueMakes);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSearchParams((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSearch = async () => {
        console.log("🔎 Search button clicked! Fetching cars...");
        await fetchCars();
    };

    return (
        <main className="p-5">
            <h1 className="text-2xl font-bold text-center mb-5">Available Cars</h1>

            {/* 🔍 Search Form */}
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

            {/* 🚗 Car Results */}
            {loading ? (
                <p className="text-center">Loading cars...</p>
            ) : (
                <CarPanel cars={cars} />
            )}
        </main>
    );
}
