import { prisma } from "@/lib/prisma";

// Domain → primary skills used for DB search
export const DOMAIN_SKILLS: Record<string, string[]> = {
  frontend:       ["React", "Next.js", "TypeScript", "Vue", "Angular", "JavaScript", "CSS"],
  backend:        ["Node.js", "Python", "Java", "Spring Boot", "FastAPI", "Express", "Go"],
  fullstack:      ["React", "Node.js", "TypeScript", "PostgreSQL", "REST API"],
  "data science": ["Python", "Machine Learning", "SQL", "Pandas", "TensorFlow", "NumPy"],
  devops:         ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux", "Helm"],
  mobile:         ["React Native", "Flutter", "Swift", "Kotlin", "Android", "iOS"],
  "ai/ml":        ["Python", "Machine Learning", "TensorFlow", "PyTorch", "LLM", "NLP"],
  design:         ["Figma", "UI/UX", "Prototyping", "Adobe XD", "User Research"],
  product:        ["Product Management", "Agile", "Scrum", "Analytics", "Roadmapping"],
  cloud:          ["AWS", "Azure", "GCP", "Kubernetes", "Terraform", "Serverless"],
  cybersecurity:  ["Network Security", "Linux", "Python", "Penetration Testing", "OWASP"],
};

// What experienced professionals should learn next per skill
export const NEXT_SKILLS: Record<string, string[]> = {
  "React":            ["Next.js 15", "TypeScript", "Zustand", "Testing Library", "Server Components"],
  "Node.js":          ["TypeScript", "GraphQL", "Redis", "Microservices", "gRPC"],
  "Python":           ["FastAPI", "LangChain", "MLOps", "Celery", "Pydantic v2"],
  "Java":             ["Spring Boot 3", "Kafka", "Kubernetes", "Reactive Programming", "GraalVM"],
  "JavaScript":       ["TypeScript", "React", "Node.js", "Vite", "Web Workers"],
  "SQL":              ["PostgreSQL Advanced", "dbt", "Query Optimization", "Data Modeling", "Analytical Functions"],
  "Docker":           ["Kubernetes", "Helm", "GitOps", "ArgoCD", "Terraform"],
  "AWS":              ["Terraform", "CDK", "Lambda", "ECS/EKS", "Well-Architected Framework"],
  "Machine Learning": ["MLOps", "LLM Fine-tuning", "Vector Databases", "LangChain", "Feature Stores"],
  "Figma":            ["Design Systems", "Motion Design", "User Research", "Framer", "Accessibility"],
  "TypeScript":       ["Advanced Generics", "Monorepo (Turborepo)", "Zod", "tRPC", "Type-level Programming"],
  "Android":          ["Jetpack Compose", "Kotlin Coroutines", "Clean Architecture", "Multiplatform"],
  "iOS":              ["SwiftUI", "Combine", "Core Data", "ARKit", "Swift Concurrency"],
  "PostgreSQL":       ["pgvector", "Partitioning", "Replication", "TimescaleDB", "PL/pgSQL"],
  "Next.js":          ["App Router Patterns", "Server Actions", "Edge Runtime", "ISR", "Partial Prerendering"],
};

// 5-step career roadmaps per domain
export const CAREER_ROADMAPS: Record<string, { step: string; skills: string[] }[]> = {
  frontend: [
    { step: "HTML & CSS fundamentals",  skills: ["HTML5", "CSS3", "Flexbox", "Grid", "Responsive Design"] },
    { step: "JavaScript essentials",    skills: ["ES6+", "DOM", "Fetch API", "Promises", "Modules"] },
    { step: "React & ecosystem",        skills: ["React", "TypeScript", "React Router", "State Management"] },
    { step: "Production skills",        skills: ["Next.js", "Testing", "Web Vitals", "Accessibility", "CI/CD"] },
    { step: "Senior-level",            skills: ["System Design", "Architecture", "Mentoring", "Open Source"] },
  ],
  backend: [
    { step: "Language foundation",      skills: ["Python or Node.js", "OOP", "Data Structures", "Algorithms"] },
    { step: "Databases & storage",      skills: ["PostgreSQL", "SQL", "Redis", "Indexing", "Transactions"] },
    { step: "API & auth",               skills: ["REST", "GraphQL", "JWT", "OAuth", "API Design"] },
    { step: "Infrastructure",           skills: ["Docker", "Linux", "AWS basics", "Monitoring", "Logging"] },
    { step: "Scale & architecture",     skills: ["Microservices", "Kafka", "CQRS", "System Design"] },
  ],
  fullstack: [
    { step: "Frontend basics",          skills: ["HTML", "CSS", "JavaScript", "TypeScript"] },
    { step: "React + Backend",          skills: ["React", "Node.js", "Express", "PostgreSQL"] },
    { step: "Full-stack framework",     skills: ["Next.js", "Prisma", "Authentication", "File uploads"] },
    { step: "Cloud & DevOps",           skills: ["Docker", "AWS", "CI/CD", "Environment management"] },
    { step: "Architect-level",          skills: ["System Design", "Performance", "Security", "Team Lead"] },
  ],
  "data science": [
    { step: "Python & stats",           skills: ["Python", "NumPy", "Pandas", "Matplotlib", "Statistics"] },
    { step: "Machine learning",         skills: ["Scikit-learn", "Feature Engineering", "Model Evaluation"] },
    { step: "Deep learning",            skills: ["TensorFlow", "PyTorch", "Neural Networks", "CV/NLP"] },
    { step: "MLOps & deployment",       skills: ["MLflow", "Docker", "Model Serving", "Monitoring"] },
    { step: "Specialization",           skills: ["LLMs", "RAG", "Recommendation Systems", "Time Series"] },
  ],
  devops: [
    { step: "Linux & scripting",        skills: ["Linux", "Bash", "Python", "Networking basics"] },
    { step: "Containers",               skills: ["Docker", "Docker Compose", "Container registries"] },
    { step: "Kubernetes",               skills: ["K8s", "Helm", "kubectl", "Operators", "RBAC"] },
    { step: "Cloud & IaC",             skills: ["AWS/GCP/Azure", "Terraform", "Ansible", "CDK"] },
    { step: "Platform engineering",     skills: ["GitOps", "ArgoCD", "Observability", "SRE practices"] },
  ],
  "ai/ml": [
    { step: "Math & Python",            skills: ["Linear Algebra", "Calculus", "Python", "NumPy"] },
    { step: "Classical ML",             skills: ["Scikit-learn", "Feature Engineering", "Evaluation metrics"] },
    { step: "Deep learning",            skills: ["PyTorch", "Transformers", "Fine-tuning", "Hugging Face"] },
    { step: "LLMs & Agents",           skills: ["LangChain", "RAG", "Vector DBs", "Prompt Engineering"] },
    { step: "Production AI",            skills: ["MLOps", "Model monitoring", "Guardrails", "Evals"] },
  ],
};

