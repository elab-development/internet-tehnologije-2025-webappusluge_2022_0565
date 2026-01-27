import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8 max-w-3xl">
        <h1 className="text-5xl font-bold text-gray-900">
          Platforma za Oglašavanje Usluga
        </h1>
        <p className="text-xl text-gray-600">
          Povežite se sa najboljim pružaocima usluga u vašem gradu.
          Brzo, jednostavno, pouzdano.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/services">
            <Button variant="primary" size="lg">
              Pregledaj usluge
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg">
              Registruj se
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="secondary" size="lg">
              Prijavi se
            </Button>
          </Link>
        </div>

        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Pronađite usluge</h3>
            <p className="text-sm text-gray-600">
              Pretražite širok spektar usluga po kategorijama i lokaciji
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Zakažite termin</h3>
            <p className="text-sm text-gray-600">
              Jednostavno zakazivanje termina sa potvrdom u realnom vremenu
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ocenite uslugu</h3>
            <p className="text-sm text-gray-600">
              Delite svoje iskustvo i pomozite drugima da donesu pravu odluku
            </p>
          </div>
        </div>

        <div className="pt-8 text-sm text-gray-500">
          <p>MVP verzija - Fakultet tehničkih nauka</p>
        </div>
      </div>
    </main>
  );
}