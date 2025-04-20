"use client";

import React, { useState, useEffect } from 'react';
import RentalRequestHistory from '@/components/RentalRequestHistory';

const RentalRequestPage: React.FC = () => {
    const [carId, setCarId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch carId dynamically (e.g., from user session or query params)
        const fetchCarId = async () => {
            try {
                // Example: Fetch carId from API or session
                const response = await fetch('/api/user/car'); // Replace with actual endpoint
                if (!response.ok) {
                    throw new Error('Failed to fetch car ID');
                }
                const data = await response.json();
                setCarId(data.carId);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchCarId();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!carId) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Rental Request</h1>
            <RentalRequestHistory carId={carId} />
        </div>
    );
};

export default RentalRequestPage;