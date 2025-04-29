'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { FiHome, FiCalendar, FiMapPin, FiUser, FiLogOut, FiStar, FiMessageCircle, FiSettings, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import { FiTag } from 'react-icons/fi'; // Add this import for a promotion icon

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-lg shadow-indigo-500/25 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {user?.role === 'admin' ? (
                <Link href={'/dashboard'} className="text-xl font-bold text-indigo-600 flex items-center">
                  Drively <span className="italic ml-1">admin</span>
                </Link>
              ) : (
                <Link href={'/'} className="text-xl font-bold text-indigo-600">
                  Drively
                </Link>
              )}
            </div>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className={`${
                    isActive('/dashboard')
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <FiHome className="mr-1" /> Home
                </Link>

                {/* Car Renter Navigation */}
                {user?.role === 'car-renter' && (
                  <>
                    <Link
                      href="/cars"
                      className={`${
                        isActive('/cars')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiMapPin className="mr-1" /> Available Cars
                    </Link>
                    <Link
                      href="/reservation/my"
                      className={`${
                        isActive('/reservation/my')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiCalendar className="mr-1" /> My Reservations
                    </Link>
                    {/* <Link
                      href="/favorite-cars"
                      className={`${
                        isActive('/favorite-cars')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiStar className="mr-1" /> Favorites
                    </Link> */}
                    <Link
                      href="/my-reviews"
                      className={`${
                        isActive('/my-reviews')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiMessageCircle className="mr-1" /> My Reviews
                    </Link>
                  </>
                )}

                {/* Car Owner Navigation */}
                {user?.role === 'car-owner' && (
                  <>
                    <Link
                      href="/my-cars"
                      className={`${
                        isActive('/my-cars')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiMapPin className="mr-1" /> My Cars
                    </Link>
                    {/* <Link
                      href="/car-management"
                      className={`${
                        isActive('/car-management')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiSettings className="mr-1" /> Car Management
                    </Link> */}
                    <Link
                      href="/reservation/received"
                      className={`${
                        isActive('/reservation/received')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiCalendar className="mr-1" /> Reservations
                    </Link>
                    <Link
                      href="/earnings"
                      className={`${
                        isActive('/earnings')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiDollarSign className="mr-1" /> Earnings
                    </Link>
                  </>
                )}

                {/* Admin Navigation */}
               {user?.role === 'admin' && (
                  <>
                    {/* <Link
                      href="/admin/users"
                      className={`${
                        isActive('/admin/users')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiUser className="mr-1" /> Users
                    </Link> */}
                    <Link
                      href="/admin/cars"
                      className={`${
                        isActive('/admin/cars')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiMapPin className="mr-1" /> Cars
                    </Link>
                    <Link
                      href="/admin/reservations"
                      className={`${
                        isActive('/admin/reservations')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiCalendar className="mr-1" /> Reservations
                    </Link>
                    <Link
                      href="/admin/users"
                      className={`${
                        isActive('/admin/users')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiUser className="mr-1" /> Users
                    </Link>
                    <Link
                      href="/admin/promotions"
                      className={`${
                        isActive('/admin/promotions')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiTag className="mr-1" /> Promotion Management
                    </Link>
                    {/* <Link
                      href="/admin/statistics"
                      className={`${
                        isActive('/admin/statistics')
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <FiBarChart2 className="mr-1" /> Statistics
                    </Link> */}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <FiUser className="mr-1" />
                  {user?.name} ({user?.role}
                  {user?.membershipTier && user.role === 'car-renter' && (
                    <span
                      className={`ml-1 text-xs px-2 py-0.5 rounded border
                        ${
                          user.membershipTier === 'gold'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : user.membershipTier === 'silver'
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }
                      `}
                    >
                      {user.membershipTier.charAt(0).toUpperCase() + user.membershipTier.slice(1)}
                    </span>
                  )}
                  )
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;