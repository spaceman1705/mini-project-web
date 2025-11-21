import EventDetailView from "@/views/eventDetail";

type EventDetailPageProps = {
  params: { slug: string };
};

export default function EventDetailPage({ params }: EventDetailPageProps) {
  return <EventDetailView slug={params.slug} />;
}
