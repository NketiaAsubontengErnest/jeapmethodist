import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Permission catalogue — see section 12 of the build spec.
 * Grows as later phases (sermons, visitors, prayer requests, etc.) are built.
 */
const PERMISSIONS: Array<{ code: string; module: string; description: string }> = [
  { code: 'member.view', module: 'member', description: 'View member records' },
  { code: 'member.create', module: 'member', description: 'Create member records' },
  { code: 'member.update', module: 'member', description: 'Edit member records' },
  { code: 'member.delete', module: 'member', description: 'Delete member records' },

  { code: 'visitor.view', module: 'visitor', description: 'View visitor records' },
  { code: 'visitor.create', module: 'visitor', description: 'Record new visitors' },
  { code: 'visitor.update', module: 'visitor', description: 'Edit visitor records and follow-up status' },
  { code: 'visitor.delete', module: 'visitor', description: 'Delete visitor records' },

  { code: 'attendance.view', module: 'attendance', description: 'View attendance records' },
  { code: 'attendance.create', module: 'attendance', description: 'Record attendance' },
  { code: 'attendance.update', module: 'attendance', description: 'Edit attendance records' },
  { code: 'attendance.delete', module: 'attendance', description: 'Delete attendance records' },

  { code: 'ministry.view', module: 'ministry', description: 'View ministries and rosters' },
  { code: 'ministry.create', module: 'ministry', description: 'Create ministries' },
  { code: 'ministry.update', module: 'ministry', description: 'Edit ministries and rosters' },
  { code: 'ministry.delete', module: 'ministry', description: 'Delete ministries' },

  { code: 'group.view', module: 'group', description: 'View church groups and rosters' },
  { code: 'group.create', module: 'group', description: 'Create church groups' },
  { code: 'group.update', module: 'group', description: 'Edit church groups and rosters' },
  { code: 'group.delete', module: 'group', description: 'Delete church groups' },

  { code: 'leadership.view', module: 'leadership', description: 'View church leadership' },
  { code: 'leadership.create', module: 'leadership', description: 'Create leadership records' },
  { code: 'leadership.update', module: 'leadership', description: 'Edit leadership records' },
  { code: 'leadership.delete', module: 'leadership', description: 'Delete leadership records' },

  { code: 'finance.view', module: 'finance', description: 'View financial records' },
  { code: 'finance.create', module: 'finance', description: 'Record financial transactions' },
  { code: 'finance.update', module: 'finance', description: 'Edit financial transactions' },
  { code: 'finance.delete', module: 'finance', description: 'Delete financial transactions' },
  { code: 'finance.report', module: 'finance', description: 'Generate financial reports' },

  { code: 'event.view', module: 'event', description: 'View events' },
  { code: 'event.create', module: 'event', description: 'Create events' },
  { code: 'event.update', module: 'event', description: 'Edit events' },
  { code: 'event.delete', module: 'event', description: 'Delete events' },

  { code: 'sermon.view', module: 'sermon', description: 'View sermons (admin list)' },
  { code: 'sermon.create', module: 'sermon', description: 'Add sermons' },
  { code: 'sermon.update', module: 'sermon', description: 'Edit sermons' },
  { code: 'sermon.delete', module: 'sermon', description: 'Delete sermons' },

  { code: 'news.view', module: 'news', description: 'View news articles (admin list)' },
  { code: 'news.create', module: 'news', description: 'Create news articles' },
  { code: 'news.update', module: 'news', description: 'Edit news articles' },
  { code: 'news.delete', module: 'news', description: 'Delete news articles' },

  { code: 'announcement.view', module: 'announcement', description: 'View announcements (admin list)' },
  { code: 'announcement.create', module: 'announcement', description: 'Create announcements' },
  { code: 'announcement.update', module: 'announcement', description: 'Edit announcements' },
  { code: 'announcement.delete', module: 'announcement', description: 'Delete announcements' },

  {
    code: 'prayer-request.view',
    module: 'prayer-request',
    description: 'View private prayer requests submitted by the public',
  },
  {
    code: 'prayer-request.update',
    module: 'prayer-request',
    description: 'Update prayer request status (contacted/prayed for/archived)',
  },

  { code: 'media.view', module: 'media', description: 'View media library' },
  { code: 'media.upload', module: 'media', description: 'Upload media files' },
  { code: 'media.update', module: 'media', description: 'Edit media metadata' },
  { code: 'media.delete', module: 'media', description: 'Delete media files' },

  { code: 'website.publish', module: 'website', description: 'Publish website content' },

  { code: 'user.view', module: 'user', description: 'View system users' },
  { code: 'user.create', module: 'user', description: 'Create system users' },
  { code: 'user.update', module: 'user', description: 'Edit system users' },
  { code: 'user.delete', module: 'user', description: 'Delete system users' },

  { code: 'settings.manage', module: 'settings', description: 'Manage church settings' },
  { code: 'audit.view', module: 'audit', description: 'View audit logs' },
];

