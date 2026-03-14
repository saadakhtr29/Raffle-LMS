const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@raffle.com' },
    update: {},
    create: {
      email: 'admin2026@raffle.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Seed: Admin user created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
