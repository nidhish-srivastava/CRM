
import { connectDb } from "@/lib/connectToDb";
import prisma from "@/lib/prisma.js";
import {  NextResponse } from "next/server";

// GET specific appointment
export async function GET(
  request,
  { params }
) {
  try {
    const id = parseInt(params.id);
    await connectDb()
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

// PUT to update an appointment
export async function PUT(
  request,
  { params }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { type, date, notes, projectId } = body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        type,
        date: new Date(date),
        notes,
        projectId,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE an appointment
export async function DELETE(
  request,
  { params }
) {
  try {
    const id = parseInt(params.id);

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}