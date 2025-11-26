"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";

import { createEventApi } from "@/services/event";
import type { CreateEventPayload } from "@/types/event";

type CreateEventFormValues = {
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  price: string;
  availableSeats: string;
  status: "DRAFT" | "PUBLISHED";
  image: File | null;
};

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  category: Yup.string().required("Category is required"),
  location: Yup.string()
    .min(3, "Location must be at least 3 characters")
    .required("Location is required"),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string().required("End date is required"),
  price: Yup.string()
    .required("Price is required")
    .matches(/^\d+$/, "Price must be a valid number"),
  availableSeats: Yup.string()
    .required("Available seats is required")
    .matches(/^\d+$/, "Available seats must be a valid number"),
  status: Yup.mixed<"DRAFT" | "PUBLISHED">()
    .oneOf(["DRAFT", "PUBLISHED"])
    .required("Status is required"),
});

function isAxiosError(
  error: unknown,
): error is { response?: { data?: { message?: string } } } {
  return typeof error === "object" && error !== null && "response" in error;
}

const CATEGORIES = [
  "Music",
  "Nightlife",
  "Art",
  "Holiday",
  "Dating",
  "Hobby",
  "Business",
  "Food & Drink",
];

export default function OrganizerEventCreateViews() {
  const { data: session, status } = useSession();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const formik = useFormik<CreateEventFormValues>({
    initialValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      startDate: "",
      endDate: "",
      price: "",
      availableSeats: "",
      status: "DRAFT",
      image: null,
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const token = session?.access_token;

        if (!token) {
          enqueueSnackbar("You are not authenticated.", {
            variant: "error",
          });
          return;
        }

        const startDateIso = new Date(values.startDate).toISOString();
        const endDateIso = new Date(values.endDate).toISOString();

        const payload: CreateEventPayload = {
          title: values.title,
          description: values.description,
          category: values.category,
          location: values.location,
          startDate: startDateIso,
          endDate: endDateIso,
          price: Number(values.price),
          availableSeats: Number(values.availableSeats),
          status: values.status,
          image: values.image,
        };

        await createEventApi(session.access_token, payload);

        enqueueSnackbar("Event created successfully!", {
          variant: "success",
        });

        resetForm();
        setImagePreview(null);

        router.push("/org/events");
      } catch (err: unknown) {
        console.error("Create event failed:", err);

        let message = "Failed to create event";
        if (isAxiosError(err)) {
          message = err.response?.data?.message ?? message;
        }

        enqueueSnackbar(message, {
          variant: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = formik;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0] ?? null;
    setFieldValue("image", file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted text-sm">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-clear mb-6 text-2xl font-semibold tracking-tight">
        Create New Event
      </h1>

      <form
        onSubmit={handleSubmit}
        className="border-border bg-secondary border-lines space-y-6 rounded-2xl border p-6 shadow-lg"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-muted text-sm font-medium" htmlFor="title">
            Event Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Jakarta Indie Music Night"
          />
          {touched.title && errors.title && (
            <p className="text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label
            className="text-muted text-sm font-medium"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Describe your event so attendees know what to expect..."
          />
          {touched.description && errors.description && (
            <p className="text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Category & Location */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-muted text-sm font-medium"
              htmlFor="category"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {touched.category && errors.category && (
              <p className="text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-muted text-sm font-medium"
              htmlFor="location"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
              value={values.location}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Jakarta, Bandung, Online"
            />
            {touched.location && errors.location && (
              <p className="text-xs text-red-500">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-muted text-sm font-medium"
              htmlFor="startDate"
            >
              Start Date & Time
            </label>
            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
              value={values.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.startDate && errors.startDate && (
              <p className="text-xs text-red-500">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-muted text-sm font-medium" htmlFor="endDate">
              End Date & Time
            </label>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
              value={values.endDate}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.endDate && errors.endDate && (
              <p className="text-xs text-red-500">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Price & Seats */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-muted text-sm font-medium" htmlFor="price">
              Price (IDR)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
              value={values.price}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 150000 (0 for free)"
            />
            {touched.price && errors.price && (
              <p className="text-xs text-red-500">{errors.price}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-muted text-sm font-medium"
              htmlFor="availableSeats"
            >
              Available Seats
            </label>
            <input
              id="availableSeats"
              name="availableSeats"
              type="number"
              min={0}
              className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
              value={values.availableSeats}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 100"
            />
            {touched.availableSeats && errors.availableSeats && (
              <p className="text-xs text-red-500">{errors.availableSeats}</p>
            )}
          </div>
        </div>

        {/* Status & Banner Image */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-muted text-sm font-medium" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm ring-0 outline-none focus:ring-2"
              value={values.status}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            {touched.status && errors.status && (
              <p className="text-xs text-red-500">{errors.status}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-muted text-sm font-medium" htmlFor="image">
              Banner Image
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full cursor-pointer text-sm hover:underline"
            />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-muted-foreground mb-1 text-xs">Preview:</p>
                <div className="border-lines relative h-40 w-full overflow-hidden rounded-xl border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            className="border-lines bg-tertiary hover:bg-primary rounded-xl border px-4 py-2 text-sm font-medium"
            onClick={() => router.push("/org/events")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="from-accent1-primary to-accent2-primary text-accent-foreground hover:from-accent1-hover hover:text-clear hover:to-accent2-hover text-clear-invert rounded-xl bg-linear-to-r px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-linear-to-r disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
