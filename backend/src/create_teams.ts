import 'dotenv/config';
import prisma from './utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const teams = [
    { username: 'team_a', password: 'passa123' },
    { username: 'team_b', password: 'passb123' },
    { username: 'team_c', password: 'passc123' },
  ];

  for (const t of teams) {
    const exists = await prisma.team.findUnique({ where: { username: t.username } });
    if (!exists) {
      const hash = await bcrypt.hash(t.password, 10);
      await prisma.team.create({ data: { username: t.username, passwordHash: hash } });
      console.log(`Created: ${t.username} / ${t.password}`);
    } else {
      console.log(`Already exists: ${t.username}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