/** Role -> permission codes. SUPER_ADMIN implicitly gets every permission. */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: PERMISSIONS.map((p) => p.code),
  MINISTER: [
    'member.view',
    'visitor.view',
    'attendance.view',
    'event.view',
    'ministry.view',
    'group.view',
    'leadership.view',
    'leadership.update',
    'prayer-request.view',
    'prayer-request.update',
    'sermon.view',
    'sermon.create',
    'sermon.update',
    'sermon.delete',
    'news.view',
    'announcement.view',
    'media.view',
    'media.upload',
  ],
  SECRETARY: [
    'member.view',
    'member.create',
    'member.update',
    'visitor.view',
    'visitor.create',
    'visitor.update',
    'attendance.view',
    'attendance.create',
    'attendance.update',
    'event.view',
    'event.create',
    'event.update',
    'ministry.view',
    'ministry.create',
    'ministry.update',
    'group.view',
    'group.create',
    'group.update',
    'leadership.view',
    'leadership.create',
    'leadership.update',
    'announcement.view',
    'announcement.create',
    'announcement.update',
    'media.view',
    'media.upload',
  ],
  TREASURER: ['finance.view', 'finance.create', 'finance.update', 'finance.report'],
  MEDIA_OFFICER: [
    'media.view',
    'media.upload',
    'media.update',
    'media.delete',
    'website.publish',
    'event.view',
    'sermon.view',
    'sermon.create',
    'sermon.update',
    'sermon.delete',
    'news.view',
    'news.create',
    'news.update',
    'news.delete',
    'announcement.view',
    'announcement.create',
    'announcement.update',
    'announcement.delete',
  ],
};

const ROLES = [
  { name: 'SUPER_ADMIN', description: 'Full system access — church administrator', isSystem: true },
  { name: 'MINISTER', description: 'Minister in charge — pastoral oversight', isSystem: true },
  { name: 'SECRETARY', description: 'Society secretary — records officer', isSystem: true },
  { name: 'TREASURER', description: 'Society treasurer — finance officer', isSystem: true },
  { name: 'MEDIA_OFFICER', description: 'Media & communications officer', isSystem: true },
];

/** Fake development-only credentials. Never used in production. */
const DEV_USERS = [
  {
    email: 'admin@samplemethodistsociety.dev',
    firstName: 'Abena',
    lastName: 'Owusu',
    roleName: 'SUPER_ADMIN',
  },
  {
    email: 'minister@samplemethodistsociety.dev',
    firstName: 'Rev. Kwame',
    lastName: 'Asante',
    roleName: 'MINISTER',
  },
  {
    email: 'secretary@samplemethodistsociety.dev',
    firstName: 'Efua',
    lastName: 'Mensah',
    roleName: 'SECRETARY',
  },
  {
    email: 'treasurer@samplemethodistsociety.dev',
    firstName: 'Kojo',
    lastName: 'Boateng',
    roleName: 'TREASURER',
  },
  {
    email: 'media@samplemethodistsociety.dev',
    firstName: 'Adjoa',
    lastName: 'Darko',
    roleName: 'MEDIA_OFFICER',
  },
];

/**
 * Configurable member categories (section 5 of the build spec) — administrators
 * can rename, reorder, deactivate or add to these via the API; this seed only
 * provides sensible starting values.
 */
const MEMBER_CATEGORIES = [
  'Full Member',
  'Probationer',
  'Youth',
  'Young Adult',
  'Children',
  'New Convert',
  'Associate Member',
];

/** Configurable membership statuses — separate from category (see docs/roles-and-permissions.md). */
const MEMBERSHIP_STATUSES: Array<{ name: string; countsAsActive: boolean }> = [
  { name: 'Active', countsAsActive: true },
  { name: 'Inactive', countsAsActive: false },
  { name: 'Transferred Out', countsAsActive: false },
  { name: 'Deceased', countsAsActive: false },
];

/** Configurable attendance programme types (section 7 of the build spec). */
const PROGRAMME_TYPES = [
  'Sunday Worship',
  'Bible Study',
  'Midweek Service',
  'Prayer Meeting',
  'Youth Service',
  "Children's Service",
  'Fellowship',
  'Special Programmes',
];

