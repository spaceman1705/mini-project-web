"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { useSession } from "next-auth/react";

import { createEventVoucher } from "@/services/event";
import type { CreateVoucherPayload } from "@/types/event";

type VoucherFormProps = {
  eventId: string;
  onSuccess?: () => void;
};

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

const voucherValidationSchema = Yup.object().shape({
  code: Yup.string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .max(32, "Code must be at most 32 characters")
    .required("Code is required"),
  discountAmount: Yup.number()
    .typeError("Discount amount must be a number")
    .positive("Discount amount must be greater than 0")
    .required("Discount amount is required"),
  maxUsage: Yup.number()
    .typeError("Max usage must be a number")
    .integer("Max usage must be an integer")
    .positive("Max usage must be greater than 0")
    .nullable()
    .optional(),
  expiredAt: Yup.string().required("Expired date is required"),
});

type AxiosErrorData = {
  error?: string;
  message?: string;
};

type AxiosErrorLike = {
  response?: {
    data?: AxiosErrorData;
  };
};

export default function VoucherForm({ eventId, onSuccess }: VoucherFormProps) {
  const { data: session } = useSession();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessToken = getAccessTokenFromSession(session);

  const formik = useFormik({
    initialValues: {
      code: "",
      discountAmount: "",
      maxUsage: "",
      expiredAt: "",
    },
    validationSchema: voucherValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!accessToken) {
          enqueueSnackbar("You are not authenticated", {
            variant: "error",
          });
          return;
        }

        setIsSubmitting(true);

        const payload: CreateVoucherPayload = {
          code: values.code.trim(),
          discountAmount: Number(values.discountAmount),
          expiredAt: new Date(values.expiredAt).toISOString(),
          maxUsage: values.maxUsage ? Number(values.maxUsage) : undefined,
        };

        await createEventVoucher(accessToken, eventId, payload);

        enqueueSnackbar("Voucher created successfully", {
          variant: "success",
        });

        resetForm();
        if (onSuccess) onSuccess();
      } catch (err: unknown) {
        let message = "Failed to create voucher";

        if (typeof err === "object" && err !== null && "response" in err) {
          const axiosErr = err as AxiosErrorLike;
          const resData = axiosErr.response?.data;

          if (resData?.error) {
            message = resData.error;
          } else if (resData?.message) {
            message = resData.message;
          }
        }

        enqueueSnackbar(message, { variant: "error" });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="border-lines bg-secondary space-y-4 rounded-2xl border p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Create Voucher</h3>
          <p className="text-muted text-xs">
            Create limited-time vouchers for this event.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Code */}
        <div>
          <label
            htmlFor="code"
            className="text-clear mb-1 block text-xs font-medium"
          >
            Voucher Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            className="border-lines bg-tertiary w-full rounded-lg border px-3 py-2 text-sm outline-none"
            placeholder="e.g. EARLYBIRD50"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.code && formik.errors.code && (
            <p className="mt-1 text-xs text-rose-500">{formik.errors.code}</p>
          )}
        </div>

        {/* Discount amount */}
        <div>
          <label
            htmlFor="discountAmount"
            className="text-clear mb-1 block text-xs font-medium"
          >
            Discount Amount (IDR)
          </label>
          <input
            id="discountAmount"
            name="discountAmount"
            type="number"
            min={0}
            className="border-lines bg-tertiary w-full rounded-lg border px-3 py-2 text-sm outline-none"
            placeholder="e.g. 50000"
            value={formik.values.discountAmount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.discountAmount && formik.errors.discountAmount && (
            <p className="mt-1 text-xs text-rose-500">
              {formik.errors.discountAmount}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Max usage */}
        <div>
          <label
            htmlFor="maxUsage"
            className="text-clear mb-1 block text-xs font-medium"
          >
            Max Usage (optional)
          </label>
          <input
            id="maxUsage"
            name="maxUsage"
            type="number"
            min={1}
            className="border-lines bg-tertiary w-full rounded-lg border px-3 py-2 text-sm outline-none"
            placeholder="e.g. 100"
            value={formik.values.maxUsage}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.maxUsage && formik.errors.maxUsage && (
            <p className="mt-1 text-xs text-rose-500">
              {formik.errors.maxUsage}
            </p>
          )}
        </div>

        {/* ExpiredAt */}
        <div>
          <label
            htmlFor="expiredAt"
            className="text-clear mb-1 block text-xs font-medium"
          >
            Expired At
          </label>
          <input
            id="expiredAt"
            name="expiredAt"
            type="datetime-local"
            className="border-lines bg-tertiary w-full rounded-lg border px-3 py-2 text-sm outline-none"
            value={formik.values.expiredAt}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.expiredAt && formik.errors.expiredAt && (
            <p className="mt-1 text-xs text-rose-500">
              {formik.errors.expiredAt}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => formik.resetForm()}
          className="border-lines bg-tertiary hover:bg-primary-invert hover:text-clear-invert rounded-lg border px-3 py-1.5 text-xs font-medium"
          disabled={isSubmitting}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary-invert text-clear-invert rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Create Voucher"}
        </button>
      </div>
    </form>
  );
}
