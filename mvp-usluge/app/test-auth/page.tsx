import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function TestAuthPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">✅ Autentifikacija radi!</h1>
        
        <div className="space-y-2">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Ime:</strong> {user.name}</p>
          <p><strong>Uloga:</strong> {user.role}</p>
          <p><strong>Verifikovan:</strong> {user.isVerified ? "Da" : "Ne"}</p>
        </div>

        <form action="/api/auth/signout" method="POST" className="mt-6">
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Odjavi se
          </button>
        </form>
      </div>
    </div>
  );
}