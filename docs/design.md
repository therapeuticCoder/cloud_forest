# Design

Cloud Forest should feel calm, grounded, alive, deliberate, and contemporary. Forest language is a metaphor for cooperation and interdependence, not an excuse for decorative nature imagery.

## Principles

- **Relationship before engagement.** Relational meaning determines hierarchy. Popularity and attention metrics do not.
- **Calm before density.** Show enough to understand and act without filling every available space.
- **Depth without constant explanation.** Repeated visual encoding should teach the layers over time.
- **People feel personal.** Use portraits where appropriate; initials are a fallback.
- **Chrome stays light.** Navigation and composition controls should not visually dominate the human content.
- **Space is intentional.** Breathing room is part of the interface.
- **Motion serves orientation and recovery.** It must never be required to understand state or reach a control.
- **Mobile is designed, not merely shrunk.** Preserve hierarchy and touch usability rather than scaling desktop mechanically.

## Layer language

Use the established semantic palette and visual identity for Party, Tribe, Guild, and Signal content. The exact implementation may evolve, but relational layers should remain perceptible without repeated badges or explanatory text.

Party should feel closest and most personal. Tribe remains personal but broader. Guilds represent collective/group identity. Signals represent external public sources.

## Timeline

Timeline is not an infinite attention feed. Content should support relationship and action rather than compete for maximum salience.

Ordinary posts may display with the established card language appropriate to their source and audience.

**Signals are intentionally de-emphasized.** External Signal activity should default to a compact, low-visual-weight presentation such as “New signal from Sam Altman.” The user explicitly expands it to consume the underlying post. Imported public activity should never visually overpower Party, Tribe, or Care.

## Interaction and accessibility

- Use semantic structure and controls.
- Preserve visible keyboard focus and keyboard recovery.
- Keep text/icons at accessible contrast.
- Make touch targets comfortable.
- Respect reduced motion.
- Prevent accidental horizontal overflow and unreachable content.
- Avoid layout shifts when floating chrome appears or disappears.

## Styling ownership

Global styles should be truly global: design tokens, resets, typography defaults, app-level primitives, and a small set of shared utilities.

Feature- or component-specific styling should live near the component or feature that owns it, using the project's existing Tailwind/component conventions or a focused stylesheet when CSS is clearer. Do not grow a single global stylesheet with unrelated local rules.

When an alpha story touches oversized or mixed-responsibility styling, extract the cohesive styles required by that story. The alpha-coherence pass should finish separating remaining global and localized styling that has accumulated during prototyping.

## Avoid

- engagement metrics, popularity counters, behavioral ranking, or attention traps
- generic social-feed density
- literal leaves, woodgrain, scenic forests, camouflage, survivalist, or rustic-spa styling
- neon/glass-heavy generic SaaS aesthetics
- repeated taxonomy labels when visual structure can carry the meaning
- nested card clutter and excessive pills
- unnecessary motion or visual competition
