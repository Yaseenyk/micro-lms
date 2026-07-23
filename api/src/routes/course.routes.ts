/**
 * Course routes (Presentation — docs/04 §6-7). Access + progress. Both are
 * protected; the response is shaped to the exact contract (no watchedSec /
 * internal fields leak). Authorization is decided in the service.
 */
import { Router } from "express";
import { z } from "zod";
import { courseService } from "../services/course.service.js";
import type { CourseProgressDomain } from "../domain/types.js";
import { sendOk } from "../lib/http.js";
import { getAuth, requireAuth } from "../middleware/require-auth.js";

export const courseRouter = Router();

/** Response adapter (docs/04 §6): expose only the contracted progress fields. */
function toProgressResponse(p: CourseProgressDomain) {
  const lessons: Record<string, { completed: boolean; lastPositionSec: number }> = {};
  for (const [id, lp] of Object.entries(p.lessons)) {
    lessons[id] = { completed: lp.completed, lastPositionSec: lp.lastPositionSec };
  }
  return {
    progressPercent: p.progressPercent,
    isComplete: p.isComplete,
    lastActiveAt: p.lastActiveAt,
    lessons,
  };
}

const accessSchema = z.object({ courseId: z.string().min(1) });
courseRouter.post("/course/access", requireAuth, async (req, res, next) => {
  try {
    const { courseId } = accessSchema.parse(req.body);
    const { userId } = getAuth(req);
    const result = await courseService.checkAccess(userId, courseId);
    sendOk(res, {
      courseId,
      access: result.access,
      progress: result.progress ? toProgressResponse(result.progress) : null,
    });
  } catch (err) {
    next(err);
  }
});

const lessonSchema = z.object({ courseId: z.string().min(1), lessonId: z.string().min(1) });
courseRouter.post("/course/lesson", requireAuth, async (req, res, next) => {
  try {
    const { courseId, lessonId } = lessonSchema.parse(req.body);
    const { userId } = getAuth(req);
    const content = await courseService.getLesson(userId, courseId, lessonId);
    sendOk(res, content); // { courseId, lessonId, title, minutes, blocks }
  } catch (err) {
    next(err);
  }
});

const progressSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  completed: z.boolean(),
  lastPositionSec: z.number().int().nonnegative(),
  watchedSec: z.number().int().nonnegative(),
});
courseRouter.patch("/course/progress", requireAuth, async (req, res, next) => {
  try {
    const input = progressSchema.parse(req.body);
    const { userId } = getAuth(req);
    const progress = await courseService.updateProgress(userId, input);
    sendOk(res, { courseId: input.courseId, access: true, progress: toProgressResponse(progress) });
  } catch (err) {
    next(err);
  }
});
