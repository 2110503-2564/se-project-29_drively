'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiClock, FiCheck, FiX, FiAlertCircle, FiCalendar, FiShoppingCart } from 'react-icons/fi';

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
}

const MyReservationsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        {reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations found</h3>
            <p className="mt-1 text-sm text-gray-500">Start by browsing available cars.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div key={reservation._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {reservation.car.make} {reservation.car.model} ({reservation.car.year})
                      </h3>
                      <div className="mt-2 flex items-center">
                        <span className={`px-2 py-1 text-sm font-medium rounded-full flex items-center ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="flex items-center text-gray-700">
                        <FiShoppingCart className="h-5 w-5 text-gray-400 mr-1" />
                        <span className="text-lg font-semibold">฿{reservation.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center">
                        <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Pick-up Date</p>
                          <p className="font-medium">
                            {new Date(reservation.pickUpDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Return Date</p>
                          <p className="font-medium">
                            {new Date(reservation.returnDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservationsPage;