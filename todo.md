# Project TODO

- [x] Establish PropNexus branding, premium design tokens, typography, and browser metadata.
- [x] Model properties, property images, and visitor inquiries in the database.
- [x] Create database migration and verify the schema is applied.
- [x] Build public homepage with hero search, featured listings, trust indicators, and responsive navigation.
- [x] Build property catalog with filters for property type, price, and location.
- [x] Wire homepage search selections into catalog URL parameters and initial filter state.
- [x] Build property detail pages with gallery, specifications, WhatsApp action, and inquiry form.
- [x] Harden the property gallery for empty or malformed image lists with a featured-image fallback and safe controls.
- [x] Sanitize malformed gallery image entries and clamp the active image selection safely.
- [x] Ensure gallery hooks run consistently before early renders and exclude invalid image URLs or paths.
- [x] Re-verify property details across loading, loaded, and malformed gallery states.
- [x] Save public inquiry submissions to the database with validation and error feedback.
- [x] Build owner-only administration with listing create, update, deletion, and image upload workflows.
- [x] Build lead-management view with inquiry status controls and contact actions.
- [x] Implement Manus OAuth owner access checks for the administration area.
- [x] Add responsive behavior, refined motion, empty states, and accessibility refinements.
- [x] Add and run unit tests covering key data and lead workflows.
- [x] Verify the public and admin experiences visually at desktop and mobile sizes.
- [x] Apply the confirmed PropNexus contact details: Abhay, +977 9769279600, and rawalabhaya!@gmail.com.
- [x] Adapt the visual direction using the Novel Masiv reference while preserving the exact PropNexus brand name.
- [x] Create a curated set of approximately 10–20 editable Nepal property listings rather than the initial four examples.
- [x] Connect verified Supabase server-side data access for property and inquiry records, while using managed project storage for property images.
- [x] Prepare the completed project for GitHub export and provide publishing guidance without deploying on the user’s behalf.
- [x] Upload and use the supplied official PropNexus Property & Real Estate logo across navigation, footer, and brand touchpoints.
- [x] Extend the premium design system with the logo’s deep navy, warm gold, and ivory palette.
- [x] Add Vitest coverage for property data, inquiry creation, lead status transitions, admin property CRUD, and media uploads.
- [x] Complete the frontend quality pass with explicit error states, accessibility improvements, and reduced-motion-aware motion.
- [x] Add explicit error states and retry actions to the property detail and admin data screens.
- [x] Extend workflow tests to cover property updates, deletions, and inquiry/lead failure paths.
- [x] Complete a keyboard, focus, label, role, and reduced-motion accessibility check across key routes.

- [x] Add an explicit landing-page query error state and finish final all-route accessibility verification.

- [x] Add executable gallery-state and accessibility source smoke checks, then record final route verification.

- [x] Make homepage advanced search filter and sorting functional for price, location, and property type.
- [x] Show functional suggested properties on the homepage with working navigation.
- [x] Repair the mobile three-line menu and verify its links.
- [x] Add visitor favorites with persistent browser storage and clear saved-state controls.
- [x] Add similar properties to each property detail page.
- [x] Remove the supplied logo background for clean transparent placement across the site.
- [x] Verify all requested interactions and update the project checkpoint.

## Interaction repair notes

- Use stable URL parameters for homepage search handoff and catalog sorting.
- Keep favorites client-side so visitors can bookmark listings without requiring authentication.
- Preserve the exact PropNexus brand name and official logo artwork while improving presentation.
- [x] Add a clear-all control for saved properties and test persisted favorites behavior.
- [x] Verify menu open/close and navigation destinations at mobile size before saving the checkpoint.
- [x] Fix mobile navigation overlay stacking so its links receive taps above the page content.
- [x] Re-run persisted-favorites interaction verification with a stable property control selector.

- [x] Make the opened mobile menu fully opaque with readable navy, ivory, and gold styling.
- [x] Verify the corrected mobile menu visually and through interaction tests.

- [x] Package the PropNexus workflow into a reusable Manus skill using skill-creator.
- [x] Add smooth scrolling for mobile-menu section links.
- [x] Add a Contact Abhay popup form modal from the mobile menu.
- [x] Add a suggested-properties list/map toggle on the homepage.
- [x] Validate skill package, website tests, and updated interactions before checkpoint.

- [x] Add and verify a visible fallback when the homepage map service cannot load.

