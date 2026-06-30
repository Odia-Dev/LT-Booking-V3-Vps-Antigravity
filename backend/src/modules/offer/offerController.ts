import { Request, Response } from "express";
import { prisma } from "../../config/db";

export const getOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const where: any = {};

    if (req.originalUrl.includes("/public/")) {
      where.isActive = true;
      where.OR = [
        { endDate: null },
        { endDate: { gte: now } }
      ];
      where.AND = [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: now } }
          ]
        }
      ];
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        vehicle: { select: { name: true } },
        variant: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      cashDiscount,
      exchangeBonus,
      corporateOffer,
      financeOffer,
      vehicleId,
      variantId,
      status,
      startDate,
      endDate,
      bannerImage,
      ctaText,
      ctaLink,
      isActive,
      validUntil,
    } = req.body;

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        cashDiscount: cashDiscount ? parseFloat(cashDiscount) : 0,
        exchangeBonus: exchangeBonus ? parseFloat(exchangeBonus) : 0,
        corporateOffer: corporateOffer ? parseFloat(corporateOffer) : 0,
        financeOffer,
        vehicleId: vehicleId || null,
        variantId: variantId || null,
        status: status || "ACTIVE",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : (validUntil ? new Date(validUntil) : null),
        bannerImage,
        ctaText,
        ctaLink,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    res.status(201).json({ success: true, offer });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      cashDiscount,
      exchangeBonus,
      corporateOffer,
      financeOffer,
      vehicleId,
      variantId,
      status,
      startDate,
      endDate,
      bannerImage,
      ctaText,
      ctaLink,
      isActive,
      validUntil,
    } = req.body;

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        title,
        description,
        cashDiscount: cashDiscount ? parseFloat(cashDiscount) : 0,
        exchangeBonus: exchangeBonus ? parseFloat(exchangeBonus) : 0,
        corporateOffer: corporateOffer ? parseFloat(corporateOffer) : 0,
        financeOffer,
        vehicleId: vehicleId || null,
        variantId: variantId || null,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : (validUntil ? new Date(validUntil) : null),
        bannerImage,
        ctaText,
        ctaLink,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    res.status(200).json({ success: true, offer });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.offer.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Offer deleted successfully" });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
