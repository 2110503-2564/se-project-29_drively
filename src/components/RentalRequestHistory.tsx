import React, { useEffect, useState } from 'react';
import getRentalRequests from '../libs/getRentalRequests';

interface RentalRequest {
    id: string;
    renterName: string;
    startDate: string;
    endDate: string;
    status: string;
}

const RentalRequestHistory = ({ carId }: { carId: string }) => {
    const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchRentalRequests() {
            try {
                setLoading(true);
                const data = await getRentalRequests(carId);
                setRentalRequests(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchRentalRequests();
    }, [carId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Rental Request History</h2>
            {rentalRequests.length === 0 ? (
                <p>No requests yet.</p>
            ) : (
                <ul>
                    {rentalRequests.map((request) => (
                        <li key={request.id}>
                            <p>Renter: {request.renterName}</p>
                            <p>Start Date: {request.startDate}</p>
                            <p>End Date: {request.endDate}</p>
                            <p>Status: {request.status}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RentalRequestHistory;