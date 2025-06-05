// app/api/recent-leads/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { connectDb } from '@/lib/connectToDb';

export async function GET() {
  try {
    await connectDb()
    const recentLeads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Fetch only 5 most recent leads
    });

    // Format the leads for the frontend
    const formattedLeads = recentLeads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      date: lead.createdAt.toISOString().split('T')[0] // Format date as YYYY-MM-DD
    }));

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error('Error fetching recent leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent leads' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}