import {NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all appointments
export async function GET(request) {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        project: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST to create a new appointment
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, date, notes, projectId } = body;

    const appointment = await prisma.appointment.create({
      data: {
        type,
        date: new Date(date),
        notes,
        projectId,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
