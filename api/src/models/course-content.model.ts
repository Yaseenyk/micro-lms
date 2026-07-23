/**
 * `courseContent` collection (docs/03 §4). One document per (courseId, lessonId).
 * Read-mostly catalog data (not write-hot), so field names are readable rather
 * than compact. `blocks` is stored as a loose array; the block union is enforced
 * by the seeder + validated on read by the adapter.
 */
import { Schema, model, type Types } from "mongoose";

export interface CourseContentDoc {
  _id: Types.ObjectId;
  courseId: string;
  lessonId: string;
  order: number;
  title: string;
  minutes: number;
  blocks: unknown[];
  sv: number;
  createdAt: number;
  updatedAt: number;
}

const courseContentSchema = new Schema<CourseContentDoc>(
  {
    courseId: { type: String, required: true },
    lessonId: { type: String, required: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    minutes: { type: Number, required: true },
    // Mixed: the block union is a content shape, validated at the adapter, not by Mongoose.
    blocks: { type: [Schema.Types.Mixed], default: [] },
    sv: { type: Number, default: 1 },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { versionKey: false },
);

courseContentSchema.index({ courseId: 1, lessonId: 1 }, { unique: true });
courseContentSchema.index({ courseId: 1, order: 1 });

export const CourseContentModel = model<CourseContentDoc>(
  "CourseContent",
  courseContentSchema,
  "courseContent",
);
