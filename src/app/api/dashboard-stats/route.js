// app/api/dashboard-stats/route.js
import { connectDb } from '@/lib/connectToDb';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDb();
    
    // Get current date references
    const today = new Date();
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const firstDayOfTwoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);

    // === NEW LEADS STATS ===
    // Current month new leads
    const newLeadsCount = await prisma.lead.count({
      where: {
        status: 'New',
        createdAt: {
          gte: firstDayOfCurrentMonth
        }
      }
    });

    // Previous month new leads
    const previousMonthNewLeads = await prisma.lead.count({
      where: {
        status: 'New',
        createdAt: {
          gte: firstDayOfPreviousMonth,
          lt: firstDayOfCurrentMonth
        }
      }
    });

    // Calculate new leads change percentage
    const newLeadsChange = previousMonthNewLeads > 0
      ? ((newLeadsCount - previousMonthNewLeads) / previousMonthNewLeads) * 100
      : 0;
    const newLeadsTrend = newLeadsChange >= 0 ? 'up' : 'down';

    // === ACTIVE PROJECTS STATS ===
    // Current active projects
    const activeProjectsCount = await prisma.project.count({
      where: {
        status: {
          in: ['In Progress']
        }
      }
    });

    // Previous month active projects
    const previousMonthActiveProjects = await prisma.project.count({
      where: {
        status: {
          in: ['In Progress', 'Installation']
        },
        createdAt: {
          lt: firstDayOfCurrentMonth
        }
      }
    });

    // Calculate active projects change percentage
    const activeProjectsChange = previousMonthActiveProjects > 0
      ? ((activeProjectsCount - previousMonthActiveProjects) / previousMonthActiveProjects) * 100
      : 0;
    const activeProjectsTrend = activeProjectsChange >= 0 ? 'up' : 'down';

    // === REVENUE STATS ===
    // This month's revenue
    const thisMonthProjects = await prisma.project.findMany({
      where: {
        startDate: {
          gte: firstDayOfCurrentMonth
        }
      },
      select: {
        cost: true
      }
    });
    
    const thisMonthRevenue = thisMonthProjects.reduce((sum, project) => sum + project.cost, 0);

    // Previous month's revenue
    const previousMonthProjects = await prisma.project.findMany({
      where: {
        startDate: {
          gte: firstDayOfPreviousMonth,
          lt: firstDayOfCurrentMonth
        }
      },
      select: {
        cost: true
      }
    });

    const previousMonthRevenue = previousMonthProjects.reduce((sum, project) => sum + project.cost, 0);

    // Calculate revenue change percentage
    const revenueChange = previousMonthRevenue > 0
      ? ((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;
    const revenueTrend = revenueChange >= 0 ? 'up' : 'down';

    // === CONVERSION RATE STATS ===
    // Current month conversion
    const totalLeadsCurrentMonth = await prisma.lead.count({
      where: {
        createdAt: {
          gte: firstDayOfCurrentMonth
        }
      }
    });
    
    const convertedLeadsCurrentMonth = await prisma.lead.count({
      where: {
        createdAt: {
          gte: firstDayOfCurrentMonth
        },
        customerId: {
          not: null
        }
      }
    });
    
    const currentConversionRate = totalLeadsCurrentMonth > 0
      ? (convertedLeadsCurrentMonth / totalLeadsCurrentMonth) * 100
      : 0;

    // Previous month conversion
    const totalLeadsPreviousMonth = await prisma.lead.count({
      where: {
        createdAt: {
          gte: firstDayOfPreviousMonth,
          lt: firstDayOfCurrentMonth
        }
      }
    });
    
    const convertedLeadsPreviousMonth = await prisma.lead.count({
      where: {
        createdAt: {
          gte: firstDayOfPreviousMonth,
          lt: firstDayOfCurrentMonth
        },
        customerId: {
          not: null
        }
      }
    });
    
    const previousConversionRate = totalLeadsPreviousMonth > 0
      ? (convertedLeadsPreviousMonth / totalLeadsPreviousMonth) * 100
      : 0;

    // Calculate conversion rate change
    const conversionRateChange = previousConversionRate > 0
      ? (currentConversionRate - previousConversionRate)
      : 0;
    const conversionRateTrend = conversionRateChange >= 0 ? 'up' : 'down';

    // Format the stats with real calculated changes
    const stats = [
      {
        label: 'New Leads',
        value: newLeadsCount,
        change: `${newLeadsChange >= 0 ? '+' : ''}${newLeadsChange.toFixed(1)}%`,
        trend: newLeadsTrend
      },
      {
        label: 'Active Projects',
        value: activeProjectsCount,
        change: `${activeProjectsChange >= 0 ? '+' : ''}${activeProjectsChange.toFixed(1)}%`,
        trend: activeProjectsTrend
      },
      {
        label: 'This Month Revenue',
        value: `$${thisMonthRevenue.toLocaleString()}`,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        trend: revenueTrend
      },
      {
        label: 'Conversion Rate',
        value: `${currentConversionRate.toFixed(1)}%`,
        change: `${conversionRateChange >= 0 ? '+' : ''}${conversionRateChange.toFixed(1)}%`,
        trend: conversionRateTrend
      },
    ];

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}