- [x] Send an owner alert when a visitor submits a property inquiry.
- [x] Add price and location filtering controls to the homepage suggested-properties section.
- [x] Enhance property detail galleries for high-quality responsive production photography with safe fallbacks.
- [x] Update and revalidate the reusable PropNexus workflow skill with notification, filtering, and gallery guidance.
- [x] Run complete validation and save a new checkpoint for these enhancements.
- [x] Ensure the responsive gallery gradient overlay does not intercept clicks on the full-screen viewer control.

- [x] Use existing free managed storage and supplied property assets to display final production photography in the responsive gallery.
- [x] Add a no-cost secondary inquiry alert fallback using already-configured project capabilities where available.
- [x] Track privacy-conscious suggested-property filter usage for location, price, and sort choices through the existing analytics path.
- [x] Validate the free implementation and save an updated checkpoint.

- [x] Add privacy-conscious homepage and suggested-property filter analytics for location, price, type, budget, and sort choices.
- [x] Add an optional server-only Gmail-compatible SMTP fallback for inquiry alerts; persistence and built-in owner alerts remain non-blocking if email is not configured.
- [x] Document SMTP credentials or a Gmail app password as the optional production step for automatic secondary email delivery.
- [x] Verify existing managed-storage property imagery is active; additional user-supplied photography can be uploaded through the owner admin flow when available.
- [x] Validate the free implementation with TypeScript and 18 Vitest tests.
- [x] Save the final checkpoint after responsive visual verification.

- [x] Add a personal wishlist view for saved favorite properties with persistent browser storage.
- [x] Add an interactive map view to the property listings catalogue with selectable markers and listing navigation.
- [x] Add a loading skeleton animation for property gallery images while they load.
- [x] Add or update Vitest coverage for wishlist, listings map, and gallery loading states.
- [x] Verify the new features at desktop and mobile sizes and save an updated checkpoint.

- [x] Add wishlist sorting and filtering by price and listing date.
- [x] Display each property price directly on interactive map markers.
- [x] Add side-by-side comparison for multiple wishlist properties with selectable entries.
- [x] Add or update Vitest coverage and verify responsive interactions before saving a checkpoint.
- [x] Run browser-level interaction checks for wishlist sorting, comparison selection/removal, and catalogue map price-label behavior.
- [x] Explicitly verify a rendered map marker price label, or confirm the map fallback when the map service is unavailable.

- [x] Add shareable wishlist links that encode saved property IDs and restore them on the wishlist page.
- [x] Add a browser-side PDF export button for the selected property comparison details.
- [x] Add map marker hover previews with a property image, price, location, and basic details.
- [x] Add or update tests and verify responsive share, export, and map-preview interactions before saving a checkpoint.

- [x] Add a read-only mode for shared wishlist links that hides all modification controls.
- [x] Add a branded PropNexus header and contact footer to the comparison PDF print layout.
- [x] Add zoom-aware clustering for nearby catalogue map markers.
- [x] Add or update tests, verify responsive behavior, and save a new checkpoint.

- [x] Add a welcome banner explaining that shared wishlist recipients are viewing a curated property list.
- [x] Display the average price of grouped properties on map cluster icons.
- [x] Add a comparison PDF email form with recipient validation and a no-cost delivery path.
- [x] Add or update tests, verify responsive behavior, and save a new checkpoint.

- [x] Add an optional custom personal message field to comparison-PDF emails.
- [x] Make cluster clicks automatically zoom and expand into individual property markers.
- [x] Add a recently viewed properties section to the wishlist using privacy-conscious browser storage.
- [x] Run a comprehensive regression test covering every existing and newly requested feature, then save a checkpoint.
- [x] Refactor cluster expansion to use stable property-member IDs across zoom recalculations.
- [x] Verify via browser that clicking a cluster renders multiple individual property markers, not only a higher zoom.
- [x] Expand final browser regression to cover inquiry submission, mobile navigation, favorites mutations, wishlist sorting/filtering, comparison selection/removal, PDF export trigger, shared read-only mode, marker hover, cluster average/expansion, and recently viewed persistence.
- [x] Save a fresh checkpoint after the expanded regression and responsive verification pass.
- [x] Re-run desktop and mobile responsive verification after the final cluster-expansion changes and expanded regression pass.
- [x] Save a new checkpoint after final responsive verification and expanded regression completion.

