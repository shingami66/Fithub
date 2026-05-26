# Food Entry Edit Plan

Future phase only. Sprint 19 does not implement editing saved food entries.

## Required Server Action

- Add an `updateFoodEntry` server action that accepts date, meal type, entry id, and a validated food entry payload.
- Validate ownership through the authenticated user and the nutrition log containing the target entry.
- Replace only the matching entry inside the existing `entries` array.
- Recalculate meal totals from the full updated entries array before saving.

## Database Update Logic

- Fetch the existing nutrition log by user id, date, meal type, and entry id.
- Build `nextEntries` by replacing the matching entry, not appending a new one.
- Persist `entries`, recalculated `totals`, and `updatedAt`.
- Return the full mapped `NutritionLog` so client state stays consistent with delete/add flows.

## Optimistic UI

- Snapshot the current logs before applying a local replacement.
- Optimistically replace the entry in the matching meal section.
- On success, replace the affected log with the server-returned log.
- On failure, restore the previous logs and show a typed error toast.

## Avoid Duplicate Entries

- Updates must target an existing `entry.id`.
- The client must not call `addFoodEntryToLog` for edits.
- The server should return `ENTRY_NOT_FOUND` if the id does not exist in the selected log.

## Pre-Fill Saved Quantity And Unit

- Use saved `quantity`, `servingUnit`, `grams`, and `servingDescription` to initialize the edit card.
- Fall back to grams when the saved unit is missing or unsupported.
- Use saved gram amount to recalculate preview macros from the original normalized food data when available.

## Validation Requirements

- Quantity must be positive.
- Serving unit must be supported by the normalized food object.
- Gram equivalent must be positive and explicit for non-gram units.
- Calories, protein, carbs, fat, fiber, and sodium must be non-negative.
- Do not accept guessed cup, piece, or household conversions.
