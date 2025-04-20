"use client";
import { useState, useEffect } from "react";
import getUserProfile from "@/libs/getUserProfile"; // Import the getUserProfile function
import styles from "./UserProfile.module.css"; // Import the CSS module

export default function UserProfilePage({ token }: { token: string }) {
  const [name, setName] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>(""); // New password
  const [currentPassword, setCurrentPassword] = useState<string>(""); // Current password
  const [role, setRole] = useState<string>(""); // Add role state
  const [updateStatus, setUpdateStatus] = useState<string>("");

  useEffect(() => {
    fetchUserDetails();
  }, []);

  async function fetchUserDetails() {
    try {
      const userProfile = await getUserProfile(token); // Fetch user profile using the helper function
      setName(userProfile.name);
      setTelephone(userProfile.telephone || ""); // Ensure telephone is set if available
      setEmail(userProfile.email);
      setRole(userProfile.role);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "name") {
      setName(value);
    } else if (name === "telephone") {
      setTelephone(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value); // Handle new password input
    } else if (name === "currentPassword") {
      setCurrentPassword(value); // Handle current password input
    }
  };

  const handleUpdate = async () => {
    if (!name || !telephone || !email ) {
      alert("Please fill in all fields, including your current password.");
      return;
    }

    try {
      const response = await fetch("https://back-end-car.vercel.app/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          telephone,
          email,
          // password: password || undefined, // Only send new password if provided
          // currentPassword, // Send current password for authorization
        }),
      });

      const result = await response.json();
      console.log("Update API Response:", result);
      if (!response.ok) {
        setUpdateStatus(result.message || "Failed to update user details.");
        alert(result.message || "Failed to update user details.");
      } else {
        setUpdateStatus("User details updated successfully!");
        alert("User details updated successfully!");
      }
    } catch (error) {
      console.error("Update error:", error);
      setUpdateStatus("Failed to update user details. Try again.");
      alert("Failed to update user details. Try again.");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>User Profile</div>

      <div className={styles.formGroup}>
        <div className={styles.formField}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Telephone</label>
          <input
            className={styles.input}
            type="text"
            name="telephone"
            value={telephone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
          />
        </div>

        {/* <div className={styles.formField}>
          <label className={styles.label}>Current Password</label>
          <input
            className={styles.input}
            type="password"
            name="currentPassword"
            value={currentPassword}
            onChange={handleChange}
            placeholder="Enter your current password"
          />
        </div> */}
{/* 
        <div className={styles.formField}>
          <label className={styles.label}>New Password</label>
          <input
            className={styles.input}
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />
        </div> */}

        <div className={styles.formField}>
          <label className={styles.label}>Role</label>
          <input
            className={styles.input}
            type="text"
            value={role} // Display role from session
            disabled
          />
        </div>
      </div>

      <button className={styles.button} onClick={handleUpdate}>
        Update Profile
      </button>

      {updateStatus && (
        <div className={styles.updateStatus}>{updateStatus}</div>
      )}
    </main>
  );
}