/** Configurable income categories (section 14 of the build spec). */
const INCOME_CATEGORIES = [
  'Sunday Offering',
  'Tithe',
  'Thanksgiving',
  'Missions',
  'Welfare',
  'Donations',
  'Special Offering',
  'Fundraising',
  'Other Income',
];

/** Configurable expense categories (section 14 of the build spec). */
const EXPENSE_CATEGORIES = [
  'Utilities',
  'Maintenance',
  'Transport',
  'Programmes',
  'Welfare',
  'Media',
  'Administration',
  'Salaries & Allowances',
  'Other Expenses',
];

const DEFAULT_MINISTRIES = [
  { name: "Men's Fellowship", slug: "mens-fellowship", description: "Fellowship and spiritual development for men of the church." },
  { name: "Women's Fellowship", slug: "womens-fellowship", description: "Fellowship, service, and prayer ministry for women." },
  { name: "Youth Fellowship", slug: "youth-fellowship", description: "Ministry dedicated to youth empowerment, Bible study, and activities." },
  { name: "Church Choir", slug: "church-choir", description: "Leading praise and worship during Sunday services and special events." },
  { name: "Media & Tech Ministry", slug: "media-tech-ministry", description: "Managing sound, live streaming, projection, and digital media." },
  { name: "Evangelism & Outreach", slug: "evangelism-outreach", description: "Community outreach, missions, and soul winning." },
  { name: "Prayer Ministry", slug: "prayer-ministry", description: "Intercessory prayer support for the society and members." },
  { name: "Sunday School / Children", slug: "sunday-school", description: "Nurturing children in Christian faith and Methodist doctrine." },
  { name: "Ushering & Protocol", slug: "ushering-protocol", description: "Welcoming worshipers and maintaining order during services." },
  { name: "Welfare Ministry", slug: "welfare-ministry", description: "Caring for needy, sick, and elderly members of the congregation." },
];

const DEFAULT_CHURCH_GROUPS = [
  { name: "Wesleyan Youth", slug: "wesleyan-youth", description: "Young adults fellowship and leadership group." },
  { name: "Singing Band", slug: "singing-band", description: "Traditional Methodist singing group and musical ministry." },
  { name: "Christ's Little Band", slug: "christs-little-band", description: "Spiritual band focused on prayer, discipline, and fellowship." },
  { name: "Girls' Fellowship", slug: "girls-fellowship", description: "Mentorship and fellowship for young girls." },
  { name: "Midweek Bible Study Groups", slug: "midweek-bible-study", description: "Cell groups for home and midweek scripture study." },
];

const DEFAULT_POSITIONS = [
  { title: "Minister in Charge", category: "Clergy", description: "Superintending / Resident Minister of the Society.", displayOrder: 1 },
  { title: "Associate Minister", category: "Clergy", description: "Assisting Minister in pastoral care and word ministry.", displayOrder: 2 },
  { title: "Society Steward", category: "Executive", description: "Senior lay leader representing the society's spiritual and administrative welfare.", displayOrder: 3 },
  { title: "Society Secretary", category: "Executive", description: "Records officer responsible for society documentation, rolls, and minutes.", displayOrder: 4 },
  { title: "Society Treasurer", category: "Executive", description: "Custodian of church financial accounts, income, and expenditure.", displayOrder: 5 },
  { title: "Property Steward", category: "Lay Leadership", description: "Oversees maintenance and protection of church land and infrastructure.", displayOrder: 6 },
  { title: "Chapel Warden", category: "Lay Leadership", description: "Manages chapel readiness, logistics, and order during worship.", displayOrder: 7 },
  { title: "Youth Coordinator", category: "Lay Leadership", description: "Coordinates youth activities, fellowships, and programmes.", displayOrder: 8 },
];

