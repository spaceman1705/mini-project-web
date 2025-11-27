import VerifyView from "@/views/auth/verify";
import { Suspense } from "react";

export default function Verify() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyView />
    </Suspense>
  );
}