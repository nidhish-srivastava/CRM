'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const response = await fetch('/api/upcoming-appointments');
        
        if (!response.ok) {
          throw new Error('Failed to fetch upcoming appointments');
        }
        
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        console.error('Error loading upcoming appointments:', err);
        setError('Failed to load upcoming appointments');
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, []);

  // Function to determine appointment type styling
  const getAppointmentTypeStyles = (type) => {
    switch (type) {
      case 'Site Assessment':
      case 'Site Survey':
        return 'bg-purple-100 text-purple-800';
      case 'Installation':
        return 'bg-blue-100 text-blue-800';
      case 'Consultation':
        return 'bg-yellow-100 text-yellow-800';
      case 'Follow-up':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>
        <div className="animate-pulse">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((item) => (
                <tr key={item} className="border-b">
                  <td className="py-2"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="py-2"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="py-2"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-500">No upcoming appointments.</p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b">
                  <td className="py-2">{appointment.customerName}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${getAppointmentTypeStyles(appointment.type)}`}>
                      {appointment.type}
                    </span>
                  </td>
                  <td className="py-2">{appointment.date} {appointment.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/appointments" className="mt-4 inline-block text-blue-500 hover:text-blue-700">
            View calendar →
          </Link>
        </>
      )}
    </div>
  );
}