export default async function getUserProfile(token: string) {
    try {
        console.log("Fetching user profile..."); // Removed token from logs for security

        const response = await fetch("https://back-end-car.vercel.app/api/users/me", {
            method: "GET",
            headers: {
                authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error(`Failed to fetch user profile: ${response.status} ${response.statusText} - ${errorMessage}`);
            throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();

        if (!data || !data._id) {
            throw new Error("Invalid response: User data is incomplete or missing.");
        }

        console.log("User profile fetched successfully:", {
            _id: data._id,
            name: data.name,
            telephone: data.telephone,
            email: data.email,
            role: data.role,
        });

        return {
            _id: data._id || "",
            name: data.name || "",
            email: data.email || "",
            telephone: data.telephone || "",
            role: data.role || "",
            token, // Store the original token
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error in getUserProfile:", error.message);
            throw error;
        } else {
            console.error("An unknown error occurred in getUserProfile:", error);
            throw new Error("An unknown error occurred while fetching user profile.");
        }
    }
}