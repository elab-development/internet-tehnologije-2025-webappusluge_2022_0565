import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Badge */}
          <div className="inline-block">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              🎓 MVP - Internet tehnologije 2026
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            Platforma za
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}Oglašavanje Usluga
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Povežite se sa najboljim pružaocima usluga u vašem gradu.
            Brzo, jednostavno, pouzdano.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/services">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Pregledaj usluge
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Registruj se besplatno
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600 mt-1">Aktivnih usluga</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">1000+</div>
              <div className="text-sm text-gray-600 mt-1">Zadovoljnih korisnika</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">4.8★</div>
              <div className="text-sm text-gray-600 mt-1">Prosečna ocena</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kako funkcioniše?
            </h2>
            <p className="text-gray-600 text-lg">
              Tri jednostavna koraka do idealne usluge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1. Pronađite uslugu
              </h3>
              <p className="text-gray-600">
                Pretražite širok spektar usluga po kategorijama, lokaciji i ocenama.
                Filtrirajte rezultate prema vašim potrebama.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2. Zakažite termin
              </h3>
              <p className="text-gray-600">
                Izaberite slobodan termin u kalendaru pružaoca.
                Dobijte potvrdu u realnom vremenu i automatske podsetnik.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3. Ocenite uslugu
              </h3>
              <p className="text-gray-600">
                Nakon završene usluge, podelite svoje iskustvo.
                Pomozite drugima da donesu pravu odluku.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Spremni da započnete?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Pridružite se hiljadama zadovoljnih korisnika već danas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Kreiraj nalog
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="min-w-[200px] !text-white !border-white hover:!bg-white/10">
                Već imam nalog
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">
            © 2024 MVP Usluge - Platforma za oglašavanje uslužnih aktivnosti
          </p>
          <p className="text-sm">
            Projekat razvijen u okviru kursa na Fakultetu tehničkih nauka
          </p>
          <div className="mt-6 flex justify-center gap-6">
            <Link href="/services" className="hover:text-white transition">
              Usluge
            </Link>
            <Link href="/docs" className="hover:text-white transition">
              API Docs
            </Link>
            <Link href="/auth/register" className="hover:text-white transition">
              Registracija
            </Link>
            <Link href="/auth/login" className="hover:text-white transition">
              Prijava
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}