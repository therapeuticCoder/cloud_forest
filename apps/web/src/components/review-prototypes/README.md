# Review prototypes

This directory contains task-scoped review components and their fictional
fixtures. They exist to answer a product or interaction question for a named
backlog task; they are not production routes, API clients, persistence, or
authorization behavior.

Each review prototype should stay in its own task-named folder with its local
styles and supporting components. Keep the normal app disconnected from it
except for the smallest explicit review entry point needed during that task.

When the product owner accepts a direction:

1. carry the accepted vocabulary, interaction, and visual rules into the
   working product components;
2. remove the review entry point and any temporary fixture wiring before PR;
3. leave the prototype here only if it is useful historical context for a
   future story; otherwise remove it in a deliberate cleanup task.

Do not make a disconnected prototype executable by default, add production
behavior to it, or treat its fictional data as a contract. The T-044 review
entry point and fixture were removed after product review; future tasks should
follow the same temporary-entry-point pattern and remove it before publication.
