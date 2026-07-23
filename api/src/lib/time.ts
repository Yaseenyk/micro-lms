/** Unix-seconds time helpers. Documents store unix seconds (docs/03 §0);
 *  ISO strings exist only in the domain/API layer. */
export const nowUnix = (): number => Math.floor(Date.now() / 1000);
export const toUnix = (iso: string): number => Math.floor(new Date(iso).getTime() / 1000);
export const fromUnix = (seconds: number): string => new Date(seconds * 1000).toISOString();
