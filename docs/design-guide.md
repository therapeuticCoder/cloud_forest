# Human Forest Design Guide

Status: approved visual direction

This guide records the visual grammar approved from the representative Timeline
implementation in August 2026. It is the source of truth for extending the
direction to later Human Forest screens. The Timeline remains the reference
implementation; its exact dimensions are examples, not universal component
requirements.

## Design intent

Human Forest should feel like contemporary ecology and quiet wellness: grounded,
alive, calm, and deliberate. The interface should make relational depth tangible
without turning it into status, competition, or explanation-heavy taxonomy.

The experience is not camping, camouflage, military, survivalist, rustic spa, or
literal nature decoration. Forest language shapes color, hierarchy, rhythm, and
behavior rather than adding leaves, woodgrain, or scenic illustration to every
surface.

## Core principles

- **Calm before density.** Show enough information to act without filling every
  available space.
- **Relationship before engagement.** Identity and relational layer carry the
  hierarchy. Counts, reactions, popularity, and attention hooks do not.
- **Depth without labels.** Repeated color, border, portrait, and mark treatments
  should teach the layers without explaining them on every item.
- **People feel personal.** Use portrait-led identity for people. Use stable,
  recognizable marks for Guilds and Signals, where portraits do not apply.
- **Chrome stays light.** Navigation and composition controls float as small,
  detached islands instead of framing the whole application.
- **Space is intentional.** Unused rails, breathing room, and calm separators are
  part of the composition, not missing content.
- **Motion serves recovery.** Movement may reduce distraction, but controls must
  always return on reverse scroll or keyboard focus.

## Color system

The approved palette is green-led, supported by bark and clay warmth and a muted
river blue. Use semantic roles rather than choosing a new green for each screen.

| Role          | Current token     | Value     | Use                               |
| ------------- | ----------------- | --------- | --------------------------------- |
| Forest floor  | `--forest-bark`   | `#29180f` | Primary page background           |
| Deep pine     | `--forest-pine`   | `#082419` | Floating chrome and dark controls |
| Pine ink      | `--forest-ink`    | `#0a2a1d` | Text on light mineral surfaces    |
| Mineral card  | `--forest-card`   | `#e4ecd9` | Primary content surfaces          |
| Party accent  | `--forest-party`  | `#607d27` | Closest relationship layer        |
| Tribe accent  | `--forest-tribe`  | `#496b2f` | Broader personal layer            |
| Guild accent  | `--forest-guild`  | `#a74418` | Group and community layer         |
| Signal accent | `--forest-signal` | `#24677a` | Public-source layer               |
| Amber action  | `--forest-amber`  | `#f1a411` | Compose and selective emphasis    |

Mineral cards may use a restrained light gradient or soft illumination to avoid
flatness. Texture should remain subtle enough that text and identity stay
primary. Do not introduce bright ecological rainbows, neon accents, or a new
color for every category.

## Typography

Use a humanist sans-serif with open forms and a warm, contemporary voice. The
current implementation uses Geist Variable. Maintain one family across content
and chrome unless a later approved use case needs otherwise.

- Headings are confident, compact, and moderately heavy.
- Author or source names lead each content item and carry the strongest weight.
- Body copy is direct and comfortably readable, never compressed into metadata
  density.
- Timestamps are inline at the bottom of content and visually quieter without
  becoming low contrast.
- UI labels use the same typographic voice as content; avoid browser-default or
  overly technical control text.

## Layout and spacing

Desktop Timeline content is centered and wide, with intentionally unused side
rails. Other screens may use a different content structure, but should preserve
clear focal regions and avoid edge-to-edge dashboard density by default.

Content surfaces use rounded corners, thick layer-colored borders, and generous
but efficient separation. Prefer one strong container per item over nested cards
or decorative frames. Day and section boundaries should be calm rules or spacing,
not unread badges or alert-like banners.

On mobile, preserve the hierarchy rather than merely shrinking desktop:

