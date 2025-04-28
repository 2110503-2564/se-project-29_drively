'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiUser, FiAlertCircle } from 'react-icons/fi';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  numberPlates: string;
  rentalPrice: number;
  available: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  ratingScore: number;
  reviewCount: number;
}

const AdminCarsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      
      if (user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      fetchAllCars();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchAllCars = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cars');
      setCars(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load cars. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) return;

    try {
      await api.delete(`/cars/${carId}`);
      setCars(cars.filter(car => car._id !== carId));
    } catch (err) {
      console.error('Error deleting car:', err);
      setError('Failed to delete the car. Please try again later.');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All Cars</h1>
            <p className="mt-1 text-sm text-gray-500">Manage all cars in the system</p>
          </div>
          <Link
            href="/admin/cars/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FiPlus className="mr-2" /> Add New Car
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {cars.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No cars found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new car.</p>
            <div className="mt-6">
              <Link
                href="/admin/cars/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FiPlus className="mr-2" /> Add New Car
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <div key={car._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {car.make} {car.model}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">Year: {car.year}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      car.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {car.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Number Plates: {car.numberPlates}</p>
                    <p className="text-sm text-gray-500">Rental Price: ฿{car.rentalPrice}/day</p>
                    <div className="mt-2 flex items-center">
                      <FiStar className="text-yellow-400" />
                      <span className="ml-1 text-sm text-gray-500">
                        {car.ratingScore ? car.ratingScore.toFixed(1) : 'No ratings'} ({car.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FiUser className="mr-1" />
                      Owner: {car.createdBy.name}
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <Link
                      href={`/admin/cars/${car._id}`}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/admin/cars/${car._id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiEdit2 />
                    </Link>
                    <button
                      onClick={() => handleDelete(car._id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCarsPage;