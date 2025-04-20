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
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");

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
                setError("No Car added");
            }
        } catch (error) {
            setError("An error occurred while fetching the listings");
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    }
    async function unlistCar(carId: string) {
        try {
            const response = await fetch(`https://back-end-car.vercel.app/api/cars/${carId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const responseData = await response.json();
            console.log("Unlist response:", responseData);
    
            if (response.ok) {
                setSuccessMessage("Car successfully unlisted.");
                // Refresh the page after successfully unlisting the car
                window.location.reload();
            } else {
                setError(responseData.message || "Failed to unlist the car.");
            }
        } catch (error) {
            setError("An error occurred while unlisting the car.");
            console.error("Error unlisting car:", error);
        } finally {
            setShowModal(false);
        }
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ textAlign: "center", color: "#333" }}>My Car Listings</h1>
            {loading && <p style={{ textAlign: "center", color: "#555" }}>Loading your listings...</p>}
            {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
            {successMessage && <p style={{ textAlign: "center", color: "green" }}>{successMessage}</p>}
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
                            <span style={{ color: "#555" }}>${listing.rentalPrice}/day</span><br />
                            <span style={{ color: listing.available ? "green" : "red" }}>
                                {listing.available ? "Active" : "Inactive"}
                            </span>
                            <br />
                            {listing.available && (
                                <button
                                    onClick={() => {
                                        setSelectedCarId(listing._id);
                                        setShowModal(true);
                                    }}
                                    style={{
                                        marginTop: "10px",
                                        padding: "5px 10px",
                                        backgroundColor: "#ff4d4f",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Unlist
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {!loading && !error && listings.length === 0 && (
                <p style={{ textAlign: "center", color: "#555" }}>No listings found.</p>
            )}

            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            textAlign: "center",
                        }}
                    >
                        <p>Are you sure you want to unlist this car?</p>
                        <button
                            onClick={() => unlistCar(selectedCarId!)}
                            style={{
                                marginRight: "10px",
                                padding: "5px 10px",
                                backgroundColor: "#ff4d4f",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#ddd",
                                color: "black",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            No
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}