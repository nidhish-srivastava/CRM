import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Get project counts by status
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Get total budget and revenue (cost)
    const projectMetrics = await prisma.project.aggregate({
      _sum: {
        budget: true,
        cost: true,
      },
      _count: {
        id: true,
      },
    });

    // Get projects over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    // Updated SQL raw query: remove systemSize, add budget
    const projectsOverTime = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', "createdAt"::timestamp) as month,
        COUNT(*)::integer as count,
        COALESCE(SUM("budget"), 0)::float as "totalBudget",
        COALESCE(SUM("cost"), 0)::float as "totalRevenue"
      FROM "Project"
      WHERE "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt"::timestamp)
      ORDER BY month ASC
    `;

    return NextResponse.json({
      projectsByStatus: projectsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      projectMetrics: {
        totalProjects: projectMetrics._count.id,
        totalBudget: projectMetrics._sum.budget || 0,
        totalRevenue: projectMetrics._sum.cost || 0,
      },
      projectsOverTime,
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project statistics', details: error.message },
      { status: 500 }
    );
  }
}