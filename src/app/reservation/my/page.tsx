'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiClock, FiCheck, FiX, FiAlertCircle, FiCalendar, FiShoppingCart, FiStar } from 'react-icons/fi';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  numberPlates: string;
  rentalPrice: number;
  available: boolean;
  createdBy: string;
  ratings: Array<{
    user: string;
    score: number;
    comment: string;
    createdAt: Date;
  }>;
  ratingScore: number;
  reviewCount: number;
  createdAt: Date;
}

interface Reservation {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  car: Car;
  pickUpDate: string;
  returnDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  rating?: {
    score: number;
    comment: string;
    createdAt: Date;
  };
}

const MyReservationsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Add userRatings state for review system
  const [userRatings, setUserRatings] = useState<Record<string, any>>({});
  const [activeStatus] = useState<'all' | 'pending' | 'accepted'>('all');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      if (user?.role !== 'car-renter') {
        router.push('/dashboard');
        return;
      }
      fetchMyReservations();
      fetchUserRatings();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchMyReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations/my');
      setReservations(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load your reservations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user ratings for review system
  const fetchUserRatings = async () => {
    try {
      const response = await api.get('/ratings/my/reviews');
      const ratingsMap = response.data.data.reduce((acc: any, rating: any) => {
        acc[rating.car._id] = rating;
        return acc;
      }, {});
      setUserRatings(ratingsMap);
    } catch (err: any) {
      // Only log error if it's not a 404 (not found)
      if (err?.response?.status !== 404) {
        console.error('Error fetching user ratings:', err);
      }
      // If 404, just set empty ratings (no reviews yet)
      setUserRatings({});
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/${reservationId}`);
      setReservations(reservations.filter(res => res._id !== reservationId));
    } catch (err) {
      console.error('Error canceling reservation:', err);
      setError('Failed to cancel the reservation. Please try again later.');
    }
  };

  // Review system: handle review button
  const handleRateReservation = (carId: string) => {
    router.push(`/my-reviews/add?carId=${carId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="mr-1.5 h-4 w-4" />;
      case 'accepted':
        return <FiCheck className="mr-1.5 h-4 w-4" />;
      case 'cancelled':
        return <FiX className="mr-1.5 h-4 w-4" />;
      default:
        return null;
    }
  };

  // Helper to calculate discounted price based on membership tier
  const getDiscountedPrice = (price: number) => {
    if (!user?.membershipTier || user.membershipTier === 'basic') return null;
    if (user.membershipTier === 'silver') return Math.round(price * 0.9);
    if (user.membershipTier === 'gold') return Math.round(price * 0.85);
    return null;
  };

  // Render review button or "Already Reviewed" for accepted reservations
  const renderRatingSection = (reservation: any) => {
    if (reservation.status !== 'accepted') {
      return null;
    }
    if (userRatings[reservation.car._id] || reservation.rating) {
      return (
        <div className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm rounded-md bg-gray-50 text-gray-600">
          <FiCheck className="mr-2" />
          Already Reviewed
        </div>
      );
    }
    return (
      <button
        onClick={() => handleRateReservation(reservation.car._id)}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
      >
        <FiStar className="mr-2" />
        Review the Car
      </button>
    );
  };

  // Group reservations by car for review system
  const groupedReservations = reservations.reduce((groups: { [key: string]: { car: Car; reservations: Reservation[] } }, reservation) => {
    const carId = reservation.car._id;
    if (!groups[carId]) {
      groups[carId] = {
        car: reservation.car,
        reservations: []
      };
    }
    groups[carId].reservations.push(reservation);
    return groups;
  }, {});

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
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Reservations</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your car reservations</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {Object.keys(groupedReservations).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations found</h3>
            <p className="mt-1 text-sm text-gray-500">Start by browsing available cars.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedReservations).map(([carId, { car, reservations }]) => {
              const filteredReservations = activeStatus === 'all'
                ? reservations
                : reservations.filter(r => r.status === activeStatus);

              if (filteredReservations.length === 0) return null;

              return (
                <div key={carId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">
                      {car.make} {car.model} ({car.year})
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Number Plates: {car.numberPlates}
                    </p>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => {
                      const discountedPrice = getDiscountedPrice(reservation.car.rentalPrice);
                      // Calculate original total price for strike-through if discounted
                      let originalTotal = reservation.totalPrice;
                      if (discountedPrice) {
                        const days =
                          (new Date(reservation.returnDate).getTime() -
                            new Date(reservation.pickUpDate).getTime()) /
                          (1000 * 60 * 60 * 24);
                        originalTotal = Math.round(
                          (discountedPrice / (1 - (user?.membershipTier === 'silver' ? 0.1 : 0.15))) * days
                        );
                      }
                      return (
                        <li key={reservation._id} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-4 md:mb-0">
                              <div className="flex items-center">
                                <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getStatusColor(reservation.status)}`}>
                                  {getStatusIcon(reservation.status)}
                                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center text-sm text-gray-500">
                                  <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                  Pick-up: {new Date(reservation.pickUpDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                  Return: {new Date(reservation.returnDate).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center text-sm">
                                <FiShoppingCart className="h-4 w-4 text-gray-400 mr-2" />
                                {discountedPrice ? (
                                  <>
                                    <span className="font-medium text-green-600">฿{reservation.totalPrice}</span>
                                    <span className="ml-2 text-base line-through text-gray-500">
                                      ฿
                                      {(() => {
                                        const days =
                                          (new Date(reservation.returnDate).getTime() -
                                            new Date(reservation.pickUpDate).getTime()) /
                                          (1000 * 60 * 60 * 24);
                                        return Math.round(reservation.car.rentalPrice * days);
                                      })()}
                                    </span>
                                    <span className="ml-2 text-xs text-green-700">
                                      {user?.membershipTier === 'silver' && '10% off (Silver)'}
                                      {user?.membershipTier === 'gold' && '15% off (Gold)'}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-medium">฿{reservation.totalPrice}</span>
                                )}
                              </div>
                            </div>
                            {/* Cancel button for pending, review for accepted */}
                            {reservation.status === 'pending' && (
                              <div className="mt-6">
                                <button
                                  onClick={() => handleCancel(reservation._id)}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                                >
                                  Cancel Request
                                </button>
                              </div>
                            )}
                            {reservation.status === 'accepted' && (
                              <div className="mt-6">
                                {renderRatingSection(reservation)}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservationsPage;