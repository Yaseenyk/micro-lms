/**
 * Course Data service (docs/01 §1.3). The only bridge between course Logic and
 * the network. It calls the api-client and runs every payload through the
 * client Serialization Adapter, so hooks receive domain objects and never the
 * raw wire shape (docs/04 §6–7).
 */
import { apiClient } from "@/lib/api-client";
import {
  courseProgressAdapter,
  type CourseAccess,
  type CourseProgress,
  type ProgressUpdate,
  type WireAccess,
  type WireProgress,
} from "@/lib/adapters/course-progress.adapter";
import type { LessonContent } from "../content.types";

export const courseService = {
  async getAccess(courseId: string): Promise<CourseAccess> {
    const wire = await apiClient.post<WireAccess>("/course/access", { courseId });
    return courseProgressAdapter.toAccess(wire);
  },

  async saveProgress(update: ProgressUpdate): Promise<CourseProgress | null> {
    const body = courseProgressAdapter.toLeanBody(update);
    const wire = await apiClient.patch<WireProgress>("/course/progress", body);
    return courseProgressAdapter.toDomain(wire);
  },

  /** Fetch a lesson's textual + SVG content (docs/04 §7b). Entitlement-gated. */
  getLesson(courseId: string, lessonId: string): Promise<LessonContent> {
    return apiClient.post<LessonContent>("/course/lesson", { courseId, lessonId });
  },

  /**
   * DEV ONLY: grant entitlement without paying (bypasses Razorpay). Hits the
   * dev-only API route that exists only outside production; in a production
   * build this is never called (the caller is gated on NODE_ENV).
   */
  async devUnlock(courseId: string): Promise<void> {
    await apiClient.post<{ granted: boolean }>("/dev/grant", { courseId });
  },
};
