'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { FiEdit2, FiTrash2, FiStar, FiArrowLeft, FiCalendar, FiUser } from 'react-icons/fi';

interface Rating {
  user: {
    name: string;
    _id: string;
  };
  score: number;
  comment: string;
  createdAt: string;
}

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  numberPlates: string;
  description: string;
  rentalPrice: number;
  available: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  ratings: Rating[];
  ratingScore: number;
  reviewCount: number;
  color: string;
  transmission: string;
  fuelType: string;
  features: string[];
}

const AdminCarDetailPage = ({ params }: { params: { id: string } }) => {
  const carId = params.id;
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
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

      fetchCarDetails();
    }
  }, [isAuthenticated, isLoading, user, router, carId]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cars/${carId}`);
      setCar(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching car details:', err);
      setError('Failed to load car details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) return;

    try {
      await api.delete(`/cars/${carId}`);
      router.push('/admin/cars');
    } catch (err) {
      console.error('Error deleting car:', err);
      setError('Failed to delete the car. Please try again later.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Car not found</h3>
            <div className="mt-6">
              <Link
                href="/admin/cars"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FiArrowLeft className="mr-2" /> Back to Cars
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link
              href="/admin/cars"
              className="mr-4 text-indigo-600 hover:text-indigo-700"
            >
              <FiArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              {car.make} {car.model}
            </h1>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/admin/cars/${car._id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiEdit2 className="mr-2" /> Edit Car
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <FiTrash2 className="mr-2" /> Delete Car
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* Car Details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Year:</span> {car.year}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Number Plates:</span> {car.numberPlates}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Color:</span> {car.color}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Transmission:</span> {car.transmission}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Fuel Type:</span> {car.fuelType}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Rental Price:</span> ฿{car.rentalPrice}/day
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Status:</span>{' '}
                    <span className={car.available ? 'text-green-600' : 'text-red-600'}>
                      {car.available ? 'Available' : 'Unavailable'}
                    </span>
                  </p>
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-gray-900">Owner Information</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {car.createdBy.name} ({car.createdBy.email})
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Features</h3>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {car.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {car.description && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900">Description</h4>
                    <p className="mt-2 text-sm text-gray-500">{car.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Ratings & Reviews ({car.reviewCount})
          </h2>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6 flex items-center">
                <FiStar className="h-5 w-5 text-yellow-400" />
                <span className="ml-2 text-lg font-medium">
                  {car.ratingScore ? car.ratingScore.toFixed(1) : 'No ratings'} / 5
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({car.reviewCount} {car.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {car.ratings.length > 0 ? (
                <div className="space-y-6">
                  {car.ratings.map((rating, index) => (
                    <div key={index} className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{rating.user.name}</p>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < rating.score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          <FiCalendar className="inline mr-1" />
                          {formatDate(rating.createdAt)}
                        </p>
                      </div>
                      {rating.comment && (
                        <p className="mt-4 text-sm text-gray-500">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCarDetailPage;