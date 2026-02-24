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
  // 6. KREIRANJE OCENA
  // ============================================

  console.log('⭐ Creating reviews...');

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Odličan servis! Brzo i profesionalno.',
      response: 'Hvala vam na lepim rečima!',
      authorId: client1.id,
      targetId: freelancer2.id,
      bookingId: booking2.id,
    },
  });

  console.log('✅ Created 1 review');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('  - 7 users (1 admin, 2 clients, 2 freelancers, 2 companies)');
  console.log('  - 3 workers');
  console.log('  - 5 categories');
  console.log('  - 6 services');
  console.log('  - 3 bookings');
  console.log('  - 1 review');
  console.log('');
  console.log('🔑 Test credentials:');
  console.log('  Admin: admin@mvp.com / admin123');
  console.log('  Client: marko@gmail.com / marko123');
  console.log('  Freelancer: petar@frizer.com / petar123');
  console.log('  Company: info@beautysalon.com / beauty123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });