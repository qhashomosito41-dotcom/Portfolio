import dotenv from 'dotenv';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

const skills = [
  { name: 'JavaScript', category: 'Programming Languages' },
  { name: 'TypeScript', category: 'Programming Languages' },
  { name: 'Java', category: 'Programming Languages' },
  { name: 'C++', category: 'Programming Languages' },
  { name: 'C#', category: 'Programming Languages' },
  { name: 'HTML', category: 'Web Development' },
  { name: 'CSS', category: 'Web Development' },
  { name: 'React', category: 'Web Development' },
  { name: 'Node.js', category: 'Web Development' },
  { name: 'Express.js', category: 'Web Development' },
  { name: 'PHP', category: 'Web Development' },
  { name: 'WordPress', category: 'Web Development' },
  { name: 'MySQL', category: 'Databases' },
  { name: 'Oracle Database', category: 'Databases' },
  { name: 'SQL', category: 'Databases' },
  { name: 'Git', category: 'Tools & Platforms' },
  { name: 'Bitbucket', category: 'Tools & Platforms' },
  { name: 'GitHub', category: 'Tools & Platforms' },
  { name: 'XAMPP', category: 'Tools & Platforms' },
  { name: 'WebStorm', category: 'Tools & Platforms' },
  { name: 'VS Code', category: 'Tools & Platforms' },
  { name: 'Responsive Web Design', category: 'Additional Areas' },
  { name: 'Search Engine Optimization (SEO)', category: 'Additional Areas' },
  { name: 'Website Performance Optimization', category: 'Additional Areas' },
  { name: 'Accessibility', category: 'Additional Areas' },
  { name: 'Debugging & Troubleshooting', category: 'Additional Areas' },
  { name: 'Database Design', category: 'Additional Areas' },
  { name: 'REST APIs', category: 'Additional Areas' },
  { name: 'AI-Assisted Development', category: 'Additional Areas' },
];

const certifications = [
  'Claude Code',
  'Generative AI for Software Development',
  'Red Teaming LLM Applications',
  'ChatGPT Prompt Engineering',
  'AI Prompting for Everyone',
  'Spec-Driven Development with Coding Agents',
];

const projects = [
  {
    title: '[Draft] Portfolio Website with Content Management',
    slug: 'draft-portfolio-website-with-content-management',
    shortDescription:
      'Draft record for a personal portfolio website with a secure content management dashboard. Replace this text with verified project details.',
    fullDescription:
      'This is a draft portfolio record. It describes a planned or in-progress personal website with a public portfolio, a secure administrator dashboard, and database-driven content. Replace this description with verified information about the actual project before publishing it.',
    category: 'Web Applications',
    projectStatus: 'In Progress',
    technologies: JSON.stringify([
      'React',
      'TypeScript',
      'Node.js',
      'Express.js',
      'MySQL',
      'Prisma',
    ]),
    sortOrder: 1,
  },
  {
    title: '[Draft] Student Records Database',
    slug: 'draft-student-records-database',
    shortDescription:
      'Draft record for an academic database design project. Replace this text with verified project details.',
    fullDescription:
      'This is a draft academic project record for a relational database system. Add the verified problem statement, schema design, implementation details, and outcomes before publishing it.',
    category: 'Database Systems',
    projectStatus: 'Planned',
    technologies: JSON.stringify(['MySQL', 'SQL', 'Database Design']),
    sortOrder: 2,
  },
  {
    title: '[Draft] E-commerce Storefront',
    slug: 'draft-ecommerce-storefront',
    shortDescription:
      'Draft record for an e-commerce website project. Replace this text with verified project details.',
    fullDescription:
      'This is a draft e-commerce project record. Add verified details about the storefront, catalogue, content management, SEO work, and any measurable outcomes before publishing it.',
    category: 'E-commerce',
    projectStatus: 'Planned',
    technologies: JSON.stringify(['WordPress', 'PHP', 'MySQL', 'SEO']),
    sortOrder: 3,
  },
];

