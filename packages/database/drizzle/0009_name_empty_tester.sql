UPDATE "user"
SET "name" = 'Empty Tester'
WHERE "email" = 'empty@example.test';
--> statement-breakpoint
UPDATE "person_profiles" AS profile
SET "display_name" = 'Empty Tester'
FROM "account_people" AS mapping
INNER JOIN "user" AS account ON account."id" = mapping."account_id"
WHERE profile."person_id" = mapping."person_id"
  AND account."email" = 'empty@example.test';
