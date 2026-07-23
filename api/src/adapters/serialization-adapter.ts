/**
 * The Serialization Adapter contract (docs/02 §2). Pure, deterministic
 * transforms between a rich Domain object and its lean DB Document. No I/O, no
 * clock, no randomness inside an adapter — timestamps are supplied by the
 * repository.
 */
export interface SerializationAdapter<Domain, Doc> {
  toDocument(domain: Domain): Doc;
  toDomain(doc: Doc): Domain;
}
