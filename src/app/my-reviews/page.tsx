'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiStar, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';

interface Rating {
  _id: string;
  score: number;
  comment: string;
  createdAt: string;
  car: {
    _id: string;
    make: string;
    model: string;
    year: number;
    numberPlates: string;
  };
}

const MyReviewsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ score: 5, comment: '' });

  // Group reviews by car
  const groupedReviews = reviews.reduce((groups: { [key: string]: Rating[] }, review) => {
    const carKey = review.car._id;
    if (!groups[carKey]) {
      groups[carKey] = [];
    }
    groups[carKey].push(review);
    return groups;
  }, {});

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
      fetchReviews();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations/my');
      const reservationsWithRatings = response.data.data.filter(
        (reservation: any) => reservation.rating
      );
      setReviews(reservationsWithRatings.map((res: any) => ({
        _id: res.rating._id,
        score: res.rating.score,
        comment: res.rating.comment,
        createdAt: res.rating.createdAt,
        car: res.car
      })));
      setError('');
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load your reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: Rating) => {
    setEditingReview(review._id);
    setEditForm({ score: review.score, comment: review.comment });
  };

  const handleUpdate = async (carId: string, ratingId: string) => {
    try {
      await api.put(`/cars/${carId}/ratings/${ratingId}`, editForm);
      setEditingReview(null);
      await fetchReviews();
    } catch (err) {
      console.error('Error updating review:', err);
      setError('Failed to update review. Please try again later.');
    }
  };

  const handleDelete = async (carId: string, ratingId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/cars/${carId}/ratings/${ratingId}`);
      await fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again later.');
    }
  };

  const renderStars = (score: number) => {
    return Array(5).fill(0).map((_, index) => (
      <FiStar
        key={index}
        className={`h-5 w-5 ${index < score ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
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
          <h1 className="text-2xl font-semibold text-gray-900">My Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">Reviews you've written for cars you've rented</p>
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

        <div className="space-y-8">
          {Object.keys(groupedReviews).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FiStar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start by rating cars you've rented.</p>
            </div>
          ) : (
            Object.entries(groupedReviews).map(([carId, carReviews]) => (
              <div key={carId} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">
                    {carReviews[0].car.make} {carReviews[0].car.model} ({carReviews[0].car.year})
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Number Plates: {carReviews[0].car.numberPlates}
                  </p>
                </div>

                <div className="divide-y divide-gray-200">
                  {carReviews.map((review) => (
                    <div key={review._id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            {editingReview === review._id ? (
                              <div className="flex space-x-1">
                                {Array(5).fill(0).map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setEditForm({ ...editForm, score: index + 1 })}
                                    className="focus:outline-none"
                                  >
                                    <FiStar
                                      className={`h-5 w-5 ${
                                        index < editForm.score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="flex space-x-1">
                                {renderStars(review.score)}
                              </div>
                            )}
                            <span className="ml-2 text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          {editingReview === review._id ? (
                            <textarea
                              value={editForm.comment}
                              onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                              className="mt-4 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              rows={3}
                              placeholder="Write your review..."
                            />
                          ) : (
                            <p className="mt-4 text-gray-600">{review.comment}</p>
                          )}
                        </div>

                        <div className="ml-4 flex-shrink-0">
                          {editingReview === review._id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdate(review.car._id, review._id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingReview(null)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(review)}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <FiEdit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(review.car._id, review._id)}
                                className="text-red-400 hover:text-red-500"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReviewsPage;