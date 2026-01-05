import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Platforma za Oglašavanje Usluga
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Povežite se sa najboljim pružaocima usluga u vašem gradu.
          Brzo, jednostavno, pouzdano.
        </p>
        
        <div className="flex gap-4 justify-center pt-4">
          <Link 
            href="/auth/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Registruj se
          </Link>
          <Link 
            href="/auth/login"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Prijavi se
          </Link>
        </div>

        <div className="pt-8 text-sm text-gray-500">
          <p>MVP verzija - Fakultet tehničkih nauka</p>
        </div>
      </div>
    </main>
  );
}