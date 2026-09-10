const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://church_admin:church_dev_password@localhost:5433/church_management?schema=public' } },
  });

  const where = {
    NOT: [
      { category: 'identity' },
      { title: { in: ['logo_url', 'favicon_url'] } },
    ],
  };

  const items = await prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, take: 10 });
  console.log('count:', items.length);
  console.log(items.map((i) => ({ id: i.id, title: i.title, type: i.type, category: i.category })));

  const total = await prisma.media.count({ where });
  console.log('total via count():', total);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
