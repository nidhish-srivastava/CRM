// app/api/leads/[id]/route.js
import { connectDb } from '@/lib/connectToDb';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    await connectDb()
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    await connectDb()
    
    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        status: data.status,
        source: data.source,
        notes: data.notes,
        leadScore: data.leadScore,
        customerId: data.customerId
      }
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    await connectDb()
    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Delete lead
    await prisma.lead.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Lead deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}