// app/api/projects/[id]/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    
    const project = await prisma.project.findUnique({
      where: { id : parsedId },
      include: {
        customer: true,
        appointments: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    });
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        budget: data.budget ? parseFloat(data.budget) : null,
        cost: data.cost ? parseFloat(data.cost) : null,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        completionDate: data.completionDate ? new Date(data.completionDate) : null,
        priority: data.priority || null,
      },
    });
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    
    await prisma.project.delete({
      where: { id: parsedId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}