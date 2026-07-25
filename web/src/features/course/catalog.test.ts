import { describe, it, expect } from "vitest";
import {
  ROADMAP,
  getAllCourses,
  getCourseMeta,
  getStarterCourse,
  getNextCourse,
  isPaidCourse,
  courseIds,
} from "@/features/course/catalog";

/**
 * Navigation-logic audit: the buttons across the app route by these helpers —
 * the hero/dashboard "start" CTA (getStarterCourse), the player "next course"
 * button (getNextCourse), and every /course/[id] link (courseIds/getCourseMeta).
 * If these are right, the buttons land where they should.
 */
describe("catalog / navigation targets", () => {
  it("every course id resolves to a real /course/[id] target", () => {
    const ids = courseIds();
    expect(ids.length).toBe(10);
    for (const id of ids) expect(getCourseMeta(id).id).toBe(id);
  });

  it("the hero/dashboard starter CTA points at the roadmap head (free)", () => {
    const s = getStarterCourse();
    expect(s.id).toBe("prompt-engineering");
    expect(s.starter).toBe(true);
    expect(isPaidCourse(s)).toBe(false);
  });

  it("the catalog renders in ROADMAP order", () => {
    expect(getAllCourses().map((c) => c.id)).toEqual([...ROADMAP]);
  });

  it("the player 'next course' button walks the roadmap, and stops at the end", () => {
    expect(getNextCourse("prompt-engineering")?.id).toBe("rag-systems");
    expect(getNextCourse("vector-search")?.id).toBe("ai-products"); // products moved up to #5
    expect(getNextCourse(ROADMAP[ROADMAP.length - 1]!)).toBeNull();
    expect(getNextCourse("does-not-exist")).toBeNull();
  });

  it("every course is currently free — no button should hit a paywall", () => {
    for (const c of getAllCourses()) expect(isPaidCourse(c)).toBe(false);
  });
});
