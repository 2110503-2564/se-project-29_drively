"use client";
import { useState, useEffect } from "react";
import ProviderPanel from "../../components/ProviderPanel"; // Import the ProviderPanel component

interface Provider {
    _id: string;
    name: string;
    address: string;
    telephone: string;
}

export default function ProviderPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProviders();
    }, []);

    async function fetchProviders() {
        setLoading(true);
        try {
            const response = await fetch("https://back-end-car.vercel.app/api/users/providers");
            if (!response.ok) throw new Error("Failed to fetch providers");
            const data: Provider[] = await response.json();
            setProviders(data);
        } catch (error) {
            console.error("Error fetching providers:", error);
            setProviders([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="p-5">
            <h1 className="text-2xl font-bold text-center mb-5">Providers</h1>

            {loading ? (
                <p className="text-center">Loading providers...</p>
            ) : (
                <ProviderPanel providers={providers} />
            )}
        </main>
    );
}
