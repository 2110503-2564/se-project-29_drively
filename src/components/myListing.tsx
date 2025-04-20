
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
                        </li>
                    ))}
                </ul>
            )}
            {!loading && !error && listings.length === 0 && (
                <p style={{ textAlign: "center", color: "#555" }}>No listings found.</p>
            )}
        </div>
    );
}