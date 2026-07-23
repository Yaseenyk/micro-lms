/**
 * Display-only course metadata (Presentation concern). This is NOT the source of
 * truth for price or entitlement — the API resolves price server-side (docs/04
 * §8) and the webhook grants access (docs/04 §9). It only powers titles, lesson
 * names, and marketing copy so the UI reads like a real product.
 */
export interface CourseMeta {
  id: string;
  title: string;
  tagline: string;
  blurb: string;
  priceLabel: string;
  hours: string;
  lessons: { id: string; title: string; minutes: number }[];
  outcomes: string[];
}

const FULL_STACK_FOUNDATIONS: CourseMeta = {
  id: "course_abc",
  title: "Full-Stack Foundations",
  tagline: "Ship a typed, decoupled web app end to end.",
  blurb:
    "Twelve focused lessons that take you from an empty repo to a production-shaped full-stack app — clean layer boundaries, lean data, and payments you can actually trust.",
  priceLabel: "₹499",
  hours: "6h 20m",
  lessons: [
    { id: "les_1", title: "How a decoupled app fits together", minutes: 24 },
    { id: "les_2", title: "The Trinity Architecture in practice", minutes: 31 },
    { id: "les_3", title: "Typed contracts between client and server", minutes: 28 },
    { id: "les_4", title: "Modelling data without leaking it", minutes: 35 },
    { id: "les_5", title: "Serialization adapters & lean payloads", minutes: 33 },
    { id: "les_6", title: "Authentication that survives a refresh", minutes: 40 },
    { id: "les_7", title: "Guarding routes on a static frontend", minutes: 26 },
    { id: "les_8", title: "Talking to one HTTP client, cleanly", minutes: 22 },
    { id: "les_9", title: "State as the single source of truth", minutes: 29 },
    { id: "les_10", title: "Payments: never trust the client", minutes: 37 },
    { id: "les_11", title: "Webhooks as the entitlement authority", minutes: 34 },
    { id: "les_12", title: "Shipping: build, deploy, verify", minutes: 21 },
  ],
  outcomes: [
    "Separate presentation, logic, and data so nothing bleeds across layers",
    "Design request/response contracts the frontend can trust",
    "Persist rich state as lean, versioned payloads",
    "Wire real, signature-verified payments end to end",
  ],
};

const CATALOG: Record<string, CourseMeta> = {
  course_abc: FULL_STACK_FOUNDATIONS,
};

export function getCourseMeta(courseId: string): CourseMeta {
  return CATALOG[courseId] ?? FULL_STACK_FOUNDATIONS;
}
