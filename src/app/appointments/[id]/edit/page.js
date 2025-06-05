// File: app/appointments/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { appointmentTypes } from "@/lib/appointment.js";

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  
  // Appointment form state
  const [appointment, setAppointment] = useState({
    type: "",
    date: "",
    time: "",
    notes: "",
    projectId: 0,
  });

  // Fetch appointment and projects data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch the specific appointment
        const appointmentRes = await fetch(`/api/appointments/${appointmentId}`);
        if (!appointmentRes.ok) {
          throw new Error("Failed to fetch appointment");
        }
        const appointmentData = await appointmentRes.json();
        
        // Format date and time for form inputs
        const appointmentDate = new Date(appointmentData.date);
        const formattedDate = appointmentDate.toISOString().split('T')[0];
        const formattedTime = appointmentDate.toTimeString().substring(0, 5);
        
        // Set appointment state
        setAppointment({
          type: appointmentData.type,
          date: formattedDate,
          time: formattedTime,
          notes: appointmentData.notes || "",
          projectId: appointmentData.projectId,
        });
        
        // Fetch projects for the dropdown
        const projectsRes = await fetch("/api/projects");
        if (!projectsRes.ok) {
          throw new Error("Failed to fetch projects");
        }
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (appointmentId) {
      fetchData();
    }
  }, [appointmentId]);

  // Handle appointment form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointment(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      // Combine date and time
      const dateTime = new Date(`${appointment.date}T${appointment.time}`);
      
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: appointment.type,
          date: dateTime.toISOString(),
          notes: appointment.notes,
          projectId: parseInt(appointment.projectId.toString()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }

      // Navigate back to the appointments page
      router.push("/projects");
      
    } catch (err) {
      console.error("Error updating appointment:", err);
      alert("Failed to update appointment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle appointment deletion
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }

      // Navigate back to the appointments page
      router.push("/appointments");
      
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to delete appointment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            <h2 className="font-bold">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push("/appointments")}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Back to Appointments
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Appointment</h1>
          <button 
            onClick={() => router.push("/appointments")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Calendar
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
          {submitting && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Appointment Type</label>
              <select 
                name="type"
                value={appointment.type}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              >
                {appointmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.value}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Project</label>
              <select 
                name="projectId"
                value={appointment.projectId}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting || projects.length === 0}
              >
                {projects.length === 0 ? (
                  <option>Loading projects...</option>
                ) : (
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.customer.name})
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Date</label>
                <input 
                  type="date"
                  name="date"
                  value={appointment.date}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Time</label>
                <input 
                  type="time"
                  name="time"
                  value={appointment.time}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Notes</label>
              <textarea 
                name="notes"
                value={appointment.notes}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                disabled={submitting}
                placeholder="Enter any relevant details about this appointment..."
              />
            </div>
            
            <div className="flex justify-between">
              <button 
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium flex items-center"
                disabled={submitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  onClick={() => router.push("/appointments")}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Update Appointment
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}