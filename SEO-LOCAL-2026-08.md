# Genius Gems — Local SEO Pass: Flora Drive, Loyang, Pasir Ris, Changi (15 Aug 2026)

Follow-up to `SEO-AUDIT-2026-07.md`. Goal: get found by parents searching from the four
neighbourhoods around the centre, and fix the keyword-less homepage `<h1>` left over from July.

**Genius Gems is one centre, at 26 Mariam Close.** Flora Drive, Loyang, Pasir Ris and Changi
are the *vicinity* — the neighbourhoods families travel from. Nothing on the site should read
as a branch network.

## 1. Keyword targets

Two pages carry the local terms; there is no per-neighbourhood page.

| Page | Primary keyword |
|---|---|
| `/` | childcare near Loyang / Flora Drive / Pasir Ris / Changi |
| `/location/changi/` | getting here from each of those neighbourhoods |

Rationale: "childcare centre Singapore" is a national head term contested by MindChamps, PCF
Sparkletots and Skool4Kidz. A single centre wins on proximity intent instead — "childcare near
<neighbourhood>" — which is also where enrolment-ready searches sit.

**Why not a page per neighbourhood.** A `/location/<place>/` directory is the structure a
multi-branch chain uses; four "Childcare near X" pages read as four centres to a parent
skimming the footer, and as thin near-duplicates to Google. For a single site the correct
pattern is one location page that answers the proximity question for every nearby area.

## 2. On-page changes

- **Homepage `<h1>` now carries the keyword.** A `.hero-title-kicker` sub-line was added
  *inside* the `<h1>`: "A bilingual childcare centre in Changi, Singapore — minutes from Flora
  Drive, Loyang & Pasir Ris". The July pass deduplicated the `<h1>` but left it as pure brand
  copy ("Shaping Tomorrow's Brightest Gems"), so the priority-1.0 page named none of its
  keywords. The brand lines are untouched and still dominant.
- **"Minutes From Your Neighbourhood" block** in the homepage Location section — one sentence
  stating plainly that we are one centre, then four pill links that deep-link into the
  matching section of the location page. Deliberately *not* a card grid: cards read as a
  branch picker.
- **`/location/changi/` gained a "Getting Here from Your Neighbourhood" section** with a
  subsection per area (`#from-flora-drive`, `#from-loyang`, `#from-pasir-ris`, `#from-changi`),
  each with its own commute angle and a live Google Maps directions link from that
  neighbourhood. Existing MRT / bus / driving sections kept below it.
- **Meta titles/descriptions/keywords** updated on the homepage, location page, gallery and
  open-house pages to carry the proximity terms.
- **Blog cross-links** now point at `#from-your-area` rather than listing bare place names.
- **Footer** keeps its single location link, relabelled "Getting Here & Directions".

## 3. Structured data

- `areaServed` widened on every `LocalBusiness`/`Preschool` node to Changi, Flora Drive,
  Loyang, Pasir Ris, Changi Village, Tampines, Bedok, Simei, Singapore. This is the correct
  way for a single-location business to declare the areas it draws from — it does not imply
  additional premises, because there is still exactly one `address` and one `geo`.
- `FAQPage` on `/location/changi/` rewritten around proximity intent ("Is there a childcare
  centre near Flora Drive?", "How far is Genius Gems from Pasir Ris MRT?").
- All JSON-LD on all 11 pages parses cleanly.

## 4. Other

- `html { scroll-padding-top: 92px }` added. The fixed navbar was covering anchor targets;
  this matters now that the homepage deep-links into location-page sections. It also fixes
  the pre-existing behaviour of the main nav's in-page links.
- i18n: `hero.title_kicker` and seven `loc.nearby_*` keys added for **en, zh, ms, ta**, key
  parity verified. The "Full directions" line uses `data-i18n-html` so its link survives
  translation. The `translations.json` fetch version in `language-switcher.js` was bumped
  alongside the site-wide `?v=20260815a` cache-bust — otherwise returning visitors would load
  cached translations missing the new keys.

## 5. Verified

- 11 pages: JSON-LD valid, exactly one `<h1>`, canonical present, no dead internal links or
  dead anchors, no unclosed tags.
- `sitemap.xml` parses; 10 URLs.
- Rendered in Chromium at 1280px and 390px; all four deep-link anchors land clear of the
  navbar.
- Language switcher exercised in all four languages: no console errors.

## 6. Not done — needs your input

1. **Named developments.** The Flora Drive section says "Flora Drive and Flora Road" rather
   than naming individual condos. Naming them is strong long-tail SEO, but I will not assert
   estate names I cannot verify. Send me the list and I will add them.
2. **Drive times.** Kept qualitative ("a few minutes by car"). Real door-to-door times per
   neighbourhood would convert better — measure them and I will put exact figures in.
3. **Google Business Profile.** Still the biggest local-pack lever and still unverified from
   July. Set its service areas to these four neighbourhoods and its category to
   "Preschool / Child care agency". Reviews collected there — not review schema on the site —
   are what put stars in the local pack.
4. **Mobile performance items** from `SEO-AUDIT-2026-07.md` §7 remain open, notably the
   12 MB `Excursion.mp4` and the full-viewport Open House banner gating LCP.
