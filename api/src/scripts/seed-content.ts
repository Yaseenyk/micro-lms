/**
 * Seed courseContent (docs/03 §4) from the authored source (content/courses.ts).
 * Idempotent upsert per (courseId, lessonId): safe to run repeatedly. Run with:
 *
 *   npm run seed
 */
import "dotenv/config";
import { connectDb, disconnectDb } from "../config/db.js";
import { CourseContentModel } from "../models/course-content.model.js";
import { COURSES } from "../content/courses.js";
import { nowUnix } from "../lib/time.js";
import { logger } from "../lib/logger.js";

async function main(): Promise<void> {
  await connectDb();
  const now = nowUnix();
  let lessons = 0;

  for (const course of COURSES) {
    for (let i = 0; i < course.lessons.length; i += 1) {
      const l = course.lessons[i]!;
      await CourseContentModel.updateOne(
        { courseId: course.id, lessonId: l.id },
        {
          $set: {
            order: i + 1,
            title: l.title,
            minutes: l.minutes,
            blocks: l.blocks,
            sv: 1,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      );
      lessons += 1;
    }
    logger.info({ courseId: course.id, lessons: course.lessons.length }, "seeded course");
  }

  logger.info(`seeded ${lessons} lessons across ${COURSES.length} courses`);
  await disconnectDb();
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "seed failed");
  process.exit(1);
});
