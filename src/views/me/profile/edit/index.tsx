"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, FormEvent } from "react";
import { apiFetch } from "@/services/auth";

export default function EditProfilePage() {
    const { data: session } = useSession();
    const [form, setForm] = useState({ firstname: "", lastname: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.accessToken) {
            apiFetch("/profile", session.accessToken).then((data) =>
                setForm({ firstname: data.firstname, lastname: data.lastname })
            );
        }
    }, [session]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        try {
            await apiFetch("/profile", session?.access_token, {
                method: "PATCH",
                body: JSON.stringify(form),
            });
            alert("Profile updated!");
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert(String(err));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 space-y-3">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    className="border p-2 w-full"
                    placeholder="First Name"
                    value={form.firstname}
                    onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                />
                <input
                    className="border p-2 w-full"
                    placeholder="Last Name"
                    value={form.lastname}
                    onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {loading ? "Saving..." : "Save"}
                </button>
            </form>
        </div>
    );
}
