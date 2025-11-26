"use client";

import VoucherForm from "../components/voucherForm";

type OrgEventVoucherPageProps = {
  eventId: string;
};

export default function OrgEventVoucherPage({
  eventId,
}: OrgEventVoucherPageProps) {
  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-muted text-xs font-semibold tracking-widest uppercase">
            Event Promotions
          </p>
          <h1 className="text-lg font-semibold tracking-tight">
            Manage Vouchers
          </h1>
          <p className="text-muted mt-1 text-xs">
            Create and manage vouchers for this event to boost your sales.
          </p>
        </header>

        <VoucherForm
          eventId={eventId}
          onSuccess={() => {
            // Comment: nanti di sini bisa kamu isi refetch list voucher kalau sudah dibuat
          }}
        />
      </div>
    </main>
  );
}
