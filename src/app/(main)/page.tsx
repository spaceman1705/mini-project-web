"use client";

import { Suspense } from "react";
import HomeView from "@/views/home";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeView />
    </Suspense>
  );
}