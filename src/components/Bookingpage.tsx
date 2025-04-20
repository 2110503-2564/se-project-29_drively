"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./Booko.module.css";

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  rentalPrice: number;
  available?: boolean;
}

interface Provider {
  _id: string;
  name: string;
  address: string;
  telephone: string;
}

export default function Booko({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const [carModel, setCarModel] = useState<string>(searchParams.get("carModel") || "");
  const [carMake, setCarMake] = useState<string>(searchParams.get("make") || "");
  const [rentalPrice, setRentalPrice] = useState<string>(searchParams.get("rentalPrice") || "");
  const [providerId, setProviderId] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [carModels, setCarModels] = useState<string[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookingStatus, setBookingStatus] = useState<string>("");

  useEffect(() => {
    fetchCars();
    fetchProviders();
  }, []);

  async function fetchCars() {
    try {
      const response = await fetch("https://back-end-car.vercel.app/api/cars/search?available=true");
      const data: Car[] = await response.json();
      setCarModels([...new Set(data.map((car) => car.model))]);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  }

  async function fetchProviders() {
    try {
      const response = await fetch("https://back-end-car.vercel.app/api/users/providers");
      const data: Provider[] = await response.json();
      setProviders(data);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "model") {
      setCarModel(value);
    } else if (name === "provider") {
      setProviderId(value);
    } else if (name === "pickupDate") {
      setPickupDate(value);
    } else if (name === "returnDate") {
      setReturnDate(value);
    }
  };

  function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(dateStr));
  }

  const handleBooking = async () => {
    if (!carModel || !providerId || !pickupDate || !returnDate) {
      alert("Please fill in all fields before booking.");
      return;
    }

    // Convert dates to ensure returnDate is after pickupDate
    const pickDate = new Date(pickupDate);
    const retDate = new Date(returnDate);

    if (retDate < pickDate) {
      alert("Return Date must be after the Pick-Up Date.");
      return;
    }

    try {
      const response = await fetch("https://back-end-car.vercel.app/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carModel,
          pickupDate,
          returnDate,
          providerId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setBookingStatus(result.message || "Failed to complete booking.");
        alert(result.message || "Failed to complete booking.");
      } else {
        setBookingStatus("Booking completed successfully!");
        alert("Booking completed successfully!");
        setCarModel("");
        setProviderId(null);
        setPickupDate("");
        setReturnDate("");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setBookingStatus("Failed to complete booking. Try again.");
      alert("Failed to complete booking. Try again.");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>New Reservation</div>

      <div className={styles.formGroup}>
        {carMake && carModel && (
          <div className={styles.formField}>
            <label className={styles.label}>Selected Car</label>
            <input
              type="text"
              value={`${carMake} ${carModel}`}
              className={styles.input}
              disabled
            />
            {rentalPrice && (
              <p className="text-gray-600 mt-2">
                Rental Price: <span className="text-green-600 font-semibold">{rentalPrice} THB/day</span>
              </p>
            )}
          </div>
        )}

        {!carModel && (
          <div className={styles.formField}>
            <label className={styles.label}>Car Model</label>
            <select
              name="model"
              value={carModel}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">All Models</option>
              {carModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.formField}>
          <label className={styles.label}>Provider Name</label>
          <select
            name="provider"
            value={providerId || ""}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="">All Providers</option>
            {providers.map((provider) => (
              <option key={provider._id} value={provider._id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Pick-Up Date</label>
          <input
            className={styles.input}
            type="date"
            name="pickupDate"
            value={pickupDate}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Return Date</label>
          <input
            className={styles.input}
            type="date"
            name="returnDate"
            value={returnDate}
            onChange={handleChange}
          />
        </div>

        {pickupDate && (
          <div className="text-gray-800 text-lg">Pickup Date: {formatDate(pickupDate)}</div>
        )}
        {returnDate && (
          <div className="text-gray-800 text-lg">Return Date: {formatDate(returnDate)}</div>
        )}
      </div>

      <button className={styles.button} onClick={handleBooking}>
        Check Car Availability & Book
      </button>

      {bookingStatus && (
        <div className={styles.bookingStatus}>{bookingStatus}</div>
      )}
    </main>
  );
}
