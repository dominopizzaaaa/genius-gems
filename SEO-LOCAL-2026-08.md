# Genius Gems — Local SEO Pass: Flora Drive, Loyang, Pasir Ris, Changi (15 Aug 2026)

Follow-up to `SEO-AUDIT-2026-07.md`. This pass targets the four neighbourhood keywords the
centre actually competes for, and fixes the keyword-less homepage `<h1>` left over from July.

## 1. Keyword targets

| Page | Primary keyword |
|---|---|
| `/` | childcare centre Changi / Loyang / Pasir Ris |
| `/location/` | areas we serve (hub) |
| `/location/flora-drive/` | childcare near Flora Drive |
| `/location/loyang/` | childcare near Loyang |
| `/location/pasir-ris/` | childcare near Pasir Ris |
| `/location/changi/` | childcare near Changi |

Rationale: "childcare centre Singapore" is a national head term contested by MindChamps, PCF
Sparkletots and Skool4Kidz. A single-site centre wins on neighbourhood intent instead —
"childcare near <estate>" — which is also where enrolment-ready searches sit.

## 2. New pages

Four pages, hub-and-spoke off `/location/`. Each carries its own `<h1>`, meta, `FAQPage`
schema, `BreadcrumbList`, and a live Google Maps directions link from that neighbourhood.

Content is deliberately **distinct per page** (different commute angle, different landmarks,
different reasons-to-choose) rather than a templated swap of the place name — near-duplicate
location pages read as doorway pages and get filtered.

## 3. On-page changes

- **Homepage `<h1>` now carries the keyword.** A `.hero-title-kicker` sub-line was added
  *inside* the `<h1>`: "Bilingual Childcare Centre in Changi, Singapore — serving Flora Drive,
  Loyang & Pasir Ris". The July pass deduplicated the `<h1>` but left it as pure brand copy
  ("Shaping Tomorrow's Brightest Gems"), so the priority-1.0 page named none of its keywords.
  The original brand lines are untouched and still dominant.
- **New "Areas We Serve" block** in the homepage Location section, linking all four pages.
- **Meta titles/descriptions/keywords** rewritten on the homepage, gallery and open-house
  pages to carry the neighbourhood terms.
- **Footer** now links all four location pages plus the hub, from every page — site-wide
  internal linking so the new URLs get crawled and pass signal.
- **Blog cross-links**: the Changi guide and small-class articles now link to the relevant
  neighbourhood pages instead of a bare list of place names.

## 4. Structured data

- `areaServed` widened on every `LocalBusiness`/`Preschool` node to: Changi, Flora Drive,
  Loyang, Pasir Ris, Changi Village, Tampines, Bedok, Simei, Singapore.
- `FAQPage` added to `/location/changi/` and all four new pages, with genuine
  location-intent questions ("Which childcare centres are near Flora Drive?").
- `/location/changi/` breadcrumbs re-levelled to Home › Locations › Childcare Near Changi.
- All JSON-LD on all 15 pages parses cleanly.

## 5. i18n

`hero.title_kicker` and nine `loc.area*` keys added for **en, zh, ms, ta** — key parity
verified across all four languages. The "See all areas we serve" line uses `data-i18n-html`
so its inner link survives translation. The `translations.json` fetch version in
`language-switcher.js` was bumped alongside the site-wide `?v=20260815a` cache-bust,
otherwise returning visitors would load cached translations missing the new keys.

## 6. Verified

- 15 pages: JSON-LD valid, exactly one `<h1>`, canonical present, no dead internal links,
  no unclosed tags.
- `sitemap.xml` parses; 14 URLs (was 10).
- Rendered in Chromium at 1280px and 390px — hero kicker and areas grid both centre and
  reflow correctly.
- Language switcher exercised in all four languages: no console errors.

## 7. Not done — needs your input

1. **Named developments.** Pages say "the Flora Drive and Flora Road condominium belt"
   rather than naming individual condos. Naming them is strong long-tail SEO, but I will not
   assert specific estate names I cannot verify. Send me the list and I will add them.
2. **Drive times.** Kept qualitative ("a few minutes by car"). Real door-to-door times per
   neighbourhood would be better — measure them and I will put exact figures in.
3. **Google Business Profile.** Still the single biggest local-pack lever and still
   unverified. Its service areas should list the same four neighbourhoods; category should be
   "Preschool / Child care agency". Reviews collected there — not review schema on the site —
   are what put stars in the local pack.
4. **Mobile performance items** from `SEO-AUDIT-2026-07.md` §7 remain open, notably the
   12 MB `Excursion.mp4` and the full-viewport Open House banner gating LCP.
