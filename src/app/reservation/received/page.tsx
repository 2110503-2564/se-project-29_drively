'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiCalendar, FiUser, FiMail, FiCheck, FiX, FiAlertCircle, FiShoppingCart } from 'react-icons/fi';

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

interface GroupedReservations {
  [key: string]: {
    car: Car;
    reservations: Reservation[];
  };
}

const ReceivedReservationsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [groupedReservations, setGroupedReservations] = useState<GroupedReservations>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStatus, setActiveStatus] = useState<'all' | 'pending' | 'accepted'>('all');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      
      if (user?.role !== 'car-owner') {
        router.push('/dashboard');
        return;
      }

      fetchReceivedReservations();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchReceivedReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations/received');
      
      // Group reservations by car
      const grouped = response.data.data.reduce((acc: GroupedReservations, reservation: Reservation) => {
        const carId = reservation.car._id;
        if (!acc[carId]) {
          acc[carId] = {
            car: reservation.car,
            reservations: []
          };
        }
        acc[carId].reservations.push(reservation);
        return acc;
      }, {});

      // Sort reservations within each group by date
      (Object.values(grouped) as { car: Car; reservations: Reservation[] }[]).forEach((group) => {
        group.reservations.sort((a, b) => new Date(a.pickUpDate).getTime() - new Date(b.pickUpDate).getTime());
      });

      setGroupedReservations(grouped);
      setError('');
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      setError('');
      const response = await api.put(`/reservations/${reservationId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        // If there were any conflicting reservations deleted, show a message
        if (response.data.deletedConflicts > 0) {
          alert(`Request accepted. ${response.data.deletedConflicts} conflicting request(s) were automatically removed.`);
        }
        await fetchReceivedReservations(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error updating reservation:', err);
      setError(err.response?.data?.error || 'Failed to update reservation status.');
    }
  };

  const handleDelete = async (reservationId: string) => {
    if (!confirm('Are you sure you want to delete this reservation request?')) return;

    try {
      setError('');
      await api.delete(`/reservations/${reservationId}`);
      await fetchReceivedReservations(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting reservation:', err);
      setError(err.response?.data?.error || 'Failed to delete the reservation.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Helper to calculate discounted price based on membership tier
  const getDiscountedPrice = (price: number, membershipTier: string | undefined) => {
    if (!membershipTier || membershipTier === 'basic') return null;
    if (membershipTier === 'silver') return Math.round(price * 0.9);
    if (membershipTier === 'gold') return Math.round(price * 0.85);
    return null;
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
          <h1 className="text-2xl font-semibold text-gray-900">Received Reservations</h1>
          <p className="mt-1 text-sm text-gray-500">Manage reservations for your cars</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'pending', 'accepted'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
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

        {Object.entries(groupedReservations).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't received any reservation requests yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedReservations).map(([carId, { car, reservations }]) => {
              const filteredReservations = activeStatus === 'all'
                ? reservations
                : reservations.filter(r => r.status === activeStatus);

              if (filteredReservations.length === 0) return null;

              return (
                <div key={carId} className="bg-white rounded-lg shadow overflow-hidden">
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
                      // If you have access to the user's membershipTier, use it here.
                      // For now, assume reservation.user.membershipTier exists (add to Reservation type if needed).
                      // If not available, just show the normal price.
                      const membershipTier = (reservation.user as any).membershipTier;
                      const discountedPrice = getDiscountedPrice(car.rentalPrice, membershipTier);
                      return (
                        <li key={reservation._id} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-4 md:mb-0">
                              <div className="flex items-center">
                                <FiUser className="h-5 w-5 text-gray-400" />
                                <span className="ml-2 font-medium">{reservation.user.name}</span>
                                <span className={`ml-4 px-2 py-1 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </span>
                              </div>
                              
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                                {reservation.user.email}
                              </div>
                              
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center text-sm text-gray-500">
                                  <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                  Pick-up: {formatDate(reservation.pickUpDate)}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                  Return: {formatDate(reservation.returnDate)}
                                </div>
                              </div>

                              <div className="mt-2 flex items-center text-sm">
                                <FiShoppingCart className="h-4 w-4 text-gray-400 mr-2" />
                                {discountedPrice ? (
                                  <>
                                    <span className="font-medium text-green-600">฿{reservation.totalPrice}</span>
                                    <span className="ml-2 text-sm line-through text-gray-500">
                                      ฿
                                      {(() => {
                                        const days =
                                          (new Date(reservation.returnDate).getTime() -
                                            new Date(reservation.pickUpDate).getTime()) /
                                          (1000 * 60 * 60 * 24);
                                        return Math.round(car.rentalPrice * days);
                                      })()}
                                    </span>
                                    <span className="ml-2 text-xs text-green-700">
                                      {membershipTier === 'silver' && '10% off (Silver)'}
                                      {membershipTier === 'gold' && '15% off (Gold)'}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-medium">฿{reservation.totalPrice}</span>
                                )}
                              </div>
                            </div>

                            {reservation.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusUpdate(reservation._id, 'accepted')}
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                  <FiCheck className="mr-2" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDelete(reservation._id)}
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                  <FiX className="mr-2" />
                                  Delete
                                </button>
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

export default ReceivedReservationsPage;