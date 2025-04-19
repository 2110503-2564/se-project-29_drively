"use client";
import { useState, useEffect } from "react";

interface Provider {
  _id: string;
  name: string;
  address: string;
  telephone: string;
}

interface Booking {
  _id: string;
  carModel: string;
  pickupDate: string;
  returnDate: string;
  provider: Provider;
  status: string;
  paymentStatus: string;
}

export default function AdminBookings({ token }: { token: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [carModel, setCarModel] = useState<string>("");
  const [pickupDate, setPickupDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const response = await fetch("https://back-end-car.vercel.app/api/admins/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings);
      } else {
        setError(data.message || "Failed to load bookings");
      }
    } catch (error) {
      setError("An error occurred while fetching the bookings");
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr));
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setCarModel(booking.carModel);
    setPickupDate(booking.pickupDate);
    setReturnDate(booking.returnDate);
    setStatus(booking.status);
  };

  const handleEditSubmit = async () => {
    if (!carModel || !pickupDate || !returnDate || !status) {
      alert("Please fill in all fields");
      return;
    }

    const pickDate = new Date(pickupDate);
    const retDate = new Date(returnDate);

    if (retDate < pickDate) {
      alert("Return Date must be after the Pick-Up Date.");
      return;
    }

    try {
      const response = await fetch(`https://back-end-car.vercel.app/api/admins/bookings/${editingBooking?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ carModel, pickupDate, returnDate, status }),
      });

      const result = await response.json();

      if (response.ok) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === editingBooking?._id
              ? { ...booking, carModel, pickupDate, returnDate, status }
              : booking
          )
        );
        alert("Booking updated successfully!");
        setEditingBooking(null);
      } else {
        alert(result.message || "Failed to update booking.");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center space-y-4 py-8">
      <h2 className="text-3xl font-semibold text-center">All Bookings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking._id} className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
              <h3 className="text-xl font-semibold mb-2 text-blue-600">{booking.carModel}</h3>
              <p className="text-gray-600 mb-4">
                <strong>Provider:</strong> {booking.provider.name}
              </p>
              <p className="text-gray-600 mb-4"> <strong>Tel:</strong> {booking.provider.telephone}</p>
              <p className="text-gray-600 mb-4"> <strong>Address:</strong> {booking.provider.address}</p>
              <p className="text-gray-600 mb-4">
                <strong>Pick-Up Date:</strong> {formatDate(booking.pickupDate)}
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Return Date:</strong> {formatDate(booking.returnDate)}
              </p>
              <p
                className={`text-white text-center py-1 px-3 rounded-full ${
                  booking.status === "pending"
                    ? "bg-yellow-500"
                    : booking.status === "completed"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {booking.status}
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleEdit(booking)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Edit Booking
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500">No bookings found.</div>
        )}
      </div>

      {editingBooking && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl text-black font-semibold mb-4">Edit Booking</h3>

            <div className="mb-4">
              <label className="block text-gray-600">Pick-Up Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600">Return Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleEditSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingBooking(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
