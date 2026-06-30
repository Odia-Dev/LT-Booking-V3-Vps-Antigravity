import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, branchId, vehicleId, source } = req.query;

    // Base date filters
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    // Branch filter for leads & bookings
    const leadFilters: any = { ...dateFilter };
    const bookingFilters: any = { ...dateFilter };
    const testDriveFilters: any = { ...dateFilter };
    const paymentFilters: any = { ...dateFilter, status: "SUCCESS" }; // only count successful revenue

    if (branchId) {
      leadFilters.branchId = branchId as string;
      bookingFilters.branchId = branchId as string;
      testDriveFilters.branchId = branchId as string;
    }

    if (vehicleId) {
      leadFilters.vehicleId = vehicleId as string;
      bookingFilters.vehicleId = vehicleId as string;
      testDriveFilters.vehicleId = vehicleId as string;
    }

    if (source) {
      leadFilters.source = source as string;
    }

    // WIDGETS: Totals
    const totalLeads = await prisma.lead.count({ where: leadFilters });
    const totalTestDrives = await prisma.testDrive.count({ where: testDriveFilters });
    const totalBookings = await prisma.booking.count({ where: bookingFilters });
    const totalDeliveries = await prisma.delivery.count({ where: { status: "DELIVERED" } });
    const totalVehicles = await prisma.vehicle.count({ where: { status: { not: "ARCHIVED" } } });
    const activeOffers = await prisma.offer.count({
      where: {
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    });
    
    const revenueAgg = await prisma.payment.aggregate({
      where: paymentFilters,
      _sum: { amount: true }
    });
    const totalRevenue = revenueAgg._sum.amount || 0;

    // CONVERSions
    const bookingConversionPct = totalLeads > 0 ? (totalBookings / totalLeads) * 100 : 0;
    
    // Payment conversion (Bookings that have at least one successful payment)
    const bookingsWithPayments = await prisma.booking.count({
      where: {
        ...bookingFilters,
        payments: { some: { status: "SUCCESS" } }
      }
    });
    const paymentConversionPct = totalBookings > 0 ? (bookingsWithPayments / totalBookings) * 100 : 0;

    // AGGREGATIONS / PERFORMANCE
    // 1. Branch Performance (Top Branches by Booking count)
    const branchPerformanceRaw = await prisma.booking.groupBy({
      by: ['branchId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    const branchIds = branchPerformanceRaw.map(b => b.branchId).filter(id => id != null) as string[];
    const branches = await prisma.branch.findMany({ where: { id: { in: branchIds } } });
    
    const branchPerformance = branchPerformanceRaw.map(bp => {
      const b = branches.find(x => x.id === bp.branchId);
      return {
        name: b ? b.name : "Unknown",
        bookings: bp._count.id
      };
    });

    // 2. Vehicle Performance (Top Vehicles by Booking count)
    const vehiclePerformanceRaw = await prisma.booking.groupBy({
      by: ['vehicleId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    const vehicleIds = vehiclePerformanceRaw.map(v => v.vehicleId).filter(id => id != null) as string[];
    const vehicles = await prisma.vehicle.findMany({ where: { id: { in: vehicleIds } } });

    const vehiclePerformance = vehiclePerformanceRaw.map(vp => {
      const v = vehicles.find(x => x.id === vp.vehicleId);
      return {
        name: v ? v.name : "Unknown",
        bookings: vp._count.id
      };
    });

    // 3. Source Performance (Leads grouped by Source)
    const sourcePerformance = await prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    // 4. Executive Performance (Bookings by Assigned Executive)
    const execPerformanceRaw = await prisma.booking.groupBy({
      by: ['assignedExecutive'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    // We don't have an explicit User model lookup here unless assignedExecutive is a string ID, 
    // assuming assignedExecutive is the name string or we just return it raw.
    const execPerformance = execPerformanceRaw.map(ep => ({
      name: ep.assignedExecutive || "Unassigned",
      bookings: ep._count.id
    }));


    // TRENDS (Monthly/Daily logic for charts)
    // To avoid complex raw SQL grouped by date, we can fetch all relevant records (if dataset is small) 
    // OR we group by month using raw query. Given constraints, we can use Prisma raw query for trends.
    // However, since it's a simple dashboard, we'll fetch the last 6 months of data grouped by month.
    
    // SQLite approach for date grouping is different from Postgres, but we'll try to just fetch the data 
    // and group in memory for simplicity to ensure cross-DB compatibility.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const recentLeads = await prisma.lead.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });
    
    const recentBookings = await prisma.booking.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });

    const recentPayments = await prisma.payment.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: "SUCCESS" },
      select: { createdAt: true, amount: true }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const trendMap = new Map();
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      trendMap.set(key, { name: key, leads: 0, bookings: 0, revenue: 0 });
    }

    recentLeads.forEach(l => {
      const key = `${months[l.createdAt.getMonth()]} ${l.createdAt.getFullYear()}`;
      if (trendMap.has(key)) trendMap.get(key).leads++;
    });

    recentBookings.forEach(b => {
      const key = `${months[b.createdAt.getMonth()]} ${b.createdAt.getFullYear()}`;
      if (trendMap.has(key)) trendMap.get(key).bookings++;
    });

    recentPayments.forEach(p => {
      const key = `${months[p.createdAt.getMonth()]} ${p.createdAt.getFullYear()}`;
      if (trendMap.has(key)) trendMap.get(key).revenue += p.amount;
    });

    const trends = Array.from(trendMap.values());

    res.status(200).json({
      success: true,
      data: {
        widgets: {
          totalLeads,
          totalTestDrives,
          totalBookings,
          totalRevenue,
          totalVehicles,
          activeOffers,
          totalDeliveries,
          bookingConversionPct: bookingConversionPct.toFixed(2),
          paymentConversionPct: paymentConversionPct.toFixed(2),
        },
        performance: {
          branch: branchPerformance,
          vehicle: vehiclePerformance,
          source: sourcePerformance.map(s => ({ name: s.source, leads: s._count.id })),
          executive: execPerformance
        },
        trends
      }
    });
  } catch (error: any) {
    console.error("getDashboardAnalytics Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
