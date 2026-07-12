import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const LB = '/images/lookbook/';

const CATEGORIES = [
  {
    slug: 'kalamkari',
    name: 'Kalamkari & Warli Print',
    desc: 'Hand-painted narrative art and tribal Warli motifs on breathable cotton silk.',
    accent: '#5c2a1e',
    images: [`${LB}IMG-20260705-WA0037.jpg`],
  },
  {
    slug: 'bandhani',
    name: 'Bandhani Border',
    desc: 'Traditional tie-dye bandhani accents paired with tribal woven borders.',
    accent: '#7a1626',
    images: [`${LB}IMG-20260705-WA0036.jpg`],
  },
  {
    slug: 'printed',
    name: 'Woven Stripe Cotton',
    desc: 'Everyday handloom cotton in banded stripes and earthy tones.',
    accent: '#7a3a52',
    images: [`${LB}IMG-20260705-WA0029.jpg`],
  },
];

const PRODUCTS = [
  { name: 'Maroon Warli Tribal Weave', category: 'kalamkari', price: 1899, oldPrice: null, rating: 4.6, reviews: 18, badge: 'Bestseller',
    colors: [{ name: 'Maroon', hex: '#7a1626' }], images: [`${LB}IMG-20260705-WA0027.jpg`],
    desc: 'Hand-block Warli tribal art printed on soft cotton silk, finished with a contrast black-gold border. Comes with a matching unstitched blouse piece.' },
  { name: 'Charcoal Warli Tribal Weave', category: 'kalamkari', price: 1899, oldPrice: null, rating: 4.5, reviews: 12, badge: null,
    colors: [{ name: 'Charcoal', hex: '#2b2622' }], images: [`${LB}IMG-20260705-WA0026.jpg`],
    desc: 'Same hand-block Warli weave as our Maroon edit, cast in a deep charcoal ground with a red-and-gold border.' },
  { name: 'Maroon Deer & Grove', category: 'kalamkari', price: 2199, oldPrice: null, rating: 4.7, reviews: 9, badge: 'New',
    colors: [{ name: 'Maroon', hex: '#7a1626' }], images: [`${LB}IMG-20260705-WA0031.jpg`],
    desc: 'A forest-and-deer motif border on rich maroon silk cotton, edged with a gold zari line.' },
  { name: 'Charcoal Deer & Grove', category: 'kalamkari', price: 2199, oldPrice: null, rating: 4.6, reviews: 7, badge: null,
    colors: [{ name: 'Charcoal', hex: '#2b2622' }], images: [`${LB}IMG-20260705-WA0032.jpg`],
    desc: 'The Deer & Grove story cast in inky charcoal — the same hand-drawn forest border, a moodier ground.' },
  { name: 'Mustard Deer & Grove', category: 'kalamkari', price: 2199, oldPrice: null, rating: 4.8, reviews: 14, badge: 'New',
    colors: [{ name: 'Mustard', hex: '#a3861f' }], images: [`${LB}IMG-20260705-WA0033.jpg`],
    desc: 'A warm mustard-gold colourway of our Deer & Grove weave — a festive pick that photographs beautifully.' },
  { name: 'Teal Elephant Procession', category: 'kalamkari', price: 2399, oldPrice: null, rating: 4.7, reviews: 11, badge: 'Bestseller',
    colors: [{ name: 'Teal', hex: '#1e6b63' }], images: [`${LB}IMG-20260705-WA0030.jpg`],
    desc: 'A Kalamkari elephant procession printed on deep teal, framed by a dense maroon and gold pallu border.' },
  { name: 'Midnight Temple Story', category: 'kalamkari', price: 2599, oldPrice: null, rating: 4.9, reviews: 21, badge: 'Bestseller',
    colors: [{ name: 'Black', hex: '#17140f' }, { name: 'Red', hex: '#a3283a' }], images: [`${LB}IMG-20260705-WA0037.jpg`],
    desc: 'A hand-painted temple courtyard scene unfolds across the pallu — Kalamkari storytelling at its most detailed.' },
  { name: 'Noir Constellation', category: 'kalamkari', price: 2299, oldPrice: null, rating: 4.6, reviews: 16, badge: null,
    colors: [{ name: 'Black', hex: '#17140f' }], images: [`${LB}IMG-20260705-WA0038.jpg`],
    desc: 'Star-motif silk cotton in deep black, bordered by a maroon temple pallu with hand-painted figures.' },
  { name: 'Maroon Bandhani Border', category: 'bandhani', price: 1799, oldPrice: null, rating: 4.5, reviews: 10, badge: null,
    colors: [{ name: 'Maroon', hex: '#7a1626' }], images: [`${LB}IMG-20260705-WA0036.jpg`],
    desc: 'A tribal-woven maroon body meets a traditional bandhani tie-dye pallu corner — two crafts, one drape.' },
  { name: 'Noir Bandhani Border', category: 'bandhani', price: 1799, oldPrice: null, rating: 4.4, reviews: 8, badge: null,
    colors: [{ name: 'Black', hex: '#17140f' }], images: [`${LB}IMG-20260705-WA0034.jpg`],
    desc: 'Black ground, dense tribal border work, and a red bandhani corner on the pallu.' },
  { name: 'Mehendi & Plum Border', category: 'bandhani', price: 1799, oldPrice: null, rating: 4.7, reviews: 13, badge: 'New',
    colors: [{ name: 'Mehendi Green', hex: '#6f7a2e' }], images: [`${LB}IMG-20260705-WA0035.jpg`],
    desc: 'A mehendi-green body with a deep plum tribal-print pallu — an unusual, striking colour pairing.' },
  { name: 'Multi-Stripe Handloom Cotton', category: 'printed', price: 1499, oldPrice: null, rating: 4.3, reviews: 6, badge: null,
    colors: [{ name: 'Multicolour', hex: '#7a3a52' }], images: [`${LB}IMG-20260705-WA0029.jpg`],
    desc: 'A banded stripe weave in five earth tones with a zari-edged pallu — easy, breathable, everyday cotton.' },
];

async function main() {
  console.log('Upserting real categories...');
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, desc: c.desc, accent: c.accent, images: JSON.stringify(c.images) },
      create: { slug: c.slug, name: c.name, desc: c.desc, accent: c.accent, images: JSON.stringify(c.images) },
    });
  }

  console.log('Seeding real stock products...');
  for (const p of PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { name: p.name, category: p.category } });
    const data = {
      name: p.name,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice,
      rating: p.rating,
      reviews: p.reviews,
      badge: p.badge,
      colors: JSON.stringify(p.colors),
      images: JSON.stringify(p.images),
      desc: p.desc,
      active: true,
    };
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
    } else {
      await prisma.product.create({ data });
    }
  }

  console.log('Deactivating any stale stock-photo products...');
  const active = await prisma.product.findMany({ where: { active: true } });
  const stale = active.filter((p) => !p.images.includes('/images/lookbook/'));
  if (stale.length) {
    await prisma.product.updateMany({ where: { id: { in: stale.map((p) => p.id) } }, data: { active: false } });
  }

  // Bootstrap the first Owner (Admin). They sign in with Google using this email.
  // If ADMIN_PASSWORD is set, they can also log in with email + password.
  const ownerEmail = (process.env.OWNER_EMAIL || 'kailashenterprises99000@gmail.com').toLowerCase();
  const ownerPassword = process.env.ADMIN_PASSWORD || '';
  console.log(`Ensuring Owner account "${ownerEmail}"...`);
  const passwordHash = ownerPassword ? await bcrypt.hash(ownerPassword, 10) : null;
  await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { role: 'admin', active: true, ...(passwordHash ? { passwordHash } : {}) },
    create: { email: ownerEmail, name: 'Owner', role: 'admin', active: true, provider: 'password', passwordHash },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
