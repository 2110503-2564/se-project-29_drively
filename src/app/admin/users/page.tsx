'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiUser, FiMail, FiShield, FiSearch, FiEdit2, FiX, FiSave } from 'react-icons/fi';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  membershipTier?: string;
}

const AdminUsersPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editMembership, setEditMembership] = useState('basic');
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
      fetchUsers();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/allusers');
      setUsers(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditMembership(user.membershipTier || 'basic');
    setModalOpen(true);
    setModalError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setEditName('');
    setEditMembership('basic');
    setModalError('');
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setModalSaving(true);
    setModalError('');
    try {
      await api.put(`/auth/user/${selectedUser._id}`, {
        name: editName,
        membershipTier: editMembership,
      });
      setUsers(users =>
        users.map(u =>
          u._id === selectedUser._id
            ? { ...u, name: editName, membershipTier: editMembership }
            : u
        )
      );
      closeModal();
      setSuccessMsg('User updated successfully!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      setModalError('Failed to update user');
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div className="py-6">
      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded shadow">
          {successMsg}
        </div>
      )}
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={closeModal}
              disabled={modalSaving}
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit User</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={modalSaving}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership</label>
              <select
                value={editMembership}
                onChange={e => setEditMembership(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={modalSaving}
              >
                <option value="basic">Basic</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </select>
            </div>
            {modalError && (
              <div className="mb-2 text-red-600 text-sm">{modalError}</div>
            )}
            <div className="flex justify-end">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center hover:bg-indigo-500 disabled:opacity-50"
                onClick={handleSave}
                disabled={modalSaving}
              >
                <FiSave className="mr-2" />
                {modalSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* End Modal */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">User Management</h1>
        <div className="mb-4 flex items-center">
          <div className="relative w-full max-w-xs">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <FiUser className="mr-2 text-gray-400" />
                      {u.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center">
                        <FiMail className="mr-2 text-gray-400" />
                        {u.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.membershipTier === 'gold' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                          Gold
                        </span>
                      ) : u.membershipTier === 'silver' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                          Silver
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                          Basic
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        className="inline-flex items-center px-3 py-1 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 text-sm"
                        onClick={() => openModal(u)}
                      >
                        <FiEdit2 className="mr-1" /> Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
