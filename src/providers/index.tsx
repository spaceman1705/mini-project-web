"use client";

import { ReactNode, Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { SnackbarProvider } from "notistack";
import Navbar from "@/components/navbar";
import { AxiosInterceptor } from "@/lib/axios-config";

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <AxiosInterceptor>
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
            </AxiosInterceptor>
        </SessionProvider>
    );
}
