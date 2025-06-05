import { connectDb } from '@/lib/connectToDb';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all customers with filtering and pagination
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || undefined;
  const sortBy = searchParams.get('sortBy') || 'updatedAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  
  // Calculate pagination
  const skip = (page - 1) * pageSize;
  
  // Build filter conditions
  const where = {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ]
  };
  
  // Add type filter if specified
  if (type && type !== 'All Types') {
    where.type = type;
  }
  
  // Determine sort field and direction
  let orderBy = {};
  if (sortBy === 'name') {
    orderBy.name = sortOrder;
  } else {
    orderBy.updatedAt = sortOrder;
  }
  
  try {
    // Get customers with count
    await connectDb()
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          projects: true,
        },
      }),
      prisma.customer.count({ where })
    ]);
    
    // Transform data to include total project budget and latest status
    const customersWithProjectInfo = customers.map(customer => {
      // Calculate total budget from all projects
      const totalBudget = customer.projects.reduce((sum, project) => sum + (project.budget || 0), 0);
      
      // Get the latest project status
      let status = 'No Projects';
      if (customer.projects.length > 0) {
        const latestProject = customer.projects.reduce((latest, current) => 
          latest.updatedAt > current.updatedAt ? latest : current
        );
        status = latestProject.status;
      }
      
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        type: customer.type,
        totalBudget: totalBudget > 0 ? totalBudget : null,
        status,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      };
    });
    
    return NextResponse.json({
      customers: customersWithProjectInfo,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize)
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST to create a new customer
export async function POST(request) {
  try {
    const body = await request.json();
    await connectDb()
    const newCustomer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        type: body.type || 'Residential',
      }
    });
    
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}