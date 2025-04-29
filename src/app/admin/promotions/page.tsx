'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiTag, FiEdit2, FiTrash2, FiPlus, FiSave, FiX } from 'react-icons/fi';

interface Promotion {
  _id: string;
  title: string;
  description: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
}

const AdminPromotionsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    discountPercent: 0,
    validFrom: '',
    validTo: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      if (user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchPromotions();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/promotions');
      setPromotions(res.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditPromotion(promotion);
      setForm({
        title: promotion.title,
        description: promotion.description,
        discountPercent: promotion.discountPercent,
        validFrom: promotion.validFrom.slice(0, 10),
        validTo: promotion.validTo.slice(0, 10)
      });
    } else {
      setEditPromotion(null);
      setForm({
        title: '',
        description: '',
        discountPercent: 0,
        validFrom: '',
        validTo: ''
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditPromotion(null);
    setForm({
      title: '',
      description: '',
      discountPercent: 0,
      validFrom: '',
      validTo: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'discountPercent' ? Number(value) : value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editPromotion) {
        await api.put(`/promotions/${editPromotion._id}`, form);
      } else {
        await api.post('/promotions', form);
      }
      await fetchPromotions();
      closeModal();
    } catch (err) {
      setError('Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      await fetchPromotions();
    } catch (err) {
      setError('Failed to delete promotion');
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <FiTag className="mr-2" /> Promotion Management
          </h1>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            onClick={() => openModal()}
          >
            <FiPlus className="mr-2" /> Add Promotion
          </button>
        </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
            {error}
          </div>
        )}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">No promotions found.</td>
                </tr>
              ) : (
                promotions.map(promo => (
                  <tr key={promo._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{promo.title}</div>
                      <div className="text-xs text-gray-500">{promo.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{promo.discountPercent}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {promo.validFrom.slice(0, 10)} - {promo.validTo.slice(0, 10)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        className="inline-flex items-center px-3 py-1 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 text-sm mr-2"
                        onClick={() => openModal(promo)}
                      >
                        <FiEdit2 className="mr-1" /> Edit
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50 text-sm"
                        onClick={() => handleDelete(promo._id)}
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={closeModal}
              disabled={saving}
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">{editPromotion ? 'Edit Promotion' : 'Add Promotion'}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={saving}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={saving}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleChange}
                min={0}
                max={100}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={saving}
              />
            </div>
            <div className="mb-4 flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                <input
                  type="date"
                  name="validFrom"
                  value={form.validFrom}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={saving}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
                <input
                  type="date"
                  name="validTo"
                  value={form.validTo}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center hover:bg-indigo-500 disabled:opacity-50"
                onClick={handleSave}
                disabled={saving}
              >
                <FiSave className="mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotionsPage;
