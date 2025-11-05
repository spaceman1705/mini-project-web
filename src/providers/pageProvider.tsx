import Navbar from "@/components/navbar";
import NavbarDummy from "@/components/navbar/navbarDummy";

interface PageProviderProps {
  children: React.ReactNode;
}

export default function PageProvider({ children }: PageProviderProps) {
  return (
    <>
      <NavbarDummy />
      <Navbar />
      {children}
    </>
  );
}
