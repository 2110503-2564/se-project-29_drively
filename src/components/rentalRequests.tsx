"use client";

import { useState, useEffect } from "react";

interface RentalRequest {
  id: string;
  renterName: string;
  carModel: string;
  status: string;
}

export default function RentalRequests({ token }: { token: string }) {
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const response = await fetch("/api/rental-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setRequests(data);
      } else {
        setError(data.error || "Failed to load requests");
      }
    } catch (err) {
      setError("An error occurred while fetching requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, status: "approved" | "rejected") {
    try {
      const response = await fetch(`/api/rental-requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status } : req
          )
        );
      } else {
        alert("Failed to update request status");
      }
    } catch (err) {
      alert("An error occurred while updating the request");
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Rental Requests</h1>
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            <p>
              <strong>Renter:</strong> {request.renterName}
            </p>
            <p>
              <strong>Car:</strong> {request.carModel}
            </p>
            <p>
              <strong>Status:</strong> {request.status}
            </p>
            {request.status === "pending" && (
              <div>
                <button onClick={() => handleAction(request.id, "approved")}>
                  Approve
                </button>
                <button onClick={() => handleAction(request.id, "rejected")}>
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}