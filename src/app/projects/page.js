'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getUpcomingAppointmentText = (project) => {
    if (project.appointments && project.appointments.length > 0) {
      const appointment = project.appointments[0];
      const date = new Date(appointment.date);
      return `${appointment.type} scheduled for ${date.toLocaleDateString()}`;
    }
    return null;
  };

  // Group projects by status
  const groupedProjects = projects.reduce((acc, project) => {
    if (!acc[project.status]) {
      acc[project.status] = [];
    }
    acc[project.status].push(project);
    return acc;
  }, {});

  // Define generic statuses for columns
  const statusColumns = [
    { key: 'Planned', label: 'Planned', empty: 'No planned projects', appointment: 'No upcoming appointments' },
    { key: 'In Progress', label: 'In Progress', empty: 'No projects in progress', appointment: 'No upcoming appointments' },
    { key: 'Completed', label: 'Completed', empty: 'No completed projects', appointment: 'Project completed' },
  ];

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading projects...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">Error: {error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/projects/new')}
        >
          Create New Project
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statusColumns.map((col) => (
          <div key={col.key} className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-bold mb-4">
              {col.label} ({groupedProjects[col.key]?.length || 0})
            </h2>
            {groupedProjects[col.key]?.map((project) => (
              <div key={project.id} className="bg-white p-3 rounded-lg shadow mb-3">
                <div className="flex justify-between">
                  <span className="font-bold">{project.name}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {project.customer?.type || '-'}
                  </span>
                </div>
                <p className="text-sm">
                  {project.priority ? `${project.priority} Priority • ` : ''}
                  {formatCurrency(project.cost)}
                </p>
                <p className="text-xs text-gray-500">
                  {getUpcomingAppointmentText(project) || col.appointment}
                </p>
                <div className="flex justify-between mt-2">
                  <span className="text-xs">{project.customer?.name || '-'}</span>
                  <Link href={`/projects/${project.id}`}>
                    <span className="text-xs text-blue-500 cursor-pointer">Details</span>
                  </Link>
                </div>
              </div>
            ))}
            {(!groupedProjects[col.key] || groupedProjects[col.key].length === 0) && (
              <div className="text-center py-4 text-gray-500">{col.empty}</div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}