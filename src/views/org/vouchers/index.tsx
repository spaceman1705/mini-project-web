"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import * as Yup from "yup";

import { createEventVoucher, getEventVouchersApi } from "@/services/event";
import type { CreateVoucherPayload, EventVoucher } from "@/types/event";

type OrgEventVouchersViewProps = {
  eventId: string;
};

const voucherSchema = Yup.object({
  code: Yup.string()
    .trim()
    .required("Voucher code is required")
    .max(50, "Code is too long"),
  discountAmount: Yup.number()
    .typeError("Discount amount must be a number")
    .positive("Discount amount must be greater than 0")
    .required("Discount amount is required"),
  expiredAt: Yup.string().required("Expired date is required"),
  maxUsage: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value,
    )
    .nullable()
    .notRequired()
    .min(1, "Max usage must be at least 1"),
});

// ChatGPT: helper sama kayak di halaman "My Events"
function getAccessTokenFromSession(session: unknown): string | null {
  if (!session || typeof session !== "object") return null;

  const s = session as {
    accessToken?: string | null;
    access_token?: string | null;
    token?: string | null;
    user?: {
      accessToken?: string | null;
      access_token?: string | null;
    };
  };

  return (
    s.accessToken ??
    s.access_token ??
    s.user?.accessToken ??
    s.user?.access_token ??
    s.token ??
    null
  );
}

