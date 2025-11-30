import OrgEventVouchersView from "@/views/org/vouchers";

type OrgEventVouchersRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function OrgEventVouchersRoute(
  props: OrgEventVouchersRouteProps,
) {
  const { id } = await props.params;

  return <OrgEventVouchersView eventId={id} />;
}
