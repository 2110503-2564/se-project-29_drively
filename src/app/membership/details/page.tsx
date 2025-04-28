'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiCheck } from 'react-icons/fi';
import { upgradeMembership } from '../../../lib/membership'; // or '@/api/membership'

const MembershipDetails = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const tiers = [
    {
      name: 'Basic',
      price: 'Free',
      tier: 'basic',
      description: 'Essential features for car rentals',
      features: [
        'Standard booking system',
        'Basic customer support',
        'Regular pricing'
      ],
      current: user?.membershipTier === 'basic'
    },
    {
      name: 'Silver',
      price: '฿259.99',
      tier: 'silver',
      description: 'Enhanced features for frequent renters',
      features: [
        '10% discount on all rentals',
        'Free delivery service',
        'Priority customer support',
      ],
      current: user?.membershipTier === 'silver'
    },
    {
      name: 'Gold',
      price: '฿499.99',
      tier: 'gold',
      description: 'Premium benefits for luxury experience',
      features: [
        '15% discount on all rentals',
        'Free delivery service',
        'Priority customer support',
        'Extra driver option included'
      ],
      current: user?.membershipTier === 'gold'
    }
  ];

  const handleSubscribe = async (tier: string) => {
    try {
      setIsLoading(true);
      setError('');
      await upgradeMembership(tier); // Calls backend to upgrade membership
      // Set reload flag so profile page will reload and show latest info
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('profileReloaded');
      }
      router.push('/profile'); // Redirect to profile page
    } catch (error) {
      setError('Failed to upgrade membership. Please try again.');
      console.error('Error upgrading membership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      {error && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Membership Plans</h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the perfect membership tier for your car rental needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 ${
                tier.current ? 'border-2 border-indigo-500' : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">{tier.name}</h3>
                <p className="mt-4 text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  {tier.price !== 'Free' && <span className="text-base font-medium text-gray-500">/year</span>}
                </p>
                <button
                  onClick={() => handleSubscribe(tier.tier)}
                  className={`mt-8 block w-full py-3 px-6 border rounded-md text-center font-medium ${
                    tier.current || isLoading
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  disabled={tier.current || isLoading}
                >
                  {isLoading ? 'Processing...' : tier.current ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide">Features</h4>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <FiCheck className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipDetails;
