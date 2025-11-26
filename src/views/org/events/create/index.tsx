"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";

import {
  addTicketTypesApi,
  createEventApi,
  getEventCategories,
  getEventDetail,
  updateEventApi,
  updateTicketTypeApi,
  deleteTicketTypeApi,
} from "@/services/event";
import type {
  CreateEventPayload,
  TicketTypeInput,
  UpdateEventPayload,
} from "@/types/event";

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

type SimpleTicketType = {
  id: string;
  name: string;
  description: string;
  price: number;
  quota: number;
  availableQuota: number;
};

type TicketTypeFormState = {
  name: string;
  description: string;
  price: string;
  quota: string;
};

type TicketTypeFormErrors = Partial<Record<keyof TicketTypeFormState, string>>;

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

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

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

function validateTicketTypeForm(
  values: TicketTypeFormState,
): TicketTypeFormErrors {
  const errors: TicketTypeFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!values.price.trim()) {
    errors.price = "Price is required";
  } else {
    const n = Number(values.price);
    if (Number.isNaN(n) || n < 0) {
      errors.price = "Price must be a number ≥ 0";
    }
  }

  if (!values.quota.trim()) {
    errors.quota = "Quota is required";
  } else {
    const n = Number(values.quota);
    if (Number.isNaN(n) || n < 1) {
      errors.quota = "Quota must be at least 1";
    }
  }

  return errors;
}

