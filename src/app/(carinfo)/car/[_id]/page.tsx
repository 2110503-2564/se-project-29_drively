import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

const CarDetailPage = async ({ params }: { params: { _id: string } }) => {
    const session = await getServerSession(authOptions);

    console.log('Fetching car details for ID:', params._id);
    const response = await fetch(`https://back-end-car.vercel.app/api/cars/${params._id}`); // Use absolute URL
    if (!response.ok) {
        throw new Error('Failed to fetch car details');
    }
    const carDetail = await response.json();
    console.log('Fetched car details:', carDetail);

    if (!session || !session.user) {
        throw new Error("User session is not available");
    }

    return (
        <main className="min-h-screen flex flex-col text-center p-10 bg-gray-50 mt-4">
            <h1 className="text-5xl font-extrabold text-gray-500 mb-16">
                {carDetail.make} {carDetail.model}
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center md:space-x-8 my-8">
                <div className="text-left w-full md:w-2/3 mt-6 md:mt-0">
                    <div className="text-lg text-gray-700 mb-2">
                        <strong>Model:</strong> {carDetail.model}
                    </div>
                    <div className="text-lg text-gray-700 mb-2">
                        <strong>Year:</strong> {carDetail.year}
                    </div>
                    <div className="text-lg text-gray-700 mb-2">
                        <strong>Price:</strong> ${carDetail.rentalPrice}
                    </div>
                    <div className="text-lg text-gray-700 mb-2">
                        <strong>Status:</strong> {carDetail.available ? "Available" : "Booked"}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CarDetailPage;