- combine brand and compose into one detached top island
- move primary view navigation to a detached bottom island
- allow cards to become taller so content wraps legibly
- expose the compact layer key when it helps users learn the visual encoding
- reserve space for fixed chrome so content remains reachable
- prevent horizontal overflow and accidental clipping

The current responsive transition occurs at `700px`. Treat that as an
implementation value that may be adjusted when a component demonstrably needs a
content-driven breakpoint.

## Identity and layer encoding

### People

Use a clear portrait where appropriate and available. Portraits should feel
natural, calm, contemporary, and consistent in crop and lighting. Use fictional
or approved data in prototypes. Initials are an acceptable fallback, not the
preferred final identity treatment.

### Guilds and Signals

Use a stable, simple mark in a field colored for the layer. Marks should share a
coherent stroke or fill language and remain recognizable at compact sizes. Do
not substitute generic portraits for organizations or public sources.

### Content cards

The approved Timeline card order is:

1. identity image or source mark
2. author or source name
3. post content
4. inline timestamp
5. matching layer mark anchored at the lower-right

The thick outer border and lower-right mark use the same layer accent. Avoid
repeating the layer name on every card once the visual system is established.

## Floating chrome and motion

Desktop uses separate brand, navigation, and compose islands. Mobile uses a top
brand/compose island and a bottom navigation island. These elements float above
the document and must not cause content to shift when their visibility changes.

On downward scrolling, chrome may fade and withdraw slightly. On upward
scrolling or keyboard focus, it returns. Controls remain in the keyboard order
and must be recoverable even while visually withdrawn.

Use short, restrained opacity and position transitions. Under
`prefers-reduced-motion: reduce`, remove spatial movement and use opacity only.
Motion must never be required to understand state or reach a control.

## Interaction and accessibility

- Use semantic headings, regions, articles, navigation, buttons, and timestamps.
- Preserve visible focus with sufficient contrast against both dark chrome and
  light cards.
- Keep text and meaningful icons at accessible contrast levels.
- Make controls comfortably targetable on touch screens.
- Verify keyboard recovery when floating chrome is hidden.
- Verify reduced motion, responsive overflow, content variation, and console
  health before approval.
- Chrome visibility changes must not alter document flow or scroll position.

## Content boundaries

Human Forest does not use likes, reposts, follower counts, unread counts,
popularity metrics, engagement controls, behavioral ranking, search, or filters
unless a separately approved product requirement introduces them. Do not invent
navigation destinations or product areas to make a composition feel fuller.

Prefer plain, humane language. The interface should not repeatedly explain the
forest metaphor or relationship taxonomy when structure and visual encoding can
carry the meaning.

## Anti-patterns

Avoid:

- camping, tactical, camouflage, military, survivalist, or rustic-spa styling
- literal leaves, trees, woodgrain, scenic forests, or decorative nature motifs
  used as filler
- engagement metrics, attention traps, or social-proof counters
- glass-heavy dashboards, neon gradients, generic SaaS cards, and dense control
  bars
- thin or arbitrary layer accents that make relational priority hard to see
- repeated textual layer badges on every content item
- nested cards, excessive pills, or decorative labels
- content shifting when chrome appears or disappears
- motion without a reduced-motion equivalent
- mobile layouts produced only by scaling down desktop dimensions

## Applying the guide

When extending this direction to another screen:

1. Identify the screen's primary human task and relational hierarchy.
2. Reuse the semantic palette, typography, identity, chrome, and motion rules.
3. Preserve the screen's actual interaction model rather than forcing Timeline
   cards onto every surface.
4. Create or select a representative desktop and mobile state.
5. Verify accessibility, keyboard behavior, reduced motion, overflow, and
   console health in the browser.
6. Compare screenshots with the approved Timeline direction and record any
   intentional differences.

New tokens or patterns should solve a demonstrated product need and remain
compatible with this grammar. Material departures require product-owner review.