const DEFAULT_SETTINGS = [
  { key: 'church_name', value: 'Methodist Church Ghana' },
  { key: 'society_name', value: 'Trinity Society' },
  { key: 'slogan', value: 'Sure and Steadfast!' },
  { key: 'tagline', value: 'Worshipping God, Serving Humanity, Discipling Nations' },
  { key: 'hero_title', value: 'Welcome to Trinity Methodist Society' },
  { key: 'hero_subtitle', value: 'A vibrant, spirit-filled family worshipping Christ, building lives, and transforming communities in Ghana.' },
  { key: 'address', value: 'Methodist Church Ghana, Cathedral Avenue, Accra / Circuit Headquarters' },
  { key: 'phone', value: '+233 30 200 0000 / +233 24 000 0000' },
  { key: 'email', value: 'info@methodistchurch.org.gh' },
  { key: 'whatsapp', value: '+233 24 000 0000' },
  { key: 'secretariat_hours', value: 'Monday – Friday: 8:00 AM – 5:00 PM' },
  { key: 'sunday_service_1', value: '1st Service (Fante / Vernacular) — 7:00 AM' },
  { key: 'sunday_service_2', value: '2nd Service (English Service) — 9:30 AM' },
  { key: 'midweek_service', value: 'Mid-Week Prayer & Bible Study — Wed 6:00 PM' },
  { key: 'sunday_service_times', value: 'First Service: 7:00 AM — 9:30 AM | Second Service: 9:45 AM — 12:00 PM' },
  { key: 'midweek_service_times', value: 'Wednesday Bible Study: 6:00 PM | Friday Prayer Vigil: 9:00 PM' },
  { key: 'momo_number', value: '024 123 4567 (Trinity Methodist Society)' },
  { key: 'bank_name', value: 'GCB Bank PLC — Accra Main Branch' },
  { key: 'bank_account_number', value: '1011122233344' },
  { key: 'facebook_url', value: 'https://facebook.com' },
  { key: 'youtube_url', value: 'https://youtube.com' },
];

const DEFAULT_SERMONS = [
  {
    title: 'Walking in the Light of Divine Grace',
    slug: 'walking-in-the-light-of-divine-grace',
    speaker: 'Rev. Kwame Asante',
    date: new Date('2026-09-06'),
    scripture: 'Ephesians 2:8-10',
    description: 'An inspiring message on understanding God’s unmerited favor, living by faith, and walking in good works prepared for us.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    audioUrl: '',
    tags: 'Grace, Faith, Salvation',
  },
  {
    title: 'Building a Strong Christian Family',
    slug: 'building-a-strong-christian-family',
    speaker: 'Rev. Kwame Asante',
    date: new Date('2026-08-30'),
    scripture: 'Joshua 24:14-15',
    description: 'Pastoral guidance for husbands, wives, and youth on cultivating unity, prayer, and godly values in Ghanaian homes.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    audioUrl: '',
    tags: 'Family, Unity, Discipleship',
  },
];

const DEFAULT_NEWS = [
  {
    title: '2026 Society Harvest & Thanksgiving Launch',
    slug: '2026-society-harvest-thanksgiving-launch',
    excerpt: 'Join us as we launch our annual harvest celebration under the theme "Abundant Harvest in Christ".',
    content: 'We invite all church members, families, and friends to the grand launch of our 2026 Annual Society Harvest & Thanksgiving service. Special praises, choir ministrations, and fundraising for our new youth hall project will take place.',
    publishedAt: new Date('2026-09-01'),
  },
  {
    title: 'Youth & Young Adult Empowerment Seminar',
    slug: 'youth-young-adult-empowerment-seminar',
    excerpt: 'Wesleyan Youth presents a 2-day career development, entrepreneurship, and leadership conference.',
    content: 'The Wesleyan Youth Fellowship is hosting an empowering seminar featuring guest speakers from tech, business, and ministry. All young adults are encouraged to attend.',
    publishedAt: new Date('2026-08-25'),
  },
];

const DEFAULT_EVENTS = [
  {
    title: 'Annual Society Convention & Revival',
    slug: 'annual-society-convention-revival',
    description: 'Three nights of intensive prayer, prophetic word, healing, and spiritual renewal for the entire church family.',
    startDate: new Date('2026-09-18T18:00:00Z'),
    endDate: new Date('2026-09-20T21:00:00Z'),
    location: 'Main Auditorium, Trinity Society',
    isRegistrationRequired: false,
  },
  {
    title: 'Medical Outreach & Community Health Screening',
    slug: 'medical-outreach-community-health-screening',
    description: 'Free health screening, blood pressure checks, eye exams, and consultation organized by the Health & Welfare Ministry.',
    startDate: new Date('2026-09-26T08:00:00Z'),
    endDate: new Date('2026-09-26T14:00:00Z'),
    location: 'Church Premises',
    isRegistrationRequired: true,
  },
];

const DEV_PASSWORD = 'DevPassword!2026';

