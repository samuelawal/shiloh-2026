import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader eyebrow="404" title="Page not found" description="We couldn't find what you were looking for." />
        <div className="container-page flex justify-center gap-3 py-16">
          <Link href="/" className="btn border border-umber/20 text-umber hover:bg-umber hover:text-white">
            Go home
          </Link>
          <Link href="/simple" className="btn-primary">
            About Shiloh 2026
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
