'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FiFilter, FiX, FiStar, FiCalendar, FiShoppingCart } from 'react-icons/fi';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  description: string;
  rentalPrice: number;
  color: string;
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  features: string[];
  available: boolean;
  ratingScore: number;
  discountedPrice?: number;
}

interface FilterState {
  make: string;
  model: string;
  year: string;
  transmission: string;
  fuelType: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
}

const CarsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    make: '',
    model: '',
    year: '',
    transmission: '',
    fuelType: '',
    color: '',
    minPrice: '',
    maxPrice: '',
    minRating: ''
  });
  const [sortBy, setSortBy] = useState('-createdAt');
  const [showFilters, setShowFilters] = useState(false);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      queryParams.append('sort', sortBy);
      queryParams.append('available', 'true');

      const response = await api.get(`/cars?${queryParams.toString()}`);
      if (response.data.success) {
        setCars(response.data.data);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [filters, sortBy]);

  

  // Helper to calculate discounted price based on membership tier
  const getDiscountedPrice = (price: number) => {
    if (!user?.membershipTier || user.membershipTier === 'basic') return null;
    if (user.membershipTier === 'silver') return Math.round(price * 0.9);
    if (user.membershipTier === 'gold') return Math.round(price * 0.85);
    return null;
  };

  // Reload the page once when user reaches this page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!sessionStorage.getItem('carsPageReloaded')) {
        sessionStorage.setItem('carsPageReloaded', 'true');
        window.location.reload();
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold text-gray-900">
              Available Cars
            </h2>
            <p className="mt-1 text-lg text-gray-500">
              Find and rent the perfect car for your needs
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {showFilters ? <FiX className="mr-2" /> : <FiFilter className="mr-2" />}
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-6">
          {/* Filter Panel - Slides in on mobile */}
          <div className={`${showFilters ? 'block' : 'hidden md:block'} w-full md:w-64 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-4`}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <p className="mt-1 text-sm text-gray-500">Refine your search</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price Range</label>
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Make</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={filters.make}
                    onChange={(e) => setFilters(prev => ({ ...prev, make: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={filters.model}
                    onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Transmission</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={filters.transmission}
                    onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                  >
                    <option value="">All</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={filters.fuelType}
                    onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                  >
                    <option value="">All</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Rating</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={filters.minRating}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">
                {cars.length} cars found
              </div>
              <select
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="rentalPrice">Price: Low to High</option>
                <option value="-rentalPrice">Price: High to Low</option>
                <option value="-ratingScore">Rating: High to Low</option>
              </select>
            </div>

            {/* Car Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => {
                  const discountedPrice = getDiscountedPrice(car.rentalPrice);
                  return (
                  <div key={car._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {car.make} {car.model}
                        </h3>
                        <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                          <FiStar className="text-yellow-400 h-4 w-4 mr-1" />
                          <span className="text-sm font-medium text-yellow-800">
                            {car.ratingScore.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{car.year}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-700">
                          <FiCalendar className="h-5 w-5 mr-2" />
                          <span>{car.transmission} · {car.fuelType}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <FiShoppingCart className="h-5 w-5 mr-2" />
                          {discountedPrice ? (
                            <>
                              <span className="text-lg font-semibold text-green-600">฿{discountedPrice}/day</span>
                              <span className="ml-2 text-sm line-through text-gray-500">
                                ฿{car.rentalPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-semibold">฿{car.rentalPrice}/day</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <Link
                          href={`/cars/${car._id}`}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Details & Book
                        </Link>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarsPage;