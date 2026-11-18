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
    { name: "AC Repair", slug: "ac-repair", iconName: "air-vent", description: "Air conditioning service and repair" },
    { name: "Plumbing", slug: "plumbing", iconName: "droplets", description: "Leaks, pipes, drains, and fixtures" },
    { name: "Electrical", slug: "electrical", iconName: "zap", description: "Wiring, outlets, and electrical repairs" },
    { name: "Home Cleaning", slug: "home-cleaning", iconName: "sparkles", description: "Deep and routine home cleaning" },
    { name: "Appliance Repair", slug: "appliance-repair", iconName: "washing-machine", description: "Washing machines, fridges, and more" },
    { name: "Laundry", slug: "laundry", iconName: "shirt", description: "Pickup and delivery laundry service" },
  ];
  const catIds: Record<string, string> = {};
  for (const c of cats) {
    const cid = id();
    catIds[c.slug] = cid;
    await db.insert(schema.serviceCategories).values({ id: cid, ...c });
  }

  // Providers
  const providers = [
    { name: "Marcus Reed", email: "marcus@fixora.test", business: "Reed Cooling & Heating", city: "Portland", bio: "Certified HVAC technician with 12 years of experience. Specializing in AC repair, refrigerant recharge, and seasonal maintenance." },
    { name: "Sofia Alvarez", email: "sofia@fixora.test", business: "Alvarez Plumbing Co.", city: "Portland", bio: "Family-run plumbing business. Emergency leaks, pipe replacement, water heaters, and bathroom remodels." },
    { name: "James Okafor", email: "james@fixora.test", business: "Spark Electric LLC", city: "Salem", bio: "Licensed electrician. Panel upgrades, outlet installs, lighting, and safety inspections." },
    { name: "Lena Petrova", email: "lena@fixora.test", business: "PureNest Cleaning", city: "Portland", bio: "Eco-friendly home cleaning team. Deep cleaning, move-in/move-out, and recurring visits." },
    { name: "Devon Park", email: "devon@fixora.test", business: "Park Appliance Fix", city: "Beaverton", bio: "Appliance repair specialist: washers, dryers, refrigerators, dishwashers, and ovens." },
    { name: "Tom Nguyen", email: "tom@fixora.test", business: "FreshFold Laundry", city: "Portland", bio: "Pickup, wash, fold, and delivery. Same-day service available." },
  ];

  const providerIds: string[] = [];
  for (const p of providers) {
    const uid = id();
    providerIds.push(uid);
    await db.insert(schema.users).values({
      id: uid, name: p.name, email: p.email,
      passwordHash: await hash("provider1234"), role: "provider", phone: "+1 555 010 20" + String(providerIds.length).padStart(2, "0"),
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
    { title: "AC deep cleaning & tune-up", provider: 0, cat: "ac-repair", price: 8900, unit: "visit" as const, desc: "Full air-conditioner deep clean: filter, coil, drain flush, refrigerant check, and performance test. Takes about 2 hours." },
    { title: "AC refrigerant recharge", provider: 0, cat: "ac-repair", price: 14500, unit: "visit" as const, desc: "Leak inspection and refrigerant top-up for split and window units. Includes pressure testing." },
    { title: "Leak detection & pipe repair", provider: 1, cat: "plumbing", price: 7500, unit: "visit" as const, desc: "Find hidden leaks, repair or replace damaged pipe sections, and pressure-test the line." },
    { title: "Water heater installation", provider: 1, cat: "plumbing", price: 22000, unit: "visit" as const, desc: "Removal of the old unit and installation of a new tank or tankless water heater, including connections and testing." },
    { title: "Outlet & switch installation", provider: 2, cat: "electrical", price: 5500, unit: "hour" as const, desc: "Install or replace outlets, switches, and dimmers. Includes safety check of the circuit." },
    { title: "Electrical panel inspection", provider: 2, cat: "electrical", price: 9900, unit: "visit" as const, desc: "Full panel inspection: breaker condition, load balance, grounding, and written safety report." },
    { title: "Whole-home deep cleaning", provider: 3, cat: "home-cleaning", price: 15900, unit: "visit" as const, desc: "Top-to-bottom clean of every room: kitchen, bathrooms, floors, windows, and dusting. Supplies included." },
    { title: "Move-in / move-out cleaning", provider: 3, cat: "home-cleaning", price: 19500, unit: "visit" as const, desc: "Empty-property deep clean, ready for handover or new tenants. Inside cabinets and appliances included." },
    { title: "Washing machine repair", provider: 4, cat: "appliance-repair", price: 6900, unit: "visit" as const, desc: "Diagnosis and repair of drum, drain, and motor issues for all major washer brands. Parts quoted separately." },
    { title: "Refrigerator repair", provider: 4, cat: "appliance-repair", price: 7900, unit: "visit" as const, desc: "Cooling problems, ice makers, thermostats, and compressor diagnostics for fridges and freezers." },
    { title: "Laundry pickup & delivery", provider: 5, cat: "laundry", price: 3500, unit: "visit" as const, desc: "We pick up, wash, dry, fold, and deliver. Up to 3 bags per visit, next-day return." },
    { title: "Duvet & bedding cleaning", provider: 5, cat: "laundry", price: 4500, unit: "visit" as const, desc: "Professional washing for duvets, comforters, and bedding sets, including stain treatment." },
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
    { name: "Alice Morgan", email: "alice@fixora.test", addr: "1204 SE Belmont St, Portland" },
    { name: "Robert Kim", email: "robert@fixora.test", addr: "88 NW Couch St, Portland" },
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
    { customer: 0, service: 0, daysAgo: 21, slot: "10:00-12:00", rating: 5, comment: "Marcus was punctual, tidy, and the AC runs like new. Booking took two minutes." },
    { customer: 0, service: 6, daysAgo: 14, slot: "08:00-10:00", rating: 5, comment: "The team deep-cleaned the whole place before my parents visited. Zero complaints." },
    { customer: 1, service: 3, daysAgo: 10, slot: "13:00-15:00", rating: 4, comment: "Water heater installed same week. Slight delay on arrival, but quality work." },
    { customer: 1, service: 9, daysAgo: 6, slot: "15:00-17:00", rating: 5, comment: "Fixed our fridge compressor issue and explained everything clearly." },
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
      totalPrice: 11000,
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
