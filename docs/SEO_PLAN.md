# SEO Strategy & Automation Plan

The Laxmi Toyota Platform V3 aims to completely outperform traditional WordPress installations by utilizing Next.js 15's static and dynamic optimization capabilities.

---

## 1. Meta Tags & Dynamic Metadata

To achieve the best rank in search results, every vehicle page and branch landing page will generate dynamic metadata.

### Next.js Dynamic Metadata Implementation Example (`app/vehicles/[slug]/page.tsx`)
```typescript
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug: params.slug },
  });

  if (!vehicle) {
    return {
      title: "Vehicle Not Found | Laxmi Toyota",
    };
  }

  return {
    title: `${vehicle.name} Price, Specs & Booking | Laxmi Toyota`,
    description: `Book your new ${vehicle.name} online at Laxmi Toyota. View ex-showroom price, features, specifications, and available variants today.`,
    openGraph: {
      title: `${vehicle.name} | Laxmi Toyota`,
      description: `Explore details and booking options for the ${vehicle.name}.`,
      images: [
        {
          url: vehicle.brochureUrl || "/default-car-share.jpg",
          alt: vehicle.name,
        },
      ],
    },
  };
}
```

---

## 2. Dynamic Sitemap & Robots.txt

### Dynamic Sitemap (`app/sitemap.ts`)
Generates structural XML maps of the site dynamically based on database contents for fast search engine indexing:
* Root pages (`/`, `/about`, `/contact`, `/service`)
* Dynamic Branch pages (`/branches/[slug]`)
* Dynamic Vehicle pages (`/vehicles/[slug]`)

```typescript
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://laxmitoyota.co.in";

  // Get vehicles
  const vehicles = await prisma.vehicle.findMany({ where: { status: "ACTIVE" } });
  const vehicleUrls = vehicles.map((v) => ({
    url: `${baseUrl}/vehicles/${v.slug}`,
    lastModified: v.updatedAt,
  }));

  // Get branches
  const branches = await prisma.branch.findMany({ where: { isActive: true } });
  const branchUrls = branches.map((b) => ({
    url: `${baseUrl}/branches/${b.slug}`,
    lastModified: b.updatedAt,
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    ...vehicleUrls,
    ...branchUrls,
  ];
}
```

---

## 3. Schema.org JSON-LD Structured Data

To produce rich snippets on Google Search, we will inject JSON-LD markup on critical pages:

* **LocalBusiness / AutoDealer Schema**: Installed on the Homepage and Branch pages to capture local map queries.
* **Product Schema**: Configured on Vehicle Detail pages containing car name, price range, brand, specs, and reviews.

### Car Product Schema Example
```tsx
const schemaJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": vehicle.name,
  "image": vehicle.colors[0]?.imageUrl,
  "description": vehicle.description,
  "brand": {
    "@type": "Brand",
    "name": "Toyota"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "INR",
    "lowPrice": vehicle.exShowroomMin,
    "highPrice": vehicle.exShowroomMax,
    "offerCount": vehicle.variants.length
  }
};

return (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
  />
);
```