export default function OrgEventVouchersView({
  eventId,
}: OrgEventVouchersViewProps) {
  const { data: session, status } = useSession();
  const { enqueueSnackbar } = useSnackbar();

  const [vouchers, setVouchers] = useState<EventVoucher[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);

  // ChatGPT: sekarang ambil token lewat helper ini
  const accessToken = getAccessTokenFromSession(session);

  const loadVouchers = useCallback(async () => {
    if (status !== "authenticated" || !accessToken || !eventId) return;

    try {
      setLoadingList(true);
      const res = await getEventVouchersApi(accessToken, eventId);
      setVouchers(res.data);
    } catch (error) {
      console.error("[OrgEventVouchersView] loadVouchers error", error);
      enqueueSnackbar("Failed to load vouchers", { variant: "error" });
    } finally {
      setLoadingList(false);
    }
  }, [accessToken, enqueueSnackbar, eventId, status]);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useFormik({
    initialValues: {
      code: "",
      discountAmount: "",
      expiredAt: "",
      maxUsage: "",
    },
    validationSchema: voucherSchema,
    onSubmit: async (formValues, { resetForm }) => {
      if (status !== "authenticated" || !accessToken) {
        enqueueSnackbar("You must be logged in to create a voucher", {
          variant: "warning",
        });
        return;
      }

      try {
        setCreating(true);

        const payload: CreateVoucherPayload = {
          code: formValues.code.trim(),
          discountAmount: Number(formValues.discountAmount),
          expiredAt: formValues.expiredAt,
        };

        if (formValues.maxUsage) {
          payload.maxUsage = Number(formValues.maxUsage);
        }

        await createEventVoucher(accessToken, eventId, payload);

        enqueueSnackbar("Voucher created successfully", {
          variant: "success",
        });

        resetForm();
        loadVouchers();
      } catch (error) {
        console.error("[OrgEventVouchersView] create voucher error", error);
        enqueueSnackbar("Failed to create voucher", { variant: "error" });
      } finally {
        setCreating(false);
      }
    },
  });

  const hasVouchers = vouchers.length > 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:px-0">
      {/* Header */}
      <header className="border-lines flex flex-col justify-between gap-3 border-b pb-4 md:flex-row md:items-center">
        <div>
          <p className="text-muted mb-1 text-xs">
            <a
              href="/org/events"
              className="text-accent1-primary text-xs font-medium hover:underline"
            >
              Back to My Events
            </a>
          </p>
          <h1 className="text-clear text-2xl font-semibold tracking-tight md:text-3xl">
            Event Vouchers
          </h1>
          <p className="text-muted mt-1 text-sm">
            Create and manage discount vouchers for this event.
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)]">
        {/* Left: Create voucher form */}
        <div className="border-lines bg-secondary space-y-4 rounded-2xl border p-5 shadow-sm">
          <div>
            <h2 className="text-clear text-lg font-semibold">
              Create new voucher
            </h2>
            <p className="text-muted mt-1 text-xs">
              Set a unique voucher code, discount amount, and expiry date.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code */}
            <div className="space-y-1.5">
              <label
                htmlFor="code"
                className="text-muted text-sm font-medium tracking-tight"
              >
                Voucher code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                className="border-lines bg-tertiary text-clear placeholder:text-muted focus:border-accent1-primary focus:ring-accent1-primary w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
                value={values.code}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. EARLYBIRD50"
              />
              {touched.code && errors.code && (
                <p className="text-xs text-red-500">{errors.code}</p>
              )}
            </div>

            {/* Discount amount */}
            <div className="space-y-1.5">
              <label
                htmlFor="discountAmount"
                className="text-muted text-sm font-medium tracking-tight"
              >
                Discount amount (IDR)
              </label>
              <input
                id="discountAmount"
                name="discountAmount"
                type="number"
                min={0}
                className="border-lines bg-tertiary text-clear placeholder:text-muted focus:border-accent1-primary focus:ring-accent1-primary w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
                value={values.discountAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 50000"
              />
              {touched.discountAmount && errors.discountAmount && (
                <p className="text-xs text-red-500">
                  {errors.discountAmount as string}
                </p>
              )}
            </div>

            {/* Expired at */}
            <div className="space-y-1.5">
              <label
                htmlFor="expiredAt"
                className="text-muted text-sm font-medium tracking-tight"
              >
                Expired date
              </label>
              <input
                id="expiredAt"
                name="expiredAt"
                type="date"
                className="border-lines bg-tertiary text-clear placeholder:text-muted focus:border-accent1-primary focus:ring-accent1-primary w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
                value={values.expiredAt}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.expiredAt && errors.expiredAt && (
                <p className="text-xs text-red-500">
                  {errors.expiredAt as string}
                </p>
              )}
            </div>

            {/* Max usage */}
            <div className="space-y-1.5">
              <label
                htmlFor="maxUsage"
                className="text-muted text-sm font-medium tracking-tight"
              >
                Max usage (optional)
              </label>
              <input
                id="maxUsage"
                name="maxUsage"
                type="number"
                min={1}
                className="border-lines bg-tertiary text-clear placeholder:text-muted focus:border-accent1-primary focus:ring-accent1-primary w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
                value={values.maxUsage}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 100 (leave empty for unlimited)"
              />
              {touched.maxUsage && errors.maxUsage && (
                <p className="text-xs text-red-500">
                  {errors.maxUsage as string}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="bg-primary-invert text-clear-invert hover:bg-primary/90 focus-visible:ring-primary border-lines inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium shadow-sm ring-0 transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-[disabled=true]:opacity-60"
              >
                {creating ? "Creating..." : "Create voucher"}
              </button>

              <button
                type="button"
                onClick={() => resetForm()}
                disabled={creating}
                className="border-lines bg-tertiary text-muted hover:bg-secondary inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-medium shadow-sm ring-0 transition outline-none"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Right: Vouchers list */}
        <div className="border-lines bg-secondary flex h-full flex-col rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-clear text-lg font-semibold">
                Existing vouchers
              </h2>
              <p className="text-muted mt-1 text-xs">
                View all vouchers created for this event.
              </p>
            </div>
          </div>

          {loadingList && (
            <div className="text-muted flex flex-1 items-center justify-center text-sm">
              Loading vouchers...
            </div>
          )}

          {!loadingList && !hasVouchers && (
            <div className="bg-empty/40 text-empty border-empty flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center text-sm">
              <p className="font-medium">No vouchers yet</p>
              <p className="text-muted mt-1 text-xs">
                Create your first voucher using the form on the left.
              </p>
            </div>
          )}

          {!loadingList && hasVouchers && (
            <div className="-mx-3 -my-2 flex-1 overflow-auto">
              <table className="min-w-full border-separate border-spacing-y-1 px-3 py-2 text-left text-sm">
                <thead className="text-muted text-xs tracking-wide uppercase">
                  <tr>
                    <th className="px-3 py-1.5">Code</th>
                    <th className="px-3 py-1.5">Discount</th>
                    <th className="px-3 py-1.5 text-center">Usage</th>
                    <th className="px-3 py-1.5">Expires</th>
                    <th className="px-3 py-1.5">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => (
                    <tr
                      key={v.id}
                      className="bg-tertiary text-clear align-middle text-xs"
                    >
                      <td className="px-3 py-2 font-mono text-[11px] font-semibold tracking-wide uppercase">
                        {v.code}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(v.discountAmount)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="bg-secondary inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px]">
                          {v.usedCount}
                          {typeof v.maxUsage === "number"
                            ? ` / ${v.maxUsage}`
                            : " / ∞"}
                        </span>
                      </td>
                      <td className="px-3 py-2">{formatDate(v.expiredAt)}</td>
                      <td className="px-3 py-2">
                        <span className="text-muted block text-[11px]">
                          {formatDateTime(v.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
