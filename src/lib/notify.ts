import { prisma } from "@/lib/prisma";

interface CreateNotificationInput {
  userId: string;
  type:
    | "CONNECTION_REQUEST"
    | "CONNECTION_ACCEPTED"
    | "POST_LIKE"
    | "POST_COMMENT"
    | "JOB_MATCH"
    | "APPLICATION_UPDATE"
    | "COURSE_UPDATE"
    | "MESSAGE";
  message: string;
  link?: string;
}

/** Creates an in-app notification, respecting the user's preferences. */
export async function notify({ userId, type, message, link }: CreateNotificationInput) {
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });

  const categoryEnabled = (() => {
    if (!prefs) return true; // default on if prefs row doesn't exist yet
    switch (type) {
      case "CONNECTION_REQUEST":
      case "CONNECTION_ACCEPTED":
        return prefs.connectionsInApp;
      case "POST_LIKE":
      case "POST_COMMENT":
        return prefs.engagementInApp;
      case "JOB_MATCH":
      case "APPLICATION_UPDATE":
        return prefs.jobsInApp;
      case "COURSE_UPDATE":
        return prefs.coursesInApp;
      case "MESSAGE":
        return prefs.messagesInApp;
      default:
        return true;
    }
  })();

  if (!categoryEnabled) return null;

  return prisma.notification.create({
    data: { userId, type, message, link },
  });
}
