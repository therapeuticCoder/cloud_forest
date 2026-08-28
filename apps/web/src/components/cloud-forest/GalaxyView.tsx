import { RelationshipField } from "./RelationshipField";

export function GalaxyView() {
  return (
    <section
      aria-label="Galaxy view"
      className="min-h-[38rem] p-3 sm:p-5 lg:h-screen lg:min-h-0"
    >
      <RelationshipField />
    </section>
  );
}
