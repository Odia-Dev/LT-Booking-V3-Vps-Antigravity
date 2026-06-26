import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    vehicle: string;
  }>;
}

export default async function BookOnlineVehiclePresetPage({ params }: Props) {
  const { vehicle } = await params;
  
  // Clean redirect to main book-online page carrying preset query
  redirect(`/book-online?vehicle=${vehicle}`);
}
