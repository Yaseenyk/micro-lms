/** `courseProgress` collection (docs/03 §3). Stored in the LEAN shape defined
 *  by the Serialization Adapter (docs/02): compact keys, lesson 3-tuples, no
 *  derived fields. */
import { Schema, model, type Types } from "mongoose";

/** [completed(0|1), lastPositionSec, watchedSec] */
export type LessonTuple = [number, number, number];

export interface CourseProgressDoc {
  _id: Types.ObjectId;
  u: Types.ObjectId; // userId
  c: string; // courseId
  l: Record<string, LessonTuple>; // lessons, compact
  t: number; // totalLessons snapshot
  iv?: Record<string, [number, number][]>; // optional watched intervals (analytics)
  ua: number; // lastActiveAt (unix seconds)
  sv: number;
  createdAt: number;
  updatedAt: number;
}

const courseProgressSchema = new Schema<CourseProgressDoc>(
  {
    u: { type: Schema.Types.ObjectId, ref: "User", required: true },
    c: { type: String, required: true },
    l: { type: Schema.Types.Mixed, default: {} },
    t: { type: Number, required: true },
    iv: { type: Schema.Types.Mixed, required: false },
    ua: { type: Number, required: true },
    sv: { type: Number, default: 1 },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { versionKey: false, minimize: false },
);

courseProgressSchema.index({ u: 1, c: 1 }, { unique: true });

export const CourseProgressModel = model<CourseProgressDoc>(
  "CourseProgress",
  courseProgressSchema,
  "courseProgress",
);
