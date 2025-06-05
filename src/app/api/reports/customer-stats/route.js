import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Get customer counts by type
    const customersByType = await prisma.customer.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
    });

    // Get customer growth over time
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const customersOverTime = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt"::timestamp) as month,
        COUNT(*)::integer as count
      FROM "Customer"
      WHERE "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt"::timestamp)
      ORDER BY month ASC
    `;

    // Get top customers by project value
    const topCustomers = await prisma.customer.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        projects: {
          select: {
            cost: true,
          },
        },
      },
      orderBy: {
        projects: {
          _count: 'desc',
        },
      },
    });

    const topCustomersWithTotal = topCustomers.map(customer => ({
      id: customer.id,
      name: customer.name,
      totalValue: customer.projects.reduce((sum, project) => sum + (project.cost || 0), 0),
      projectCount: customer.projects.length,
    }));

    return NextResponse.json({
      customersByType: customersByType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      customersOverTime,
      topCustomers: topCustomersWithTotal,
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer statistics', details: error.message },
      { status: 500 }
    );
  }
}