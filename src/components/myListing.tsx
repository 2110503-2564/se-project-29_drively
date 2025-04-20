"use client";

import React, { useEffect, useState } from "react";

interface Car {
    _id: string;
    make: string;
    model: string;
    year: number;
    rentalPrice: number;
    available?: boolean;
    createdBy?: string;
}

export default function MyListings({ token }: { token: string }) {
    const [listings, setListings] = useState<Car[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);
    const [currentCar, setCurrentCar] = useState<Car | null>(null);
    const [formData, setFormData] = useState<Partial<Car>>({});

    useEffect(() => {
        fetchListings();
    }, []);

    async function fetchListings() {
        try {
            const response = await fetch("https://back-end-car.vercel.app/api/cars/search-by-user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data: Car[] = await response.json();

            if (response.ok) {
                setListings(data);
            } else {
                setError("Failed to load listings");
            }
        } catch (error) {
            setError("An error occurred while fetching the listings");
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdate(id: string) {
        const carToUpdate = listings.find((car) => car._id === id);
        if (!carToUpdate) return;
        setCurrentCar(carToUpdate);
        setFormData({
            make: carToUpdate.make,
            model: carToUpdate.model,
            year: carToUpdate.year,
            rentalPrice: carToUpdate.rentalPrice,
        });
        setShowUpdateForm(true);
    }

    async function submitUpdate() {
        if (!currentCar) return;

        try {
            const response = await fetch(`https://back-end-car.vercel.app/api/cars/${currentCar._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Failed to update car listing");
            alert("Car listing updated successfully");
            setShowUpdateForm(false);
            fetchListings(); // Refresh listings
        } catch (error) {
            console.error(error);
            alert("Error updating car listing");
        }
    }

    async function handleDelete(id: string) {
        console.log(`Attempting to delete car with ID: ${id}`);
        try {
            const response = await fetch(`https://back-end-car.vercel.app/api/cars/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to delete car listing");
            alert("Car listing deleted successfully");
            fetchListings(); // Refresh listings
        } catch (error) {
            console.error("Error deleting car listing:", error);
            alert("Error deleting car listing");
        }
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ textAlign: "center", color: "#333" }}>My Car Listings</h1>
            {loading && <p style={{ textAlign: "center", color: "#555" }}>Loading your listings...</p>}
            {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
            {!loading && !error && listings.length > 0 && (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {listings.map((listing) => (
                        <li
                            key={listing._id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "10px",
                                margin: "10px 0",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <strong>{listing.make} {listing.model}</strong> ({listing.year})<br />
                            <span style={{ color: "#555" }}>${listing.rentalPrice}/day</span>
                            <div style={{ marginTop: "10px" }}>
                                <button
                                    style={{
                                        backgroundColor: "blue",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        marginRight: "10px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleUpdate(listing._id)}
                                >
                                    Update
                                </button>
                                <button
                                    style={{
                                        backgroundColor: "red",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleDelete(listing._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {!loading && !error && listings.length === 0 && (
                <p style={{ textAlign: "center", color: "#555" }}>No listings found.</p>
            )}

            {showUpdateForm && (
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "white",
                        padding: "20px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        zIndex: 1000,
                    }}
                >
                    <h2>Update Car Listing</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitUpdate();
                        }}
                    >
                        <div style={{ marginBottom: "10px" }}>
                            <label>Make:</label>
                            <input
                                type="text"
                                value={formData.make || ""}
                                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                            />
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Model:</label>
                            <input
                                type="text"
                                value={formData.model || ""}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                            />
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Year:</label>
                            <input
                                type="number"
                                value={formData.year || ""}
                                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                            />
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Rental Price:</label>
                            <input
                                type="number"
                                value={formData.rentalPrice || ""}
                                onChange={(e) => setFormData({ ...formData, rentalPrice: Number(e.target.value) })}
                                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                backgroundColor: "blue",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginRight: "10px",
                            }}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowUpdateForm(false)}
                            style={{
                                backgroundColor: "gray",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}