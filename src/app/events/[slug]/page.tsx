import EventDetailView from "@/views/eventDetail";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;
  return <EventDetailView slug={slug} />;
}
