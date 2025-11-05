import Navbar from "@/components/navbar";

interface PageProviderProps {
  children: React.ReactNode;
}

export default function PageProvider({ children }: PageProviderProps) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
