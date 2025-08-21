import NavBar from "./components/NavBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

