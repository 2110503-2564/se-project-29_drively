'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { FiSave, FiX } from 'react-icons/fi';

interface CarFormData {
  make: string;
  model: string;
  year: number;
  numberPlates: string;
  description: string;
  rentalPrice: number;
  color: string;
  transmission: string;
  fuelType: string;
  features: string[];
}

const AddCarPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<CarFormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    numberPlates: '',
    description: '',
    rentalPrice: 0,
    color: '',
    transmission: '',
    fuelType: '',
    features: []
  });

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
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'rentalPrice' || name === 'year') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    
    setFormData({
      ...formData,
      features: [...formData.features, newFeature.trim()]
    });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/cars', formData);
      router.push(`/my-cars/${response.data.data._id}`);
    } catch (err: any) {
      console.error('Error creating car:', err);
      setError(err.response?.data?.error || 'Failed to create car. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Add New Car
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new car to your rental listings
            </p>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <Link
              href="/my-cars"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiX className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Cancel
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                  Make
                </label>
                <input
                  type="text"
                  name="make"
                  id="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Toyota"
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  id="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Camry"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="numberPlates" className="block text-sm font-medium text-gray-700">
                  Number Plates
                </label>
                <input
                  type="text"
                  name="numberPlates"
                  id="numberPlates"
                  value={formData.numberPlates}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., ABC123"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  id="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Silver"
                />
              </div>

              <div>
                <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
                  Transmission
                </label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select transmission type</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
                  Fuel Type
                </label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select fuel type</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label htmlFor="rentalPrice" className="block text-sm font-medium text-gray-700">
                  Rental Price (฿ per day)
                </label>
                <input
                  type="number"
                  name="rentalPrice"
                  id="rentalPrice"
                  value={formData.rentalPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., 50.00"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe your car..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Features</label>
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature (e.g., GPS, Bluetooth)"
                    className="flex-1 block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                      >
                        <span className="sr-only">Remove feature</span>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                {isSubmitting ? 'Creating...' : 'Create Car'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCarPage;