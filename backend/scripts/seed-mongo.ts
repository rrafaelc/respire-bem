import 'reflect-metadata';
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import SensorData from '../src/interfaces/ISensorData';
import CepData from '../src/interfaces/ICep';

const prisma = new PrismaClient();

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@rafaelcostadev.com';

const MOCK_CEPS = [
  '13970-005',
  '13974-212',
  '13972-272',
  '13972-335',
  '13974-175',
  '13977-135',
  '13975-111',
  '13971-207',
  '13971-141',
  '13973-817',
  '13977-111',
  '13970-080',
  '13973-015',
];

// Static CEP data for Itapira/SP — avoids external ViaCEP calls durante demo
const CEP_DATA: Record<string, { logradouro: string; complemento: string; bairro: string; localidade: string; uf: string }> = {
  '13970-005': { logradouro: 'Rua Antônio Camargo', complemento: '-', bairro: 'Centro', localidade: 'Itapira', uf: 'SP' },
  '13974-212': { logradouro: 'Rua das Acácias', complemento: '-', bairro: 'Jardim Paulista', localidade: 'Itapira', uf: 'SP' },
  '13972-272': { logradouro: 'Rua Barão de Itapira', complemento: '-', bairro: 'Centro', localidade: 'Itapira', uf: 'SP' },
  '13972-335': { logradouro: 'Rua Floriano Peixoto', complemento: '-', bairro: 'Centro', localidade: 'Itapira', uf: 'SP' },
  '13974-175': { logradouro: 'Rua dos Pinheiros', complemento: '-', bairro: 'Jardim Novo', localidade: 'Itapira', uf: 'SP' },
  '13977-135': { logradouro: 'Rua Sete de Setembro', complemento: '-', bairro: 'Vila Nova', localidade: 'Itapira', uf: 'SP' },
  '13975-111': { logradouro: 'Rua das Palmeiras', complemento: '-', bairro: 'Jardim América', localidade: 'Itapira', uf: 'SP' },
  '13971-207': { logradouro: 'Avenida Doutor Altino Arantes', complemento: '-', bairro: 'Centro', localidade: 'Itapira', uf: 'SP' },
  '13971-141': { logradouro: 'Rua Major Prado', complemento: '-', bairro: 'Centro', localidade: 'Itapira', uf: 'SP' },
  '13973-817': { logradouro: 'Rua Benedito Neto', complemento: '-', bairro: 'Jardim Bela Vista', localidade: 'Itapira', uf: 'SP' },
  '13977-111': { logradouro: 'Rua Ipiranga', complemento: '-', bairro: 'Vila Nova', localidade: 'Itapira', uf: 'SP' },
  '13970-080': { logradouro: 'Rua XV de Novembro', complemento: '-', bairro: 'Centro', localidade: 'Itapira', uf: 'SP' },
  '13973-015': { logradouro: 'Rua Independência', complemento: '-', bairro: 'Jardim Bela Vista', localidade: 'Itapira', uf: 'SP' },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI not set');

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');

  const count = await SensorData.countDocuments();
  if (count > 0) {
    console.log(`SensorData already has ${count} documents — skipping mongo seed`);
    return;
  }

  // Seed CepData
  const cepCount = await CepData.countDocuments();
  if (cepCount === 0) {
    const cepDocs = MOCK_CEPS.map((cep) => ({
      cep,
      ...(CEP_DATA[cep] ?? {
        logradouro: 'Rua Desconhecida',
        complemento: '-',
        bairro: 'Centro',
        localidade: 'Itapira',
        uf: 'SP',
      }),
    }));
    await CepData.insertMany(cepDocs);
    console.log(`CepData seeded: ${cepDocs.length} CEPs`);
  }

  // Busca os sensores do user demo via Prisma
  const demoSensors = await prisma.sensor.findMany({
    where: { user: { email: DEMO_EMAIL }, isActive: true },
  });

  if (demoSensors.length === 0) {
    console.log('No demo sensors found in Postgres — run postgres seed first');
    return;
  }

  const now = Date.now();
  const RECORDS_PER_SENSOR = 50;
  const INTERVAL_MS = 30 * 60 * 1000; // 30 minutos

  const sensorDataDocs: Array<{ sensor_id: string; level: number; cep: string; createdAt: Date; updatedAt: Date }> = [];

  for (const sensor of demoSensors) {
    for (let i = 0; i < RECORDS_PER_SENSOR; i++) {
      const createdAt = new Date(now - i * INTERVAL_MS);
      sensorDataDocs.push({
        sensor_id: sensor.id,
        level: randomInt(100, 900),
        cep: MOCK_CEPS[randomInt(0, MOCK_CEPS.length - 1)],
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  await SensorData.insertMany(sensorDataDocs);
  console.log(`SensorData seeded: ${sensorDataDocs.length} records (${RECORDS_PER_SENSOR} per sensor, ${demoSensors.length} sensors)`);
}

main()
  .catch((e) => {
    console.error('Mongo seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    await prisma.$disconnect();
  });
