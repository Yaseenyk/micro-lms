/**
 * Course catalog — the server-side source of truth for price and lesson count
 * (docs/03 §4: content is static catalog data referenced by id). Prices are
 * resolved here, NEVER trusted from the client (docs/04 §8). This is app data,
 * not a secret, so it lives in code; swap for a DB/CMS lookup later without
 * changing callers.
 */
export interface CatalogCourse {
  id: string;
  title: string;
  priceInPaise: number; // integer paise (docs/03 §0)
  totalLessons: number;
}

const CATALOG: Record<string, CatalogCourse> = {
  course_abc: { id: "course_abc", title: "Sample Course", priceInPaise: 49_900, totalLessons: 12 },
};

export function getCatalogCourse(id: string): CatalogCourse | null {
  return CATALOG[id] ?? null;
}
