import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertSkills(names: string[]) {
  // Run sequentially to avoid exhausting the Neon connection pool
  const records: { id: string; name: string }[] = [];
  for (const name of names) {
    const r = await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
    records.push(r);
  }
  return Object.fromEntries(records.map((r) => [r.name, r]));
}

// Create a course only if a course with the same title doesn't already exist
async function createCourse(data: Parameters<typeof prisma.course.create>[0]["data"]) {
  const existing = await prisma.course.findFirst({ where: { title: data.title as string } });
  if (existing) return existing;
  return prisma.course.create({ data });
}

async function main() {
  console.log("Seeding SkillWarehouse demo data…");

  // ── Admin ─────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@atlas.dev" },
    update: {},
    create: {
      name: "Admin", email: "admin@atlas.dev", password: adminPassword,
      role: "ADMIN", emailVerified: new Date(),
      notificationPrefs: { create: {} },
    },
  });

  const password = await bcrypt.hash("password123", 10);

  // ── Skills ────────────────────────────────────────────────────────
  const skillNames = [
    // Frontend
    "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "CSS", "HTML",
    // Backend
    "Node.js", "Python", "Java", "Go", "FastAPI", "Django", "Spring Boot", "Express.js", "GraphQL",
    // Data
    "SQL", "Data Analysis", "Pandas", "NumPy", "Machine Learning", "Deep Learning",
    "PyTorch", "TensorFlow", "scikit-learn", "Power BI", "Tableau", "dbt", "Apache Spark",
    // DevOps / Cloud
    "Docker", "Kubernetes", "AWS", "Azure", "Terraform", "Linux", "CI/CD", "Helm",
    // Mobile
    "React Native", "Flutter", "Swift", "Kotlin",
    // Design
    "Product Design", "Figma", "User Research", "UI/UX", "Motion Design",
    // Product / Management
    "Product Management", "Agile", "Scrum", "System Design", "Microservices",
    // Soft skills & General
    "Communication", "Leadership", "Marketing", "SEO", "Content Strategy",
    "LangChain", "Prompt Engineering", "Testing", "Git",
  ];
  const skills = await upsertSkills(skillNames);

  // ── Users ─────────────────────────────────────────────────────────
  const userDefs = [
    { key: "alex",   name: "Alex Rivera",     email: "alex@atlas.dev",   role: "MEMBER",    headline: "Product Designer at Northwind Labs",         currentRole: "Product Designer",  currentCompany: "Northwind Labs",    location: "San Francisco, CA", about: "Designing useful, honest software for eight years.",            skillNames: ["Product Design", "Figma", "User Research", "Communication"] },
    { key: "priya",  name: "Priya Nair",      email: "priya@atlas.dev",  role: "MEMBER",    headline: "Data Analyst, open to new roles",            currentRole: "Data Analyst",      currentCompany: "Self-employed",     location: "Bangalore, IN",     about: "I turn messy spreadsheets into decisions. SQL, Python, and a healthy distrust of vanity metrics.", skillNames: ["SQL", "Data Analysis", "Python", "Power BI"] },
    { key: "jordan", name: "Jordan Kim",      email: "jordan@atlas.dev", role: "RECRUITER", headline: "Talent Lead at Northwind Labs",              currentRole: "Talent Lead",       currentCompany: "Northwind Labs",    location: "San Francisco, CA", about: "Hiring across product and engineering at Northwind Labs.",      skillNames: ["Leadership", "Communication"] },
    { key: "sam",    name: "Sam Okafor",      email: "sam@atlas.dev",    role: "PROVIDER",  headline: "Data instructor & full-stack educator",      currentRole: "Instructor",        currentCompany: "Independent",      location: "Remote",            about: "I build practical courses for people switching careers into tech and data.", skillNames: ["SQL", "Data Analysis", "Python", "React", "Node.js"] },
    { key: "maria",  name: "Maria Gonzalez",  email: "maria@atlas.dev",  role: "MEMBER",    headline: "Frontend Engineer",                         currentRole: "Frontend Engineer", currentCompany: "Lighthouse Software",location: "New York, NY",     about: "React all day. Occasionally argue about CSS.",                 skillNames: ["React", "JavaScript", "TypeScript", "CSS"] },
    { key: "liam",   name: "Liam Chen",       email: "liam@atlas.dev",   role: "MEMBER",    headline: "Backend Engineer, Node & AWS",              currentRole: "Backend Engineer",  currentCompany: "Lighthouse Software",location: "Seattle, WA",      about: "Building reliable APIs since 2017.",                           skillNames: ["Node.js", "AWS", "Docker", "TypeScript", "PostgreSQL"] },
    { key: "nina",   name: "Nina Petrova",    email: "nina@atlas.dev",   role: "RECRUITER", headline: "Head of People at Bluepeak Analytics",      currentRole: "Head of People",    currentCompany: "Bluepeak Analytics", location: "Austin, TX",      about: "Building the analytics team at Bluepeak.",                     skillNames: ["Leadership", "Communication"] },
    { key: "omar",   name: "Omar Haddad",     email: "omar@atlas.dev",   role: "MEMBER",    headline: "Marketing Manager",                         currentRole: "Marketing Manager", currentCompany: "Bluepeak Analytics", location: "Chicago, IL",     about: "Growth marketing, mostly B2B SaaS.",                           skillNames: ["Marketing", "SEO", "Content Strategy"] },
    { key: "ava",    name: "Ava Thompson",    email: "ava@atlas.dev",    role: "PROVIDER",  headline: "Founder, Skillforge Academy",               currentRole: "Founder",           currentCompany: "Skillforge Academy", location: "Remote",          about: "Teaching product, design, and growth skills to career switchers.", skillNames: ["Product Design", "Marketing", "Product Management"] },
    { key: "noah",   name: "Noah Park",       email: "noah@atlas.dev",   role: "MEMBER",    headline: "Junior Developer, learning fast",           currentRole: "Junior Developer",  currentCompany: "Freelance",          location: "Boston, MA",      about: "Bootcamp grad, six months into my first dev role.",            skillNames: ["JavaScript", "React", "CSS"] },
    { key: "riya",   name: "Riya Sharma",     email: "riya@atlas.dev",   role: "MEMBER",    headline: "ML Engineer at DataVault AI",               currentRole: "ML Engineer",       currentCompany: "DataVault AI",       location: "Pune, IN",        about: "Building production ML systems with PyTorch and MLOps.",       skillNames: ["Python", "Machine Learning", "PyTorch", "Docker"] },
    { key: "david",  name: "David Park",      email: "david@atlas.dev",  role: "MEMBER",    headline: "DevOps Engineer · Kubernetes fanatic",      currentRole: "DevOps Engineer",   currentCompany: "CloudNine Infrastructure", location: "Berlin, DE",  about: "Kubernetes, Terraform, GitOps — turning infra into code.",     skillNames: ["Kubernetes", "Docker", "Terraform", "AWS", "Linux"] },
  ] as const;

  const users: Record<string, any> = {};
  for (const def of userDefs) {
    const skillsToCreate = def.skillNames
      .filter((n) => skills[n])
      .map((n) => ({ skillId: skills[n].id, endorsements: Math.floor(Math.random() * 8) }));
    const user = await prisma.user.upsert({
      where: { email: def.email },
      update: {},
      create: {
        name: def.name, email: def.email, password, role: def.role,
        headline: def.headline, about: def.about, location: def.location,
        currentRole: def.currentRole, currentCompany: def.currentCompany,
        emailVerified: new Date(),
        notificationPrefs: { create: {} },
        skills: { create: skillsToCreate },
      },
    });
    users[def.key] = user;
  }

  // Experience & education
  await prisma.experience.createMany({
    skipDuplicates: true,
    data: [
      { userId: users.alex.id,   title: "Product Designer",    company: "Northwind Labs",       location: "San Francisco, CA", startDate: new Date("2022-03-01"), current: true,  description: "Leading design for the core scheduling product." },
      { userId: users.alex.id,   title: "UX Designer",         company: "Fernbridge",           location: "Oakland, CA",       startDate: new Date("2019-06-01"), endDate: new Date("2022-02-15") },
      { userId: users.priya.id,  title: "Freelance Analyst",   company: "Self-employed",        startDate: new Date("2023-01-01"), current: true },
      { userId: users.priya.id,  title: "Reporting Analyst",   company: "Meridian Retail",      location: "Bangalore, IN",     startDate: new Date("2020-08-01"), endDate: new Date("2022-12-01") },
      { userId: users.liam.id,   title: "Backend Engineer",    company: "Lighthouse Software",  location: "Seattle, WA",       startDate: new Date("2021-05-01"), current: true },
      { userId: users.riya.id,   title: "ML Engineer",         company: "DataVault AI",         location: "Pune, IN",          startDate: new Date("2022-09-01"), current: true },
      { userId: users.david.id,  title: "DevOps Engineer",     company: "CloudNine Infrastructure", location: "Berlin, DE",    startDate: new Date("2021-11-01"), current: true },
      { userId: users.david.id,  title: "SRE",                 company: "Fastlane GmbH",        location: "Munich, DE",        startDate: new Date("2019-03-01"), endDate: new Date("2021-10-01") },
    ],
  });

  await prisma.education.createMany({
    skipDuplicates: true,
    data: [
      { userId: users.alex.id,  school: "California College of the Arts",  degree: "BFA",         field: "Interaction Design",       startDate: new Date("2015-09-01"), endDate: new Date("2019-05-01") },
      { userId: users.priya.id, school: "BITS Pilani",                     degree: "B.Tech",      field: "Computer Science",         startDate: new Date("2016-09-01"), endDate: new Date("2020-05-01") },
      { userId: users.noah.id,  school: "Galvanize Coding Bootcamp",       degree: "Certificate", field: "Full-Stack Development",   startDate: new Date("2024-01-01"), endDate: new Date("2024-06-01") },
      { userId: users.riya.id,  school: "IIT Bombay",                      degree: "M.Tech",      field: "Machine Learning",         startDate: new Date("2020-08-01"), endDate: new Date("2022-07-01") },
      { userId: users.david.id, school: "TU Berlin",                       degree: "B.Sc.",       field: "Computer Engineering",     startDate: new Date("2015-10-01"), endDate: new Date("2019-07-01") },
    ],
  });

  // ── Companies ─────────────────────────────────────────────────────
  const northwind = await prisma.company.upsert({
    where: { slug: "northwind-labs" }, update: {},
    create: { name: "Northwind Labs", slug: "northwind-labs", industry: "Software", size: "51-200", about: "We build scheduling software for healthcare teams.", website: "https://northwindlabs.example.com", members: { create: { userId: users.jordan.id, role: "ADMIN" } } },
  });
  const bluepeak = await prisma.company.upsert({
    where: { slug: "bluepeak-analytics" }, update: {},
    create: { name: "Bluepeak Analytics", slug: "bluepeak-analytics", industry: "Data & Analytics", size: "11-50", about: "Analytics-as-a-service for mid-market retailers.", website: "https://bluepeak.example.com", members: { create: { userId: users.nina.id, role: "ADMIN" } } },
  });
  const datavault = await prisma.company.upsert({
    where: { slug: "datavault-ai" }, update: {},
    create: { name: "DataVault AI", slug: "datavault-ai", industry: "AI & Machine Learning", size: "11-50", about: "We build AI systems that turn raw data into production intelligence.", website: "https://datavault.example.com", members: { create: { userId: users.riya.id, role: "ADMIN" } } },
  });
  const cloudnine = await prisma.company.upsert({
    where: { slug: "cloudnine-infra" }, update: {},
    create: { name: "CloudNine Infrastructure", slug: "cloudnine-infra", industry: "Cloud & DevOps", size: "201-500", about: "Platform engineering and managed Kubernetes for scale-up engineering teams.", website: "https://cloudnine.example.com", members: { create: { userId: users.david.id, role: "ADMIN" } } },
  });
  const pulse = await prisma.company.upsert({
    where: { slug: "pulse-digital" }, update: {},
    create: { name: "Pulse Digital", slug: "pulse-digital", industry: "Digital Marketing", size: "51-200", about: "Full-funnel digital marketing for D2C and SaaS brands.", website: "https://pulsedigital.example.com", members: { create: { userId: users.omar.id, role: "RECRUITER" } } },
  });

  // ── Jobs ──────────────────────────────────────────────────────────
  async function createJob(opts: {
    companyId: string; postedById: string; title: string; description: string;
    requirements: string; location: string; workType: string; experienceLevel: string;
    salaryMin: number; salaryMax: number; remote: boolean; skillNames: string[];
    featured?: boolean;
  }) {
    return prisma.job.create({
      data: {
        companyId: opts.companyId, postedById: opts.postedById,
        title: opts.title, description: opts.description, requirements: opts.requirements,
        location: opts.location, workType: opts.workType, experienceLevel: opts.experienceLevel,
        salaryMin: opts.salaryMin, salaryMax: opts.salaryMax, remote: opts.remote,
        featured: opts.featured ?? false,
        skills: { create: opts.skillNames.filter((n) => skills[n]).map((n) => ({ skillId: skills[n].id })) },
      },
    });
  }

  // Northwind Labs
  const frontendJob = await createJob({ companyId: northwind.id, postedById: users.jordan.id, featured: true,
    title: "Senior Frontend Engineer", experienceLevel: "SENIOR", location: "San Francisco, CA", workType: "FULL_TIME", remote: true, salaryMin: 150000, salaryMax: 190000,
    description: "Own the architecture of our React + TypeScript scheduling app. Work closely with design to ship fast without breaking things.",
    requirements: "5+ years with React in production. Comfortable owning a feature end to end.",
    skillNames: ["React", "TypeScript", "JavaScript", "Next.js"],
  });
  const designJob = await createJob({ companyId: northwind.id, postedById: users.jordan.id,
    title: "Product Designer", experienceLevel: "MID", location: "San Francisco, CA", workType: "FULL_TIME", remote: false, salaryMin: 115000, salaryMax: 145000,
    description: "Design end-to-end flows for clinical scheduling. You'll partner directly with engineering and our customers.",
    requirements: "Portfolio showing systems thinking. Figma fluency. User research experience.",
    skillNames: ["Product Design", "Figma", "User Research", "UI/UX"],
  });
  const frontendInternJob = await createJob({ companyId: northwind.id, postedById: users.jordan.id,
    title: "Frontend Engineering Intern", experienceLevel: "ENTRY", location: "San Francisco, CA", workType: "INTERNSHIP", remote: true, salaryMin: 45000, salaryMax: 60000,
    description: "Work alongside our senior engineers on real features. You'll ship code to production in your first two weeks.",
    requirements: "Proficiency in JavaScript and React fundamentals. Side projects welcome as portfolio.",
    skillNames: ["JavaScript", "React", "CSS", "HTML"],
  });

  // Bluepeak Analytics
  const dataJob = await createJob({ companyId: bluepeak.id, postedById: users.nina.id,
    title: "Data Analyst", experienceLevel: "MID", location: "Austin, TX", workType: "FULL_TIME", remote: false, salaryMin: 92000, salaryMax: 122000,
    description: "Turn retail transaction data into recommendations our customers actually act on.",
    requirements: "Strong SQL. Python a plus. Comfortable presenting to non-technical stakeholders.",
    skillNames: ["SQL", "Data Analysis", "Python", "Power BI"],
  });
  const juniorDataJob = await createJob({ companyId: bluepeak.id, postedById: users.nina.id,
    title: "Junior Data Analyst", experienceLevel: "ENTRY", location: "Austin, TX", workType: "FULL_TIME", remote: true, salaryMin: 60000, salaryMax: 80000,
    description: "Help build dashboards, clean datasets, and generate reports that inform executive decisions.",
    requirements: "Solid SQL foundation. Basic Python. Curious and detail-oriented.",
    skillNames: ["SQL", "Data Analysis", "Power BI"],
  });
  const marketingJob = await createJob({ companyId: bluepeak.id, postedById: users.nina.id,
    title: "Marketing Manager", experienceLevel: "MID", location: "Chicago, IL", workType: "FULL_TIME", remote: true, salaryMin: 85000, salaryMax: 105000,
    description: "Lead demand generation for our analytics platform across SEO and content.",
    requirements: "3+ years B2B SaaS marketing. SEO chops required.",
    skillNames: ["Marketing", "SEO", "Content Strategy"],
  });

  // DataVault AI
  const mlJob = await createJob({ companyId: datavault.id, postedById: users.riya.id, featured: true,
    title: "Machine Learning Engineer", experienceLevel: "SENIOR", location: "Pune, IN", workType: "FULL_TIME", remote: true, salaryMin: 2200000, salaryMax: 3500000,
    description: "Build and ship ML models into production. Own the ML platform from experimentation to serving.",
    requirements: "5+ years ML engineering. Strong PyTorch or TensorFlow. MLOps experience (MLflow, DVC, or similar).",
    skillNames: ["Machine Learning", "PyTorch", "Python", "Docker", "Kubernetes"],
  });
  const dataEngJob = await createJob({ companyId: datavault.id, postedById: users.riya.id,
    title: "Data Engineer", experienceLevel: "MID", location: "Bangalore, IN", workType: "FULL_TIME", remote: true, salaryMin: 1400000, salaryMax: 2200000,
    description: "Build the data pipelines that feed our ML platform. Design schemas, orchestrate jobs, and make data reliable.",
    requirements: "Strong Python. Experience with Airflow, Spark, or dbt. SQL mastery.",
    skillNames: ["Python", "SQL", "Apache Spark", "dbt", "Docker"],
  });
  const aiResearchJob = await createJob({ companyId: datavault.id, postedById: users.riya.id,
    title: "AI Research Engineer", experienceLevel: "SENIOR", location: "Remote", workType: "FULL_TIME", remote: true, salaryMin: 3000000, salaryMax: 5000000,
    description: "Push the frontier on LLM fine-tuning and RAG systems. Publish, experiment, and ship.",
    requirements: "Deep ML fundamentals. Experience with LLM fine-tuning. Strong publication record a plus.",
    skillNames: ["Machine Learning", "PyTorch", "LangChain", "Prompt Engineering", "Python"],
  });

  // CloudNine Infrastructure
  const devopsJob = await createJob({ companyId: cloudnine.id, postedById: users.david.id, featured: true,
    title: "Senior DevOps Engineer", experienceLevel: "SENIOR", location: "Berlin, DE", workType: "FULL_TIME", remote: true, salaryMin: 85000, salaryMax: 115000,
    description: "Own the Kubernetes platform used by 40+ engineering teams. Design for reliability and developer experience.",
    requirements: "5+ years DevOps/SRE. Deep Kubernetes. Terraform for IaC. On-call experience.",
    skillNames: ["Kubernetes", "Docker", "Terraform", "AWS", "Helm", "Linux"],
  });
  const goBackendJob = await createJob({ companyId: cloudnine.id, postedById: users.david.id,
    title: "Go Backend Engineer", experienceLevel: "MID", location: "Berlin, DE", workType: "FULL_TIME", remote: true, salaryMin: 70000, salaryMax: 95000,
    description: "Build the control plane APIs for our managed Kubernetes offering. Performance and correctness matter here.",
    requirements: "3+ years Go in production. Familiarity with gRPC and distributed systems.",
    skillNames: ["Go", "Docker", "Kubernetes", "System Design"],
  });
  const platformEngJob = await createJob({ companyId: cloudnine.id, postedById: users.david.id,
    title: "Platform Engineer (Intern)", experienceLevel: "ENTRY", location: "Berlin, DE", workType: "INTERNSHIP", remote: false, salaryMin: 30000, salaryMax: 42000,
    description: "Join our platform team to learn infra-as-code, container orchestration, and CI/CD in a real production environment.",
    requirements: "Some Linux experience. Basic scripting (Bash or Python). Keen to learn Kubernetes.",
    skillNames: ["Linux", "Docker", "CI/CD"],
  });

  // Pulse Digital
  const growthJob = await createJob({ companyId: pulse.id, postedById: users.omar.id,
    title: "Growth Marketing Analyst", experienceLevel: "ENTRY", location: "Chicago, IL", workType: "FULL_TIME", remote: true, salaryMin: 55000, salaryMax: 72000,
    description: "Run experiments, analyse campaign performance, and help grow Pulse's D2C client base.",
    requirements: "Strong with spreadsheets and basic data analysis. Interest in A/B testing and SEO.",
    skillNames: ["Marketing", "SEO", "Data Analysis"],
  });
  const uxDesignerJob = await createJob({ companyId: pulse.id, postedById: users.omar.id,
    title: "UI/UX Designer", experienceLevel: "ENTRY", location: "Chicago, IL", workType: "FULL_TIME", remote: false, salaryMin: 62000, salaryMax: 82000,
    description: "Design landing pages, ad creatives, and user flows for our clients' digital campaigns.",
    requirements: "Portfolio of digital design work. Figma proficiency. Understanding of conversion design.",
    skillNames: ["Figma", "UI/UX", "Product Design"],
  });

  // ── Courses ───────────────────────────────────────────────────────
  const sqlCourse = await createCourse({
    title: "SQL for Data Analysis", level: "BEGINNER", creatorId: users.sam.id, providerName: "Sam Okafor",
    description: "A practical, no-fluff introduction to SQL for people who need to answer real business questions with data. By the end you'll write your own reports without waiting on anyone.",
    skills: { create: [{ skillId: skills["SQL"].id }, { skillId: skills["Data Analysis"].id }] },
    modules: { create: [
      { title: "Querying basics", order: 0, lessons: { create: [
        { title: "Why SQL matters in 2026", type: "TEXT", order: 0, durationMinutes: 5, content: "SQL is the language every database speaks. It hasn't died — it's everywhere: data warehouses, analytics platforms, backend apps, ML pipelines.\n\nIn this course you'll learn to ask precise questions of real datasets. By the end you'll be pulling your own reports instead of waiting on someone else to do it." },
        { title: "SELECT and WHERE", type: "TEXT", order: 1, durationMinutes: 10, content: "SELECT chooses columns. WHERE filters rows. That's 80% of what you'll use day-to-day.\n\n```sql\nSELECT name, revenue\nFROM customers\nWHERE revenue > 1000;\n```\n\nTry rewriting that to only return the `name` column for `revenue > 5000` before moving on." },
        { title: "ORDER BY, LIMIT, and DISTINCT", type: "TEXT", order: 2, durationMinutes: 8, content: "Sort results with ORDER BY, cap them with LIMIT, and remove duplicates with DISTINCT.\n\n```sql\nSELECT DISTINCT city\nFROM customers\nORDER BY city ASC\nLIMIT 10;\n```" },
        { title: "Querying Basics — Quiz", type: "QUIZ", order: 3, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "Which clause filters rows in SQL?", options: ["SELECT", "WHERE", "FROM", "ORDER BY"], correctIndex: 1 },
          { question: "What does SELECT * do?", options: ["Deletes all rows", "Selects every column", "Counts rows", "Sorts results"], correctIndex: 1 },
          { question: "Which keyword removes duplicate rows from results?", options: ["UNIQUE", "ONLY", "DISTINCT", "FILTER"], correctIndex: 2 },
        ] }) },
      ] } },
      { title: "Joining tables", order: 1, lessons: { create: [
        { title: "INNER JOIN", type: "TEXT", order: 0, durationMinutes: 12, content: "Most real questions need more than one table. INNER JOIN combines rows where a condition matches.\n\n```sql\nSELECT orders.id, customers.name\nFROM orders\nINNER JOIN customers ON orders.customer_id = customers.id;\n```\n\nOnly rows that exist in BOTH tables appear in the result." },
        { title: "LEFT JOIN and NULLs", type: "TEXT", order: 1, durationMinutes: 10, content: "LEFT JOIN returns all rows from the left table, even when there's no match on the right. Unmatched columns show as NULL.\n\nUseful for: 'give me all customers, including those who've never ordered.'" },
        { title: "Aggregations with GROUP BY", type: "TEXT", order: 2, durationMinutes: 12, content: "GROUP BY collapses rows into summaries. Pair it with COUNT, SUM, AVG, MIN, or MAX.\n\n```sql\nSELECT customer_id, SUM(amount) AS total_spent\nFROM orders\nGROUP BY customer_id\nHAVING SUM(amount) > 500;\n```\n\nHAVING filters groups the same way WHERE filters rows." },
        { title: "Joins & Aggregations — Quiz", type: "QUIZ", order: 3, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "Which join type returns all rows from the left table even with no match?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], correctIndex: 1 },
          { question: "Which clause filters aggregated results?", options: ["WHERE", "FILTER", "HAVING", "GROUP FILTER"], correctIndex: 2 },
        ] }) },
      ] } },
      { title: "Window functions & subqueries", order: 2, lessons: { create: [
        { title: "ROW_NUMBER and RANK", type: "TEXT", order: 0, durationMinutes: 15, content: "Window functions let you compute values across a set of rows without collapsing them into a single result.\n\n```sql\nSELECT name, salary,\n  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_in_dept\nFROM employees;\n```" },
        { title: "Subqueries and CTEs", type: "TEXT", order: 1, durationMinutes: 12, content: "A CTE (WITH clause) names a subquery so you can reference it multiple times — far more readable than nesting.\n\n```sql\nWITH high_value AS (\n  SELECT customer_id FROM orders WHERE total > 1000\n)\nSELECT * FROM customers WHERE id IN (SELECT customer_id FROM high_value);\n```" },
      ] } },
    ] },
  });

  const reactCourse = await createCourse({
    title: "React & TypeScript Fundamentals", level: "INTERMEDIATE", creatorId: users.sam.id, providerName: "Sam Okafor",
    description: "Get productive with React and TypeScript together — components, props, state, and the type patterns that actually come up at work.",
    skills: { create: [{ skillId: skills["React"].id }, { skillId: skills["TypeScript"].id }, { skillId: skills["JavaScript"].id }] },
    modules: { create: [
      { title: "Typed components", order: 0, lessons: { create: [
        { title: "Props with interfaces", type: "TEXT", order: 0, durationMinutes: 10, content: "Typing props catches bugs before your users do.\n\n```tsx\ninterface ButtonProps {\n  label: string;\n  onClick: () => void;\n  variant?: 'primary' | 'outline';\n}\nfunction Button({ label, onClick, variant = 'primary' }: ButtonProps) {\n  return <button onClick={onClick}>{label}</button>;\n}\n```" },
        { title: "useState with types", type: "TEXT", order: 1, durationMinutes: 10, content: "TypeScript usually infers useState's type from its initial value. When it can't, give it a hint:\n\n```tsx\nconst [user, setUser] = useState<User | null>(null);\nconst [items, setItems] = useState<string[]>([]);\n```" },
        { title: "useEffect and async data", type: "TEXT", order: 2, durationMinutes: 12, content: "Fetch data in useEffect, cancel it on cleanup.\n\n```tsx\nuseEffect(() => {\n  let active = true;\n  fetch('/api/user').then(r => r.json()).then(d => { if (active) setUser(d); });\n  return () => { active = false; };\n}, []);\n```" },
      ] } },
      { title: "Patterns & performance", order: 1, lessons: { create: [
        { title: "useMemo and useCallback", type: "TEXT", order: 0, durationMinutes: 12, content: "Memoization prevents unnecessary re-renders. The rule: only reach for it when a profiler confirms you have a problem.\n\nuseMemo caches a computed value. useCallback caches a function reference." },
        { title: "Context and custom hooks", type: "TEXT", order: 1, durationMinutes: 12, content: "Extract shared state logic into a custom hook. Name it useXxx.\n\n```tsx\nfunction useLocalStorage<T>(key: string, initial: T) {\n  const [val, setVal] = useState<T>(() => {\n    try { return JSON.parse(localStorage.getItem(key) ?? '') ?? initial; }\n    catch { return initial; }\n  });\n  const set = (v: T) => { setVal(v); localStorage.setItem(key, JSON.stringify(v)); };\n  return [val, set] as const;\n}\n```" },
        { title: "React & TypeScript — Quiz", type: "QUIZ", order: 2, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "What TypeScript syntax is used to type React component props?", options: ["type Props = any", "interface / type alias", "PropTypes from 'prop-types'", "JSDoc comments"], correctIndex: 1 },
          { question: "When should you use useCallback?", options: ["Always", "Never", "When passing a function to a memoized child component", "When the function makes an API call"], correctIndex: 2 },
        ] }) },
      ] } },
    ] },
  });

  const nextjsCourse = await createCourse({
    title: "Next.js 15 Production Masterclass", level: "ADVANCED", creatorId: users.sam.id, providerName: "Sam Okafor",
    description: "Master the App Router, React Server Components, Server Actions, and deployment patterns for shipping production Next.js apps with confidence.",
    skills: { create: [{ skillId: skills["Next.js"].id }, { skillId: skills["React"].id }, { skillId: skills["TypeScript"].id }] },
    modules: { create: [
      { title: "App Router deep dive", order: 0, lessons: { create: [
        { title: "React Server Components explained", type: "TEXT", order: 0, durationMinutes: 15, content: "RSCs render on the server — they have no bundle size, can access databases and secrets directly, and stream to the client.\n\nThe key mental model: server components CAN'T use useState, useEffect, or event handlers. Mark anything that needs those with 'use client'." },
        { title: "Streaming with Suspense", type: "TEXT", order: 1, durationMinutes: 12, content: "Wrap slow server components in <Suspense fallback={<Skeleton />}> to stream them independently. The shell renders immediately; the suspended part arrives as it resolves.\n\nThis replaces getServerSideProps's waterfall with parallel streaming." },
        { title: "Server Actions", type: "TEXT", order: 2, durationMinutes: 15, content: "Server Actions are async functions with 'use server' that run on the server, triggered from the client.\n\n```tsx\nasync function savePost(formData: FormData) {\n  'use server';\n  await db.post.create({ data: { title: formData.get('title') } });\n  revalidatePath('/posts');\n}\n```\n\nNo API route needed. TypeScript types flow end-to-end." },
        { title: "App Router — Quiz", type: "QUIZ", order: 3, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "Which directive marks a Next.js component as a Client Component?", options: ["'use server'", "'use client'", "'use browser'", "export client = true"], correctIndex: 1 },
          { question: "What replaces the old getServerSideProps in the App Router?", options: ["getServerProps", "async server components", "useServerData", "getStaticProps"], correctIndex: 1 },
        ] }) },
      ] } },
      { title: "Performance & deployment", order: 1, lessons: { create: [
        { title: "Caching strategies in Next.js 15", type: "TEXT", order: 0, durationMinutes: 15, content: "Next.js 15 ships with granular caching controls. By default, fetch() is not cached (unlike v13/14).\n\nOpt in per fetch: fetch(url, { next: { revalidate: 60 } }) for ISR-style caching, or { cache: 'force-cache' } for static.\n\nRoute-level caching is controlled with export const revalidate = N." },
        { title: "Image optimisation and fonts", type: "TEXT", order: 1, durationMinutes: 10, content: "next/image handles lazy loading, responsive sizes, and format conversion (WebP/AVIF) automatically. Always set width and height to avoid CLS.\n\nnext/font preloads Google fonts at build time — no runtime fetch, no FOUT. Variables let you use them in CSS and Tailwind." },
        { title: "Deploying to Vercel", type: "VIDEO", order: 2, durationMinutes: 8, content: "https://youtube.com/watch?v=example-nextjs-deploy" },
      ] } },
    ] },
  });

  const pythonCourse = await createCourse({
    title: "Python for Data Science", level: "BEGINNER", creatorId: users.sam.id, providerName: "Sam Okafor",
    description: "Go from Python zero to data analysis hero. Covers core Python, Pandas, NumPy, and data visualisation with Matplotlib — all with real datasets.",
    skills: { create: [{ skillId: skills["Python"].id }, { skillId: skills["Pandas"].id }, { skillId: skills["NumPy"].id }, { skillId: skills["Data Analysis"].id }] },
    modules: { create: [
      { title: "Python essentials", order: 0, lessons: { create: [
        { title: "Lists, dicts, and functions", type: "TEXT", order: 0, durationMinutes: 12, content: "Python's three most useful primitives for data work:\n\n- **Lists** — ordered, mutable: `prices = [10.5, 22.0, 8.75]`\n- **Dicts** — key-value: `user = {'name': 'Priya', 'age': 27}`\n- **Functions** — reusable blocks:\n\n```python\ndef describe(data: list[float]) -> dict:\n    return {'mean': sum(data)/len(data), 'count': len(data)}\n```" },
        { title: "Reading and writing files", type: "TEXT", order: 1, durationMinutes: 10, content: "Most data work starts with a file. Python's built-in open() handles text; for CSVs use the csv module or — better — Pandas.\n\n```python\nimport csv\nwith open('sales.csv') as f:\n    reader = csv.DictReader(f)\n    rows = list(reader)\n```" },
        { title: "List comprehensions and lambdas", type: "TEXT", order: 2, durationMinutes: 10, content: "List comprehensions replace verbose loops:\n\n```python\n# Instead of:\nresult = []\nfor x in data:\n    if x > 0:\n        result.append(x * 2)\n\n# Write:\nresult = [x * 2 for x in data if x > 0]\n```" },
      ] } },
      { title: "Pandas & NumPy for analysis", order: 1, lessons: { create: [
        { title: "DataFrames 101", type: "TEXT", order: 0, durationMinutes: 14, content: "A DataFrame is a 2D table. Load it from CSV in one line:\n\n```python\nimport pandas as pd\ndf = pd.read_csv('sales.csv')\ndf.head()          # first 5 rows\ndf.info()          # column types and nulls\ndf.describe()      # stats for numeric columns\n```" },
        { title: "Data cleaning", type: "TEXT", order: 1, durationMinutes: 14, content: "Real data is messy. Essential cleaning operations:\n\n```python\ndf.dropna(subset=['revenue'])          # drop rows missing revenue\ndf['date'] = pd.to_datetime(df['date']) # parse date strings\ndf['name'] = df['name'].str.strip()    # remove whitespace\ndf = df[df['revenue'] > 0]             # remove nonsense values\n```" },
        { title: "Groupby and pivot tables", type: "TEXT", order: 2, durationMinutes: 12, content: "Groupby is Pandas' version of SQL GROUP BY:\n\n```python\nmonthly = df.groupby('month').agg({'revenue': 'sum', 'orders': 'count'})\n```\n\nPivot tables let you cross-tabulate two dimensions:\n\n```python\npivot = df.pivot_table(values='revenue', index='region', columns='category', aggfunc='sum')\n```" },
        { title: "Pandas Essentials — Quiz", type: "QUIZ", order: 3, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "Which Pandas method shows basic stats for numeric columns?", options: ["df.stats()", "df.describe()", "df.summary()", "df.info()"], correctIndex: 1 },
          { question: "How do you drop rows with missing values in a specific column?", options: ["df.dropna()", "df.fillna()", "df.dropna(subset=['col'])", "df.remove_nulls()"], correctIndex: 2 },
        ] }) },
      ] } },
    ] },
  });

  const dockerCourse = await createCourse({
    title: "Docker & Kubernetes: Zero to Production", level: "INTERMEDIATE", creatorId: users.ava.id, providerName: "Skillforge Academy",
    description: "Containers changed software deployment. This course takes you from your first Dockerfile to running a multi-service app on Kubernetes — with real YAML and real clusters.",
    skills: { create: [{ skillId: skills["Docker"].id }, { skillId: skills["Kubernetes"].id }, { skillId: skills["Linux"].id }] },
    modules: { create: [
      { title: "Containers with Docker", order: 0, lessons: { create: [
        { title: "Why containers?", type: "TEXT", order: 0, durationMinutes: 8, content: "\"Works on my machine\" is a team problem. Containers bundle your app and everything it needs — runtime, dependencies, config — into a single portable unit.\n\nA container image is like a snapshot of a filesystem. Run the same image on your laptop, a CI server, or a cloud VM and get identical behaviour." },
        { title: "Your first Dockerfile", type: "TEXT", order: 1, durationMinutes: 14, content: "```dockerfile\n# Start from an official base image\nFROM node:20-alpine\n\n# Set working directory\nWORKDIR /app\n\n# Copy and install dependencies first (layer caching)\nCOPY package*.json ./\nRUN npm ci --only=production\n\n# Copy app code\nCOPY . .\n\n# Declare the port your app listens on\nEXPOSE 3000\n\n# Start command\nCMD [\"node\", \"server.js\"]\n```\n\nBuild: `docker build -t my-app .`\nRun: `docker run -p 3000:3000 my-app`" },
        { title: "Docker Compose for local dev", type: "TEXT", order: 2, durationMinutes: 12, content: "docker-compose.yml describes your whole local environment — app, database, cache — as a single config file.\n\n```yaml\nservices:\n  app:\n    build: .\n    ports: ['3000:3000']\n    depends_on: [postgres]\n    environment:\n      DATABASE_URL: postgres://user:pass@postgres/mydb\n  postgres:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: pass\n    volumes:\n      - pg_data:/var/lib/postgresql/data\nvolumes:\n  pg_data:\n```\n\n`docker compose up` starts everything." },
        { title: "Docker — Quiz", type: "QUIZ", order: 3, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "What command builds a Docker image from a Dockerfile?", options: ["docker run", "docker build", "docker create", "docker push"], correctIndex: 1 },
          { question: "Which Dockerfile instruction sets the working directory?", options: ["CD", "RUN cd", "WORKDIR", "SET_DIR"], correctIndex: 2 },
        ] }) },
      ] } },
      { title: "Kubernetes in practice", order: 1, lessons: { create: [
        { title: "Pods, Deployments, and Services", type: "TEXT", order: 0, durationMinutes: 18, content: "Kubernetes has three core objects you'll use every day:\n\n- **Pod** — the smallest deployable unit; wraps one or more containers\n- **Deployment** — manages a set of replica Pods, handles rollouts and rollbacks\n- **Service** — stable network endpoint for a set of Pods (ClusterIP, NodePort, LoadBalancer)\n\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app\n  template:\n    metadata:\n      labels:\n        app: my-app\n    spec:\n      containers:\n      - name: my-app\n        image: my-app:1.0\n        ports:\n        - containerPort: 3000\n```" },
        { title: "Helm charts overview", type: "TEXT", order: 1, durationMinutes: 12, content: "Helm is the package manager for Kubernetes. A chart is a reusable, parameterised Kubernetes config.\n\nInstall a chart: `helm install my-release bitnami/postgresql`\nCustomise with values: `helm install my-release bitnami/postgresql --set auth.password=secret`\n\nFor your own apps, `helm create my-chart` generates the boilerplate." },
        { title: "K8s Core Concepts — Quiz", type: "QUIZ", order: 2, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "What Kubernetes object manages replica Pods and handles rolling updates?", options: ["Pod", "Service", "Deployment", "Ingress"], correctIndex: 2 },
          { question: "What is Helm?", options: ["A Kubernetes GUI", "A package manager for K8s", "A monitoring tool", "A Kubernetes cluster manager"], correctIndex: 1 },
        ] }) },
      ] } },
    ] },
  });

  const mlCourse = await createCourse({
    title: "Machine Learning with PyTorch", level: "ADVANCED", creatorId: users.ava.id, providerName: "Skillforge Academy",
    description: "Build and train neural networks with PyTorch from scratch. Covers tensors, autograd, training loops, CNNs, and modern techniques to ship ML models to production.",
    skills: { create: [{ skillId: skills["PyTorch"].id }, { skillId: skills["Machine Learning"].id }, { skillId: skills["Python"].id }, { skillId: skills["Deep Learning"].id }] },
    modules: { create: [
      { title: "PyTorch fundamentals", order: 0, lessons: { create: [
        { title: "Tensors and autograd", type: "TEXT", order: 0, durationMinutes: 15, content: "A tensor is the fundamental PyTorch data structure — think an N-dimensional NumPy array that can run on a GPU.\n\n```python\nimport torch\n\nx = torch.tensor([[1.0, 2.0], [3.0, 4.0]])\nx.shape  # torch.Size([2, 2])\nx.dtype  # torch.float32\n\n# Move to GPU if available\ndevice = 'cuda' if torch.cuda.is_available() else 'cpu'\nx = x.to(device)\n```\n\nAutograd tracks operations and computes gradients automatically:\n\n```python\nw = torch.tensor(2.0, requires_grad=True)\ny = w ** 2 + 3 * w\ny.backward()  # dy/dw\nprint(w.grad)  # tensor(7.)  → 2w + 3 at w=2\n```" },
        { title: "Building your first neural network", type: "TEXT", order: 1, durationMinutes: 18, content: "```python\nimport torch.nn as nn\n\nclass MLP(nn.Module):\n    def __init__(self, in_features: int, hidden: int, out_features: int):\n        super().__init__()\n        self.net = nn.Sequential(\n            nn.Linear(in_features, hidden),\n            nn.ReLU(),\n            nn.Linear(hidden, out_features),\n        )\n    def forward(self, x: torch.Tensor) -> torch.Tensor:\n        return self.net(x)\n\nmodel = MLP(784, 256, 10)\nprint(model)\n```" },
        { title: "Training loop from scratch", type: "TEXT", order: 2, durationMinutes: 18, content: "Every PyTorch training loop has the same four steps:\n\n```python\noptimizer = torch.optim.Adam(model.parameters(), lr=1e-3)\ncriterion = nn.CrossEntropyLoss()\n\nfor epoch in range(num_epochs):\n    for X_batch, y_batch in dataloader:\n        optimizer.zero_grad()     # 1. clear old gradients\n        preds = model(X_batch)    # 2. forward pass\n        loss = criterion(preds, y_batch)  # 3. compute loss\n        loss.backward()           # 4. backprop\n        optimizer.step()          # 5. update weights\n```" },
        { title: "PyTorch Fundamentals — Quiz", type: "QUIZ", order: 3, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "What does calling .backward() do in PyTorch?", options: ["Reverses the model", "Computes gradients via backpropagation", "Runs the model backwards", "Freezes weights"], correctIndex: 1 },
          { question: "What must you call before each training step to prevent gradient accumulation?", options: ["model.reset()", "optimizer.zero_grad()", "loss.clear()", "model.train()"], correctIndex: 1 },
        ] }) },
      ] } },
      { title: "Modern techniques", order: 1, lessons: { create: [
        { title: "Transfer learning with pretrained models", type: "TEXT", order: 0, durationMinutes: 15, content: "Don't train from scratch when you don't have to. Pretrained models on ImageNet (ResNet, ViT) or text (BERT, GPT) have learned rich representations you can fine-tune on your data.\n\n```python\nfrom torchvision.models import resnet50, ResNet50_Weights\n\nmodel = resnet50(weights=ResNet50_Weights.DEFAULT)\n# Freeze all layers\nfor p in model.parameters():\n    p.requires_grad = False\n# Replace classifier head\nmodel.fc = nn.Linear(2048, num_classes)\n# Now only model.fc will be trained\n```" },
        { title: "Avoiding overfitting", type: "TEXT", order: 1, durationMinutes: 12, content: "A model that memorises training data is useless. Key techniques to generalise:\n\n- **Dropout** — randomly zeros out neurons during training: `nn.Dropout(p=0.3)`\n- **Weight decay** — penalises large weights: `torch.optim.Adam(params, weight_decay=1e-4)`\n- **Data augmentation** — artificially expand training data with flips, crops, colour jitter\n- **Early stopping** — stop when validation loss stops improving" },
      ] } },
    ] },
  });

  const awsCourse = await createCourse({
    title: "AWS Cloud Practitioner Essentials", level: "BEGINNER", creatorId: users.liam.id, providerName: "Liam Chen",
    description: "Understand what AWS is, what each core service does, and how to reason about cloud architecture — without drowning in acronyms. Perfect preparation for the AWS CLF-C02 exam.",
    skills: { create: [{ skillId: skills["AWS"].id }, { skillId: skills["Linux"].id }] },
    modules: { create: [
      { title: "Core AWS services", order: 0, lessons: { create: [
        { title: "EC2, S3, and RDS", type: "TEXT", order: 0, durationMinutes: 14, content: "Three services used in almost every AWS architecture:\n\n**EC2 (Elastic Compute Cloud)** — virtual machines you can size and start/stop on demand. You pay per second.\n\n**S3 (Simple Storage Service)** — object storage for files, images, backups, static websites. Extremely durable (11 nines). Pay per GB stored and per request.\n\n**RDS (Relational Database Service)** — managed PostgreSQL, MySQL, Aurora, etc. AWS handles backups, patches, and failover; you handle schema and queries." },
        { title: "IAM and security basics", type: "TEXT", order: 1, durationMinutes: 12, content: "IAM (Identity and Access Management) controls who can do what in your AWS account.\n\nKey concepts:\n- **Users** — people or services with long-lived credentials\n- **Roles** — temporary credentials assumed by EC2 instances, Lambda, or other services\n- **Policies** — JSON documents that allow or deny specific actions on specific resources\n\nGolden rule: **least privilege** — grant only the permissions something needs to do its job." },
        { title: "Lambda and serverless", type: "TEXT", order: 2, durationMinutes: 10, content: "Lambda runs your code in response to events — no server to provision or manage.\n\nPay only for actual execution time (billed in 1ms increments). Cold starts add latency for the first request after idle, but most event-driven workloads tolerate this.\n\nTypical uses: API backends, image processing, scheduled jobs, event-driven pipelines." },
        { title: "AWS Basics — Quiz", type: "QUIZ", order: 3, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "Which AWS service provides managed relational databases?", options: ["EC2", "S3", "RDS", "Lambda"], correctIndex: 2 },
          { question: "What IAM concept grants temporary credentials to an AWS service?", options: ["User", "Group", "Policy", "Role"], correctIndex: 3 },
        ] }) },
      ] } },
      { title: "Architecture & pricing", order: 1, lessons: { create: [
        { title: "The Well-Architected Framework", type: "TEXT", order: 0, durationMinutes: 12, content: "AWS's five pillars:\n1. **Operational Excellence** — run and monitor systems, improve processes\n2. **Security** — protect data and systems\n3. **Reliability** — recover from failures, meet demand\n4. **Performance Efficiency** — use resources efficiently\n5. **Cost Optimisation** — avoid unnecessary spend\n\nReview your architecture against these pillars with the Well-Architected Tool in the console." },
        { title: "Pricing models", type: "TEXT", order: 1, durationMinutes: 8, content: "AWS has three main pricing models:\n\n- **On-Demand** — pay per second with no commitment. Most flexible, most expensive.\n- **Reserved Instances** — commit to 1 or 3 years, save up to 72%.\n- **Spot Instances** — bid on spare capacity, save up to 90% — but AWS can reclaim with 2 min notice.\n\nFor predictable workloads: Reserved. For batch jobs that can be interrupted: Spot. For experiments: On-Demand." },
      ] } },
    ] },
  });

  const nodeCourse = await createCourse({
    title: "Node.js & Express API Development", level: "INTERMEDIATE", creatorId: users.liam.id, providerName: "Liam Chen",
    description: "Build production-grade REST APIs with Node.js and Express. Covers routing, middleware, PostgreSQL, authentication, and deployment to a cloud server.",
    skills: { create: [{ skillId: skills["Node.js"].id }, { skillId: skills["JavaScript"].id }, { skillId: skills["SQL"].id }] },
    modules: { create: [
      { title: "REST API design", order: 0, lessons: { create: [
        { title: "Express routing patterns", type: "TEXT", order: 0, durationMinutes: 12, content: "Express routes map HTTP methods + paths to handler functions.\n\n```javascript\nconst express = require('express');\nconst app = express();\napp.use(express.json());\n\napp.get('/users', async (req, res) => {\n  const users = await db.query('SELECT id, name FROM users');\n  res.json(users.rows);\n});\n\napp.post('/users', async (req, res) => {\n  const { name, email } = req.body;\n  const { rows } = await db.query(\n    'INSERT INTO users(name,email) VALUES($1,$2) RETURNING *',\n    [name, email]\n  );\n  res.status(201).json(rows[0]);\n});\n```" },
        { title: "Middleware and error handling", type: "TEXT", order: 1, durationMinutes: 12, content: "Middleware functions run before your route handlers — perfect for logging, auth, and validation.\n\n```javascript\n// Auth middleware\nfunction requireAuth(req, res, next) {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  try {\n    req.user = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch {\n    res.status(401).json({ error: 'Invalid token' });\n  }\n}\n\n// Error handler (must have 4 params)\napp.use((err, req, res, next) => {\n  console.error(err);\n  res.status(err.status ?? 500).json({ error: err.message });\n});\n```" },
        { title: "Authentication with JWT", type: "TEXT", order: 2, durationMinutes: 14, content: "JWT (JSON Web Token) is a compact way to represent a user's identity server-side.\n\n**Login flow:**\n1. User posts email + password\n2. Server verifies, creates JWT: `jwt.sign({ userId: user.id }, SECRET, { expiresIn: '7d' })`\n3. Client stores token, sends it in every request: `Authorization: Bearer <token>`\n4. Server verifies with middleware on protected routes\n\nNever store JWTs in localStorage on sensitive apps — use httpOnly cookies." },
        { title: "Node.js API — Quiz", type: "QUIZ", order: 3, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "What status code should a successful POST (resource created) return?", options: ["200", "201", "204", "301"], correctIndex: 1 },
          { question: "What is the purpose of Express middleware?", options: ["To render HTML templates", "To run code before route handlers", "To connect to databases", "To minify JavaScript"], correctIndex: 1 },
        ] }) },
      ] } },
    ] },
  });

  const figmaCourse = await createCourse({
    title: "Figma for Design Systems", level: "INTERMEDIATE", creatorId: users.ava.id, providerName: "Skillforge Academy",
    description: "Build scalable, maintainable design systems in Figma. Master Auto Layout, components, variables, and handoff workflows that engineering teams will actually use.",
    skills: { create: [{ skillId: skills["Figma"].id }, { skillId: skills["Product Design"].id }, { skillId: skills["UI/UX"].id }] },
    modules: { create: [
      { title: "Components & auto layout", order: 0, lessons: { create: [
        { title: "Auto Layout mastery", type: "TEXT", order: 0, durationMinutes: 14, content: "Auto Layout is the most important Figma feature. It makes frames behave like CSS flex containers — children stack horizontally or vertically, resize gracefully, and respect padding.\n\nKey settings:\n- Direction: horizontal / vertical\n- Gap between items (like `gap`)\n- Padding (like `padding`)\n- Hug contents / Fill container / Fixed width\n\nRule: if your design breaks when you change text length, you need Auto Layout." },
        { title: "Component variants", type: "TEXT", order: 1, durationMinutes: 14, content: "Variants let one component cover multiple states. Instead of a Button, a ButtonHover, a ButtonDisabled — you have one Button component with a State property.\n\nCreate variants:\n1. Select your component instances\n2. Right-click → Combine as Variants\n3. Name your properties (State: Default/Hover/Disabled, Size: SM/MD/LG)\n\nConsumers pick their variant from the panel. One source of truth for the whole system." },
      ] } },
      { title: "Design tokens & handoff", order: 1, lessons: { create: [
        { title: "Variables in Figma", type: "TEXT", order: 0, durationMinutes: 12, content: "Variables (formerly Tokens) store values that are referenced throughout your design — colours, spacing, radii, type sizes.\n\nBenefit: change one variable and every component that uses it updates instantly. Dark mode becomes a mode switch, not a redesign.\n\nCreate a variable: Local Variables panel → + → name it `color/primary/500` → assign #00C4A7" },
        { title: "Handoff to engineering", type: "TEXT", order: 1, durationMinutes: 10, content: "Good handoff means engineers never have to guess. Best practices:\n\n1. Export variables as a JSON token file (use Token Studio plugin)\n2. Name everything with purpose, not appearance: `color/brand/primary` not `teal-500`\n3. Use real copy in mockups, not lorem ipsum\n4. Mark which screens are flows, not just artboards\n5. Annotate edge cases and empty states\n\nEngineer's first question: 'What does this look like with 50 items?' — answer it in Figma before they ask." },
      ] } },
    ] },
  });

  const systemDesignCourse = await createCourse({
    title: "System Design for Software Engineers", level: "ADVANCED", creatorId: users.liam.id, providerName: "Liam Chen",
    description: "Learn to design large-scale distributed systems — the skill that separates mid-level from senior engineers. Covers scalability, reliability, databases, caching, messaging, and real-world case studies.",
    skills: { create: [{ skillId: skills["System Design"].id }, { skillId: skills["Microservices"].id }, { skillId: skills["AWS"].id }] },
    modules: { create: [
      { title: "Fundamentals", order: 0, lessons: { create: [
        { title: "Horizontal vs vertical scaling", type: "TEXT", order: 0, durationMinutes: 12, content: "**Vertical scaling** (scale up): add more CPU/RAM to existing servers. Simple, but has limits and creates a single point of failure.\n\n**Horizontal scaling** (scale out): add more servers. Requires your app to be stateless — no session stored locally, files on shared storage (S3), sessions in Redis.\n\nMost large systems combine both: vertically scale the database as long as possible, horizontally scale the application tier." },
        { title: "CAP theorem and consistency", type: "TEXT", order: 1, durationMinutes: 14, content: "CAP: a distributed system can only guarantee two of:\n- **Consistency** — every read returns the most recent write\n- **Availability** — every request gets a response\n- **Partition tolerance** — system works despite network failures\n\nIn practice, P is mandatory (networks do fail), so you choose between C and A.\n\n- CP systems (Zookeeper, HBase): correct data, may be unavailable during partitions\n- AP systems (DynamoDB, Cassandra): always available, may serve stale data" },
        { title: "Caching strategies", type: "TEXT", order: 2, durationMinutes: 12, content: "Cache where reads vastly outnumber writes and data changes predictably.\n\n**Write-through** — write to cache and DB simultaneously. Consistent but adds write latency.\n**Write-back** (write-behind) — write to cache, flush to DB asynchronously. Fast writes, risk of data loss.\n**Cache-aside** — app manages the cache: miss → load from DB → store in cache. Most common pattern.\n\nEviction policies: LRU (least recently used) is the safe default." },
      ] } },
      { title: "Real-world case studies", order: 1, lessons: { create: [
        { title: "Design a URL shortener", type: "TEXT", order: 0, durationMinutes: 18, content: "Classic system design interview question. Requirements: 100M URLs/day, 10:1 read:write ratio, URLs don't expire.\n\n**Estimations:**\n- Write: ~1200 URLs/sec\n- Read: ~12,000 redirects/sec\n- Storage: 100M × 365 days × 5 years × 500 bytes ≈ 91 TB\n\n**Core components:**\n1. Hash service generates 7-char codes (Base62 → 62^7 = 3.5T combinations)\n2. Write API: POST /shorten → store `{code, long_url, created_at}` in DB\n3. Redirect API: GET /{code} → cache lookup → DB lookup → 301 redirect\n4. Cache layer (Redis) for hot codes\n5. DB (Postgres) for persistence\n\n**Scaling:** read replicas for the DB, CDN edge nodes for popular URLs." },
        { title: "Rate limiting strategies", type: "TEXT", order: 1, durationMinutes: 12, content: "Rate limiting protects your API from abuse and keeps usage fair.\n\n**Token bucket** — each user has a bucket refilled at a fixed rate. Allows short bursts. Good for API quotas.\n**Sliding window counter** — count requests in a rolling time window. More accurate than fixed-window.\n\nImplementation: store counters in Redis with a TTL.\n\n```\nkey = f'rate:{user_id}:{current_minute}'\ncount = redis.incr(key)\nredis.expire(key, 60)\nif count > LIMIT:\n    return 429 Too Many Requests\n```" },
      ] } },
    ] },
  });

  const designCourse = await createCourse({
    title: "Product Design Foundations", level: "BEGINNER", creatorId: users.ava.id, providerName: "Skillforge Academy",
    description: "The fundamentals of product design: user research, wireframing, and how to defend your decisions in a critique.",
    skills: { create: [{ skillId: skills["Product Design"].id }, { skillId: skills["Figma"].id }, { skillId: skills["User Research"].id }] },
    modules: { create: [
      { title: "Starting with research", order: 0, lessons: { create: [
        { title: "Talking to users", type: "TEXT", order: 0, durationMinutes: 8, content: "The goal of a user interview isn't to validate your idea — it's to find out where you're wrong. Ask about past behaviour, not hypothetical future behaviour.\n\nBest opener: 'Tell me about the last time you tried to [do the thing your product does].' Then shut up and listen." },
        { title: "Synthesising notes into insights", type: "TEXT", order: 1, durationMinutes: 8, content: "Affinity mapping turns a pile of quotes into a handful of real themes. Write one observation per sticky. Group similar ones. Name the pattern, not just the topic.\n\n'Users struggle to cancel' is a topic. 'Users don't know cancellation is possible' is an insight." },
      ] } },
      { title: "From sketch to screen", order: 1, lessons: { create: [
        { title: "Low-fidelity wireframes", type: "TEXT", order: 0, durationMinutes: 10, content: "Stay ugly for as long as possible. Boxes and labels force the conversation onto structure instead of colour.\n\nIf someone says 'I don't like the blue' in a wireframe session, the wireframe has too much detail." },
        { title: "Product Design — Quiz", type: "QUIZ", order: 1, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "What's the main goal of a user interview?", options: ["Confirm your idea is good", "Find where your assumptions are wrong", "Sell the product", "Collect testimonials"], correctIndex: 1 },
          { question: "Why should wireframes be low-fidelity?", options: ["They are faster to make", "To focus discussion on structure not aesthetics", "Users can't read high-fidelity designs", "To save money"], correctIndex: 1 },
        ] }) },
      ] } },
    ] },
  });

  const marketingCourse = await createCourse({
    title: "Growth Marketing Essentials", level: "BEGINNER", creatorId: users.ava.id, providerName: "Skillforge Academy",
    description: "Practical SEO and content strategy for B2B teams that don't have a big budget. Learn what actually moves the needle vs. what sounds good in strategy docs.",
    skills: { create: [{ skillId: skills["Marketing"].id }, { skillId: skills["SEO"].id }, { skillId: skills["Content Strategy"].id }] },
    modules: { create: [
      { title: "SEO that actually works", order: 0, lessons: { create: [
        { title: "Keyword intent", type: "TEXT", order: 0, durationMinutes: 8, content: "Not all searches are equal. Someone searching 'what is CRM' wants education. Someone searching 'best CRM for small teams' is closer to buying.\n\nFour intent types:\n- **Informational** — want to learn (blog posts, guides)\n- **Navigational** — want a specific site (homepage, login page)\n- **Commercial** — comparing options (comparison pages, reviews)\n- **Transactional** — ready to buy (landing pages, pricing)\n\nWrite for the intent, not just the keyword." },
        { title: "On-page SEO checklist", type: "TEXT", order: 1, durationMinutes: 10, content: "For every page you publish:\n\n✅ Title tag: include primary keyword, under 60 chars\n✅ Meta description: compelling summary with CTA, under 155 chars\n✅ H1: one per page, matches search intent\n✅ Internal links: link to 2-3 relevant existing pages\n✅ Image alt text: describe the image (not keyword stuffing)\n✅ Page speed: under 3s on mobile (use PageSpeed Insights)\n✅ Canonical tag: avoid duplicate content issues" },
        { title: "Content distribution", type: "TEXT", order: 2, durationMinutes: 8, content: "Publishing is 20% of the work. Distribution is 80%.\n\nFor B2B content:\n1. LinkedIn: post a thread summarising key insights (not just a link)\n2. Newsletter: include a short excerpt in your next send\n3. Repurpose: turn a 2000-word guide into a Loom walkthrough\n4. Community: answer relevant questions on Slack groups with a link\n5. Email outreach: find 5 sites that would genuinely benefit from linking to this — don't spam" },
      ] } },
    ] },
  });

  const pmCourse = await createCourse({
    title: "Product Management Fundamentals", level: "BEGINNER", creatorId: users.ava.id, providerName: "Skillforge Academy",
    description: "Learn what product managers actually do, how to prioritise ruthlessly, write specs that engineering teams ship, and measure whether it worked.",
    skills: { create: [{ skillId: skills["Product Management"].id }, { skillId: skills["Agile"].id }, { skillId: skills["Scrum"].id }] },
    modules: { create: [
      { title: "The PM's core job", order: 0, lessons: { create: [
        { title: "What PMs actually do", type: "TEXT", order: 0, durationMinutes: 10, content: "The PM's job is to make sure the team builds the right thing. That means:\n\n1. **Discovery** — understanding the problem deeply before jumping to solutions\n2. **Prioritisation** — deciding what gets built next and what doesn't\n3. **Specification** — writing clear, unambiguous requirements\n4. **Delivery** — keeping the team unblocked and the roadmap on track\n5. **Measurement** — knowing whether the shipped feature worked\n\nPMs don't design, code, or manage people. They clear paths and make decisions." },
        { title: "Prioritisation frameworks", type: "TEXT", order: 1, durationMinutes: 12, content: "**RICE scoring** (Reach × Impact × Confidence / Effort) is the most useful framework for data-informed prioritisation.\n\n- **Reach** — how many users affected per quarter?\n- **Impact** — how much does it move the metric? (0.25=minimal, 3=massive)\n- **Confidence** — how sure are we? (50-100%)\n- **Effort** — person-months\n\nScore = R × I × C / E\n\nHigh score = ship it first. Low score = deprioritise or kill it." },
      ] } },
      { title: "Writing specs and measuring impact", order: 1, lessons: { create: [
        { title: "Writing a PRD that gets shipped", type: "TEXT", order: 0, durationMinutes: 12, content: "A Product Requirements Document (PRD) should answer:\n\n1. **Problem** — what user problem are we solving? What evidence do we have?\n2. **Goal** — what metric are we moving and by how much?\n3. **Non-goals** — what are we explicitly NOT doing? (This saves 30% of scope creep)\n4. **User stories** — 'As a [user], I want to [action] so that [outcome]'\n5. **Acceptance criteria** — checkboxes that define 'done'\n6. **Open questions** — unknowns that need resolving before engineering starts\n\nKeep it to 1-2 pages. Long PRDs don't get read." },
        { title: "Agile ceremonies in practice", type: "TEXT", order: 1, durationMinutes: 10, content: "Agile isn't a process, it's a mindset. The ceremonies are just structure:\n\n- **Sprint planning** — pick work for the next 2 weeks from the backlog; estimate effort\n- **Daily standup** — 3 questions: what did I do? what will I do? what's blocking me?\n- **Sprint review** — demo finished work to stakeholders; get feedback\n- **Retrospective** — what went well? what should we change? one action item each\n\nThe point isn't perfect ceremonies. It's shipping frequently and learning fast." },
        { title: "PM Fundamentals — Quiz", type: "QUIZ", order: 2, durationMinutes: 5, content: JSON.stringify({ questions: [
          { question: "What does the C in RICE scoring stand for?", options: ["Cost", "Confidence", "Conversion", "Complexity"], correctIndex: 1 },
          { question: "What is the primary purpose of a PRD's Non-goals section?", options: ["List rejected features", "Reduce scope creep by defining what's excluded", "Document technical constraints", "Track backlog items"], correctIndex: 1 },
        ] }) },
      ] } },
    ] },
  });

  // ── Connections ───────────────────────────────────────────────────
  async function connect(a: string, b: string, status: "ACCEPTED" | "PENDING" = "ACCEPTED") {
    await prisma.connection.upsert({
      where: { requesterId_addresseeId: { requesterId: a, addresseeId: b } },
      update: {}, create: { requesterId: a, addresseeId: b, status },
    });
  }
  await connect(users.alex.id, users.maria.id);
  await connect(users.alex.id, users.liam.id);
  await connect(users.alex.id, users.jordan.id);
  await connect(users.priya.id, users.sam.id);
  await connect(users.priya.id, users.nina.id);
  await connect(users.priya.id, users.riya.id);
  await connect(users.maria.id, users.liam.id);
  await connect(users.riya.id, users.david.id);
  await connect(users.liam.id, users.david.id);
  await connect(users.noah.id, users.maria.id, "PENDING");
  await connect(users.omar.id, users.alex.id, "PENDING");

  await prisma.follow.createMany({
    skipDuplicates: true,
    data: [
      { followerId: users.priya.id,  followeeId: users.ava.id },
      { followerId: users.noah.id,   followeeId: users.sam.id },
      { followerId: users.noah.id,   followeeId: users.liam.id },
      { followerId: users.omar.id,   followeeId: users.ava.id },
      { followerId: users.riya.id,   followeeId: users.sam.id },
    ],
  });

  // ── Posts, likes, comments ─────────────────────────────────────────
  const posts = await Promise.all([
    prisma.post.create({ data: { authorId: users.alex.id,   content: "Shipped a redesign of our scheduling flow this week — cut average booking time from 4 minutes to under 90 seconds. Small interactions add up. #ProductDesign #UX" } }),
    prisma.post.create({ data: { authorId: users.sam.id,    content: "Just published the Window Functions module in 'SQL for Data Analysis.' ROW_NUMBER, RANK, LAG — the things that turn good analysts into great ones. #SQL #DataAnalysis" } }),
    prisma.post.create({ data: { authorId: users.nina.id,   content: "Bluepeak Analytics is hiring a Data Analyst and a Marketing Manager. Referrals welcome — DM me. Both roles on our jobs page. #Hiring #Analytics" } }),
    prisma.post.create({ data: { authorId: users.maria.id,  content: "Hot take: most 'senior' React interviews test trivia, not judgment. Ask them to debug a real codebase instead. #React #Frontend #Interviews" } }),
    prisma.post.create({ data: { authorId: users.riya.id,   content: "Deployed our first RAG system to production this week. Latency is the unexpected challenge — embedding 500 docs takes 3s cold. Caching saves the day. #AI #MLOps #LLM" } }),
    prisma.post.create({ data: { authorId: users.david.id,  content: "New blog: 'Why we migrated from EKS to self-managed Kubernetes.' TLDR: cost and control. Happy to share the Terraform code. #Kubernetes #DevOps #CloudNine" } }),
    prisma.post.create({ data: { authorId: users.liam.id,   content: "Reminder: Node.js 22 is LTS now. If you're still on 18, the migration is smooth — and the performance improvements are real. #NodeJS #Backend" } }),
    prisma.post.create({ data: { authorId: users.priya.id,  content: "Finished the PyTorch course this week. Took 3 days of evenings. The training loop finally clicked. Thanks @sam! #MachineLearning #Python #Learning" } }),
    prisma.post.create({ data: { authorId: users.noah.id,   content: "6 months into my first dev job. Things I wish I knew: read the error message fully, git blame is your friend, ask questions earlier. #JuniorDev #Career" } }),
    prisma.post.create({ data: { authorId: users.ava.id,    content: "Just launched the 'System Design for Software Engineers' course on SkillWarehouse. URL shortener, rate limiting, database sharding — all with worked examples. #SystemDesign #Career" } }),
  ]);

  await prisma.like.createMany({
    skipDuplicates: true,
    data: [
      { postId: posts[0].id, userId: users.maria.id },
      { postId: posts[0].id, userId: users.liam.id },
      { postId: posts[0].id, userId: users.jordan.id },
      { postId: posts[1].id, userId: users.priya.id },
      { postId: posts[1].id, userId: users.noah.id },
      { postId: posts[2].id, userId: users.omar.id },
      { postId: posts[3].id, userId: users.alex.id },
      { postId: posts[3].id, userId: users.noah.id },
      { postId: posts[4].id, userId: users.liam.id },
      { postId: posts[4].id, userId: users.david.id },
      { postId: posts[4].id, userId: users.priya.id },
      { postId: posts[5].id, userId: users.liam.id },
      { postId: posts[5].id, userId: users.riya.id },
      { postId: posts[6].id, userId: users.maria.id },
      { postId: posts[6].id, userId: users.noah.id },
      { postId: posts[7].id, userId: users.sam.id },
      { postId: posts[8].id, userId: users.maria.id },
      { postId: posts[8].id, userId: users.liam.id },
      { postId: posts[9].id, userId: users.riya.id },
      { postId: posts[9].id, userId: users.david.id },
      { postId: posts[9].id, userId: users.priya.id },
    ],
  });

  await prisma.comment.createMany({
    skipDuplicates: true,
    data: [
      { postId: posts[0].id, userId: users.liam.id,  content: "90 seconds is wild — what was the biggest win?" },
      { postId: posts[0].id, userId: users.ava.id,   content: "Love the focus on interaction detail. Most teams skip this and wonder why conversion drops." },
      { postId: posts[1].id, userId: users.noah.id,  content: "Perfect timing, just hit that module." },
      { postId: posts[3].id, userId: users.liam.id,  content: "Ask them to debug a real (small) bug live instead." },
      { postId: posts[4].id, userId: users.sam.id,   content: "Curious about your caching strategy — Redis or in-memory?" },
      { postId: posts[4].id, userId: users.riya.id,  content: "@sam Redis with a 1-hour TTL per query. Works great." },
      { postId: posts[7].id, userId: users.sam.id,   content: "Glad it clicked! The backward pass is where it all comes together." },
      { postId: posts[8].id, userId: users.maria.id, content: "The 'ask questions earlier' one — this. I wasted 2 days on a problem someone could have answered in 5 mins." },
    ],
  });

  // ── Applications ──────────────────────────────────────────────────
  await prisma.application.createMany({
    skipDuplicates: true,
    data: [
      { jobId: dataJob.id,        applicantId: users.priya.id,  status: "SHORTLISTED", coverLetter: "I'd love to bring my retail analytics background to Bluepeak." },
      { jobId: frontendJob.id,    applicantId: users.maria.id,  status: "INTERVIEW" },
      { jobId: designJob.id,      applicantId: users.noah.id,   status: "APPLIED" },
      { jobId: mlJob.id,          applicantId: users.riya.id,   status: "INTERVIEW" },
      { jobId: devopsJob.id,      applicantId: users.david.id,  status: "OFFER" },
      { jobId: dataEngJob.id,     applicantId: users.priya.id,  status: "APPLIED" },
      { jobId: juniorDataJob.id,  applicantId: users.noah.id,   status: "APPLIED" },
      { jobId: growthJob.id,      applicantId: users.omar.id,   status: "SHORTLISTED" },
    ],
  });

  await prisma.savedJob.createMany({
    skipDuplicates: true,
    data: [
      { jobId: marketingJob.id, userId: users.omar.id },
      { jobId: frontendJob.id,  userId: users.noah.id },
      { jobId: mlJob.id,        userId: users.priya.id },
      { jobId: nextjsCourse.id ? devopsJob.id : devopsJob.id, userId: users.liam.id },
      { jobId: aiResearchJob.id, userId: users.riya.id },
    ],
  });

  // ── Enrollments, progress, certificates ───────────────────────────
  // Priya: SQL in progress, Python enrolled
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: sqlCourse.id, userId: users.priya.id } }, update: {}, create: { courseId: sqlCourse.id, userId: users.priya.id, progressPercent: 60, lastAccessedAt: new Date() } });
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: pythonCourse.id, userId: users.priya.id } }, update: {}, create: { courseId: pythonCourse.id, userId: users.priya.id, progressPercent: 30, lastAccessedAt: new Date() } });

  // Liam: React complete (with cert), Node enrolled, System Design enrolled
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: reactCourse.id, userId: users.liam.id } }, update: {}, create: { courseId: reactCourse.id, userId: users.liam.id, progressPercent: 100, lastAccessedAt: new Date(), completedAt: new Date() } });
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: nodeCourse.id, userId: users.liam.id } }, update: {}, create: { courseId: nodeCourse.id, userId: users.liam.id, progressPercent: 50, lastAccessedAt: new Date() } });
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: awsCourse.id, userId: users.liam.id } }, update: {}, create: { courseId: awsCourse.id, userId: users.liam.id, progressPercent: 80, lastAccessedAt: new Date() } });
  await prisma.certificate.upsert({ where: { userId_courseId: { userId: users.liam.id, courseId: reactCourse.id } }, update: {}, create: { userId: users.liam.id, courseId: reactCourse.id, courseName: reactCourse.title } });

  // Alex: Design complete (with cert), Figma enrolled
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: designCourse.id, userId: users.alex.id } }, update: {}, create: { courseId: designCourse.id, userId: users.alex.id, progressPercent: 100, lastAccessedAt: new Date(), completedAt: new Date() } });
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: figmaCourse.id, userId: users.alex.id } }, update: {}, create: { courseId: figmaCourse.id, userId: users.alex.id, progressPercent: 40, lastAccessedAt: new Date() } });
  await prisma.certificate.upsert({ where: { userId_courseId: { userId: users.alex.id, courseId: designCourse.id } }, update: {}, create: { userId: users.alex.id, courseId: designCourse.id, courseName: designCourse.title } });

  // Riya: ML complete (with cert), Next.js enrolled
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: mlCourse.id, userId: users.riya.id } }, update: {}, create: { courseId: mlCourse.id, userId: users.riya.id, progressPercent: 100, lastAccessedAt: new Date(), completedAt: new Date() } });
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: nextjsCourse.id, userId: users.riya.id } }, update: {}, create: { courseId: nextjsCourse.id, userId: users.riya.id, progressPercent: 20, lastAccessedAt: new Date() } });
  await prisma.certificate.upsert({ where: { userId_courseId: { userId: users.riya.id, courseId: mlCourse.id } }, update: {}, create: { userId: users.riya.id, courseId: mlCourse.id, courseName: mlCourse.title } });

  // David: Docker complete (with cert), System Design enrolled
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: dockerCourse.id, userId: users.david.id } }, update: {}, create: { courseId: dockerCourse.id, userId: users.david.id, progressPercent: 100, lastAccessedAt: new Date(), completedAt: new Date() } });
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: systemDesignCourse.id, userId: users.david.id } }, update: {}, create: { courseId: systemDesignCourse.id, userId: users.david.id, progressPercent: 60, lastAccessedAt: new Date() } });
  await prisma.certificate.upsert({ where: { userId_courseId: { userId: users.david.id, courseId: dockerCourse.id } }, update: {}, create: { userId: users.david.id, courseId: dockerCourse.id, courseName: dockerCourse.title } });

  // Noah: SQL enrolled, Growth Marketing enrolled
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: sqlCourse.id, userId: users.noah.id } }, update: {}, create: { courseId: sqlCourse.id, userId: users.noah.id, progressPercent: 15, lastAccessedAt: new Date() } });
  await prisma.enrollment.upsert({ where: { courseId_userId: { courseId: marketingCourse.id, userId: users.omar.id } }, update: {}, create: { courseId: marketingCourse.id, userId: users.omar.id, progressPercent: 70, lastAccessedAt: new Date() } });

  // ── Reviews ───────────────────────────────────────────────────────
  await prisma.courseReview.createMany({
    skipDuplicates: true,
    data: [
      { courseId: reactCourse.id,       userId: users.liam.id,  rating: 5, comment: "Exactly the right depth — no wasted time. The custom hooks section saved me days at work." },
      { courseId: designCourse.id,      userId: users.alex.id,  rating: 4, comment: "Great refresher on research fundamentals. The affinity mapping module was excellent." },
      { courseId: mlCourse.id,          userId: users.riya.id,  rating: 5, comment: "Best PyTorch course I've found. The training loop explanation finally made autograd click." },
      { courseId: dockerCourse.id,      userId: users.david.id, rating: 5, comment: "Comprehensive and practical. Used the Kubernetes YAML examples directly in our staging cluster." },
      { courseId: sqlCourse.id,         userId: users.priya.id, rating: 5, comment: "Would have saved me months if I'd found this when starting out. The window functions module is gold." },
      { courseId: nodeCourse.id,        userId: users.liam.id,  rating: 4, comment: "Solid JWT auth implementation. Wish it covered refresh tokens too." },
      { courseId: figmaCourse.id,       userId: users.alex.id,  rating: 5, comment: "The Variables section changed how I build design systems. Handoff to engineering is so much smoother." },
      { courseId: awsCourse.id,         userId: users.liam.id,  rating: 4, comment: "Perfect exam prep. Passed CLF-C02 on first attempt after this course." },
      { courseId: systemDesignCourse.id,userId: users.david.id, rating: 5, comment: "The URL shortener walkthrough is the best system design explanation I've read." },
      { courseId: pythonCourse.id,      userId: users.priya.id, rating: 4, comment: "Great intro. The Pandas groupby examples are real-world and immediately useful." },
    ],
  });

  console.log("✅  Seed complete.");
  console.log("Demo accounts (all use password123):");
  console.log("  alex@atlas.dev    — Product Designer");
  console.log("  priya@atlas.dev   — Data Analyst");
  console.log("  jordan@atlas.dev  — Recruiter (Northwind)");
  console.log("  sam@atlas.dev     — Training provider");
  console.log("  maria@atlas.dev   — Frontend Engineer");
  console.log("  liam@atlas.dev    — Backend Engineer");
  console.log("  nina@atlas.dev    — Recruiter (Bluepeak)");
  console.log("  riya@atlas.dev    — ML Engineer");
  console.log("  david@atlas.dev   — DevOps Engineer");
  console.log("  omar@atlas.dev    — Marketing Manager");
  console.log("  ava@atlas.dev     — Training provider");
  console.log("  noah@atlas.dev    — Junior Developer");
  console.log("Admin: admin@atlas.dev / Admin@123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
