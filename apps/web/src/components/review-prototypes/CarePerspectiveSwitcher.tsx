import type { CarePerspectiveOption } from "@/data/careLifecycleMockData";
import type { CarePersonId } from "@/types/careRequest";

export function CarePerspectiveSwitcher({
  onChange,
  options,
  viewerId,
}: {
  onChange: (viewerId: CarePersonId) => void;
  options: CarePerspectiveOption[];
  viewerId: CarePersonId;
}) {
  return (
    <aside
      aria-label="Prototype care perspective"
      className="care-perspective-switcher"
    >
      <div>
        <strong>Prototype only — not account switching</strong>
        <span>Fictional people for lifecycle review.</span>
      </div>
      <label>
        Reviewing as
        <select
          onChange={(event) => onChange(event.target.value)}
          value={viewerId}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.displayName} — {option.role}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}
