import Link from "next/link";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card variant="elevated" padding="lg" className="max-w-md w-full">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <CardTitle className="text-center">Nemate pristup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Nemate dozvolu da pristupite ovoj stranici. Molimo prijavite se sa odgovarajućim nalogom.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link href="/" className="flex-1">
            <Button variant="outline" fullWidth>
              Početna
            </Button>
          </Link>
          <Link href="/auth/login" className="flex-1">
            <Button variant="primary" fullWidth>
              Prijavi se
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}