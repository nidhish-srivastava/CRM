"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { appointmentTypes } from "@/lib/appointment.js";

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  
  // Appointment form state
  const [newAppointment, setNewAppointment] = useState({
    type: appointmentTypes[0].value,
    date: "",
    time: "09:00",
    notes: "",
    projectId: 0,
  });

  // Fetch projects for the form dropdown
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
        if (data.length > 0) {
          setNewAppointment(prev => ({ ...prev, projectId: data[0].id }));
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Handle appointment form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Combine date and time
      const dateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
      
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: newAppointment.type,
          date: dateTime.toISOString(),
          notes: newAppointment.notes,
          projectId: parseInt(newAppointment.projectId.toString()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      // Navigate back to the appointments page
      router.push("/appointments");
      
    } catch (err) {
      console.error("Error creating appointment:", err);
      alert("Failed to create appointment: " + err.message);
    } finally {
      setLoading(false);
    }
  };
 // Loading state
 if (loading) {
  return (
    <main className="p-6">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </main>
  );
}

  return (
    <main className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Schedule New Appointment</h1>
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
        
         
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Appointment Type</label>
              <select 
                name="type"
                value={newAppointment.type}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
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
                value={newAppointment.projectId}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading || projects.length === 0}
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
                  value={newAppointment.date}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Time</label>
                <input 
                  type="time"
                  name="time"
                  value={newAppointment.time}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Notes</label>
              <textarea 
                name="notes"
                value={newAppointment.notes}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                disabled={loading}
                placeholder="Enter any relevant details about this appointment..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                type="button"
                onClick={() => router.push("/appointments")}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Create Appointment
                  </>
                )}
              </button>
            </div>
          </form>
      </div>
    </main>
  );
}