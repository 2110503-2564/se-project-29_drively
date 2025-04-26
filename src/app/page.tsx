'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiTruck, FiShield, FiClock } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const backgroundImages = [
    '/img/car1.jpg',  // Make sure to add appropriate car images
    '/img/car2.jpg',
    '/img/car3.jpg',
    '/img/car4.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white w-full">
      {/* Hero section */}
      <div className="relative min-h-[600px] w-full">
        {backgroundImages.map((image, index) => (
          <div
            key={image}
            className="absolute inset-0 w-full h-full transition-opacity duration-1000"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0, 0, 0, 0.25) 100%), url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(4px)',
              opacity: index === currentImageIndex ? 1 : 0
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl drop-shadow-lg">
              Find Your Perfect Ride
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white drop-shadow-lg">
              Rent quality cars from trusted owners with flexible booking options.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              {!isAuthenticated ? (
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                >
                  Get Started <FiArrowRight className="ml-2" />
                </Link>
              ) : user?.role === 'car-renter' ? (
                <Link
                  href="/cars"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                >
                  Browse Cars <FiArrowRight className="ml-2" />
                </Link>
              ) : (
                <Link
                  href="/my-cars/add"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                >
                  List Your Car <FiArrowRight className="ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              The Smart Way to Rent a Car
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Experience hassle-free car rental with our secure platform and verified car owners.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FiTruck className="h-6 w-6" />
                </div>
                <div className="mt-5 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Quality Vehicles</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Choose from a wide selection of well-maintained cars for any occasion.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FiShield className="h-6 w-6" />
                </div>
                <div className="mt-5 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Secure Booking</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Verified owners and secure payment system for peace of mind.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FiClock className="h-6 w-6" />
                </div>
                <div className="mt-5 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Flexible Rentals</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Book by the day with easy pickup and return options.
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

export default HomePage;
