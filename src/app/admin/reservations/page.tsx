'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiCalendar, FiUser, FiMail, FiCheck, FiX, FiAlertCircle, FiShoppingCart, FiTruck } from 'react-icons/fi';

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

const AdminReservationsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStatus, setActiveStatus] = useState<'all' | 'pending' | 'accepted'>('all');

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

      fetchAllReservations();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations/all');
      setReservations(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this reservation as ${newStatus}?`)) return;

    try {
      setError('');
      await api.put(`/reservations/${reservationId}/status`, {
        status: newStatus
      });
      await fetchAllReservations(); // Refresh the list
    } catch (err: any) {
      console.error('Error updating reservation:', err);
      setError(err.response?.data?.error || 'Failed to update reservation status.');
    }
  };

  const handleDelete = async (reservationId: string) => {
    if (!confirm('Are you sure you want to delete this reservation? This action cannot be undone.')) return;

    try {
      setError('');
      await api.delete(`/reservations/${reservationId}`);
      await fetchAllReservations(); // Refresh the list
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

  const groupReservationsByCar = (reservations: Reservation[]) => {
    return reservations.reduce((groups, reservation) => {
      const carId = reservation.car._id;
      if (!groups[carId]) {
        groups[carId] = {
          car: reservation.car,
          reservations: []
        };
      }
      groups[carId].reservations.push(reservation);
      return groups;
    }, {} as Record<string, { car: Car; reservations: Reservation[] }>);
  };

  const statusOptions = ['pending', 'accepted'];

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const filteredReservations = activeStatus === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === activeStatus);

  const groupedReservations = groupReservationsByCar(filteredReservations);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">All Reservations</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all reservations in the system</p>
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

        {Object.keys(groupedReservations).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations found</h3>
            <p className="mt-1 text-sm text-gray-500">No reservations match the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.values(groupedReservations).map(({ car, reservations }) => (
              <div key={car._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {car.make} {car.model} ({car.year})
                    </h3>
                    <span className="text-sm text-gray-500">
                      Plates: {car.numberPlates}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <div key={reservation._id} className="p-6">
                      <div className="lg:flex lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center mb-1">
                            <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              Renter: {reservation.user.name}
                            </span>
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
                            <span className="font-medium">฿{reservation.totalPrice}</span>
                          </div>
                        </div>

                        <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-3 items-center">
                          <select
                            value={reservation.status}
                            onChange={(e) => handleStatusUpdate(reservation._id, e.target.value)}
                            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDelete(reservation._id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <FiX className="mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReservationsPage;