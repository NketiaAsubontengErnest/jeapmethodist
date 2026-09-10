const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://church_admin:church_dev_password@localhost:5433/church_management?schema=public' } },
  });

  console.log('--- no where at all ---');
  console.log('total:', await prisma.media.count());

  console.log('--- NOT as single object ---');
  console.log('total:', await prisma.media.count({
    where: { NOT: { category: 'identity' } },
  }));

  console.log('--- NOT as array with 1 item ---');
  console.log('total:', await prisma.media.count({
    where: { NOT: [{ category: 'identity' }] },
  }));

  console.log('--- NOT as array with 2 items (the actual code) ---');
  console.log('total:', await prisma.media.count({
    where: { NOT: [{ category: 'identity' }, { title: { in: ['logo_url', 'favicon_url'] } }] },
  }));

  console.log('--- raw rows for inspection ---');
  const all = await prisma.media.findMany({ select: { id: true, title: true, category: true } });
  console.log(all);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