export default function OrganizerEventCreateViews() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const editID = searchParams.get("edit");
  const editSlug = searchParams.get("slug");
  const tabParam = searchParams.get("tab");
  const isEditMode = Boolean(editID);

  const activeTab: "details" | "tickets" =
    tabParam === "tickets" ? "tickets" : "details";

  const [eventLoading, setEventLoading] = useState(false);

  const [ticketTypes, setTicketTypes] = useState<SimpleTicketType[]>([]);

  const [ticketForm, setTicketForm] = useState<TicketTypeFormState>({
    name: "",
    description: "",
    price: "",
    quota: "",
  });
  const [ticketFormErrors, setTicketFormErrors] =
    useState<TicketTypeFormErrors>({});
  const [isSavingTicketType, setIsSavingTicketType] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTicketId, setEditTicketId] = useState<string | null>(null);
  const [editTicketForm, setEditTicketForm] = useState<TicketTypeFormState>({
    name: "",
    description: "",
    price: "",
    quota: "",
  });
  const [editTicketFormErrors, setEditTicketFormErrors] =
    useState<TicketTypeFormErrors>({});
  const [isUpdatingTicketType, setIsUpdatingTicketType] = useState(false);

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
        const token = getAccessTokenFromSession(session);

        if (!token) {
          enqueueSnackbar("You are not authenticated.", {
            variant: "error",
          });
          return;
        }

        const startDateIso = new Date(values.startDate).toISOString();
        const endDateIso = new Date(values.endDate).toISOString();

        if (isEditMode && editID) {
          const payload: UpdateEventPayload = {
            title: values.title,
            description: values.description,
            category: values.category,
            location: values.location,
            startDate: startDateIso,
            endDate: endDateIso,
            price: Number(values.price),
            availableSeats: Number(values.availableSeats),
            status: values.status,
          };

          await updateEventApi(token, editID, payload);

          enqueueSnackbar("Event updated successfully!", {
            variant: "success",
          });
        } else {
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

          await createEventApi(token, payload);

          enqueueSnackbar("Event created successfully!", {
            variant: "success",
          });

          resetForm();
          setImagePreview(null);
        }

        router.push("/org/events");
      } catch (err: unknown) {
        console.error("Create/update event failed:", err);

        let message = isEditMode
          ? "Failed to update event"
          : "Failed to create event";
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
    setValues,
    isSubmitting,
  } = formik;

  function syncEventFromTickets(updatedTickets: SimpleTicketType[]) {
    if (!updatedTickets.length) return;

    const minPrice = updatedTickets.reduce(
      (min, t) => (t.price < min ? t.price : min),
      updatedTickets[0].price,
    );

    const totalQuota = updatedTickets.reduce((sum, t) => sum + t.quota, 0);

    setValues((prev) => ({
      ...prev,
      price: String(minPrice),
      availableSeats: String(totalQuota),
    }));
  }

  useEffect(() => {
    if (!isEditMode || !editSlug) return;

    let cancelled = false;

    const loadEvent = async () => {
      setEventLoading(true);
      try {
        const res = await getEventDetail(editSlug);
        const event = res.data;

        if (!event) {
          if (!cancelled) {
            enqueueSnackbar("Event not found.", { variant: "error" });
            router.push("/org/events");
          }
          return;
        }

        if (cancelled) return;

        setValues({
          title: event.title ?? "",
          description: event.description ?? "",
          category: event.category ?? "",
          location: event.location ?? "",
          startDate: isoToLocalInput(event.startDate),
          endDate: isoToLocalInput(event.endDate),
          price: event.price != null ? String(event.price) : "",
          availableSeats:
            event.availableSeats != null ? String(event.availableSeats) : "",
          status:
            (event.status as "DRAFT" | "PUBLISHED") === "PUBLISHED"
              ? "PUBLISHED"
              : "DRAFT",
          image: null,
        });

        if (event.bannerImg) {
          setImagePreview(event.bannerImg);
        }

        if (Array.isArray(event.ticketType)) {
          setTicketTypes(
            event.ticketType.map((t: SimpleTicketType) => ({
              id: t.id,
              name: t.name,
              description: t.description ?? "",
              price: t.price,
              quota: t.quota,
              availableQuota: t.availableQuota,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load event for editing:", err);
        if (!cancelled) {
          enqueueSnackbar("Failed to load event data for editing.", {
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setEventLoading(false);
        }
      }
    };

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, editSlug, enqueueSnackbar, router, setValues]);

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

  const handleTabChange = (tab: "details" | "tickets") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "details") {
      params.delete("tab");
    } else {
      params.set("tab", "tickets");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleTicketFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTicketForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTicketType = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode || !editID) {
      enqueueSnackbar("Create the event first before adding ticket types.", {
        variant: "warning",
      });
      return;
    }

    const token = getAccessTokenFromSession(session);
    if (!token) {
      enqueueSnackbar("You are not authenticated.", { variant: "error" });
      return;
    }

    const errors = validateTicketTypeForm(ticketForm);
    setTicketFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payloadItems: TicketTypeInput[] = [
      {
        name: ticketForm.name.trim(),
        description: ticketForm.description.trim(),
        price: Number(ticketForm.price),
        quota: Number(ticketForm.quota),
      },
    ];

    try {
      setIsSavingTicketType(true);

      const res = await addTicketTypesApi(token, editID, payloadItems);

      type AddTicketTypesResponse = {
        data?: SimpleTicketType[];
      };

      const allTickets = (res as AddTicketTypesResponse).data ?? [];

      const mappedTickets = allTickets.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? "",
        price: t.price,
        quota: t.quota,
        availableQuota: t.availableQuota,
      }));

      setTicketTypes(mappedTickets);
      syncEventFromTickets(mappedTickets);

      setTicketForm({
        name: "",
        description: "",
        price: "",
        quota: "",
      });
      setTicketFormErrors({});

      enqueueSnackbar("Ticket type added successfully!", {
        variant: "success",
      });
    } catch (err) {
      console.error("addTicketTypesApi error:", err);
      let message = "Failed to add ticket type";
      if (isAxiosError(err)) {
        message = err.response?.data?.message ?? message;
      }
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsSavingTicketType(false);
    }
  };

  const openEditModal = (ticket: SimpleTicketType) => {
    setEditTicketId(ticket.id);
    setEditTicketForm({
      name: ticket.name,
      description: ticket.description ?? "",
      price: String(ticket.price),
      quota: String(ticket.quota),
    });
    setEditTicketFormErrors({});
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditTicketId(null);
  };

  const handleEditTicketFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditTicketForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateTicketType = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode || !editID || !editTicketId) {
      enqueueSnackbar("No ticket selected to update.", {
        variant: "warning",
      });
      return;
    }

    const token = getAccessTokenFromSession(session);
    if (!token) {
      enqueueSnackbar("You are not authenticated.", { variant: "error" });
      return;
    }

    const errors = validateTicketTypeForm(editTicketForm);
    setEditTicketFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      name: editTicketForm.name.trim(),
      description: editTicketForm.description.trim(),
      price: Number(editTicketForm.price),
      quota: Number(editTicketForm.quota),
    };

    try {
      setIsUpdatingTicketType(true);

      const res = await updateTicketTypeApi(
        token,
        editID,
        editTicketId,
        payload,
      );

      type UpdateTicketTypesResponse = {
        data?: SimpleTicketType[];
      };
      const updated = (res as UpdateTicketTypesResponse).data ?? [];

      const mappedTickets = updated.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? "",
        price: t.price,
        quota: t.quota,
        availableQuota: t.availableQuota,
      }));

      setTicketTypes(mappedTickets);
      syncEventFromTickets(mappedTickets);

      enqueueSnackbar("Ticket type updated successfully!", {
        variant: "success",
      });
      closeEditModal();
    } catch (err) {
      console.error("updateTicketTypeApi error:", err);
      let message = "Failed to update ticket type";
      if (isAxiosError(err)) {
        message = err.response?.data?.message ?? message;
      }
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsUpdatingTicketType(false);
    }
  };

  const handleDeleteTicketType = async (ticket: SimpleTicketType) => {
    if (!isEditMode || !editID) {
      enqueueSnackbar("Create the event first before deleting ticket types.", {
        variant: "warning",
      });
      return;
    }

    if (ticket.name.toLowerCase() === "regular") {
      enqueueSnackbar("Regular ticket cannot be deleted.", {
        variant: "warning",
      });
      return;
    }

    const confirmed = window.confirm(
      `Delete ticket "${ticket.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    const token = getAccessTokenFromSession(session);
    if (!token) {
      enqueueSnackbar("You are not authenticated.", { variant: "error" });
      return;
    }

    try {
      setIsSavingTicketType(true);

      const res = await deleteTicketTypeApi(token, editID, ticket.id);

      type DeleteTicketTypesResponse = {
        data?: SimpleTicketType[];
      };
      const updated = (res as DeleteTicketTypesResponse).data ?? [];

      const mappedTickets = updated.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? "",
        price: t.price,
        quota: t.quota,
        availableQuota: t.availableQuota,
      }));

      setTicketTypes(mappedTickets);
      if (mappedTickets.length > 0) {
        syncEventFromTickets(mappedTickets);
      }

      enqueueSnackbar("Ticket type deleted successfully!", {
        variant: "success",
      });
    } catch (err) {
      console.error("deleteTicketTypeApi error:", err);
      let message = "Failed to delete ticket type";
      if (isAxiosError(err)) {
        message = err.response?.data?.message ?? message;
      }
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsSavingTicketType(false);
    }
  };

  if (status === "loading" || (isEditMode && eventLoading)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted text-sm">
          {isEditMode ? "Loading event data..." : "Loading session..."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-clear mb-4 text-2xl font-semibold tracking-tight">
          {isEditMode ? "Edit Event" : "Create New Event"}
        </h1>

        <div className="bg-tertiary mb-6 flex gap-2 rounded-full p-1 text-sm">
          <button
            type="button"
            onClick={() => handleTabChange("details")}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium transition ${
              activeTab === "details"
                ? "bg-primary text-clear shadow-sm"
                : "text-muted hover:bg-secondary"
            }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("tickets")}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium transition ${
              activeTab === "tickets"
                ? "bg-primary text-clear shadow-sm"
                : "text-muted hover:bg-secondary"
            }`}
          >
            Ticket Types
          </button>
        </div>

        {activeTab === "details" && (
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
                  <option value="">
                    {categoriesLoading ? "Loading..." : "Select category"}
                  </option>
                  {categoryOptions.map((cat) => (
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
                <label
                  className="text-muted text-sm font-medium"
                  htmlFor="endDate"
                >
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
                <label
                  className="text-muted text-sm font-medium"
                  htmlFor="price"
                >
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
                  <p className="text-xs text-red-500">
                    {errors.availableSeats}
                  </p>
                )}
              </div>
            </div>

            {/* Status & Banner Image */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  className="text-muted text-sm font-medium"
                  htmlFor="status"
                >
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
                <label
                  className="text-muted text-sm font-medium"
                  htmlFor="image"
                >
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
                    <p className="text-muted-foreground mb-1 text-xs">
                      Preview:
                    </p>
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
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Save Changes"
                    : "Create Event"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "tickets" && (
          <div className="border-border bg-secondary border-lines space-y-6 rounded-2xl border p-6 shadow-lg">
            {isEditMode ? (
              <>
                {/* List ticket types */}
                <div>
                  <h2 className="text-clear mb-3 text-sm font-semibold">
                    Existing Ticket Types
                  </h2>
                  {ticketTypes.length === 0 ? (
                    <p className="text-muted text-sm">
                      No ticket types yet. Add your first ticket type below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {ticketTypes.map((t) => (
                        <div
                          key={t.id}
                          className="border-lines bg-tertiary flex items-start justify-between rounded-xl border px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="text-clear font-semibold">{t.name}</p>
                            {t.description && (
                              <p className="text-muted text-xs">
                                {t.description}
                              </p>
                            )}
                            <p className="text-muted text-xs">
                              Price: Rp {t.price.toLocaleString("id-ID")} ·
                              Quota: {t.quota} · Available: {t.availableQuota}
                            </p>
                          </div>
                          <div className="mt-1 flex flex-col items-end gap-1 text-xs md:flex-row md:text-xs">
                            <button
                              type="button"
                              onClick={() => openEditModal(t)}
                              className="border-lines bg-secondary hover:bg-primary rounded-lg border px-2 py-1 font-medium"
                            >
                              Edit
                            </button>
                            {t.name.toLowerCase() !== "regular" && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTicketType(t)}
                                className="border-lines bg-secondary rounded-lg border px-2 py-1 font-medium text-red-400 hover:bg-red-500/10 hover:text-red-500"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form add ticket type */}
                <div className="border-lines bg-tertiary mt-4 rounded-xl border p-4">
                  <h2 className="text-clear mb-3 text-sm font-semibold">
                    Add Ticket Type
                  </h2>
                  <form
                    className="grid gap-3 md:grid-cols-2"
                    onSubmit={handleAddTicketType}
                  >
                    <div className="space-y-1.5">
                      <label
                        htmlFor="ticket-name"
                        className="text-muted text-xs font-medium"
                      >
                        Name
                      </label>
                      <input
                        id="ticket-name"
                        name="name"
                        type="text"
                        className="border-lines bg-secondary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                        value={ticketForm.name}
                        onChange={handleTicketFormChange}
                        placeholder="e.g. VIP, Regular"
                      />
                      {ticketFormErrors.name && (
                        <p className="text-xs text-red-500">
                          {ticketFormErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="ticket-price"
                        className="text-muted text-xs font-medium"
                      >
                        Price (IDR)
                      </label>
                      <input
                        id="ticket-price"
                        name="price"
                        type="number"
                        min={0}
                        className="border-lines bg-secondary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                        value={ticketForm.price}
                        onChange={handleTicketFormChange}
                        placeholder="e.g. 150000"
                      />
                      {ticketFormErrors.price && (
                        <p className="text-xs text-red-500">
                          {ticketFormErrors.price}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label
                        htmlFor="ticket-description"
                        className="text-muted text-xs font-medium"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        id="ticket-description"
                        name="description"
                        rows={2}
                        className="border-lines bg-secondary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                        value={ticketForm.description}
                        onChange={handleTicketFormChange}
                        placeholder="e.g. Front row seat with merchandise"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="ticket-quota"
                        className="text-muted text-xs font-medium"
                      >
                        Quota
                      </label>
                      <input
                        id="ticket-quota"
                        name="quota"
                        type="number"
                        min={1}
                        className="border-lines bg-secondary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                        value={ticketForm.quota}
                        onChange={handleTicketFormChange}
                        placeholder="e.g. 100"
                      />
                      {ticketFormErrors.quota && (
                        <p className="text-xs text-red-500">
                          {ticketFormErrors.quota}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end justify-end md:col-span-2">
                      <button
                        type="submit"
                        disabled={isSavingTicketType}
                        className="from-accent1-primary to-accent2-primary text-accent-foreground hover:from-accent1-hover hover:text-clear hover:to-accent2-hover text-clear-invert rounded-xl bg-linear-to-r px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-linear-to-r disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingTicketType
                          ? "Saving ticket..."
                          : "Add Ticket Type"}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <p className="text-muted text-sm">
                You need to create the event first before adding ticket types.
                Create an event in the{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("details")}
                  className="underline"
                >
                  Details
                </button>{" "}
                tab, then come back here.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal Edit Ticket Type */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="border-lines bg-secondary w-full max-w-md rounded-2xl border p-6 shadow-xl">
            <h2 className="text-clear mb-4 text-base font-semibold">
              Edit Ticket Type
            </h2>
            <form className="space-y-3" onSubmit={handleUpdateTicketType}>
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-ticket-name"
                  className="text-muted text-xs font-medium"
                >
                  Name
                </label>
                <input
                  id="edit-ticket-name"
                  name="name"
                  type="text"
                  className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                  value={editTicketForm.name}
                  onChange={handleEditTicketFormChange}
                />
                {editTicketFormErrors.name && (
                  <p className="text-xs text-red-500">
                    {editTicketFormErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-ticket-price"
                  className="text-muted text-xs font-medium"
                >
                  Price (IDR)
                </label>
                <input
                  id="edit-ticket-price"
                  name="price"
                  type="number"
                  min={0}
                  className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                  value={editTicketForm.price}
                  onChange={handleEditTicketFormChange}
                />
                {editTicketFormErrors.price && (
                  <p className="text-xs text-red-500">
                    {editTicketFormErrors.price}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-ticket-quota"
                  className="text-muted text-xs font-medium"
                >
                  Quota
                </label>
                <input
                  id="edit-ticket-quota"
                  name="quota"
                  type="number"
                  min={1}
                  className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                  value={editTicketForm.quota}
                  onChange={handleEditTicketFormChange}
                />
                {editTicketFormErrors.quota && (
                  <p className="text-xs text-red-500">
                    {editTicketFormErrors.quota}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-ticket-description"
                  className="text-muted text-xs font-medium"
                >
                  Description (optional)
                </label>
                <textarea
                  id="edit-ticket-description"
                  name="description"
                  rows={2}
                  className="border-lines bg-tertiary focus:border-accent1-primary focus:ring-accent2-hover w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                  value={editTicketForm.description}
                  onChange={handleEditTicketFormChange}
                />
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="border-lines bg-tertiary hover:bg-primary rounded-xl border px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTicketType}
                  className="from-accent1-primary to-accent2-primary text-accent-foreground hover:from-accent1-hover hover:text-clear hover:to-accent2-hover text-clear-invert rounded-xl bg-linear-to-r px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-linear-to-r disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingTicketType ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
