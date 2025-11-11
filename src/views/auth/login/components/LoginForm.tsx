"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.ok) router.push("/");
        else alert("Login gagal");
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 flex flex-col gap-4">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border px-3 py-2 rounded"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border px-3 py-2 rounded"
            />
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
                Login
            </button>
        </form>
    );
}
