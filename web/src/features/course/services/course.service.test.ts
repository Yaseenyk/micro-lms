import { describe, it, expect, beforeEach } from "vitest";
import { courseService } from "@/features/course/services/course.service";
import { setAccessToken } from "@/lib/api-client";
import { jsonRes, mockFetch } from "@/test/http";

const API = "http://api.test/api";

const wireAccess = {
  courseId: "rag-systems",
  access: true,
  progress: {
    progressPercent: 42,
    isComplete: false,
    lastActiveAt: "2026-07-22T10:00:00Z",
    lessons: { les_1: { completed: true, lastPositionSec: 512 } },
  },
};

describe("courseService (docs/04 §6-7b)", () => {
  let fetchMock: ReturnType<typeof mockFetch>;
  beforeEach(() => {
    fetchMock = mockFetch();
    setAccessToken(null);
  });

  it("getAccess → POST /course/access {courseId}, adapts wire → domain (Date + lessons array)", async () => {
    fetchMock.mockResolvedValueOnce(jsonRes(200, { ok: true, data: wireAccess }));
    const res = await courseService.getAccess("rag-systems");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/course/access`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ courseId: "rag-systems" });
    expect(res.access).toBe(true);
    expect(res.progress?.lastActiveAt).toBeInstanceOf(Date);
    expect(res.progress?.lessons).toEqual([{ lessonId: "les_1", completed: true, lastPositionSec: 512 }]);
  });

  it("saveProgress → PATCH /course/progress with a LEAN body (floored, no derived fields)", async () => {
    fetchMock.mockResolvedValueOnce(jsonRes(200, { ok: true, data: wireAccess.progress }));
    await courseService.saveProgress({
      courseId: "rag-systems",
      lessonId: "les_1",
      completed: true,
      lastPositionSec: 512.9,
      watchedSec: 512.9,
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/course/progress`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({
      courseId: "rag-systems",
      lessonId: "les_1",
      completed: true,
      lastPositionSec: 512,
      watchedSec: 512,
    });
  });

  it("getLesson → POST /course/lesson {courseId,lessonId}", async () => {
    const lesson = { courseId: "rag-systems", lessonId: "les_1", title: "X", minutes: 24, blocks: [] };
    fetchMock.mockResolvedValueOnce(jsonRes(200, { ok: true, data: lesson }));
    expect(await courseService.getLesson("rag-systems", "les_1")).toEqual(lesson);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/course/lesson`);
    expect(JSON.parse(init.body)).toEqual({ courseId: "rag-systems", lessonId: "les_1" });
  });

  it("devUnlock → POST /dev/grant {courseId}", async () => {
    fetchMock.mockResolvedValueOnce(jsonRes(200, { ok: true, data: { granted: true } }));
    await courseService.devUnlock("rag-systems");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/dev/grant`);
    expect(JSON.parse(init.body)).toEqual({ courseId: "rag-systems" });
  });
});