const main = async () => {
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      fullName: 'Mosito Qhasho',
      professionalTitle: 'Computing Student | Software Developer | Web Development & SEO',
      headline: 'I build practical software and modern web experiences.',
      heroIntro:
        'I am a Computing student passionate about building practical, user-friendly software solutions and modern web experiences. I enjoy solving problems, learning new technologies, and developing applications that combine functionality, performance, and good design.',
      heroTechSummary: JSON.stringify(['TypeScript', 'React', 'Node.js', 'MySQL', 'SEO']),
      biography:
        'Mosito Qhasho is a Computing student at Botho University in Lesotho, with an interest in software development, web technologies, database systems, and building practical digital solutions.\n\nHe is particularly interested in web development, database systems, REST APIs, responsive design, and search engine optimization, and enjoys turning requirements into reliable, user-friendly applications.',
      academicBackground:
        'Bachelor of Science Honours in Computing at Botho University, Lesotho. Currently in the third year of study.',
      approach:
        'I approach problems by clarifying requirements, breaking work into small verifiable steps, and testing as I build. I value readable code, sound database design, and interfaces that work well for real users.',
      careerObjectives:
        'To grow as a software developer by contributing to well-engineered web and software projects, strengthening my full-stack and database skills, and delivering work that is reliable, accessible, and useful.',
      professionalInterests: JSON.stringify([
        'Full-stack web development',
        'Database design and SQL',
        'REST API development',
        'Responsive and accessible interfaces',
        'Search engine optimization',
        'Website performance',
        'AI-assisted software development',
      ]),
      location: 'Lesotho',
      contactEmail: null,
      profileImagePath: null,
      websiteTitle: 'Mosito | Web Design, Development & SEO',
      websiteDescription:
        'Portfolio of Mosito Qhasho, a Computing student and software developer in Lesotho interested in web development, databases, responsive design, and SEO.',
    },
  });

  for (const [index, skill] of skills.entries()) {
    await prisma.skill.upsert({
      where: { name_category: { name: skill.name, category: skill.category } },
      update: {},
      create: {
        name: skill.name,
        category: skill.category,
        sortOrder: index + 1,
        visible: true,
      },
    });
  }

  const experienceExists = await prisma.experience.findFirst({
    where: { organization: 'Goopter Commerce Solutions' },
  });
  if (!experienceExists) {
    await prisma.experience.create({
      data: {
        organization: 'Goopter Commerce Solutions',
        position: 'Intern',
        type: 'Internship',
        location: null,
        startDate: date('2026-07-11'),
        endDate: date('2026-10-02'),
        isCurrent: false,
        responsibilities: JSON.stringify([
          'Website development and maintenance',
          'WordPress theme development and troubleshooting',
          'Responsive design and SEO improvements',
          'Website performance optimization',
          'Quality assurance, debugging, and testing forms and website functionality',
          'Multilingual content consistency',
          'Git and Bitbucket workflows',
        ]),
        achievements: JSON.stringify([]),
        technologies: JSON.stringify([
          'WordPress',
          'HTML',
          'CSS',
          'JavaScript',
          'SEO',
          'Git',
          'Bitbucket',
        ]),
        evidenceUrl: null,
        published: true,
        sortOrder: 1,
      },
    });
  }

  const educationExists = await prisma.education.findFirst({
    where: { institution: 'Botho University' },
  });
  if (!educationExists) {
    await prisma.education.create({
      data: {
        institution: 'Botho University',
        qualification: 'Bachelor of Science Honours in Computing',
        fieldOfStudy: 'Computing',
        location: 'Lesotho',
        startDate: null,
        endDate: null,
        isCurrent: true,
        description:
          'Currently in the third year of the Bachelor of Science Honours in Computing programme at Botho University, Lesotho.',
        modules: JSON.stringify([]),
        achievements: JSON.stringify([]),
        published: true,
        sortOrder: 1,
      },
    });
  }

  for (const [index, title] of certifications.entries()) {
    const exists = await prisma.certification.findFirst({ where: { title } });
    if (!exists) {
      await prisma.certification.create({
        data: {
          title,
          provider: 'To be confirmed',
          completionDate: null,
          description:
            'Draft course record. Verify the provider, completion date, and certificate details before publishing.',
          published: false,
          sortOrder: index + 1,
        },
      });
    }
  }

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: {
        ...project,
        published: false,
        featured: false,
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: 'footerTagline' },
    update: {},
    create: {
      key: 'footerTagline',
      value:
        'Computing student and software developer building practical, user-friendly digital products.',
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'contactNotificationEmail' },
    update: {},
    create: { key: 'contactNotificationEmail', value: '' },
  });

  const counts = {
    skills: await prisma.skill.count(),
    projects: await prisma.project.count(),
    experience: await prisma.experience.count(),
    education: await prisma.education.count(),
    certifications: await prisma.certification.count(),
  };

  console.log('Seed completed. Current records:', counts);
  console.log('Draft projects and certifications are not published until you review them.');
};

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
