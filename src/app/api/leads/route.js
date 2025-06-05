// app/api/leads/route.js
import { connectDb } from '@/lib/connectToDb';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || 'recent';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Build sort
    let orderBy = {};
    switch (sort) {
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'leadScore':
        orderBy = { leadScore: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
    }

    await connectDb()
    // Fetch leads with pagination
    const leads = await prisma.lead.findMany({
      where: filter,
      orderBy,
      skip,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    // Get total count for pagination
    const total = await prisma.lead.count({
      where: filter
    });

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.name || !data.email || !data.phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }
    await connectDb()
    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        status: data.status || 'New',
        source: data.source,
        notes: data.notes,
        leadScore: data.leadScore,
        customerId: data.customerId
      }
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}