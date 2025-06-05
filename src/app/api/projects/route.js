// app/api/projects/route.js
import { connectDb } from '@/lib/connectToDb';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDb()
    const projects = await prisma.project.findMany({
      include: {
        customer: true,
        appointments: {
          orderBy: {
            date: 'asc',
          },
          take: 1,
        },
      },
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    await connectDb()
    const newProject = await prisma.project.create({
      data: {
           name: data.name,
        description: data.description,
        budget: data.budget ? parseFloat(data.budget) : null,
        cost: data.cost ? parseFloat(data.cost) : null,
        status: data.status || "Planned",
        startDate: data.startDate ? new Date(data.startDate) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        completionDate: data.completionDate ? new Date(data.completionDate) : null,
        priority: data.priority || null,
        customer: {
          connect: { id: parseInt(data.customerId) }
        }
      },
    });
    
    return NextResponse.json(newProject);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}