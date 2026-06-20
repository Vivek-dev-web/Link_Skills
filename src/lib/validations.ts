import { z } from "zod";
import {
  WORK_TYPES,
  EXPERIENCE_LEVELS,
  COURSE_LEVELS,
  LESSON_TYPES,
  VISIBILITY,
  APPLICATION_STATUS,
} from "@/lib/constants";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["MEMBER", "RECRUITER", "PROVIDER"]).default("MEMBER"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  headline: z.string().max(200).optional().nullable(),
  about: z.string().max(3000).optional().nullable(),
  location: z.string().max(150).optional().nullable(),
  currentRole: z.string().max(150).optional().nullable(),
  currentCompany: z.string().max(150).optional().nullable(),
  visibility: z.enum(VISIBILITY).optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(1).max(150),
  company: z.string().min(1).max(150),
  location: z.string().max(150).optional().nullable(),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  current: z.boolean().optional().default(false),
  description: z.string().max(3000).optional().nullable(),
});

export const educationSchema = z.object({
  school: z.string().min(1).max(150),
  degree: z.string().max(150).optional().nullable(),
  field: z.string().max(150).optional().nullable(),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export const postSchema = z.object({
  content: z.string().min(1, "Say something first").max(5000),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
  documentUrl: z.string().optional().nullable(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const jobSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().min(2).max(150),
  description: z.string().min(10).max(8000),
  requirements: z.string().max(4000).optional().nullable(),
  location: z.string().min(1).max(150),
  workType: z.enum(WORK_TYPES).default("FULL_TIME"),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).default("MID"),
  salaryMin: z.number().int().nonnegative().optional().nullable(),
  salaryMax: z.number().int().nonnegative().optional().nullable(),
  remote: z.boolean().optional().default(false),
  status: z.enum(["OPEN", "CLOSED", "DRAFT"]).optional().default("OPEN"),
  skills: z.array(z.string()).optional().default([]),
});

export const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUS),
});

export const courseSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().min(10).max(5000),
  providerName: z.string().max(150).optional().nullable(),
  level: z.enum(COURSE_LEVELS).default("BEGINNER"),
  imageUrl: z.string().optional().nullable(),
  published: z.boolean().optional().default(true),
  skills: z.array(z.string()).optional().default([]),
  modules: z
    .array(
      z.object({
        title: z.string().min(1).max(150),
        order: z.number().int(),
        lessons: z.array(
          z.object({
            title: z.string().min(1).max(150),
            type: z.enum(LESSON_TYPES).default("TEXT"),
            content: z.string().min(1),
            order: z.number().int(),
            durationMinutes: z.number().int().nonnegative().default(5),
          })
        ),
      })
    )
    .optional()
    .default([]),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
});

export const companySchema = z.object({
  name: z.string().min(2).max(150),
  about: z.string().max(3000).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  industry: z.string().max(150).optional().nullable(),
  size: z.string().max(50).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
});

export const messageSchema = z.object({
  content: z.string().min(1).max(4000),
});

export const notificationPrefsSchema = z.object({
  connectionsEmail: z.boolean(),
  connectionsInApp: z.boolean(),
  engagementEmail: z.boolean(),
  engagementInApp: z.boolean(),
  jobsEmail: z.boolean(),
  jobsInApp: z.boolean(),
  coursesEmail: z.boolean(),
  coursesInApp: z.boolean(),
  messagesEmail: z.boolean(),
  messagesInApp: z.boolean(),
});
