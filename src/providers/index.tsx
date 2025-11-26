"use client";

import { ReactNode, Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { SnackbarProvider } from "notistack";
import Navbar from "@/components/navbar";

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <SnackbarProvider
                maxSnack={2}
                transitionDuration={300}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <>
                    <Suspense fallback={null}>
                        <Navbar />
                    </Suspense>
                    <main>{children}</main>
                </>
            </SnackbarProvider>
        </SessionProvider>
    );
}
