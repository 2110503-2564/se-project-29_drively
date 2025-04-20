export default async function getRentalRequests(carId: string) {
    const response = await fetch(`https://back-end-car.vercel.app/api/cars/${carId}/requests`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}` // Pass token for authorization
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch rental requests");
    }

    return await response.json();
}