'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FiStar, FiCalendar, FiShoppingCart, FiTruck, FiUser, FiPhone, FiMail, FiFeather, FiAlertCircle } from 'react-icons/fi';
import React from 'react';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  description: string;
  rentalPrice: number;
  color: string;
  transmission: string;
  fuelType: string;
  features: string[];
  available: boolean;
  ratingScore: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    telephoneNumber: string;
  };
  ratings: Array<{
    score: number;
    comment: string;
    user: {
      name: string;
    };
    createdAt: string;
  }>;
}

export default function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id } = React.use(params);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pickUpDate, setPickUpDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [reservationError, setReservationError] = useState('');

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const response = await api.get(`/cars/${id}`);
      if (response.data.success) {
        setCar(response.data.data);
      }
    } catch (error) {
      setError('Failed to load car details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await api.post('/reservations', {
        car: car?._id,
        pickUpDate,
        returnDate
      });

      if (response.data.success) {
        router.push('/reservation/my');
      }
    } catch (error: any) {
      setReservationError(error.response?.data?.error || 'Failed to create reservation');
    }
  };

  // Helper to calculate discounted price based on membership tier
  const getDiscountedPrice = (price: number) => {
    if (!user?.membershipTier || user.membershipTier === 'basic') return null;
    if (user.membershipTier === 'silver') return Math.round(price * 0.9);
    if (user.membershipTier === 'gold') return Math.round(price * 0.85);
    return null;
  };

  const calculateTotalPrice = () => {
    if (!pickUpDate || !returnDate) return 0;
    const start = new Date(pickUpDate);
    const end = new Date(returnDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const discounted = getDiscountedPrice(car?.rentalPrice || 0);
    const pricePerDay = discounted ?? (car?.rentalPrice || 0);
    return days * pricePerDay;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error || 'Car not found'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {car.make} {car.model}
                </h1>
                <p className="mt-2 text-xl text-gray-500">Year: {car.year}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                <div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center">
                  <FiStar className="text-yellow-400 h-5 w-5 mr-1" />
                  <span className="font-medium text-yellow-800">{car.ratingScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 sm:p-8">
            {/* Car Details Section */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">About this car</h2>
                <p className="text-gray-600">{car.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <FiTruck className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Transmission</p>
                    <p className="font-medium">{car.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FiShoppingCart className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Price per day</p>
                    {(() => {
                      const discounted = getDiscountedPrice(car.rentalPrice);
                      if (discounted) {
                        return (
                          <span>
                            <span className="text-green-600 font-bold">฿{discounted}</span>
                            <span className="ml-2 text-gray-400 line-through">฿{car.rentalPrice}</span>
                            <span className="ml-2 text-xs text-green-700">
                              {user?.membershipTier === 'silver' && '10% off (Silver)'}
                              {user?.membershipTier === 'gold' && '15% off (Gold)'}
                            </span>
                          </span>
                        );
                      }
                      return <span className="font-medium">฿{car.rentalPrice}</span>;
                    })()}
                  </div>
                </div>
                <div className="flex items-center">
                  <FiFeather className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Fuel Type</p>
                    <p className="font-medium">{car.fuelType}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full mr-2" style={{ backgroundColor: car.color }}></div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium">{car.color}</p>
                  </div>
                </div>
              </div>

              {car.features.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Features</h2>
                  <ul className="grid grid-cols-2 gap-4">
                    {car.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <FiFeather className="h-4 w-4 text-indigo-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Owner Info */}
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                <h2 className="text-xl font-semibold mb-4 text-purple-900">Car Owner</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FiUser className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-purple-900">{car.createdBy.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FiMail className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-purple-900">{car.createdBy.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-purple-900">{car.createdBy.telephoneNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Section */}
            <div className="lg:col-span-1">
              {car.available && user?.role === 'car-renter' ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Make a Reservation</h2>
                  <form onSubmit={handleReservation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pick-up Date</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={pickUpDate}
                        onChange={(e) => setPickUpDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Return Date</label>
                      <input
                        type="date"
                        required
                        min={pickUpDate || new Date().toISOString().split('T')[0]}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {totalPrice > 0 && (
                      <div className="bg-white rounded-md p-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Price:</span>
                          <span className="text-xl font-bold">
                            ฿{totalPrice}
                            {getDiscountedPrice(car.rentalPrice) && (
                              <span className="ml-2 text-base text-gray-400 line-through">
                                ฿{(() => {
                                  if (!pickUpDate || !returnDate) return 0;
                                  const start = new Date(pickUpDate);
                                  const end = new Date(returnDate);
                                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                  return days * car.rentalPrice;
                                })()}
                              </span>
                            )}
                          </span>
                        </div>
                        {getDiscountedPrice(car.rentalPrice) && (
                          <div className="text-xs text-green-700 mt-1">
                            {user?.membershipTier === 'silver' && '10% off (Silver)'}
                            {user?.membershipTier === 'gold' && '15% off (Gold)'}
                          </div>
                        )}
                      </div>
                    )}

                    {reservationError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                        {reservationError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Request Reservation
                    </button>
                  </form>
                </div>
              ) : !car.available ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <FiCalendar className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Currently Unavailable
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        This car is currently reserved. Please check back later or browse other available cars.
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Reviews Section */}
          {car.ratings && car.ratings.length > 0 && (
            <div className="border-t border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-6">Reviews</h2>
              <div className="space-y-6">
                {car.ratings.map((rating, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="font-medium">
                          {rating.user && rating.user.name ? rating.user.name : 'Anonymous'}
                        </div>
                        <div className="ml-4 flex items-center">
                          <FiStar className="text-yellow-400 h-4 w-4" />
                          <span className="ml-1 text-sm text-gray-600">{rating.score}</span>
                        </div>
                      </div>
                      <time className="text-sm text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="mt-2 text-gray-600">{rating.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}