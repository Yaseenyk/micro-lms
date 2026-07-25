import { describe, it, expect } from "vitest";
import { courseProgressAdapter } from "@/lib/adapters/course-progress.adapter";

describe("courseProgressAdapter", () => {
  it("toDomain returns null for a null wire progress", () => {
    expect(courseProgressAdapter.toDomain(null)).toBeNull();
  });

  it("toDomain maps the lessons map → array and the ISO string → Date", () => {
    const d = courseProgressAdapter.toDomain({
      progressPercent: 50,
      isComplete: false,
      lastActiveAt: "2026-01-02T03:04:05Z",
      lessons: { a: { completed: true, lastPositionSec: 10 }, b: { completed: false, lastPositionSec: 0 } },
    });
    expect(d!.progressPercent).toBe(50);
    expect(d!.lastActiveAt).toBeInstanceOf(Date);
    expect(d!.lessons).toEqual([
      { lessonId: "a", completed: true, lastPositionSec: 10 },
      { lessonId: "b", completed: false, lastPositionSec: 0 },
    ]);
  });

  it("toAccess wraps the access flag + nested progress", () => {
    expect(courseProgressAdapter.toAccess({ courseId: "c", access: false, progress: null })).toEqual({
      courseId: "c",
      access: false,
      progress: null,
    });
  });

  it("toLeanBody floors seconds, clamps negatives, and keeps ONLY the contract fields", () => {
    const body = courseProgressAdapter.toLeanBody({
      courseId: "c",
      lessonId: "l",
      completed: true,
      lastPositionSec: 12.9,
      watchedSec: -5,
    });
    expect(body).toEqual({ courseId: "c", lessonId: "l", completed: true, lastPositionSec: 12, watchedSec: 0 });
    expect(Object.keys(body).sort()).toEqual([
      "completed",
      "courseId",
      "lastPositionSec",
      "lessonId",
      "watchedSec",
    ]);
  });
});
