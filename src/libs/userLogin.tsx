import getUserProfile from "./getUserProfile"; // Import profile fetch function

export default async function userLogin(userEmail: string, userPassword: string) {
    try {
        const response = await fetch("https://back-end-car.vercel.app/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, password: userPassword }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("Login failed:", errorMessage);
            return null;
        }

        const data = await response.json();
        console.log("Login API Response:", data);

        if (!data || !data.token) {
            console.error("Invalid response from server: Missing token.");
            return null;
        }

        // Fetch full user details using the token
        const userProfile = await getUserProfile(data.token);

        if (!userProfile || !userProfile._id) {
            console.error("Failed to retrieve user profile.");
            return null;
        }

        return {
            _id: userProfile._id,
            name: userProfile.name,
            email: userProfile.email,
            role: userProfile.role,
            token: data.token, // Ensure token is stored
        };
    } catch (error) {
        console.error("Error during login:", error);
        return null;
    }
}
