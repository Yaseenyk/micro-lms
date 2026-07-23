/**
 * Course catalog — the server-side source of truth for price and lesson count
 * (docs/04 §8: prices are resolved here, NEVER trusted from the client). Derived
 * from the authored course content (content/courses.ts) so price + lesson count
 * never drift from the lessons that actually exist.
 */
import { COURSES } from "../content/courses.js";

export interface CatalogCourse {
  id: string;
  title: string;
  priceInPaise: number; // integer paise (docs/03 §0)
  totalLessons: number;
}

const CATALOG: Record<string, CatalogCourse> = Object.fromEntries(
  COURSES.map((c) => [
    c.id,
    { id: c.id, title: c.title, priceInPaise: c.priceInPaise, totalLessons: c.lessons.length },
  ]),
);

export function getCatalogCourse(id: string): CatalogCourse | null {
  return CATALOG[id] ?? null;
}