async function main() {
  console.log('Seeding permissions...');
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { module: permission.module, description: permission.description },
      create: permission,
    });
  }

  console.log('Seeding roles...');
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, isSystem: role.isSystem },
      create: role,
    });
  }

  console.log('Wiring role -> permission grants...');
  for (const [roleName, permissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    for (const code of permissionCodes) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { code } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log('Seeding member categories...');
  for (const [index, name] of MEMBER_CATEGORIES.entries()) {
    await prisma.memberCategory.upsert({
      where: { name },
      update: { displayOrder: index },
      create: { name, displayOrder: index },
    });
  }

  console.log('Seeding membership statuses...');
  for (const [index, status] of MEMBERSHIP_STATUSES.entries()) {
    await prisma.membershipStatus.upsert({
      where: { name: status.name },
      update: { displayOrder: index, countsAsActive: status.countsAsActive },
      create: { name: status.name, displayOrder: index, countsAsActive: status.countsAsActive },
    });
  }

  console.log('Seeding attendance programme types...');
  for (const [index, name] of PROGRAMME_TYPES.entries()) {
    await prisma.programmeType.upsert({
      where: { name },
      update: { displayOrder: index },
      create: { name, displayOrder: index },
    });
  }

  console.log('Seeding income categories...');
  for (const [index, name] of INCOME_CATEGORIES.entries()) {
    await prisma.incomeCategory.upsert({
      where: { name },
      update: { displayOrder: index },
      create: { name, displayOrder: index },
    });
  }

  console.log('Seeding expense categories...');
  for (const [index, name] of EXPENSE_CATEGORIES.entries()) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: { displayOrder: index },
      create: { name, displayOrder: index },
    });
  }

  console.log('Seeding default funds...');
  const DEFAULT_FUNDS: Array<{ name: string; type: 'GENERAL' | 'RESTRICTED'; description: string }> = [
    { name: 'General Fund', type: 'GENERAL', description: 'Unrestricted day-to-day operating fund' },
    { name: 'Building Fund', type: 'RESTRICTED', description: 'Restricted for building projects and major capital works' },
    { name: 'Missions Fund', type: 'RESTRICTED', description: 'Restricted for missions and outreach programmes' },
  ];
  for (const fund of DEFAULT_FUNDS) {
    await prisma.fund.upsert({
      where: { name: fund.name },
      update: { type: fund.type, description: fund.description },
      create: fund,
    });
  }

  console.log('Seeding default ministries...');
  for (const item of DEFAULT_MINISTRIES) {
    await prisma.ministry.upsert({
      where: { name: item.name },
      update: { description: item.description, slug: item.slug },
      create: item,
    });
  }

  console.log('Seeding default church groups...');
  for (const item of DEFAULT_CHURCH_GROUPS) {
    await prisma.churchGroup.upsert({
      where: { name: item.name },
      update: { description: item.description, slug: item.slug },
      create: item,
    });
  }

  console.log('Seeding default church positions...');
  for (const item of DEFAULT_POSITIONS) {
    await prisma.churchPosition.upsert({
      where: { title: item.title },
      update: { category: item.category, description: item.description, displayOrder: item.displayOrder },
      create: item,
    });
  }

  console.log('Seeding public church settings (CMS)...');
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.churchSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Seeding default sermons...');
  for (const sermon of DEFAULT_SERMONS) {
    await prisma.sermon.upsert({
      where: { slug: sermon.slug },
      update: { title: sermon.title, speaker: sermon.speaker, date: sermon.date, description: sermon.description },
      create: sermon,
    });
  }

  console.log('Seeding default news articles...');
  for (const news of DEFAULT_NEWS) {
    await prisma.newsArticle.upsert({
      where: { slug: news.slug },
      update: { title: news.title, excerpt: news.excerpt, content: news.content },
      create: news,
    });
  }

  console.log('Seeding default events...');
  for (const event of DEFAULT_EVENTS) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: { title: event.title, description: event.description, startDate: event.startDate, location: event.location },
      create: event,
    });
  }

  console.log('Seeding development users (fake credentials, dev only)...');
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);
  for (const user of DEV_USERS) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: user.roleName } });
    const email = user.email.toLowerCase();
    await prisma.user.upsert({
      where: { email },
      update: { firstName: user.firstName, lastName: user.lastName, roleId: role.id },
      create: {
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        passwordHash,
        roleId: role.id,
      },
    });
  }

  console.log('\nSeed complete.');
  console.log('Development login credentials (DO NOT use in production):');
  for (const user of DEV_USERS) {
    console.log(`  ${user.roleName.padEnd(14)} ${user.email}  /  ${DEV_PASSWORD}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
