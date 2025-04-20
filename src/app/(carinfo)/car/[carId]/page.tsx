"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Car {
    _id: string;
    make: string;
    model: string;
    year: number;
    rentalPrice: number;
    available?: boolean;
}

export default function CarDetails({ params }: { params: { carId: string } }) {
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const response = await fetch(`https://back-end-car.vercel.app/api/cars/${params.carId}`);
                if (!response.ok) throw new Error('Car not found');
                const data = await response.json();
                setCar(data);
            } catch (error) {
                console.error('Error fetching car details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCarDetails();
    }, [params.carId]);

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (!car) return <div className="text-center p-8">Car not found</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">{car.make} {car.model}</h1>
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-gray-600">Make</p>
                        <p className="font-semibold">{car.make}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Model</p>
                        <p className="font-semibold">{car.model}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Year</p>
                        <p className="font-semibold">{car.year}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Rental Price</p>
                        <p className="font-semibold text-green-600">{car.rentalPrice} THB/day</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Status</p>
                        <p className={car.available ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                            {car.available ? "Available" : "Booked"}
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href={`/booking/${car._id}`}>
                        <button 
                            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                            disabled={!car.available}
                        >
                            {car.available ? "Send Booking Request" : "Currently Unavailable"}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}