- [x] Add timestamps and a Clear History control to recently viewed properties.
- [x] Add an Add to Wishlist action directly inside map marker hover previews.
- [x] Highlight key differences between selected properties in the comparison workspace.
- [x] Add regression coverage, verify responsive behavior, and save an updated checkpoint.

- [x] Run the final all-feature regression, including TypeScript, Vitest, browser flows, and responsive checks.
- [x] Inspect the connected GitHub repository and push the verified PropNexus project.
- [x] Save a final checkpoint after the successful regression and GitHub push.
- [x] Update the legacy mobile navigation browser assertion to target the current dedicated Wishlist route and label.
- [x] Re-run desktop and mobile responsive verification after the final browser regression and Wishlist selector fix.

- [x] Verify the connected GitHub repository push, branch, latest commit, and clean status.
- [x] Run the comprehensive TypeScript, Vitest, Playwright, and responsive verification suite.
- [x] Generate a summary report covering implemented features, test results, and any remaining operational notes.
- [x] Re-run mobile responsive verification after the final Playwright regression and Wishlist selector fix.
- [x] Generate and deliver the concise final summary report covering implementation, GitHub status, tests, and operational notes.
- [x] Deliver the final summary report to the user with the verified GitHub status and test results.

- [x] Reproduce and fix the reported click interaction that makes the page disappear.
- [x] Add regression coverage for the repaired interaction and save an updated checkpoint.

- [x] Scan current browser/server logs and reproduce the reported errors across core public flows.
- [x] Fix confirmed runtime, navigation, or interaction errors and add regression coverage.
- [x] Run final TypeScript, Vitest, Playwright, and responsive checks after the fixes.

- [x] Audit the current property count, distinct listing identities, and image reuse across the catalogue.
- [x] Expand the catalogue with additional distinct Nepal property listings using transparent listing metadata.
- [x] Assign varied managed-storage photography so properties do not all reuse the same images.
- [x] Validate catalogue counts, filters, map markers, and responsive presentation after the expansion.

- [x] Reproduce and fix the blank Why PropNexus navigation route on desktop and mobile.
- [x] Add regression coverage for Why PropNexus navigation and verify all public routes remain rendered.

- [x] Audit current property categories, counts, area values, prices, and image reuse.
- [x] Provide at least four distinct listings in every available category, including land/plot and building-related types.
- [x] Use varied Nepal locations, areas, prices, titles, descriptions, and photography assignments without fabricating reviews or testimonials.
- [x] Validate category filters, map markers, detail routes, wishlist behavior, and responsive catalogue presentation.
- [x] Final catalogue expansion audit: verify 4+ distinct listings per property category and non-repeating featured photography across the public catalogue.
- [x] Verify comparison Email PDF custom-message flow after catalogue expansion.
- [x] Save final checkpoint after final audit.
- [x] Run post-expansion browser regression for catalogue filters, map view, detail links, and wishlist behavior.
- [x] Add explicit post-expansion wishlist-page verification for saved items, sorting, filtering, and detail navigation.
- [x] Assert actual wishlist sort order and price-filter result changes with multiple expanded-catalogue properties.

## New feature request: Nepal filters, natural-language search, and comparison

- [x] Add Nepal-specific listing metadata for ward, municipality, and road width with safe Supabase mapping and admin-compatible defaults.
- [x] Add ward, municipality, and road-width filters to the public homepage/catalogue search, URL state, filtering logic, empty states, and responsive controls.
- [x] Add a server-side natural-language property-search procedure using the built-in LLM with strict structured output, bounded result IDs, safe fallback behavior, and no client-side secret exposure.
- [x] Add a conversational search bar that submits natural-language queries, presents interpreted criteria, handles loading/error/empty states, and links results into the existing catalogue.
- [x] Implement a public comparison workspace that selects up to three listings, supports add/remove/clear actions, highlights differences, and remains usable on mobile.
- [x] Add Vitest coverage for Nepal metadata/filter helpers, natural-language search parsing/fallbacks, and three-property comparison limits and differences.
- [x] Add Playwright coverage for Nepal filters, conversational search, comparison selection/removal, and responsive presentation.
- [x] Run TypeScript, Vitest, Playwright, and desktop/mobile visual checks; save an updated checkpoint.
- [x] Persist ward, municipality, and road-width fields through property create/update inputs, Supabase payload mapping, and the admin editor.
- [x] Extend the homepage hero search with ward, municipality, and road-width controls and URL handoff.
- [x] Cap natural-language search result IDs and returned properties to a documented maximum.
- [x] Add Vitest assertions for the natural-language search mutation and comparison difference-highlighting helper.
- [x] Fix existing favorites regression selector after adding comparison actions to property cards.
- [x] Correct comparison browser regression to select three enabled listings and verify the fourth is disabled.

