/**
 * Client-side Serialization Adapter (docs/01 §1.3, docs/02).
 *
 * The API already returns a *rich* progress payload (docs/04 §6) and accepts a
 * *lean* progress update (docs/04 §7). This adapter is the client's mirror of
 * that contract: it turns the wire payload into a comfortable UI domain object,
 * and turns a UI-level progress event into the exact lean body the API expects —
 * stripping anything derived (percent, completeness) that the server recomputes.
 *
 * Presentation and hooks work with `CourseProgress`; only this module knows the
 * wire shapes.
 */

// --- wire shapes (must match docs/04) --------------------------------------
export interface WireLesson {
  completed: boolean;
  lastPositionSec: number;
}
export interface WireProgress {
  progressPercent: number;
  isComplete: boolean;
  lastActiveAt: string; // ISO
  lessons: Record<string, WireLesson>;
}
export interface WireAccess {
  courseId: string;
  access: boolean;
  progress: WireProgress | null;
}

// --- client domain ---------------------------------------------------------
export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  lastPositionSec: number;
}
export interface CourseProgress {
  progressPercent: number;
  isComplete: boolean;
  lastActiveAt: Date | null;
  lessons: LessonProgress[];
}
export interface CourseAccess {
  courseId: string;
  access: boolean;
  progress: CourseProgress | null;
}

/** A UI-level progress event, before it is leaned down for the wire. */
export interface ProgressUpdate {
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastPositionSec: number;
  watchedSec: number;
}

/** Lean PATCH body the API re-adapts to its DB tuple (docs/04 §7). */
export interface LeanProgressBody {
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastPositionSec: number;
  watchedSec: number;
}

export const courseProgressAdapter = {
  /** wire → domain */
  toDomain(wire: WireProgress | null): CourseProgress | null {
    if (!wire) return null;
    return {
      progressPercent: wire.progressPercent,
      isComplete: wire.isComplete,
      lastActiveAt: wire.lastActiveAt ? new Date(wire.lastActiveAt) : null,
      lessons: Object.entries(wire.lessons).map(([lessonId, l]) => ({
        lessonId,
        completed: l.completed,
        lastPositionSec: l.lastPositionSec,
      })),
    };
  },

  /** wire access envelope → domain */
  toAccess(wire: WireAccess): CourseAccess {
    return {
      courseId: wire.courseId,
      access: wire.access,
      progress: this.toDomain(wire.progress),
    };
  },

  /** domain update → lean wire body (drops nothing the server needs, keeps
   *  only the contract fields — future derived UI fields die here). */
  toLeanBody(update: ProgressUpdate): LeanProgressBody {
    return {
      courseId: update.courseId,
      lessonId: update.lessonId,
      completed: update.completed,
      lastPositionSec: Math.max(0, Math.floor(update.lastPositionSec)),
      watchedSec: Math.max(0, Math.floor(update.watchedSec)),
    };
  },
};
