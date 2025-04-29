'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiClock, FiX, FiCheckCircle, FiUsers, FiArrowRight, FiEdit2, FiUser, FiStar } from 'react-icons/fi';

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

interface CoworkingSpace {
  _id: string;
  name: string;
  location: string;
  availableSeats: number;
}

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  numberPlates: string;
  rentalPrice: number;
  discountedPrice?: number;
  discountRate?: number;
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

interface CarOwnerReservation extends Reservation {
  car: Car;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [ownerReservations, setOwnerReservations] = useState<CarOwnerReservation[]>([]);
  const [popularCars, setPopularCars] = useState<Car[]>([]);
  const [suggestedCars, setSuggestedCars] = useState<Car[]>([]);
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promotions, setPromotions] = useState<{ title: string; description: string }[]>([]);
  const router = useRouter();
  const MAX_SUGGESTED_SPACES = 3;

  // Fetch promotions from backend
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await api.get('/promotions');
        if (res.data.success) {
          setPromotions(res.data.data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      if (user?.role === 'car-owner') {
        Promise.all([fetchOwnerReservations(), fetchPopularCars()]);
      } else if (user?.role === 'car-renter') {
        Promise.all([fetchReservations(), fetchSuggestedCars()]);
      } else if (user?.role === 'admin') {
        Promise.all([fetchAllReservations(), fetchAllCars()]);
      }
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  const fetchMyCars = async () => {
    try {
      const response = await api.get('/cars/my');
      setMyCars(response.data.data);
    } catch (err) {
      console.error('Error fetching cars:', err);
    }
  };

  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations/all');
      setReservations(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching all reservations:', err);
      setError('Failed to load reservations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCars = async () => {
    try {
      const response = await api.get('/cars');
      setSuggestedCars(response.data.data);
    } catch (err) {
      console.error('Error fetching all cars:', err);
    }
  };

  const fetchReservations = async () => {
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

  const fetchSuggestedCars = async () => {
    try {
      const response = await api.get('/cars?limit=3');
      setSuggestedCars(response.data.data.slice(0, MAX_SUGGESTED_SPACES));
    } catch (err) {
      console.error('Error fetching suggested cars:', err);
    }
  };

  const fetchOwnerReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations/received');
      setOwnerReservations(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching owner reservations:', err);
      setError('Failed to load reservation requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularCars = async () => {
    try {
      const response = await api.get('/cars/my/top-rated');
      setPopularCars(response.data.data);
    } catch (err) {
      console.error('Error fetching popular cars:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Promotion Announce List Component
  const PromotionList = () => (
    user?.membershipTier && (user.membershipTier === 'silver' || user.membershipTier === 'gold') && promotions.length > 0 ? (
      <div className="mb-6">
        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-800 mb-2">Announcements & Promotions</h2>
          <ul className="space-y-2">
            {promotions.map((promo, idx) => (
              <li key={idx} className="text-indigo-900">
                <span className="font-bold">{promo.title}</span>
                <span className="block text-sm text-indigo-700">{promo.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : null
  );

  if (user?.role === 'car-owner') {
    // Sort all reservations by date, pending first
    const sortedReservations = ownerReservations
      .sort((a, b) => {
        // Sort pending requests first
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        // Then sort by date
        return new Date(a.pickUpDate).getTime() - new Date(b.pickUpDate).getTime();
      });

    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PromotionList />
          <h1 className="text-2xl font-semibold text-gray-900">Owner Dashboard</h1>
          
          {/* Rental Requests Section */}
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg leading-6 font-medium text-gray-900">Rental Requests</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      View and manage all rental requests for your cars
                    </p>
                  </div>
                  <Link
                    href="/reservation/received"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View all requests <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-200">
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm text-red-600">{error}</div>
                  </div>
                )}

                {sortedReservations.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>You don't have any rental requests yet.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {sortedReservations.slice(0, 5).map((reservation) => (
                      <li key={reservation._id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <FiCalendar className="h-6 w-6 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900">
                                {reservation.car.make} {reservation.car.model}
                              </h4>
                              <div className="mt-1">
                                <p className="text-sm text-gray-500">
                                  Renter: {reservation.user.name}
                                </p>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <p>{formatDate(reservation.pickUpDate)} - {formatDate(reservation.returnDate)}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              reservation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : reservation.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Popular Cars Section */}
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg leading-6 font-medium text-gray-900">Your Most Popular Cars</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Cars with the highest ratings
                    </p>
                  </div>
                  <Link
                    href="/my-cars"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View all your cars <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {popularCars.map((car) => (
                    <div key={car._id} className="bg-white overflow-hidden shadow rounded-lg border">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {car.make} {car.model}
                        </h3>
                        <div className="mt-2 flex items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.round(car.ratingScore)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="ml-2 text-sm text-gray-500">
                            ({car.reviewCount} reviews)
                          </p>
                        </div>
                        <div className="mt-4">
                          <Link
                            href={`/my-cars/${car._id}`}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Car-renter view modifications
  if (user?.role === 'car-renter') {
    // Helper to calculate discounted price based on membership tier
    const getDiscountedPrice = (price: number) => {
      if (!user?.membershipTier || user.membershipTier === 'basic') return null;
      if (user.membershipTier === 'silver') return Math.round(price * 0.9);
      if (user.membershipTier === 'gold') return Math.round(price * 0.85);
      return null;
    };

    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PromotionList />
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg leading-6 font-medium text-gray-900">Your Recent Reservations</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      View your recent car reservations
                    </p>
                  </div>
                  <Link href="/reservation/my" className="text-sm text-indigo-600 hover:text-indigo-500">
                    Edit your reservations <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FiCalendar className="mr-2" /> Your Upcoming Reservations
                </h3>
                
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm text-red-600">{error}</div>
                  </div>
                )}
                
                {reservations.length === 0 ? (
                  <div className="mt-6 text-center text-gray-500 py-4">
                    <p>You don't have any upcoming reservations.</p>
                    <Link 
                      href="/cars" 
                      className="inline-flex items-center mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Find and Book a Car Now!
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {reservations.map((reservation) => (
                        <li key={reservation._id} className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                                <FiMapPin className="h-6 w-6 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {reservation.car.make} {reservation.car.model}
                                </h4>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  <p>Pick up: {formatDate(reservation.pickUpDate)}</p>
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  <p>Return: {formatDate(reservation.returnDate)}</p>
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <span className="font-medium">Total: ฿{reservation.totalPrice}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                reservation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : reservation.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : reservation.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Suggested Cars Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Suggested Cars</h2>
              <Link href="/cars" className="text-sm text-indigo-600 hover:text-indigo-500">
                View all cars <span aria-hidden="true">→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestedCars.map((car) => {
                const discountedPrice = getDiscountedPrice(car.rentalPrice);
                return (
                  <div key={car._id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{car.make} {car.model}</h3>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <p>Year: {car.year}</p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <FiUsers className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <p>
                          Rating: {typeof car.ratingScore === 'number' ? car.ratingScore.toFixed(1) : '0.0'} ({car.reviewCount} reviews)
                        </p>
                      </div>
                      <div className="mt-2">
                        {discountedPrice ? (
                          <div>
                            <span className="text-gray-500 line-through mr-2">
                              ฿{car.rentalPrice}
                            </span>
                            <span className="text-green-600 font-bold">
                              ฿{discountedPrice}
                            </span>
                            <span className="ml-2 text-xs text-green-700">
                              {user?.membershipTier === 'silver' && '10% off (Silver)'}
                              {user?.membershipTier === 'gold' && '15% off (Gold)'}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold">฿{car.rentalPrice}</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/cars/${car._id}`}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 w-full justify-center"
                    >
                      View Details <FiArrowRight className="ml-1" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  if (user?.role === 'admin') {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PromotionList />
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg leading-6 font-medium text-gray-900">All Reservations</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      View all reservations in the system
                    </p>
                  </div>
                  <Link href="admin/reservations" className="text-sm text-indigo-600 hover:text-indigo-500">
                    View all reservations <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FiCalendar className="mr-2" /> All Reservations
                </h3>
                
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm text-red-600">{error}</div>
                  </div>
                )}
                
                {reservations.length === 0 ? (
                  <div className="mt-6 text-center text-gray-500 py-4">
                    <p>No reservations found.</p>
                  </div>
                ) : (
                  <div className="mt-6 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {reservations.map((reservation) => (
                        <li key={reservation._id} className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                                <FiMapPin className="h-6 w-6 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {reservation.car.make} {reservation.car.model}
                                </h4>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  <p>Pick up: {formatDate(reservation.pickUpDate)}</p>
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  <p>Return: {formatDate(reservation.returnDate)}</p>
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <span className="font-medium">Total: ฿{reservation.totalPrice}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                reservation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : reservation.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : reservation.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Cars Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">All Cars</h2>
              <Link href="admin/cars" className="text-sm text-indigo-600 hover:text-indigo-500">
                View all cars <span aria-hidden="true">→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestedCars.map((car) => (
                <div key={car._id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{car.make} {car.model}</h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      <p>Year: {car.year}</p>
                    </div>
                    <div className="mt-2 flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(car.ratingScore)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="ml-2 text-sm text-gray-500">
                        ({car.reviewCount} reviews)
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium">฿{car.rentalPrice}/day</span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/cars/${car._id}`}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 w-full justify-center"
                  >
                    View Details <FiArrowRight className="ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fix the default view
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PromotionList />
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Welcome</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Please select a role to continue
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;