import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const CBC_LEVELS = [
  'Pre-Primary 1',
  'Pre-Primary 2',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Senior School - STEM',
  'Senior School - Social Sciences',
  'Senior School - Arts & Sports Science'
];

const FORM44_LEVELS = [
  'Standard 1',
  'Standard 2',
  'Standard 3',
  'Standard 4',
  'Standard 5',
  'Standard 6',
  'Standard 7',
  'Standard 8',
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4'
];

const CONTENT_TYPES = ['Notes', 'Exams', 'Marking Scheme', 'Lesson Plan', 'Scheme of Work'];

const PLANS = [
  { name: 'Monthly', durationMonths: 1, priceKes: 300 },
  { name: 'Semi-annual', durationMonths: 6, priceKes: 400 },
  { name: 'Annual', durationMonths: 12, priceKes: 700 }
];

async function main() {
  const cbc = await db.curriculum.upsert({
    where: { name: 'CBC' },
    update: {},
    create: { name: 'CBC' }
  });

  const f44 = await db.curriculum.upsert({
    where: { name: '8-4-4' },
    update: {},
    create: { name: '8-4-4' }
  });

  for (const [i, name] of CBC_LEVELS.entries()) {
    await db.educationLevel.upsert({
      where: { curriculumId_name: { curriculumId: cbc.id, name } },
      update: {},
      create: { curriculumId: cbc.id, name, order: i }
    });
  }

  for (const [i, name] of FORM44_LEVELS.entries()) {
    await db.educationLevel.upsert({
      where: { curriculumId_name: { curriculumId: f44.id, name } },
      update: {},
      create: { curriculumId: f44.id, name, order: i }
    });
  }

  for (const name of CONTENT_TYPES) {
    await db.contentType.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const plan of PLANS) {
    await db.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan
    });
  }

  console.log('Seed complete: curricula, levels, content types, plans.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
