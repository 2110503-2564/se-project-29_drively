"use client";

interface Provider {
    _id: string;
    name: string;
    address: string;
    telephone: string;
}

interface ProviderPanelProps {
    providers: Provider[]; // Explicitly define 'providers' as a required prop
}

const ProviderPanel: React.FC<ProviderPanelProps> = ({ providers }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
            {providers.length === 0 ? (
                <p className="text-center text-gray-500">No providers found.</p>
            ) : (
                providers.map((provider) => (
                    <div key={provider._id} className="border rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-bold">{provider.name}</h2>
                        <p className="text-gray-600">
                            Address: <span className="text-gray-800">{provider.address}</span>
                        </p>
                        <p className="text-gray-600">
                            Telephone:{" "}
                            <span className="text-blue-600">{provider.telephone}</span>
                        </p>
                    </div>
                ))
            )}
        </div>
    );
};

export default ProviderPanel;