## New feature request: guided search, saved searches, and shared comparisons

- [x] Add an animated typing indicator to the AI natural-language search state.
- [x] Add three clickable example queries that populate or submit the AI search bar.
- [x] Add Save Search persistence for current catalogue criteria using local storage.
- [x] Add a Saved Searches section with load and delete actions.
- [x] Add a Share Comparison action that creates a unique share URL and restores the selected comparison.
- [x] Add Vitest and Playwright coverage for the three requested enhancements.
- [x] Add Vitest coverage for saved-search serialization, comparison-share URL generation/restoration, and guided-search example contracts.
- [x] Run final type, unit, browser, and responsive checks and save a new checkpoint.
- [x] Stabilize AI example-query browser setup with a rendered-section wait.
- [x] Set desktop viewport for saved-search browser coverage so catalogue controls are visible.

## New feature request: saved-search names, QR sharing, and query history

- [x] Let users enter a custom name when saving a catalogue search and preserve the name across reloads.
- [x] Add a QR-code export action for comparison share URLs with accessible dialog/download behavior.
- [x] Store recent AI conversational queries locally with a reusable history dropdown and clear-history action.
- [x] Add Vitest and Playwright coverage for custom names, QR export, and query history.
- [x] Run final type, unit, browser, build, and responsive checks and save a new checkpoint.
- [x] Narrow the query-history browser assertion to distinguish history results from example-query buttons.

## New feature request: sync, native sharing, and saved-search editing

- [x] Add a user-owned persistence model for saved searches and AI query history with schema-first migration and server authorization.
- [x] Add signed-in sync procedures with safe local-to-server merge behavior and graceful signed-out fallback.
- [x] Sync saved searches and AI query history across devices when a user is authenticated.
- [x] Add inline edit and rename controls for saved searches with persistence and cancellation.
- [x] Add native Web Share API support for the comparison QR image/link with clipboard/download fallback.
- [x] Add Vitest and Playwright coverage for sync, editing, and native-share fallback behavior.
- [x] Run final schema, type, unit, browser, build, and responsive checks and save a new checkpoint.
- [x] Ensure every represented Nepal place in the public catalogue has at least two distinct properties with varied metadata and photography.
- [x] Audit place counts, update the catalogue where gaps exist, and verify place-filter behavior.
- [x] Update catalogue browser regression expectations from 16 to 20 listings and add city coverage assertions.

## New feature request: map exploration, price history, and Contact Agent

- [x] Add a list/map toggle to the search results page with municipality-aware markers, price labels, and property navigation.
- [x] Add transparent price-history data to property records or a documented deterministic fallback without fabricating transactions.
- [x] Add an accessible responsive price-history chart to property detail pages with NPR labels and unavailable-data state.
- [x] Add a Contact Agent modal for a specific property with validated name, email, phone, and message fields.
- [x] Add a server-side AI message-drafting procedure with bounded structured output, safe fallback, and no client-side secrets.
- [x] Add draft, edit, submit, loading, error, and success states to the Contact Agent flow.
- [x] Add Vitest and Playwright coverage for map toggle, price history, AI drafting, and inquiry submission.
- [x] Run final schema, type, unit, browser, build, and responsive checks and save a new checkpoint.

- [x] Verify Vercel deployment readiness for the full-stack frontend/backend repository while preserving Supabase configuration requirements.

- [x] Diagnose Vercel inability to access the private GitHub repository and document the required repository/App permission fix.

- [x] Change the PropNexus GitHub repository visibility from private to public for Vercel discovery and verify the result.

- [x] Adapt the Express/tRPC backend for Vercel serverless execution with an exported request handler and preserve the existing local server runtime.
- [x] Add and validate Vercel configuration for the full-stack build without exposing Supabase secrets.

- [x] Document Supabase connection, initial migration, Vercel environment setup, and post-deployment database verification steps for the user.

- [x] Diagnose and fix the Vercel deployment bundle if it still starts the local Express listener instead of exporting the serverless handler.

- [ ] Synchronize the corrected Vercel adapter and deployment configuration from the local project to the public GitHub main branch so Vercel stops deploying the stale bundle.
