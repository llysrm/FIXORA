/**
 * Seed script: demo categories, providers, services, customers, bookings, reviews.
 * Run: npx tsx scripts/seed.ts   (or npm run db:seed)
 * Idempotent: skips seeding if users already exist.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import * as schema from "../db/schema";

const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
const db = drizzle(client, { schema });

const id = () => randomBytes(16).toString("hex");
const hash = (pw: string) => bcrypt.hash(pw, 12);

async function main() {
  const existing = await db.select({ id: schema.users.id }).from(schema.users).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  // Admin
  const adminId = id();
  await db.insert(schema.users).values({
    id: adminId, name: "FIXORA Admin", email: "admin@fixora.test",
    passwordHash: await hash("admin1234"), role: "admin",
  });

  // Categories
  const cats = [
    { name: "Servis AC", slug: "ac-repair", iconName: "air-vent", description: "Servis dan perbaikan pendingin ruangan" },
    { name: "Perbaikan Pipa", slug: "plumbing", iconName: "droplets", description: "Kebocoran, pipa, saluran air, dan keran" },
    { name: "Listrik", slug: "electrical", iconName: "zap", description: "Instalasi kabel, saklar, dan perbaikan kelistrikan" },
    { name: "Kebersihan Rumah", slug: "home-cleaning", iconName: "sparkles", description: "Kebersihan rutin dan bersih total rumah" },
    { name: "Servis Elektronik", slug: "appliance-repair", iconName: "washing-machine", description: "Mesin cuci, kulkas, dan elektronik lainnya" },
    { name: "Laundry", slug: "laundry", iconName: "shirt", description: "Jemput, cuci, dan antar laundry" },
  ];
  const catIds: Record<string, string> = {};
  for (const c of cats) {
    const cid = id();
    catIds[c.slug] = cid;
    await db.insert(schema.serviceCategories).values({ id: cid, ...c });
  }

  // Providers
  const providers = [
    { name: "Budi Santoso", email: "marcus@fixora.test", business: "Budi Teknik Pendingin", city: "Jakarta Selatan", bio: "Teknisi AC bersertifikat dengan 12 tahun pengalaman. Spesialis servis AC, isi freon, dan perawatan musiman." },
    { name: "Sari Wulandari", email: "sofia@fixora.test", business: "Sari Plumbing", city: "Jakarta Selatan", bio: "Usaha keluarga di bidang pipa. Penanganan kebocoran darurat, ganti pipa, water heater, dan renovasi kamar mandi." },
    { name: "Joko Prasetyo", email: "james@fixora.test", business: "Joko Listrik", city: "Depok", bio: "Elektrikisi berlisensi. Upgrade panel, pasang saklar, pemasangan lampu, dan inspeksi keamanan." },
    { name: "Lestari Rambe", email: "lena@fixora.test", business: "BersihRumah", city: "Jakarta Timur", bio: "Tim kebersihan rumah ramah lingkungan. Bersih total, pindahan, dan kunjungan rutin." },
    { name: "Dedi Kurniawan", email: "devon@fixora.test", business: "Dedi Servis Elektronik", city: "Tangerang", bio: "Spesialis servis elektronik: mesin cuci, kulkas, pengering, dan oven." },
    { name: "Tommy Wijaya", email: "tom@fixora.test", business: "LaundryKilat", city: "Jakarta Utara", bio: "Jemput, cuci, lipat, dan antar. Tersedia layanan hari yang sama." },
  ];

  const providerIds: string[] = [];
  for (const p of providers) {
    const uid = id();
    providerIds.push(uid);
    await db.insert(schema.users).values({
      id: uid, name: p.name, email: p.email,
      passwordHash: await hash("provider1234"), role: "provider", phone: "+62 812 0000 20" + String(providerIds.length).padStart(2, "0"),
    });
    await db.insert(schema.providerProfiles).values({
      id: id(), userId: uid, businessName: p.business, city: p.city, bio: p.bio, status: "approved",
    });
    await db.insert(schema.providerAvailability).values(
      [1, 2, 3, 4, 5].map((day) => ({
        id: id(), providerId: uid, dayOfWeek: day, startTime: "08:00", endTime: "17:00", isActive: true,
      })),
    );
  }

  // Services
  const svc = [
    { title: "Cuci AC total & perawatan", provider: 0, cat: "ac-repair", price: 150000, unit: "visit" as const, desc: "Cuci AC menyeluruh: filter, coil, flush saluran pembuangan, cek freon, dan tes performa. Butuh sekitar 2 jam." },
    { title: "Isi freon AC", provider: 0, cat: "ac-repair", price: 250000, unit: "visit" as const, desc: "Pengecekan kebocoran dan tambah freon untuk AC split dan window. Termasuk tes tekanan." },
    { title: "Deteksi kebocoran & perbaikan pipa", provider: 1, cat: "plumbing", price: 180000, unit: "visit" as const, desc: "Temukan kebocoran tersembunyi, perbaiki atau ganti pipa yang rusak, dan tes tekanan saluran." },
    { title: "Pemasangan water heater", provider: 1, cat: "plumbing", price: 450000, unit: "visit" as const, desc: "Pembongkaran unit lama dan pemasangan water heater baru, termasuk sambungan dan pengujian." },
    { title: "Pasang saklar & stop kontak", provider: 2, cat: "electrical", price: 120000, unit: "hour" as const, desc: "Pasang atau ganti saklar, stop kontak, dan dimmer. Termasuk cek keamanan sirkuit." },
    { title: "Inspeksi panel listrik", provider: 2, cat: "electrical", price: 200000, unit: "visit" as const, desc: "Inspeksi panel lengkap: kondisi breaker, keseimbangan beban, pembumian, dan laporan keamanan tertulis." },
    { title: "Bersih total seluruh rumah", provider: 3, cat: "home-cleaning", price: 350000, unit: "visit" as const, desc: "Bersih menyeluruh setiap ruangan: dapur, kamar mandi, lantai, jendela, dan debu. Termasuk peralatan." },
    { title: "Bersih untuk pindahan", provider: 3, cat: "home-cleaning", price: 500000, unit: "visit" as const, desc: "Bersih total properti kosong, siap diserahkan ke pemilik atau penyewa baru. Termasuk dalam kulkas dan lemari." },
    { title: "Perbaikan mesin cuci", provider: 4, cat: "appliance-repair", price: 180000, unit: "visit" as const, desc: "Diagnosis dan perbaikan masalah tabung, pembuangan, dan motor untuk semua merek utama. Biaya spare part dihitung terpisah." },
    { title: "Perbaikan kulkas", provider: 4, cat: "appliance-repair", price: 220000, unit: "visit" as const, desc: "Masalah pendinginan, pembuat es, termostat, dan diagnosis kompresor untuk kulkas dan freezer." },
    { title: "Laundry jemput & antar", provider: 5, cat: "laundry", price: 35000, unit: "visit" as const, desc: "Kami jemput, cuci, keringkan, lipat, dan antar. Sampai 3 tas per kunjungan, selesai hari berikutnya." },
    { title: "Cuci bed cover & seprei", provider: 5, cat: "laundry", price: 60000, unit: "visit" as const, desc: "Cuci profesional untuk bed cover, selimut, dan set seprei, termasuk penanganan noda." },
  ];

  const serviceIds: string[] = [];
  for (const s of svc) {
    const sid = id();
    serviceIds.push(sid);
    await db.insert(schema.services).values({
      id: sid, providerId: providerIds[s.provider], categoryId: catIds[s.cat],
      title: s.title, description: s.desc, price: s.price, priceUnit: s.unit,
    });
  }

  // Customers
  const customers = [
    { name: "Andi Pratama", email: "alice@fixora.test", addr: "Jl. Kemang Raya No. 12, Jakarta Selatan" },
    { name: "Rina Melati", email: "robert@fixora.test", addr: "Jl. Cikini Raya No. 45, Jakarta Pusat" },
  ];
  const customerIds: string[] = [];
  for (const c of customers) {
    const uid = id();
    customerIds.push(uid);
    await db.insert(schema.users).values({
      id: uid, name: c.name, email: c.email,
      passwordHash: await hash("customer1234"), role: "customer", address: c.addr,
    });
  }

  // Bookings (past completed with reviews + upcoming pending)
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const past = (daysAgo: number) => { const d = new Date(today); d.setDate(d.getDate() - daysAgo); return iso(d); };
  const future = (daysAhead: number) => { const d = new Date(today); d.setDate(d.getDate() + daysAhead); return iso(d); };

  const completedBookings = [
    { customer: 0, service: 0, daysAgo: 21, slot: "10:00-12:00", rating: 5, comment: "Mas Budi datang tepat waktu, kerjanya rapi, dan AC jadi dingin lagi. Pesannya juga cepat diproses." },
    { customer: 0, service: 6, daysAgo: 14, slot: "08:00-10:00", rating: 5, comment: "Tim BersihRumah membersihkan seluruh rumah sebelum orang tua saya datang. Tidak ada keluhan." },
    { customer: 1, service: 3, daysAgo: 10, slot: "13:00-15:00", rating: 4, comment: "Water heater terpasang di minggu yang sama. Datangnya agak telat, tapi hasilnya rapi." },
    { customer: 1, service: 9, daysAgo: 6, slot: "15:00-17:00", rating: 5, comment: "Masalah kompresor kulkas beres dan dijelasin dengan detail. Recommended." },
  ];

  for (const b of completedBookings) {
    const svcRow = svc[b.service];
    const providerId = providerIds[svcRow.provider];
    const bid = id();
    await db.insert(schema.bookings).values({
      id: bid, customerId: customerIds[b.customer], providerId,
      serviceId: serviceIds[b.service], scheduledDate: past(b.daysAgo), timeSlot: b.slot,
      status: "completed", address: customers[b.customer].addr, totalPrice: svcRow.price,
    });
    await db.insert(schema.reviews).values({
      id: id(), bookingId: bid, customerId: customerIds[b.customer], providerId,
      rating: b.rating, comment: b.comment,
    });
  }

  await db.insert(schema.bookings).values([
    {
      id: id(), customerId: customerIds[0], providerId: providerIds[1],
      serviceId: serviceIds[2], scheduledDate: future(3), timeSlot: "08:00-10:00",
      status: "pending", address: customers[0].addr,
      notes: "Kitchen sink drains very slowly. Might be a clog deeper in the line.",
      totalPrice: svc[2].price,
    },
    {
      id: id(), customerId: customerIds[1], providerId: providerIds[2],
      serviceId: serviceIds[4], scheduledDate: future(5), timeSlot: "13:00-15:00",
      status: "accepted", address: customers[1].addr,
      notes: "Two rooms need new outlets. Breaker occasionally trips.",
      totalPrice: 120000,
    },
  ]);

  // A conversation between Alice and Sofia
  const convId = id();
  await db.insert(schema.conversations).values({
    id: convId, customerId: customerIds[0], providerId: providerIds[1],
  });
  await db.insert(schema.messages).values([
    { id: id(), conversationId: convId, senderId: customerIds[0], body: "Hi Sofia, I booked a leak detection for Friday morning. The kitchen sink drains slowly, could it be a deeper clog?" },
    { id: id(), conversationId: convId, senderId: providerIds[1], body: "Hi Alice! Yes, slow draining usually means a clog past the trap. I will bring the drain auger on Friday. See you then!" },
  ]);

  await db.insert(schema.notifications).values({
    id: id(), userId: customerIds[0],
    title: "Welcome to FIXORA",
    body: "Browse services and book trusted professionals for your home.",
    link: "/services",
  });

  console.log("Seed complete:");
  console.log("  admin@fixora.test / admin1234");
  console.log("  alice@fixora.test / customer1234 (customer)");
  console.log("  robert@fixora.test / customer1234 (customer)");
  console.log("  marcus@fixora.test / provider1234 (provider, approved)");
  console.log("  ...5 more approved providers (sofia, james, lena, devon, tom)");
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
