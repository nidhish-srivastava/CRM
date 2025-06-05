import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Get lead counts by status
    const leadsByStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Get lead counts by source
    const leadsBySource = await prisma.lead.groupBy({
      by: ['source'],
      _count: {
        source: true,
      },
    });

    // Get lead creation over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const leadsOverTime = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt"::timestamp) as month,
        COUNT(*)::integer as count
      FROM "Lead"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt"::timestamp)
      ORDER BY month ASC
    `;

    return NextResponse.json({
      leadsByStatus: leadsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      leadsBySource: leadsBySource.map(item => ({
        source: item.source || 'Unknown',
        count: item._count.source,
      })),
      leadsOverTime,
    });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead statistics', details: error.message },
      { status: 500 }
    );
  }
}