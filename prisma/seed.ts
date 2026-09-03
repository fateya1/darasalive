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

const CONTENT_TYPES = [
  'Notes',
  'Exams',
  'Termly Exams',
  'Mocks',
  'Marking Scheme',
  'Lesson Plan',
  'Scheme of Work',
  'CBA Assessment'
];

// Subjects grouped by grade band, then mapped onto each level name below.
// Senior School core (English, Kiswahili, Mathematics, Community Service
// Learning, Physical Education) is combined with pathway-specific electives.
const PRE_PRIMARY_SUBJECTS = [
  'Language Activities',
  'Mathematical Activities',
  'Creative Activities',
  'Environmental Activities',
  'Religious Activities'
];

const LOWER_PRIMARY_SUBJECTS = [
  'Indigenous Language',
  'Kiswahili',
  'English',
  'Mathematics',
  'Religious Education',
  'Environmental Activities',
  'Creative Activities'
];

const UPPER_PRIMARY_SUBJECTS = [
  'English',
  'Mathematics',
  'Kiswahili',
  'Religious Education',
  'Agriculture and Nutrition',
  'Social Studies',
  'Creative Arts',
  'Science and Technology'
];

const JUNIOR_SCHOOL_SUBJECTS = [
  'English',
  'Kiswahili',
  'Mathematics',
  'Integrated Science',
  'Health Education',
  'Pre-Technical and Pre-Career Education',
  'Social Studies',
  'Religious Education',
  'Business Studies',
  'Agriculture and Nutrition',
  'Creative Arts and Sports',
  'Life Skills Education'
];

const SENIOR_SCHOOL_CORE = [
  'English',
  'Kiswahili',
  'Mathematics',
  'Community Service Learning',
  'Physical Education'
];

const SENIOR_STEM_SUBJECTS = [
  ...SENIOR_SCHOOL_CORE,
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Agriculture'
];

const SENIOR_SOCIAL_SCIENCES_SUBJECTS = [
  ...SENIOR_SCHOOL_CORE,
  'History',
  'Geography',
  'Business Studies',
  'Government',
  'Religious Education'
];

const SENIOR_ARTS_SPORTS_SUBJECTS = [
  ...SENIOR_SCHOOL_CORE,
  'Visual Arts',
  'Performing Arts',
  'Sports Science',
  'Music'
];

const F44_PRIMARY_SUBJECTS = [
  'English',
  'Kiswahili',
  'Mathematics',
  'Science',
  'Social Studies',
  'Religious Education',
  'Creative Arts',
  'Physical Education',
  'Life Skills'
];

const F44_SECONDARY_SUBJECTS = [
  'English',
  'Kiswahili',
  'Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
  'History and Government',
  'Geography',
  'Religious Education',
  'Business Studies',
  'Agriculture',
  'Computer Studies'
];

const SUBJECTS_BY_LEVEL: Record<string, string[]> = {
  'Pre-Primary 1': PRE_PRIMARY_SUBJECTS,
  'Pre-Primary 2': PRE_PRIMARY_SUBJECTS,
  'Grade 1': LOWER_PRIMARY_SUBJECTS,
  'Grade 2': LOWER_PRIMARY_SUBJECTS,
  'Grade 3': LOWER_PRIMARY_SUBJECTS,
  'Grade 4': UPPER_PRIMARY_SUBJECTS,
  'Grade 5': UPPER_PRIMARY_SUBJECTS,
  'Grade 6': UPPER_PRIMARY_SUBJECTS,
  'Grade 7': JUNIOR_SCHOOL_SUBJECTS,
  'Grade 8': JUNIOR_SCHOOL_SUBJECTS,
  'Grade 9': JUNIOR_SCHOOL_SUBJECTS,
  'Senior School - STEM': SENIOR_STEM_SUBJECTS,
  'Senior School - Social Sciences': SENIOR_SOCIAL_SCIENCES_SUBJECTS,
  'Senior School - Arts & Sports Science': SENIOR_ARTS_SPORTS_SUBJECTS,
  'Standard 1': F44_PRIMARY_SUBJECTS,
  'Standard 2': F44_PRIMARY_SUBJECTS,
  'Standard 3': F44_PRIMARY_SUBJECTS,
  'Standard 4': F44_PRIMARY_SUBJECTS,
  'Standard 5': F44_PRIMARY_SUBJECTS,
  'Standard 6': F44_PRIMARY_SUBJECTS,
  'Standard 7': F44_PRIMARY_SUBJECTS,
  'Standard 8': F44_PRIMARY_SUBJECTS,
  'Form 1': F44_SECONDARY_SUBJECTS,
  'Form 2': F44_SECONDARY_SUBJECTS,
  'Form 3': F44_SECONDARY_SUBJECTS,
  'Form 4': F44_SECONDARY_SUBJECTS
};

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

  const allLevels = await db.educationLevel.findMany();

  for (const level of allLevels) {
    const subjectNames = SUBJECTS_BY_LEVEL[level.name];
    if (!subjectNames) {
      console.warn(`No subject list defined for level "${level.name}" — skipping.`);
      continue;
    }
    for (const name of subjectNames) {
      await db.subject.upsert({
        where: { educationLevelId_name: { educationLevelId: level.id, name } },
        update: {},
        create: { educationLevelId: level.id, name }
      });
    }
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

  console.log('Seed complete: curricula, levels, subjects, content types, plans.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
