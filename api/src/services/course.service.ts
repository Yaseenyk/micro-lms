/**
 * Course service (Logic layer — docs/04 §6-7). Owns the access decision and
 * progress writes. Authorization (entitlement + ownership) lives HERE, not in
 * the handler (docs/01 §2.2).
 */
import type { CourseProgressDomain, LessonContentDomain } from "../domain/types.js";
import { userRepository } from "../repositories/user.repository.js";
import { courseProgressRepository } from "../repositories/course-progress.repository.js";
import { courseContentRepository } from "../repositories/course-content.repository.js";
import { getCatalogCourse } from "../config/catalog.js";
import { isFreeAccess } from "../config/env.js";
import { AppError } from "../lib/app-error.js";

/**
 * The single entitlement decision (docs/04 §0a). In free-access mode every
 * catalog course is open to any signed-in user; otherwise access is granted
 * only by the verified payment webhook writing `users.entitlements`.
 */
function isEntitled(entitlements: string[], courseId: string): boolean {
  if (isFreeAccess) return getCatalogCourse(courseId) !== null;
  return entitlements.includes(courseId);
}

export const courseService = {
  async checkAccess(
    userId: string,
    courseId: string,
  ): Promise<{ access: boolean; progress: CourseProgressDomain | null }> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("UNAUTHENTICATED", "User not found");
    if (!isEntitled(user.entitlements, courseId)) return { access: false, progress: null };
    const progress = await courseProgressRepository.get(userId, courseId);
    return { access: true, progress };
  },

  async updateProgress(
    userId: string,
    input: {
      courseId: string;
      lessonId: string;
      completed: boolean;
      lastPositionSec: number;
      watchedSec: number;
    },
  ): Promise<CourseProgressDomain> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("UNAUTHENTICATED", "User not found");
    // Ownership: a user may only write progress for a course they own.
    if (!isEntitled(user.entitlements, input.courseId)) {
      throw new AppError("NOT_FOUND", "No access to this course");
    }
    const course = getCatalogCourse(input.courseId);
    if (!course) throw new AppError("NOT_FOUND", "Unknown course");

    return courseProgressRepository.upsertLesson({
      userId,
      courseId: input.courseId,
      totalLessons: course.totalLessons,
      lessonId: input.lessonId,
      lesson: {
        completed: input.completed,
        lastPositionSec: input.lastPositionSec,
        watchedSec: input.watchedSec,
      },
    });
  },

  /** Lesson content (docs/04 §7b). Entitlement-gated — no access is not leaked. */
  async getLesson(
    userId: string,
    courseId: string,
    lessonId: string,
  ): Promise<LessonContentDomain> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("UNAUTHENTICATED", "User not found");
    if (!isEntitled(user.entitlements, courseId)) {
      throw new AppError("NOT_FOUND", "No access to this course");
    }
    const content = await courseContentRepository.get(courseId, lessonId);
    if (!content) throw new AppError("NOT_FOUND", "Lesson not found");
    return content;
  },
};
