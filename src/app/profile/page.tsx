'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiCreditCard, FiCalendar, FiShield, FiAlertTriangle } from 'react-icons/fi';
import api from '@/lib/api';

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telephoneNumber: '',
    driverLicense: ''
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Membership expiry and countdown logic
  const expiryDate = user?.membershipExpiryDate ? new Date(user.membershipExpiryDate) : null;
  const now = new Date();
  const countdown = useMemo(() => {
    if (!expiryDate) return null;
    const diff = expiryDate.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  }, [expiryDate, now]);

  const handleUpgradeMembership = () => {
    router.push('/membership/details');
  };

  const showRenew = user?.membershipTier === 'silver' || user?.membershipTier === 'gold';
  const showUpgrade = !user?.membershipTier || user?.membershipTier === 'basic' || user?.membershipTier === 'silver';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        telephoneNumber: user.telephoneNumber || '',
        driverLicense: user.driverLicense || ''
      });
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Reload the page once when user enters this page (avoid infinite loop)
  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('profilePageReloaded')) {
      sessionStorage.setItem('profilePageReloaded', 'true');
      window.location.reload();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/auth/updateprofile', formData);
      if (response.data.success) {
        updateUser(response.data.data);
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      telephoneNumber: user?.telephoneNumber || '',
      driverLicense: user?.driverLicense || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleCancelMembership = async () => {
    setCancelLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/membership/cancel');
      if (response.data.success) {
        updateUser(response.data.data);
        setSuccess('Membership cancelled. You are now a Basic member.');
        setShowCancelModal(false);
        window.location.reload(); // reload page to get latest data
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel membership');
      setShowCancelModal(false);
    } finally {
      setCancelLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="text-yellow-500 mr-2" size={24} />
              <span className="font-semibold text-lg">Cancel Membership</span>
            </div>
            <p className="mb-4 text-gray-700">
              Are you sure you want to cancel your membership? You will lose all premium benefits and revert to Basic.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={cancelLoading}
              >
                No, Keep Membership
              </button>
              <button
                onClick={handleCancelMembership}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your personal information and account details
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiEdit2 className="mr-2" /> Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FiSave className="mr-2" /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiX className="mr-2" /> Cancel
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-sm text-green-600">{success}</div>
            </div>
          )}

          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-500">
                      <FiUser className="mr-2" /> Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-500">
                      <FiMail className="mr-2" /> Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="telephoneNumber" className="flex items-center text-sm font-medium text-gray-500">
                      <FiPhone className="mr-2" /> Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="telephoneNumber"
                        id="telephoneNumber"
                        value={formData.telephoneNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{user.telephoneNumber}</p>
                    )}
                  </div>

                  {user.role === 'car-renter' && (
                    <div>
                      <label htmlFor="driverLicense" className="flex items-center text-sm font-medium text-gray-500">
                        <FiCreditCard className="mr-2" /> Driver License
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="driverLicense"
                          id="driverLicense"
                          value={formData.driverLicense}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{user.driverLicense}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <FiShield className="mr-2" /> Account Type
                    </label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {user.role === 'car-owner' ? 'Car Owner' : user.role === 'car-renter' ? 'Car Renter' : 'Administrator'}
                      </span>
                    </div>
                  </div>

                  {/* Membership Section for car-renter */}
                  {user.role === 'car-renter' && (
                    <>
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-500">
                          <FiCreditCard className="mr-2" /> Membership Tier
                        </label>
                        <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (user.membershipTier || 'basic') === 'gold'
                              ? 'bg-yellow-100 text-yellow-800'
                              : (user.membershipTier || 'basic') === 'silver'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {(user.membershipTier || 'basic').charAt(0).toUpperCase() + (user.membershipTier || 'basic').slice(1)} Membership
                          </span>
                          {showRenew && expiryDate && (
                            <span className="ml-2 text-xs text-gray-600">
                              Expire: {expiryDate.toLocaleDateString()} ({countdown})
                            </span>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {showRenew && (
                              <button
                                onClick={handleUpgradeMembership}
                                className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  expiryDate && expiryDate > new Date()
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                }`}
                                disabled={!!(expiryDate && expiryDate > new Date())}
                              >
                                Renew Membership
                              </button>
                            )}
                            {showUpgrade && (
                              <button
                                onClick={handleUpgradeMembership}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Upgrade Membership
                              </button>
                            )}
                            {(user.membershipTier === 'silver' || user.membershipTier === 'gold') && (
                              <button
                                onClick={() => setShowCancelModal(true)}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                type="button"
                              >
                                Cancel Membership
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-500">
                          <FiCalendar className="mr-2" /> Membership Details
                        </label>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Member since: {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'N/A'}</p>
                          <p>Expires: {user.membershipExpiryDate ? new Date(user.membershipExpiryDate).toLocaleDateString() : 'N/A'}</p>
                          <div className="mt-2">
                            <h4 className="font-medium">Benefits:</h4>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                              <li>Discount Rate: {(user.membershipBenefits?.discountRate ?? 0) * 100}%</li>
                              {user.membershipBenefits?.freeDelivery && <li>Free Delivery</li>}
                              {user.membershipBenefits?.prioritySupport && <li>Priority Support</li>}
                              {user.membershipBenefits?.extraDriverOption && <li>Extra Driver Option</li>}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;