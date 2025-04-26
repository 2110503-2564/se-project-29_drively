'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus, FiCreditCard, FiKey, FiTruck } from 'react-icons/fi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    telephoneNumber: '',
    role: '',
    driverLicense: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <label className="text-base font-medium text-gray-900">Select your role</label>
              <div className="space-y-4">
                <div
                  className={`relative flex cursor-pointer rounded-lg border ${
                    formData.role === 'car-renter'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 bg-white'
                  } p-4 shadow-sm focus:outline-none`}
                  onClick={() => setFormData({ ...formData, role: 'car-renter' })}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <FiKey className={`mr-2 h-5 w-5 ${
                            formData.role === 'car-renter' ? 'text-indigo-600' : 'text-gray-400'
                          }`} />
                          <p className={`font-medium ${
                            formData.role === 'car-renter' ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            Car Renter
                          </p>
                        </div>
                        <p className={`mt-1 ${
                          formData.role === 'car-renter' ? 'text-indigo-700' : 'text-gray-500'
                        }`}>
                          Rent cars from owners and explore various vehicles
                        </p>
                      </div>
                    </div>
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      formData.role === 'car-renter'
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {formData.role === 'car-renter' && (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`relative flex cursor-pointer rounded-lg border ${
                    formData.role === 'car-owner'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 bg-white'
                  } p-4 shadow-sm focus:outline-none`}
                  onClick={() => setFormData({ ...formData, role: 'car-owner' })}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <FiTruck className={`mr-2 h-5 w-5 ${
                            formData.role === 'car-owner' ? 'text-indigo-600' : 'text-gray-400'
                          }`} />
                          <p className={`font-medium ${
                            formData.role === 'car-owner' ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            Car Owner
                          </p>
                        </div>
                        <p className={`mt-1 ${
                          formData.role === 'car-owner' ? 'text-indigo-700' : 'text-gray-500'
                        }`}>
                          List your vehicles and earn money by renting them out
                        </p>
                      </div>
                    </div>
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      formData.role === 'car-owner'
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {formData.role === 'car-owner' && (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none rounded-t-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telephoneNumber" className="sr-only">Telephone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="telephoneNumber"
                    name="telephoneNumber"
                    type="tel"
                    pattern="[0-9]{10}"
                    required
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Phone Number (10 digits)"
                    value={formData.telephoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formData.role === 'car-renter' && (
                <div>
                  <label htmlFor="driverLicense" className="sr-only">Driver License</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="driverLicense"
                      name="driverLicense"
                      type="text"
                      required
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Driver License Number"
                      value={formData.driverLicense}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.role}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FiUserPlus className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
              </span>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;