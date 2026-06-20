// SQLite has no native enum support, so every "enum" in the schema is a
// plain String column. These arrays are the single source of truth for
// what values are valid — used in zod validation and in <select> options.

export const ROLES = ["MEMBER", "RECRUITER", "PROVIDER", "ADMIN"] as const;
export type UserRole = (typeof ROLES)[number];

export const VISIBILITY = ["PUBLIC", "CONNECTIONS", "PRIVATE"] as const;
export type ProfileVisibility = (typeof VISIBILITY)[number];

export const CONNECTION_STATUS = ["PENDING", "ACCEPTED", "REJECTED"] as const;

export const WORK_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as const;
export type WorkType = (typeof WORK_TYPES)[number];

export const EXPERIENCE_LEVELS = ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const JOB_STATUS = ["OPEN", "CLOSED", "DRAFT"] as const;
export type JobStatus = (typeof JOB_STATUS)[number];

export const APPLICATION_STATUS = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];

export const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const LESSON_TYPES = ["TEXT", "VIDEO", "DOCUMENT", "QUIZ"] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

export const WORK_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  ENTRY: "Entry level",
  MID: "Mid level",
  SENIOR: "Senior",
  LEAD: "Lead",
  EXECUTIVE: "Executive",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export const APPLICATION_PIPELINE: ApplicationStatus[] = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
];

export const COURSE_LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  CONNECTION_REQUEST: "Connection request",
  CONNECTION_ACCEPTED: "Connection accepted",
  POST_LIKE: "Post like",
  POST_COMMENT: "Post comment",
  JOB_MATCH: "Job match",
  APPLICATION_UPDATE: "Application update",
  COURSE_UPDATE: "Course update",
  MESSAGE: "New message",
};