// Detect domain from free text when user types instead of selecting
export function detectDomain(text: string): string {
  const lower = text.toLowerCase();
  let best = "fullstack";
  let bestScore = 0;

  for (const [domain, skills] of Object.entries(DOMAIN_SKILLS)) {
    const skillHits = skills.filter((s) => lower.includes(s.toLowerCase())).length;
    const domainHit = lower.includes(domain) ? 3 : 0;
    const score = skillHits + domainHit;
    if (score > bestScore) {
      bestScore = score;
      best = domain;
    }
  }
  return best;
}

export type RecResult = {
  jobs: any[];
  courses: any[];
  matchedSkills: string[];
  domain: string;
  roadmap: { step: string; skills: string[] }[];
  nextSkills: Record<string, string[]>; // for professionals
};

export async function getRecommendations(
  input: string,
  domain: string,
  userType: "student" | "professional",
  userSkills: string[] = []
): Promise<RecResult> {
  const effectiveDomain =
    domain !== "auto" ? domain : detectDomain(input);

  const domainSkills = DOMAIN_SKILLS[effectiveDomain] ?? DOMAIN_SKILLS["fullstack"];
  const searchSkills =
    userType === "professional" && userSkills.length > 0
      ? userSkills
      : domainSkills;

  const skillFilters = searchSkills.slice(0, 6).map((s) => ({
    skills: {
      some: { skill: { name: { contains: s, mode: "insensitive" as const } } },
    },
  }));

  const textFilters =
    input.trim().length > 2
      ? [
          { title: { contains: input, mode: "insensitive" as const } },
          { description: { contains: input, mode: "insensitive" as const } },
        ]
      : [];

  const expLevels =
    userType === "student"
      ? { in: ["ENTRY", "MID"] }
      : { in: ["MID", "SENIOR", "LEAD"] };

  const courseLevel =
    userType === "student" ? "BEGINNER" : undefined;
  const courseLevels =
    userType === "professional"
      ? { in: ["INTERMEDIATE", "ADVANCED"] }
      : undefined;

  const [jobs, courses] = await Promise.all([
    prisma.job.findMany({
      where: {
        status: "OPEN",
        experienceLevel: expLevels,
        OR: skillFilters.length ? [...skillFilters, ...textFilters] : undefined,
      },
      include: {
        company: { select: { id: true, name: true, logoUrl: true, slug: true } },
        skills:  { include: { skill: true } },
        _count:  { select: { applications: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
    prisma.course.findMany({
      where: {
        published: true,
        level: courseLevel ?? courseLevels,
        OR: [...skillFilters, ...textFilters].length
          ? [...skillFilters, ...textFilters]
          : undefined,
      },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        skills:  { include: { skill: true } },
        _count:  { select: { enrollments: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  // Build skill gap map for professionals
  const nextSkills: Record<string, string[]> = {};
  for (const skill of userSkills) {
    const match = Object.keys(NEXT_SKILLS).find(
      (k) => k.toLowerCase() === skill.toLowerCase()
    );
    if (match) nextSkills[match] = NEXT_SKILLS[match];
  }

  return {
    jobs,
    courses: courses.map((c) => ({
      ...c,
      avgRating: c.reviews.length
        ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
        : null,
      reviews: undefined,
    })),
    matchedSkills: domainSkills.slice(0, 6),
    domain: effectiveDomain,
    roadmap: CAREER_ROADMAPS[effectiveDomain] ?? CAREER_ROADMAPS["fullstack"],
    nextSkills,
  };
}
