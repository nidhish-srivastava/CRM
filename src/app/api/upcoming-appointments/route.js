// app/api/upcoming-appointments/route.js
import { connectDb } from '@/lib/connectToDb';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDb()
    const today = new Date();
    
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: today
        }
      },
      orderBy: {
        date: 'asc'
      },
      take: 5,
      include: {
        project: {
          include: {
            customer: true
          }
        }
      }
    });

    // Format the appointments for the frontend
    const formattedAppointments = upcomingAppointments.map(appointment => {
      const appointmentDate = new Date(appointment.date);
      
      // Format time in AM/PM format
      const hours = appointmentDate.getHours();
      const minutes = appointmentDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;
      
      return {
        id: appointment.id,
        type: appointment.type,
        date: appointmentDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        time: timeString,
        customerName: appointment.project.customer.name,
        projectName: appointment.project.name
      };
    });

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming appointments' },
      { status: 500 }
    );
  }
}