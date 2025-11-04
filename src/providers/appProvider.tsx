import Navbar from "@/components/navbar/navbar";
import React from "react";

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
