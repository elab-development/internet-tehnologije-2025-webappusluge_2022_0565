import { PrismaClient, UserRole, PricingType, LocationType, BookingStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Očisti bazu pre seed-a
  console.log('🧹 Cleaning database...');
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // 1. KREIRANJE KORISNIKA
  // ============================================

  console.log('👤 Creating users...');

  // Admin korisnik
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mvp.com',
      password: await hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'Adminović',
      role: UserRole.ADMIN,
      isVerified: true,
      phone: '+381601234567',
    },
  });

  // Klijent korisnik
  const client1 = await prisma.user.create({
    data: {
      email: 'marko@gmail.com',
      password: await hash('marko123', 10),
      firstName: 'Marko',
      lastName: 'Marković',
      role: UserRole.CLIENT,
      isVerified: true,
      phone: '+381601111111',
      city: 'Beograd',
    },
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'ana@gmail.com',
      password: await hash('ana123', 10),
      firstName: 'Ana',
      lastName: 'Anić',
      role: UserRole.CLIENT,
      isVerified: true,
      phone: '+381602222222',
      city: 'Novi Sad',
    },
  });

  // Samostalni radnik (frizer)
  const freelancer1 = await prisma.user.create({
    data: {
      email: 'petar@frizer.com',
      password: await hash('petar123', 10),
      firstName: 'Petar',
      lastName: 'Petrović',
      role: UserRole.FREELANCER,
      isVerified: true,
      phone: '+381603333333',
      bio: 'Profesionalni frizer sa 10 godina iskustva. Specijalizovan za moderne muške frizure.',
      address: 'Knez Mihailova 15',
      city: 'Beograd',
      latitude: 44.8176,
      longitude: 20.4633,
      averageRating: 4.8,
      totalReviews: 45,
    },
  });

  // Samostalni radnik (vodoinstalater)
  const freelancer2 = await prisma.user.create({
    data: {
      email: 'jovan@vodovod.com',
      password: await hash('jovan123', 10),
      firstName: 'Jovan',
      lastName: 'Jovanović',
      role: UserRole.FREELANCER,
      isVerified: true,
      phone: '+381604444444',
      bio: 'Licencirani vodoinstalater. Hitne intervencije 24/7.',
      address: 'Bulevar Kralja Aleksandra 45',
      city: 'Beograd',
      latitude: 44.8048,
      longitude: 20.4781,
      averageRating: 4.5,
      totalReviews: 32,
    },
  });

  // Preduzeće (salon lepote)
  const company1 = await prisma.user.create({
    data: {
      email: 'info@beautysalon.com',
      password: await hash('beauty123', 10),
      firstName: 'Beauty',
      lastName: 'Salon',
      role: UserRole.COMPANY,
      companyName: 'Beauty Salon Elegance',
      pib: '123456789',
      isVerified: true,
      phone: '+381605555555',
      bio: 'Vodeći salon lepote u Beogradu. Nudimo sve vrste kozmetičkih tretmana.',
      address: 'Terazije 25',
      city: 'Beograd',
      latitude: 44.8125,
      longitude: 20.4612,
      averageRating: 4.9,
      totalReviews: 120,
      verifiedAt: new Date(),
    },
  });

  // Preduzeće (servis za popravke)
  const company2 = await prisma.user.create({
    data: {
      email: 'info@homerepair.com',
      password: await hash('repair123', 10),
      firstName: 'Home',
      lastName: 'Repair',
      role: UserRole.COMPANY,
      companyName: 'Home Repair Pro',
      pib: '987654321',
      isVerified: true,
      phone: '+381606666666',
      bio: 'Profesionalne usluge popravki i održavanja kuća i stanova.',
      address: 'Novi Beograd, Blok 23',
      city: 'Beograd',
      latitude: 44.8167,
      longitude: 20.3833,
      averageRating: 4.6,
      totalReviews: 85,
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Created 7 users');

  // ============================================
  // 1.5. KREIRANJE RADNOG VREMENA
  // ============================================
  console.log('⏰ Creating working hours...');

  // Radno vreme za freelancer1 (Petar - frizer)
  await prisma.workingHours.createMany({
    data: [
      // Ponedeljak - Petak: 09:00 - 17:00
      { userId: freelancer1.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
      { userId: freelancer1.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
      { userId: freelancer1.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
      { userId: freelancer1.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
      { userId: freelancer1.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true },
      // Subota: 10:00 - 14:00
      { userId: freelancer1.id, dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isActive: true },
    ],
  });

  // Radno vreme za freelancer2 (Jovan - vodoinstalater) - 24/7 hitne intervencije
  await prisma.workingHours.createMany({
    data: [
      { userId: freelancer2.id, dayOfWeek: 0, startTime: '00:00', endTime: '23:59', isActive: true },
      { userId: freelancer2.id, dayOfWeek: 1, startTime: '00:00', endTime: '23:59', isActive: true },
      { userId: freelancer2.id, dayOfWeek: 2, startTime: '00:00', endTime: '23:59', isActive: true },
      { userId: freelancer2.id, dayOfWeek: 3, startTime: '00:00', endTime: '23:59', isActive: true },
      { userId: freelancer2.id, dayOfWeek: 4, startTime: '00:00', endTime: '23:59', isActive: true },
      { userId: freelancer2.id, dayOfWeek: 5, startTime: '00:00', endTime: '23:59', isActive: true },
      { userId: freelancer2.id, dayOfWeek: 6, startTime: '00:00', endTime: '23:59', isActive: true },
    ],
  });

  // Radno vreme za company1 (Beauty Salon)
  await prisma.workingHours.createMany({
    data: [
      // Ponedeljak - Petak: 08:00 - 20:00
      { userId: company1.id, dayOfWeek: 1, startTime: '08:00', endTime: '20:00', isActive: true },
      { userId: company1.id, dayOfWeek: 2, startTime: '08:00', endTime: '20:00', isActive: true },
      { userId: company1.id, dayOfWeek: 3, startTime: '08:00', endTime: '20:00', isActive: true },
      { userId: company1.id, dayOfWeek: 4, startTime: '08:00', endTime: '20:00', isActive: true },
      { userId: company1.id, dayOfWeek: 5, startTime: '08:00', endTime: '20:00', isActive: true },
      // Subota: 09:00 - 18:00
      { userId: company1.id, dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isActive: true },
    ],
  });

  // Radno vreme za company2 (Home Repair)
  await prisma.workingHours.createMany({
    data: [
      // Ponedeljak - Subota: 07:00 - 19:00
      { userId: company2.id, dayOfWeek: 1, startTime: '07:00', endTime: '19:00', isActive: true },
      { userId: company2.id, dayOfWeek: 2, startTime: '07:00', endTime: '19:00', isActive: true },
      { userId: company2.id, dayOfWeek: 3, startTime: '07:00', endTime: '19:00', isActive: true },
      { userId: company2.id, dayOfWeek: 4, startTime: '07:00', endTime: '19:00', isActive: true },
      { userId: company2.id, dayOfWeek: 5, startTime: '07:00', endTime: '19:00', isActive: true },
      { userId: company2.id, dayOfWeek: 6, startTime: '07:00', endTime: '19:00', isActive: true },
    ],
  });

  console.log('✅ Created working hours for 4 providers');

  // ============================================
  // 2. KREIRANJE RADNIKA (za preduzeća)
  // ============================================

  console.log('👷 Creating workers...');

  const worker1 = await prisma.worker.create({
    data: {
      firstName: 'Milica',
      lastName: 'Milić',
      email: 'milica@beautysalon.com',
      phone: '+381607777777',
      position: 'Senior kozmetičar',
      specializations: ['Manikir', 'Pedikir', 'Tretmani lica'],
      companyId: company1.id,
    },
  });

  const worker2 = await prisma.worker.create({
    data: {
      firstName: 'Jelena',
      lastName: 'Jelenić',
      email: 'jelena@beautysalon.com',
      phone: '+381608888888',
      position: 'Frizer',
      specializations: ['Šišanje', 'Farbanje', 'Feniranje'],
      companyId: company1.id,
    },
  });

  const worker3 = await prisma.worker.create({
    data: {
      firstName: 'Nikola',
      lastName: 'Nikolić',
      email: 'nikola@homerepair.com',
      phone: '+381609999999',
      position: 'Električar',
      specializations: ['Instalacije', 'Popravke', 'Održavanje'],
      companyId: company2.id,
    },
  });

  console.log('✅ Created 3 workers');

  // ============================================
  // 3. KREIRANJE KATEGORIJA
  // ============================================

  console.log('📂 Creating categories...');

  const catBeauty = await prisma.category.create({
    data: {
      name: 'Lepota i wellness',
      slug: 'lepota-wellness',
      description: 'Usluge frizerskih salona, kozmetičkih tretmana i masaža',
      iconUrl: '💇',
    },
  });

  const catBeautyHair = await prisma.category.create({
    data: {
      name: 'Frizerske usluge',
      slug: 'frizerske-usluge',
      description: 'Šišanje, farbanje, feniranje',
      iconUrl: '✂',
      parentId: catBeauty.id,
    },
  });

  const catBeautyCosmetics = await prisma.category.create({
    data: {
      name: 'Kozmetički tretmani',
      slug: 'kozmeticki-tretmani',
      description: 'Manikir, pedikir, tretmani lica',
      iconUrl: '💅',
      parentId: catBeauty.id,
    },
  });

  const catHome = await prisma.category.create({
    data: {
      name: 'Popravke i održavanje',
      slug: 'popravke-odrzavanje',
      description: 'Vodoinstalaterske, električarske i građevinske usluge',
      iconUrl: '🔧',
    },
  });

  const catHomePlumbing = await prisma.category.create({
    data: {
      name: 'Vodoinstalaterske usluge',
      slug: 'vodoinstalaterske-usluge',
      description: 'Popravke cevi, slavina, bojlera',
      iconUrl: '🚰',
      parentId: catHome.id,
    },
  });

  console.log('✅ Created 5 categories');

  // ============================================
  // 4. KREIRANJE USLUGA
  // ============================================

  console.log('💼 Creating services...');

  // Usluge freelancera (frizer)
  const service1 = await prisma.service.create({
    data: {
      name: 'Muško šišanje',
      description: 'Profesionalno muško šišanje sa stilizovanjem. Uključuje pranje i feniranje.',
      price: 1500,
      pricingType: PricingType.FIXED,
      duration: 45,
      locationType: LocationType.ONSITE,
      images: [],
      providerId: freelancer1.id,
      categoryId: catBeautyHair.id,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Žensko šišanje',
      description: 'Šišanje sa konsultacijom i stilizovanjem. Uključuje pranje i feniranje.',
      price: 2500,
      pricingType: PricingType.FIXED,
      duration: 90,
      locationType: LocationType.ONSITE,
      images: [],
      providerId: freelancer1.id,
      categoryId: catBeautyHair.id,
    },
  });

  // Usluge freelancera (vodoinstalater)
  const service3 = await prisma.service.create({
    data: {
      name: 'Popravka slavine',
      description: 'Popravka ili zamena slavine. Hitne intervencije dostupne.',
      price: 3000,
      pricingType: PricingType.FIXED,
      duration: 60,
      locationType: LocationType.CLIENT_LOCATION,
      images: [],
      providerId: freelancer2.id,
      categoryId: catHomePlumbing.id,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      name: 'Čišćenje odvoda',
      description: 'Profesionalno čišćenje začepljenih odvoda. Garancija na uslugu.',
      price: 4500,
      pricingType: PricingType.FIXED,
      duration: 120,
      locationType: LocationType.CLIENT_LOCATION,
      images: [],
      providerId: freelancer2.id,
      categoryId: catHomePlumbing.id,
    },
  });

  // Usluge preduzeća (salon)
  const service5 = await prisma.service.create({
    data: {
      name: 'Manikir sa gel lakom',
      description: 'Profesionalni manikir sa trajnim gel lakom. Uključuje oblikovanje i njegu.',
      price: 2000,
      pricingType: PricingType.FIXED,
      duration: 60,
      locationType: LocationType.ONSITE,
      images: [],
      providerId: company1.id,
      categoryId: catBeautyCosmetics.id,
    },
  });

  const service6 = await prisma.service.create({
    data: {
      name: 'Tretman lica',
      description: 'Dubinsko čišćenje i hidratacija lica. Prilagođeno tipu kože.',
      price: 3500,
      pricingType: PricingType.FIXED,
      duration: 90,
      locationType: LocationType.ONSITE,
      images: [],
      providerId: company1.id,
      categoryId: catBeautyCosmetics.id,
    },
  });

  // Povezivanje radnika sa uslugama
  await prisma.service.update({
    where: { id: service5.id },
    data: {
      workers: {
        connect: [{ id: worker1.id }],
      },
    },
  });

  await prisma.service.update({
    where: { id: service6.id },
    data: {
      workers: {
        connect: [{ id: worker1.id }],
      },
    },
  });

  await prisma.service.update({
    where: { id: service5.id },
    data: {
      workers: {
        connect: [{ id: worker2.id }],
      },
    },
  });

  console.log('✅ Created 6 services');

  // ============================================
  // 5. KREIRANJE REZERVACIJA
  // ============================================

  console.log('📅 Creating bookings...');

  const booking1 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2024-01-20'),
      scheduledTime: '14:00',
      status: BookingStatus.CONFIRMED,
      clientNotes: 'Molim vas da budete tačni.',
      clientId: client1.id,
      providerId: freelancer1.id,
      serviceId: service1.id,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2024-01-22'),
      scheduledTime: '10:00',
      status: BookingStatus.COMPLETED,
      clientNotes: 'Hitna intervencija.',
      clientId: client1.id,
      providerId: freelancer2.id,
      serviceId: service3.id,
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2024-01-25'),
      scheduledTime: '16:00',
      status: BookingStatus.PENDING,
      clientId: client2.id,
      providerId: company1.id,
      serviceId: service5.id,
      workerId: worker1.id,
    },
  });

  console.log('✅ Created 3 initial bookings');

  // Mock podaci za analitiku (u poslednjih 6 meseci za freelancer1 i company1)
  console.log('📅 Creating recent bookings for analytics...');
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const b1 = await prisma.booking.create({
      data: {
        scheduledDate: date,
        scheduledTime: '10:00',
        status: BookingStatus.COMPLETED,
        clientId: client1.id,
        providerId: freelancer1.id,
        serviceId: service1.id,
      },
    });

    await prisma.review.create({
      data: {
        rating: i % 2 === 0 ? 5 : 4,
        comment: 'Odlično!',
        authorId: client1.id,
        targetId: freelancer1.id,
        bookingId: b1.id,
      },
    });

    const b2 = await prisma.booking.create({
      data: {
        scheduledDate: date,
        scheduledTime: '14:00',
        status: BookingStatus.COMPLETED,
        clientId: client2.id,
        providerId: company1.id,
        serviceId: service5.id,
      },
    });

    await prisma.review.create({
      data: {
        rating: 5,
        comment: 'Vrlo dobro!',
        authorId: client2.id,
        targetId: company1.id,
        bookingId: b2.id,
      },
    });
  }
  console.log('✅ Created recent mock bookings & reviews for analytics');

  // ============================================
  // 6. KREIRANJE OCENA - RAZNOVRSNI SCENARIJI
  // ============================================

  console.log('⭐ Creating comprehensive reviews for testing...');

  // SCENARIO 1: NOVA OCENA (može se menjati) - kreiranа pre 2 dana
  const newDate = new Date();
  newDate.setDate(newDate.getDate() - 2);

  const newBooking1 = await prisma.booking.create({
    data: {
      scheduledDate: newDate,
      scheduledTime: '15:00',
      status: BookingStatus.COMPLETED,
      clientId: client1.id,
      providerId: freelancer1.id,
      serviceId: service1.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Odličan frizer! Promenio mi je izgled. Veoma preporučujem njegovu uslugu.',
      authorId: client1.id,
      targetId: freelancer1.id,
      bookingId: newBooking1.id,
      createdAt: newDate,
    },
  });

  // SCENARIO 2: OCENA BLIZU LIMITE (3 dana - može se menjati do 7) - kreiranа pre 3 dana
  const threeDay = new Date();
  threeDay.setDate(threeDay.getDate() - 3);

  const booking3Day = await prisma.booking.create({
    data: {
      scheduledDate: threeDay,
      scheduledTime: '10:00',
      status: BookingStatus.COMPLETED,
      clientId: client2.id,
      providerId: freelancer1.id,
      serviceId: service2.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Dobar servis, profesionalno, malo sam nezadovoljna sa farbom koja nije tačno pogođena ali je cena prihvatljiva.',
      authorId: client2.id,
      targetId: freelancer1.id,
      bookingId: booking3Day.id,
      createdAt: threeDay,
    },
  });

  // SCENARIO 3: OCENA SA ODGOVOROM PRUŽAOCA (nova sa odgovorom)
  const withResponseDate = new Date();
  withResponseDate.setDate(withResponseDate.getDate() - 1);

  const bookingWithResponse = await prisma.booking.create({
    data: {
      scheduledDate: withResponseDate,
      scheduledTime: '14:00',
      status: BookingStatus.COMPLETED,
      clientId: client1.id,
      providerId: company1.id,
      serviceId: service5.id,
      workerId: worker1.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Manikir je bio odličan! Gel lak će trajati sigurno dve nedelje. Velika je pažnja na detaljima.',
      response: 'Hvala vam što ste zadovoljni! Veselimo se da vas vidimo ponovo uskoro. 💅',
      authorId: client2.id,
      targetId: company1.id,
      bookingId: bookingWithResponse.id,
      createdAt: withResponseDate,
    },
  });

  // SCENARIO 4: STARA OCENA (više od 7 dana - NIJE moguće menjati) - kreiranа pre 10 dana
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 10);

  const oldBooking = await prisma.booking.create({
    data: {
      scheduledDate: oldDate,
      scheduledTime: '11:00',
      status: BookingStatus.COMPLETED,
      clientId: client1.id,
      providerId: freelancer2.id,
      serviceId: service3.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Odličan servis! Brzo i profesionalno rešio problem sa slavinom. Preporučujem svima.',
      response: 'Hvala vam na poveri! Bilo nam je zadovoljstvo da radimo za vas.',
      authorId: client1.id,
      targetId: freelancer2.id,
      bookingId: oldBooking.id,
      createdAt: oldDate,
    },
  });

  // SCENARIO 5: SREDNJA OCENA (3 zvezdice) - kreiranа pre 5 dana
  const middleRatingDate = new Date();
  middleRatingDate.setDate(middleRatingDate.getDate() - 5);

  const middleBooking = await prisma.booking.create({
    data: {
      scheduledDate: middleRatingDate,
      scheduledTime: '16:00',
      status: BookingStatus.COMPLETED,
      clientId: client2.id,
      providerId: freelancer2.id,
      serviceId: service4.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 3,
      comment: 'Usluga je zadovoljavajuća, rešio je problem ali je trebalo duže nego što je obećano.',
      authorId: client2.id,
      targetId: freelancer2.id,
      bookingId: middleBooking.id,
      createdAt: middleRatingDate,
    },
  });

  // SCENARIO 6: LOŠA OCENA (1 zvezdica) - kreiranа pre 6 dana
  const badReviewDate = new Date();
  badReviewDate.setDate(badReviewDate.getDate() - 6);

  const badBooking = await prisma.booking.create({
    data: {
      scheduledDate: badReviewDate,
      scheduledTime: '09:00',
      status: BookingStatus.COMPLETED,
      clientId: client1.id,
      providerId: company2.id,
      serviceId: service6.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 2,
      comment: 'Lošo rađeno. Trebao je bolji pristup i više profesionalnosti. Neću ponovno do njih.',
      authorId: client1.id,
      targetId: company2.id,
      bookingId: badBooking.id,
      createdAt: badReviewDate,
    },
  });

  // SCENARIO 7: SKORO NA LIMITI (6.9 dana) - kreiranа pre skoro 7 dana
  const almostLimitDate = new Date();
  almostLimitDate.setHours(almostLimitDate.getHours() - 166); // 6 dana i 22 sata

  const almostLimitBooking = await prisma.booking.create({
    data: {
      scheduledDate: almostLimitDate,
      scheduledTime: '13:00',
      status: BookingStatus.COMPLETED,
      clientId: client2.id,
      providerId: freelancer1.id,
      serviceId: service1.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Zadovoljavam se sa uslugom. Malo je trebalo bolje, ali očekujem nove rezultate sledeci put.',
      authorId: client2.id,
      targetId: freelancer1.id,
      bookingId: almostLimitBooking.id,
      createdAt: almostLimitDate,
    },
  });

  // SCENARIO 8: SAMO RATING BEZ KOMENTA - kreiranа pre 4 dana
  const ratingOnlyDate = new Date();
  ratingOnlyDate.setDate(ratingOnlyDate.getDate() - 4);

  const ratingOnlyBooking = await prisma.booking.create({
    data: {
      scheduledDate: ratingOnlyDate,
      scheduledTime: '12:00',
      status: BookingStatus.COMPLETED,
      clientId: client1.id,
      providerId: company1.id,
      serviceId: service5.id,
      workerId: worker2.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Odličan tretman lica!',
      authorId: client1.id,
      targetId: company1.id,
      bookingId: ratingOnlyBooking.id,
      createdAt: ratingOnlyDate,
    },
  });

  console.log('✅ Created 9 comprehensive reviews with various scenarios');

  // ============================================
  // 7. KREIRANJE USLUGA BEZ OCENA (ZA TESTIRANJE KREIRANJA NOVIH OCENA)
  // ============================================

  console.log('📅 Creating completed bookings WITHOUT reviews for rating testing...');

  // BOOKING 1: Muško šišanje bez ocene - client1 -> freelancer1
  const unratedBooking1 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-15'), // Nedavna
      scheduledTime: '10:30',
      status: BookingStatus.COMPLETED,
      clientNotes: 'Molim malo kraće sa strana.',
      clientId: client1.id,
      providerId: freelancer1.id,
      serviceId: service1.id,
    },
  });

  // BOOKING 2: Manikir bez ocene - client2 -> company1 (sa radnikom)
  const unratedBooking2 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-14'),
      scheduledTime: '14:00',
      status: BookingStatus.COMPLETED,
      clientId: client2.id,
      providerId: company1.id,
      serviceId: service5.id,
      workerId: worker1.id,
    },
  });

  // BOOKING 3: Žensko šišanje bez ocene - client2 -> freelancer1
  const unratedBooking3 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-13'),
      scheduledTime: '11:00',
      status: BookingStatus.COMPLETED,
      clientNotes: 'Žena sa dugom kosom.',
      clientId: client2.id,
      providerId: freelancer1.id,
      serviceId: service2.id,
    },
  });

  // BOOKING 4: Popravka slavine bez ocene - client1 -> freelancer2
  const unratedBooking4 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-12'),
      scheduledTime: '15:30',
      status: BookingStatus.COMPLETED,
      clientNotes: 'Hitna intervencija - dete slomilo slavinu u koupaonici.',
      clientId: client1.id,
      providerId: freelancer2.id,
      serviceId: service3.id,
    },
  });

  // BOOKING 5: Tretman lica bez ocene - client1 -> company1 (sa radnikom)
  const unratedBooking5 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-11'),
      scheduledTime: '16:00',
      status: BookingStatus.COMPLETED,
      clientId: client1.id,
      providerId: company1.id,
      serviceId: service6.id,
      workerId: worker1.id,
    },
  });

  // BOOKING 6: Čišćenje odvoda bez ocene - client2 -> freelancer2
  const unratedBooking6 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-10'),
      scheduledTime: '09:00',
      status: BookingStatus.COMPLETED,
      clientNotes: 'Kupatilo je potpuno začepljeno.',
      clientId: client2.id,
      providerId: freelancer2.id,
      serviceId: service4.id,
    },
  });

  console.log('✅ Created 6 completed bookings without reviews for rating testing');
  console.log('   - These bookings can now be rated by the clients');
  console.log('   - Access them through /api/reviews POST endpoint');

  // ============================================
  // 8. KREIRANJE OTKAZANIH I ODBIJENIH REZERVACIJA (ZA TESTIRANJE BRISANJA)
  // ============================================

  console.log('📅 Creating cancelled and rejected bookings for deletion testing...');

  // CANCELLED BOOKING 1 - klijent je otkazao
  const cancelledBooking1 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-01'),
      scheduledTime: '14:00',
      status: BookingStatus.CANCELLED,
      clientNotes: 'Moram da otkaž zbog bolovanja.',
      clientId: client1.id,
      providerId: freelancer1.id,
      serviceId: service1.id,
    },
  });

  // REJECTED BOOKING 1 - pružalac je odbio
  const rejectedBooking1 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-02'),
      scheduledTime: '10:00',
      status: BookingStatus.REJECTED,
      providerNotes: 'Tog dana sam već zauzet sa drugim klijentima.',
      clientId: client2.id,
      providerId: freelancer2.id,
      serviceId: service3.id,
    },
  });

  // CANCELLED BOOKING 2 - kompanija je otkazala
  const cancelledBooking2 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-03'),
      scheduledTime: '15:30',
      status: BookingStatus.CANCELLED,
      clientNotes: 'Nema više potrebe za uslugom.',
      clientId: client1.id,
      providerId: company1.id,
      serviceId: service5.id,
      workerId: worker1.id,
    },
  });

  // REJECTED BOOKING 2 - salon je odbio
  const rejectedBooking2 = await prisma.booking.create({
    data: {
      scheduledDate: new Date('2025-02-04'),
      scheduledTime: '11:00',
      status: BookingStatus.REJECTED,
      providerNotes: 'Preopterećeni smo u tom vremenu.',
      clientId: client2.id,
      providerId: company1.id,
      serviceId: service2.id,
    },
  });

  console.log('✅ Created 4 cancelled/rejected bookings for deletion testing');
  console.log('   - Use DELETE /api/bookings/{id} to delete them');
  console.log('   - Only CANCELLED or REJECTED bookings can be deleted');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('  - 7 users (1 admin, 2 clients, 2 freelancers, 2 companies)');
  console.log('  - 3 workers');
  console.log('  - 5 categories');
  console.log('  - 6 services');
  console.log('  - 30+ bookings (completed, pending, confirmed, cancelled, rejected)');
  console.log('  - 9 reviews with various test scenarios');
  console.log('  - 6 unrated completed bookings for testing review creation');
  console.log('  - 4 cancelled/rejected bookings for deletion testing');
  console.log('  - 27 working hours slots');
  console.log('');
  console.log('⭐ Review Test Scenarios Created:');
  console.log('  1. ✏️  NOVO - Nova ocena (2 dana) - CAN BE EDITED');
  console.log('  2. ⏰ BLIZU LIMITE - Ocena blizu 7-dnevne limite (3 dana) - CAN BE EDITED');
  console.log('  3. 💬 SA ODGOVOROM - Ocena sa pružaočevim odgovorom (1 dan) - CAN BE EDITED');
  console.log('  4. 🔒 STARA - Ocena starija od 7 dana (10 dana) - CANNOT BE EDITED');
  console.log('  5. 3⭐ SREDNJA - Srednja ocena (3/5 zvezdice, 5 dana) - CAN BE EDITED');
  console.log('  6. 1⭐ LOŠA - Loša ocena (1/5 zvezdica, 6 dana) - CAN BE EDITED');
  console.log('  7. ⏳ SKORO NA LIMITI - Blizu isteka 7 dana (6.9 dana) - CAN BE EDITED (još ~2h)');
  console.log('  8. ✍️  SAMO RATING - Kratka ocena sa samo komentarom (4 dana) - CAN BE EDITED');
  console.log('');
  console.log('📝 VAŽNO SVOJSTVO: Ocene se sada mogu menjati u roku od 7 DANA (umesto 24h)');
  console.log('');

  console.log('🗑️  Booking Deletion Test Scenarios:');
  console.log('  ✓ CANCELLED - Muško šišanje (client1 -> freelancer1/Petar) - 01.02.2025');
  console.log('  ✓ REJECTED - Popravka slavine (client2 -> freelancer2/Jovan) - 02.02.2025');
  console.log('  ✓ CANCELLED - Tretman lica (client1 -> company1/Beauty Salon) - 03.02.2025');
  console.log('  ✓ REJECTED - Manikir (client2 -> company1/Beauty Salon) - 04.02.2025');
  console.log('  💡 Use DELETE /api/bookings/{id} to test deletion!');
  console.log('  💡 Only CANCELLED or REJECTED bookings can be deleted');
  console.log('');

  console.log('🆕 Unrated Bookings Available for Testing Review Creation:');
  console.log('  ✓ Muško šišanje (client1 -> freelancer1/Petar) - 15.02.2025');
  console.log('  ✓ Manikir (client2 -> company1/Beauty Salon) - 14.02.2025');
  console.log('  ✓ Žensko šišanje (client2 -> freelancer1/Petar) - 13.02.2025');
  console.log('  ✓ Popravka slavine (client1 -> freelancer2/Jovan) - 12.02.2025');
  console.log('  ✓ Tretman lica (client1 -> company1/Beauty Salon) - 11.02.2025');
  console.log('  ✓ Čišćenje odvoda (client2 -> freelancer2/Jovan) - 10.02.2025');
  console.log('  Use POST /api/reviews with bookingId to create new reviews!');
  console.log('');
  console.log('🔑 Test credentials:');
  console.log('  Admin: admin@mvp.com / admin123');
  console.log('  Client 1: marko@gmail.com / marko123');
  console.log('  Client 2: ana@gmail.com / ana123');
  console.log('  Freelancer (Frizer): petar@frizer.com / petar123');
  console.log('  Freelancer (Vodovod): jovan@vodovod.com / jovan123');
  console.log('  Company (Salon): info@beautysalon.com / beauty123');
  console.log('  Company (Popravke): info@homerepair.com / repair123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });