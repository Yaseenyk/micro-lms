/**
 * Seed one authored Markdown/MDX file as a lesson's content (docs/03 §4).
 *
 *   npm run seed:md -- <courseId> <lessonId> <path-to-file.mdx>
 *
 * Example:
 *   npm run seed:md -- prompt-engineering les_1 ../content/prompt-engineering/module-1-core-mechanics.mdx
 *
 * Front matter (--- ... --- at the top) is parsed for `title` and
 * `readingMinutes` and stripped from the body. The remaining Markdown is stored
 * as a single `markdown` block and rendered at runtime by the client.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { connectDb, disconnectDb } from "../config/db.js";
import { CourseContentModel } from "../models/course-content.model.js";
import { getCatalogCourse } from "../config/catalog.js";
import { nowUnix } from "../lib/time.js";
import { logger } from "../lib/logger.js";

interface FrontMatter {
  title?: string;
  readingMinutes?: number;
}

/** Minimal front-matter reader — avoids a dependency for four fields. */
function splitFrontMatter(raw: string): { meta: FrontMatter; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };

  const meta: FrontMatter = {};
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const kv = /^(\w+)\s*:\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const key = kv[1]!;
    const value = (kv[2] ?? "").trim().replace(/^["']|["']$/g, "");
    if (key === "title") meta.title = value;
    if (key === "readingMinutes") {
      const minutes = Number(value);
      if (Number.isFinite(minutes) && minutes > 0) meta.readingMinutes = minutes;
    }
  }
  return { meta, body: raw.slice(match[0].length) };
}

async function main(): Promise<void> {
  const [courseId, lessonId, filePath] = process.argv.slice(2);

  if (!courseId || !lessonId || !filePath) {
    console.error(
      "Usage: npm run seed:md -- <courseId> <lessonId> <path-to-file.mdx>\n" +
        "Example: npm run seed:md -- prompt-engineering les_1 ../content/prompt-engineering/module-1-core-mechanics.mdx",
    );
    process.exit(1);
  }

  if (!getCatalogCourse(courseId)) {
    console.error(`Unknown course "${courseId}". Check config/catalog.ts.`);
    process.exit(1);
  }

  const absolute = resolve(process.cwd(), filePath);
  const raw = readFileSync(absolute, "utf8");
  const { meta, body } = splitFrontMatter(raw);

  await connectDb();
  const now = nowUnix();

  const existing = await CourseContentModel.findOne({ courseId, lessonId }).lean();
  const order = existing?.order ?? 1;

  await CourseContentModel.updateOne(
    { courseId, lessonId },
    {
      $set: {
        order,
        title: meta.title ?? existing?.title ?? lessonId,
        minutes: meta.readingMinutes ?? existing?.minutes ?? 20,
        // One markdown block; the client renders GFM + highlighting + mermaid.
        blocks: [{ type: "markdown", markdown: body.trim() }],
        sv: 1,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  logger.info(
    {
      courseId,
      lessonId,
      title: meta.title,
      minutes: meta.readingMinutes,
      chars: body.trim().length,
    },
    "seeded markdown lesson",
  );

  await disconnectDb();
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "markdown seed failed");
  process.exit(1);
});
