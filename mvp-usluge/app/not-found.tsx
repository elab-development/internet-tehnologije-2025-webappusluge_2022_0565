import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">
          Stranica nije pronađena
        </h2>
        <p className="text-gray-600 mt-2 mb-8">
          Stranica koju tražite ne postoji ili je premeštena.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg">
              Nazad na početnu
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="outline" size="lg">
              Pregledaj usluge
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}