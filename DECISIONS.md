# Decisions

Hi, quick note on what I built and why. I stayed inside the time box, so it's a smaller slice done carefully rather than everything half-done.

## Built
- **Table** with all 8 columns, sorting (severity, status, cost, updated; asc → desc → none, active column highlighted), hover, skeleton loading, empty state, and "Showing 1–25 of N" pagination.
- **Filters** (severity, status, owner multi-select) with removable chips and "Clear all". OR within a group, AND across groups.
- **Inline status edit**: keyboard-accessible, saves immediately (optimistic, rolls back with a message if the save fails), Escape closes without changing anything.
- **Severity chips** from the `tokens.css` colour pairs, with a text label so colour is never the only signal.

## Cut, and why
- **Group by owner.** It fights with pagination: a page of 25 rows can't show correct group counts. It needs either all rows client-side or a grouped endpoint, and I'd rather ask than guess.
- **Row virtualisation.** With 25 rows per page the DOM is tiny, so virtualising adds complexity for no gain. The cost that remains is filter/sort over 10k rows. Timings in Node (logic only, not browser rendering): normalise ≈ 9 ms, sort ≈ 3 ms, filter < 1 ms. Try `?rows=10000` in the URL. If we ever drop pagination for infinite scroll, virtualise then.
- Tests, and a real server-side data layer.

## API vs. what the product needs
- **Severity is inconsistent**: `Critical`/`critical`/`HIGH`, plus `Moderate` and `""`. I normalise on load, map Moderate → Medium (assumption), and show empty as "Not set". Ask for a fixed enum.
- **`owner_id` only.** Name and avatar need embedding or a users endpoint. I hard-coded owners in `data/users.ts` and use initials for avatars.
- **No total count** in the response, so "of 297" is impossible. Need `total`.
- **At 10k rows, sort, filter and page must be server-side** (query params + total). I do it client-side for now, isolated in `useRiskTable`, so swapping is contained.
- **Status casing** is lowercase while severity is capitalised. `cost_impact_eur: 0` is ambiguous (zero vs unknown); I'd like null for unknown. Status edits need a PATCH endpoint, ideally with a version/etag to catch concurrent edits.

## Assumptions
- Severity "ascending" means most severe first (Critical on top), since that's the useful default.
- Euro format `€480,000` via `en-IE`. Relative times use the browser clock; hovering shows the exact date.
- Changing a status while a status filter is active can make the row vanish from view. I left it, but a real UI might keep it until refresh.
- Inter isn't bundled; the token fallback (`system-ui`) applies.

## Design system vs. app-specific
- **Shared:** tokens, Chip/Badge (tone prop), Avatar, Checkbox, multi-select dropdown, Listbox/popover, Pagination, Skeleton.
- **App-specific:** the column set, the severity → tone mapping and rank, status workflow order, filter panel composition, the risk-specific normalisation.
