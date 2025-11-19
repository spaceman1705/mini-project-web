"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/auth";

type Profile = {
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  pointsBalance: number;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      apiFetch("/profile", session.accessToken)
        .then((data) => setProfile(data))
        .catch((err) => console.error(err));
    }
  }, [status, session]);

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>You must be logged in to view this page.</p>;

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>
      <p><b>Name:</b> {profile.firstname} {profile.lastname}</p>
      <p><b>Email:</b> {profile.email}</p>
      <p><b>Role:</b> {profile.role}</p>
      <p><b>Points:</b> {profile.pointsBalance}</p>

      <div className="mt-4 space-x-3">
        <a href="/profile/edit" className="text-blue-500 underline">Edit Profile</a>
        <a href="/profile/change-password" className="text-blue-500 underline">Change Password</a>
      </div>
    </div>
  );
}
