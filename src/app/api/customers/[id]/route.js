// app/api/customers/[id]/route.ts
import { connectDb } from '@/lib/connectToDb';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';


// GET a specific customer by ID
export async function GET(
  request,
  { params }
) {
  const id = parseInt(params.id);
  
  try {
    await connectDb()
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        projects: true,
        leads: true,
      },
    });
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT to update a customer
export async function PUT(
  request,
  { params }
) {
  const id = parseInt(params.id);
  
  try {
    const body = await request.json();
    await connectDb()
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        type: body.type,
      },
    });
    
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE a customer
export async function DELETE(
  request,
  { params }
) {
  const id = parseInt(params.id);
  
  try {
    await connectDb()
    // First, check if customer has projects or leads
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            leads: true,
          },
        },
      },
    });
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // If customer has related records, return error
    if (customer._count.projects > 0 || customer._count.leads > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with associated projects or leads' },
        { status: 400 }
      );
    }
    
    // Delete the customer
    await prisma.customer.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}