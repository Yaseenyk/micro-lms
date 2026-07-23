/**
 * Email canonicalization (Data-adjacent helper). Used to DEDUPLICATE accounts so
 * the "same" address can't create multiple users.
 *
 * Base rule (all providers): trim + lowercase.
 * Gmail rule: Gmail ignores dots in the local part and treats everything after a
 * "+" as a tag, and googlemail.com is an alias of gmail.com. So
 *   John.Doe+work@gmail.com  ==  johndoe@googlemail.com  ==  johndoe@gmail.com
 * all normalize to a single canonical address.
 *
 * The canonical form is what we store in `users.email` (unique) and what we look
 * up on login, so every alias maps to one account. We intentionally do NOT strip
 * "+" tags for non-Gmail providers — not every provider treats them as aliases.
 */
const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

export function normalizeEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return trimmed; // not a normal address; leave as-is (Zod already validated shape)

  let local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1);

  if (GMAIL_DOMAINS.has(domain)) {
    const plus = local.indexOf("+");
    if (plus >= 0) local = local.slice(0, plus); // drop +tag
    local = local.replace(/\./g, ""); // dots are insignificant
    domain = "gmail.com"; // fold googlemail.com into gmail.com
  }

  return `${local}@${domain}`;
}
