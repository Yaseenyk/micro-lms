/**
 * Course service (Logic layer — docs/04 §6-7). Owns the access decision and
 * progress writes. Authorization (entitlement + ownership) lives HERE, not in
 * the handler (docs/01 §2.2).
 */
import type { CourseProgressDomain } from "../domain/types.js";
import { userRepository } from "../repositories/user.repository.js";
import { courseProgressRepository } from "../repositories/course-progress.repository.js";
import { getCatalogCourse } from "../config/catalog.js";
import { AppError } from "../lib/app-error.js";

export const courseService = {
  async checkAccess(
    userId: string,
    courseId: string,
  ): Promise<{ access: boolean; progress: CourseProgressDomain | null }> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("UNAUTHENTICATED", "User not found");
    if (!user.entitlements.includes(courseId)) return { access: false, progress: null };
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
    if (!user.entitlements.includes(input.courseId)) {
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
};
