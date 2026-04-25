import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@rafaelcostadev.com';
const DEMO_PASSWORD = 'demo123';
const SALT_ROUNDS = 10;

const DEMO_SENSORS = [
  { name: 'Sensor Centro', model: 'MQ-135' },
  { name: 'Sensor Bairro A', model: 'MQ-135' },
  { name: 'Sensor Bairro B', model: 'MQ-135' },
  { name: 'Sensor Zona Rural', model: 'MQ-135' },
];

async function main() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      name: 'Demo',
      email: DEMO_EMAIL,
      password: hashedPassword,
      isActive: true,
    },
  });

  console.log(`Demo user ready: ${demoUser.email}`);

  for (const sensorData of DEMO_SENSORS) {
    const existing = await prisma.sensor.findFirst({
      where: { name: sensorData.name, userId: demoUser.id },
    });

    if (!existing) {
      const sensor = await prisma.sensor.create({
        data: {
          name: sensorData.name,
          model: sensorData.model,
          userId: demoUser.id,
          isActive: true,
        },
      });
      console.log(`Sensor created: ${sensor.name} (${sensor.id})`);
    } else {
      console.log(`Sensor already exists: ${existing.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
