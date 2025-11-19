"use client";
import { useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { apiFetch } from "@/services/auth";

export default function ChangePasswordPage() {
    const { data: session } = useSession();
    const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        try {
            await apiFetch("/profile/password", session?.access_token, {
                method: "PATCH",
                body: JSON.stringify(form),
            });
            alert("Password updated!");
            setForm({ oldPassword: "", newPassword: "" });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An error occurred";
            alert(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 space-y-3">
            <h1 className="text-2xl font-bold">Change Password</h1>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    className="border p-2 w-full"
                    type="password"
                    placeholder="Old Password"
                    value={form.oldPassword}
                    onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                />
                <input
                    className="border p-2 w-full"
                    type="password"
                    placeholder="New Password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />
                <button
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}
