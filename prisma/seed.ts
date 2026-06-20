import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertSkills(names: string[]) {
  const records = await Promise.all(
    names.map((name) => prisma.skill.upsert({ where: { name }, update: {}, create: { name } }))
  );
  return Object.fromEntries(records.map((r) => [r.name, r]));
}

async function main() {
  console.log("Seeding Atlas demo data…");

  const password = await bcrypt.hash("password123", 10);

  // ── Skills ────────────────────────────────────────────────────────
  const skillNames = [
    "JavaScript", "TypeScript", "React", "Node.js", "SQL", "Python",
    "Data Analysis", "Product Design", "Figma", "Project Management",
    "Communication", "Leadership", "AWS", "Docker", "Marketing", "SEO",
    "Content Strategy", "User Research",
  ];
  const skills = await upsertSkills(skillNames);

  // ── Users ─────────────────────────────────────────────────────────
  const userDefs = [
    { key: "alex", name: "Alex Rivera", email: "alex@atlas.dev", role: "MEMBER", headline: "Product Designer at Northwind Labs", currentRole: "Product Designer", currentCompany: "Northwind Labs", location: "San Francisco, CA", about: "Designing useful, honest software for eight years. Previously at two early-stage startups.", skillNames: ["Product Design", "Figma", "User Research", "Communication"] },
    { key: "priya", name: "Priya Nair", email: "priya@atlas.dev", role: "MEMBER", headline: "Data Analyst, open to new roles", currentRole: "Data Analyst", currentCompany: "Self-employed", location: "Austin, TX", about: "I turn messy spreadsheets into decisions. SQL, Python, and a healthy distrust of vanity metrics.", skillNames: ["SQL", "Data Analysis", "Python"] },
    { key: "jordan", name: "Jordan Kim", email: "jordan@atlas.dev", role: "RECRUITER", headline: "Talent Lead at Northwind Labs", currentRole: "Talent Lead", currentCompany: "Northwind Labs", location: "San Francisco, CA", about: "Hiring across product and engineering at Northwind Labs.", skillNames: ["Leadership", "Communication"] },
    { key: "sam", name: "Sam Okafor", email: "sam@atlas.dev", role: "PROVIDER", headline: "Data instructor, ex-Bluepeak Analytics", currentRole: "Instructor", currentCompany: "Independent", location: "Remote", about: "I build practical data courses for people switching careers into analytics.", skillNames: ["SQL", "Data Analysis", "Python"] },
    { key: "maria", name: "Maria Gonzalez", email: "maria@atlas.dev", role: "MEMBER", headline: "Frontend Engineer", currentRole: "Frontend Engineer", currentCompany: "Lighthouse Software", location: "New York, NY", about: "React all day. Occasionally argue about CSS.", skillNames: ["React", "JavaScript", "TypeScript"] },
    { key: "liam", name: "Liam Chen", email: "liam@atlas.dev", role: "MEMBER", headline: "Backend Engineer, Node & AWS", currentRole: "Backend Engineer", currentCompany: "Lighthouse Software", location: "Seattle, WA", about: "Building reliable APIs since 2017.", skillNames: ["Node.js", "AWS", "Docker"] },
    { key: "nina", name: "Nina Petrova", email: "nina@atlas.dev", role: "RECRUITER", headline: "Head of People at Bluepeak Analytics", currentRole: "Head of People", currentCompany: "Bluepeak Analytics", location: "Austin, TX", about: "Building the analytics team at Bluepeak.", skillNames: ["Leadership", "Communication"] },
    { key: "omar", name: "Omar Haddad", email: "omar@atlas.dev", role: "MEMBER", headline: "Marketing Manager", currentRole: "Marketing Manager", currentCompany: "Bluepeak Analytics", location: "Chicago, IL", about: "Growth marketing, mostly B2B SaaS.", skillNames: ["Marketing", "SEO", "Content Strategy"] },
    { key: "ava", name: "Ava Thompson", email: "ava@atlas.dev", role: "PROVIDER", headline: "Founder, Skillforge Academy", currentRole: "Founder", currentCompany: "Skillforge Academy", location: "Remote", about: "Teaching product and growth skills to career switchers.", skillNames: ["Product Design", "Marketing"] },
    { key: "noah", name: "Noah Park", email: "noah@atlas.dev", role: "MEMBER", headline: "Junior Developer, learning fast", currentRole: "Junior Developer", currentCompany: "Freelance", location: "Boston, MA", about: "Bootcamp grad, six months into my first dev role.", skillNames: ["JavaScript", "React"] },
  ] as const;

  const users: Record<string, any> = {};
  for (const def of userDefs) {
    const user = await prisma.user.upsert({
      where: { email: def.email },
      update: {},
      create: {
        name: def.name,
        email: def.email,
        password,
        role: def.role,
        headline: def.headline,
        about: def.about,
        location: def.location,
        currentRole: def.currentRole,
        currentCompany: def.currentCompany,
        emailVerified: new Date(),
        notificationPrefs: { create: {} },
        skills: { create: def.skillNames.map((n) => ({ skillId: skills[n].id, endorsements: Math.floor(Math.random() * 6) })) },
      },
    });
    users[def.key] = user;
  }

  // Experience + education for a couple of profiles to show off the timeline
  await prisma.experience.createMany({
    data: [
      { userId: users.alex.id, title: "Product Designer", company: "Northwind Labs", location: "San Francisco, CA", startDate: new Date("2022-03-01"), current: true, description: "Leading design for the core scheduling product." },
      { userId: users.alex.id, title: "UX Designer", company: "Fernbridge", location: "Oakland, CA", startDate: new Date("2019-06-01"), endDate: new Date("2022-02-15"), description: "Owned onboarding and growth surfaces." },
      { userId: users.priya.id, title: "Freelance Data Analyst", company: "Self-employed", startDate: new Date("2023-01-01"), current: true },
      { userId: users.priya.id, title: "Reporting Analyst", company: "Meridian Retail", location: "Austin, TX", startDate: new Date("2020-08-01"), endDate: new Date("2022-12-01") },
    ],
    skipDuplicates: true,
  });

  await prisma.education.createMany({
    data: [
      { userId: users.alex.id, school: "California College of the Arts", degree: "BFA", field: "Interaction Design", startDate: new Date("2015-09-01"), endDate: new Date("2019-05-01") },
      { userId: users.priya.id, school: "University of Texas at Austin", degree: "BS", field: "Statistics", startDate: new Date("2016-09-01"), endDate: new Date("2020-05-01") },
      { userId: users.noah.id, school: "Galvanize Coding Bootcamp", degree: "Certificate", field: "Full-Stack Web Development", startDate: new Date("2024-01-01"), endDate: new Date("2024-06-01") },
    ],
    skipDuplicates: true,
  });

  // ── Companies ─────────────────────────────────────────────────────
  const northwind = await prisma.company.upsert({
    where: { slug: "northwind-labs" },
    update: {},
    create: {
      name: "Northwind Labs", slug: "northwind-labs", industry: "Software", size: "51-200",
      about: "We build scheduling software for healthcare teams.", website: "https://northwindlabs.example.com",
      members: { create: { userId: users.jordan.id, role: "ADMIN" } },
    },
  });
  const bluepeak = await prisma.company.upsert({
    where: { slug: "bluepeak-analytics" },
    update: {},
    create: {
      name: "Bluepeak Analytics", slug: "bluepeak-analytics", industry: "Data & Analytics", size: "11-50",
      about: "Analytics-as-a-service for mid-market retailers.", website: "https://bluepeak.example.com",
      members: { create: { userId: users.nina.id, role: "ADMIN" } },
    },
  });

  // ── Jobs ──────────────────────────────────────────────────────────
  async function createJob(opts: {
    companyId: string; postedById: string; title: string; description: string; requirements: string;
    location: string; workType: string; experienceLevel: string; salaryMin: number; salaryMax: number;
    remote: boolean; skillNames: string[];
  }) {
    return prisma.job.create({
      data: {
        companyId: opts.companyId, postedById: opts.postedById, title: opts.title, description: opts.description,
        requirements: opts.requirements, location: opts.location, workType: opts.workType,
        experienceLevel: opts.experienceLevel, salaryMin: opts.salaryMin, salaryMax: opts.salaryMax,
        remote: opts.remote, skills: { create: opts.skillNames.map((n) => ({ skillId: skills[n].id })) },
      },
    });
  }

  const frontendJob = await createJob({
    companyId: northwind.id, postedById: users.jordan.id, title: "Senior Frontend Engineer",
    description: "Own the architecture of our React + TypeScript scheduling app. Work closely with design to ship fast without breaking things.",
    requirements: "5+ years with React in production. Comfortable owning a feature end to end.",
    location: "San Francisco, CA", workType: "FULL_TIME", experienceLevel: "SENIOR",
    salaryMin: 150000, salaryMax: 190000, remote: true, skillNames: ["React", "TypeScript", "JavaScript"],
  });
  const designJob = await createJob({
    companyId: northwind.id, postedById: users.jordan.id, title: "Product Designer",
    description: "Design end-to-end flows for clinical scheduling. You'll partner directly with engineering and our customers.",
    requirements: "Portfolio showing systems thinking, not just polish. Figma fluency.",
    location: "San Francisco, CA", workType: "FULL_TIME", experienceLevel: "MID",
    salaryMin: 115000, salaryMax: 145000, remote: false, skillNames: ["Product Design", "Figma", "User Research"],
  });
  const dataJob = await createJob({
    companyId: bluepeak.id, postedById: users.nina.id, title: "Data Analyst",
    description: "Turn retail transaction data into recommendations our customers actually act on.",
    requirements: "Strong SQL. Python a plus. Comfortable presenting to non-technical stakeholders.",
    location: "Austin, TX", workType: "FULL_TIME", experienceLevel: "MID",
    salaryMin: 92000, salaryMax: 122000, remote: false, skillNames: ["SQL", "Data Analysis", "Python"],
  });
  const marketingJob = await createJob({
    companyId: bluepeak.id, postedById: users.nina.id, title: "Marketing Manager",
    description: "Lead demand generation for our analytics platform across SEO and content.",
    requirements: "3+ years B2B SaaS marketing. SEO chops required.",
    location: "Chicago, IL", workType: "FULL_TIME", experienceLevel: "MID",
    salaryMin: 85000, salaryMax: 105000, remote: true, skillNames: ["Marketing", "SEO", "Content Strategy"],
  });

  // ── Courses ───────────────────────────────────────────────────────
  const sqlCourse = await prisma.course.create({
    data: {
      title: "SQL for Data Analysis", description: "A practical, no-fluff introduction to SQL for people who need to answer real business questions with data.",
      creatorId: users.sam.id, providerName: "Sam Okafor", level: "BEGINNER",
      skills: { create: [{ skillId: skills["SQL"].id }, { skillId: skills["Data Analysis"].id }] },
      modules: {
        create: [
          {
            title: "Querying basics", order: 0,
            lessons: {
              create: [
                { title: "Why SQL", type: "TEXT", order: 0, durationMinutes: 5, content: "SQL is the language nearly every database speaks. In this course you'll learn to ask precise questions of real datasets — not just memorize syntax.\n\nBy the end, you'll be comfortable pulling your own reports instead of waiting on someone else to do it." },
                { title: "SELECT and WHERE", type: "TEXT", order: 1, durationMinutes: 10, content: "SELECT chooses columns. WHERE filters rows.\n\nSELECT name, revenue FROM customers WHERE revenue > 1000;\n\nTry rewriting that query to filter for revenue > 5000 and only the 'name' column before moving on." },
                { title: "Quick check", type: "QUIZ", order: 2, durationMinutes: 5, content: JSON.stringify({ questions: [
                  { question: "Which clause filters rows in SQL?", options: ["SELECT", "WHERE", "FROM", "ORDER BY"], correctIndex: 1 },
                  { question: "What does SELECT * do?", options: ["Deletes all rows", "Selects every column", "Counts rows", "Sorts results"], correctIndex: 1 },
                ] }) },
              ],
            },
          },
          {
            title: "Joining tables", order: 1,
            lessons: {
              create: [
                { title: "INNER JOIN", type: "TEXT", order: 0, durationMinutes: 12, content: "Most real questions need more than one table. INNER JOIN combines rows from two tables where a condition matches.\n\nSELECT orders.id, customers.name FROM orders INNER JOIN customers ON orders.customer_id = customers.id;" },
                { title: "Aggregations with GROUP BY", type: "TEXT", order: 1, durationMinutes: 12, content: "GROUP BY collapses rows into summaries. Pair it with COUNT, SUM, or AVG.\n\nSELECT customer_id, SUM(amount) FROM orders GROUP BY customer_id;" },
              ],
            },
          },
        ],
      },
    },
  });

  const reactCourse = await prisma.course.create({
    data: {
      title: "React & TypeScript Fundamentals", description: "Get productive with React and TypeScript together — components, props, state, and the type patterns that actually come up at work.",
      creatorId: users.sam.id, providerName: "Sam Okafor", level: "INTERMEDIATE",
      skills: { create: [{ skillId: skills["React"].id }, { skillId: skills["TypeScript"].id }, { skillId: skills["JavaScript"].id }] },
      modules: {
        create: [
          {
            title: "Typed components", order: 0,
            lessons: {
              create: [
                { title: "Props with interfaces", type: "TEXT", order: 0, durationMinutes: 10, content: "Typing props catches bugs before your users do.\n\ninterface ButtonProps { label: string; onClick: () => void; }\nfunction Button({ label, onClick }: ButtonProps) { return <button onClick={onClick}>{label}</button>; }" },
                { title: "useState with types", type: "TEXT", order: 1, durationMinutes: 10, content: "TypeScript usually infers useState's type from its initial value. When it can't, give it a hint:\n\nconst [user, setUser] = useState<User | null>(null);" },
              ],
            },
          },
        ],
      },
    },
  });

  const designCourse = await prisma.course.create({
    data: {
      title: "Product Design Foundations", description: "The fundamentals of product design: user research, wireframing, and how to defend your decisions in a critique.",
      creatorId: users.ava.id, providerName: "Skillforge Academy", level: "BEGINNER",
      skills: { create: [{ skillId: skills["Product Design"].id }, { skillId: skills["Figma"].id }, { skillId: skills["User Research"].id }] },
      modules: {
        create: [
          {
            title: "Starting with research", order: 0,
            lessons: {
              create: [
                { title: "Talking to users", type: "TEXT", order: 0, durationMinutes: 8, content: "The goal of a user interview isn't to validate your idea — it's to find out where you're wrong. Ask about past behavior, not hypothetical future behavior." },
                { title: "Synthesizing notes", type: "TEXT", order: 1, durationMinutes: 8, content: "Affinity mapping turns a pile of quotes into a handful of real themes. Group similar observations, then name the pattern, not just the topic." },
              ],
            },
          },
          {
            title: "From sketch to screen",
            order: 1,
            lessons: {
              create: [
                { title: "Low-fidelity wireframes", type: "TEXT", order: 0, durationMinutes: 10, content: "Stay ugly for as long as possible. Boxes and labels force the conversation onto structure instead of color." },
                { title: "Final check", type: "QUIZ", order: 1, durationMinutes: 5, content: JSON.stringify({ questions: [
                  { question: "What's the main goal of a user interview?", options: ["Confirm your idea is good", "Find out where your assumptions are wrong", "Sell the product", "Collect testimonials"], correctIndex: 1 },
                ] }) },
              ],
            },
          },
        ],
      },
    },
  });

  const marketingCourse = await prisma.course.create({
    data: {
      title: "Growth Marketing Essentials", description: "Practical SEO and content strategy for B2B teams that don't have a big budget.",
      creatorId: users.ava.id, providerName: "Skillforge Academy", level: "BEGINNER",
      skills: { create: [{ skillId: skills["Marketing"].id }, { skillId: skills["SEO"].id }, { skillId: skills["Content Strategy"].id }] },
      modules: {
        create: [
          {
            title: "SEO basics", order: 0,
            lessons: {
              create: [
                { title: "Keyword intent", type: "TEXT", order: 0, durationMinutes: 8, content: "Not all searches are equal. Someone searching 'what is CRM' wants education; someone searching 'best CRM for small teams' is closer to buying. Write for the intent, not just the keyword." },
              ],
            },
          },
        ],
      },
    },
  });

  // ── Connections ───────────────────────────────────────────────────
  async function connect(a: string, b: string, status: "ACCEPTED" | "PENDING" = "ACCEPTED") {
    await prisma.connection.create({ data: { requesterId: a, addresseeId: b, status } });
  }
  await connect(users.alex.id, users.maria.id);
  await connect(users.alex.id, users.liam.id);
  await connect(users.alex.id, users.jordan.id);
  await connect(users.priya.id, users.sam.id);
  await connect(users.priya.id, users.nina.id);
  await connect(users.maria.id, users.liam.id);
  await connect(users.noah.id, users.maria.id, "PENDING");
  await connect(users.omar.id, users.alex.id, "PENDING");

  await prisma.follow.createMany({
    data: [
      { followerId: users.priya.id, followeeId: users.ava.id },
      { followerId: users.noah.id, followeeId: users.sam.id },
    ],
  });

  // ── Posts, likes, comments ───────────────────────────────────────
  const post1 = await prisma.post.create({
    data: { authorId: users.alex.id, content: "Shipped a redesign of our scheduling flow this week — cut the average booking time from 4 minutes to under 90 seconds. Small interactions add up." },
  });
  const post2 = await prisma.post.create({
    data: { authorId: users.sam.id, content: "Just published a new module on JOINs in 'SQL for Data Analysis.' If you've ever been confused about INNER vs LEFT JOIN, this one's for you." },
  });
  const post3 = await prisma.post.create({
    data: { authorId: users.nina.id, content: "Bluepeak Analytics is hiring a Data Analyst and a Marketing Manager — both fully described on our jobs page. Referrals welcome." },
  });
  const post4 = await prisma.post.create({
    data: { authorId: users.maria.id, content: "Hot take: most 'senior' React interviews test trivia, not judgment. What would you ask instead?" },
  });

  await prisma.like.createMany({
    data: [
      { postId: post1.id, userId: users.maria.id },
      { postId: post1.id, userId: users.liam.id },
      { postId: post1.id, userId: users.jordan.id },
      { postId: post2.id, userId: users.priya.id },
      { postId: post3.id, userId: users.omar.id },
      { postId: post4.id, userId: users.alex.id },
    ],
  });
  await prisma.comment.createMany({
    data: [
      { postId: post1.id, userId: users.liam.id, content: "90 seconds is wild — what was the biggest win?" },
      { postId: post2.id, userId: users.noah.id, content: "Perfect timing, just got to that part." },
      { postId: post4.id, userId: users.liam.id, content: "Ask them to debug a real (small) bug live instead." },
    ],
  });

  // ── Applications ──────────────────────────────────────────────────
  await prisma.application.create({
    data: { jobId: dataJob.id, applicantId: users.priya.id, status: "SHORTLISTED", coverLetter: "I'd love to bring my retail analytics background to Bluepeak." },
  });
  await prisma.application.create({
    data: { jobId: frontendJob.id, applicantId: users.maria.id, status: "INTERVIEW" },
  });
  await prisma.application.create({
    data: { jobId: designJob.id, applicantId: users.noah.id, status: "APPLIED" },
  });
  await prisma.savedJob.createMany({
    data: [
      { jobId: marketingJob.id, userId: users.omar.id },
      { jobId: frontendJob.id, userId: users.noah.id },
    ],
  });

  // ── Enrollments + completion (-> certificate + skill) ─────────────
  await prisma.enrollment.create({
    data: { courseId: sqlCourse.id, userId: users.priya.id, progressPercent: 60, lastAccessedAt: new Date() },
  });
  const sqlLessons = await prisma.lesson.findMany({ where: { module: { courseId: sqlCourse.id } }, orderBy: { order: "asc" } });
  await prisma.lessonProgress.createMany({
    data: sqlLessons.slice(0, 3).map((l) => ({ lessonId: l.id, userId: users.priya.id, completed: true, completedAt: new Date() })),
  });

  // Liam fully completes the React course
  const reactEnrollment = await prisma.enrollment.create({
    data: { courseId: reactCourse.id, userId: users.liam.id, progressPercent: 100, lastAccessedAt: new Date(), completedAt: new Date() },
  });
  const reactLessons = await prisma.lesson.findMany({ where: { module: { courseId: reactCourse.id } } });
  await prisma.lessonProgress.createMany({
    data: reactLessons.map((l) => ({ lessonId: l.id, userId: users.liam.id, completed: true, completedAt: new Date() })),
  });
  await prisma.certificate.create({
    data: { userId: users.liam.id, courseId: reactCourse.id, courseName: reactCourse.title },
  });
  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId: users.liam.id, skillId: skills["React"].id } },
    update: {}, create: { userId: users.liam.id, skillId: skills["React"].id, source: `course:${reactCourse.id}` },
  });

  // Alex fully completes the design course
  const designLessons = await prisma.lesson.findMany({ where: { module: { courseId: designCourse.id } } });
  await prisma.enrollment.create({
    data: { courseId: designCourse.id, userId: users.alex.id, progressPercent: 100, lastAccessedAt: new Date(), completedAt: new Date() },
  });
  await prisma.lessonProgress.createMany({
    data: designLessons.map((l) => ({ lessonId: l.id, userId: users.alex.id, completed: true, completedAt: new Date() })),
  });
  await prisma.certificate.create({
    data: { userId: users.alex.id, courseId: designCourse.id, courseName: designCourse.title },
  });

  await prisma.courseReview.createMany({
    data: [
      { courseId: reactCourse.id, userId: users.liam.id, rating: 5, comment: "Exactly the right depth — no wasted time." },
      { courseId: designCourse.id, userId: users.alex.id, rating: 4, comment: "Great refresher on research fundamentals." },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo login: alex@atlas.dev / password123 (or priya, jordan, sam, maria, liam, nina, omar, ava, noah @atlas.dev)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
