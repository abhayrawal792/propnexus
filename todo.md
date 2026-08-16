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
