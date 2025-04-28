'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { FiStar, FiAlertCircle } from 'react-icons/fi';

const AddReviewPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get('carId');

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    score: 5,
    comment: ''
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !carId) {
        router.push('/auth/login');
        return;
      }
      fetchCarDetails();
    }
  }, [isAuthenticated, isLoading, carId, router]);

  const fetchCarDetails = async () => {
    try {
      const response = await api.get(`/cars/${carId}`);
      setCar(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching car details:', err);
      setError('Failed to load car details');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carId) return;

    try {
      await api.post(`/cars/${carId}/ratings`, formData);
      router.push('/my-reviews');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Write a Review</h1>
            {car && (
              <div className="mt-2">
                <h2 className="text-lg font-medium text-gray-900">
                  {car.make} {car.model} ({car.year})
                </h2>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <FiAlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3 text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="mt-2 flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFormData({ ...formData, score })}
                      className="focus:outline-none"
                    >
                      <FiStar
                        className={`h-8 w-8 ${
                          score <= formData.score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                  Review
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Write your review here..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReviewPage;