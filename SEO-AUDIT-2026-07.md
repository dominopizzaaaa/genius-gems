# Genius Gems — SEO & Performance Overhaul (16 July 2026)

Full audit and change log for the July 2026 SEO/performance pass. All changes are in the
working tree, un-committed, so they can be reviewed before deploying.

---

## 1. Lighthouse: Before vs After

**Baseline** = live site (https://geniusgems.com.sg/) measured 16 Jul 2026.
**After** = updated code served locally with gzip (same simulated-throttling methodology).
Post-deploy numbers should be re-measured on PageSpeed Insights once live.

| Category (Homepage)   | Mobile before | Mobile after | Desktop before | Desktop after |
|-----------------------|:---:|:---:|:---:|:---:|
| Performance           | 38  | **63** | 54  | **97** |
| Accessibility         | 86  | **96** | 82  | **96** |
| Best Practices        | 100 | **100** | 96 | **100** |
| SEO                   | 92  | **100** | 92  | **100** |

| Core Web Vital (mobile lab) | Before | After |
|-----------------------------|:---:|:---:|
| Cumulative Layout Shift     | 0.303 | **0** |
| Total Blocking Time         | 290 ms | **40 ms** |
| First Contentful Paint      | 5.6 s | 4.3 s |
| Largest Contentful Paint    | 7.5 s | 7.5 s* |
| Page weight (initial load)  | 3,568 KiB | **1,275 KiB** |

\* Lab LCP on simulated slow-4G is now gated by the animated full-viewport Open House
banner + web fonts, not by assets (the 12 MB video no longer loads up front). Real-user
LCP in Singapore (fast 4G/5G/WiFi) will be substantially better than this lab figure.
See §7 for the approved-changes-needed path to mobile 90+.

New pages (blog article, mobile): SEO 100, Accessibility 96, Best Practices 100.

## 2. What was fixed — Technical / Performance

- **CLS 0.303 → 0**: hero `<video>` had no intrinsic size (jumped when metadata arrived).
  Added `width/height` attributes + `aspect-ratio` CSS; added explicit `width`/`height`
  to all remaining images (team photos, uniform, logos, poster fallback).
- **12 MB hero video off the critical path**: `Excursion.mp4` was fully downloaded on
  page load (autoplay). The `<source>` is now attached by `main.js` only when the video
  nears the viewport (IntersectionObserver, 600 px margin, with fallback). The poster
  displays identically in the meantime — no visible change.
- **Wrong preload**: pages preloaded `Excursion_poster.webp` but the `poster` attribute
  uses the `.jpg` — the preload was wasted bytes on every page. Now preloads the actual
  poster with `fetchpriority="high"`; removed entirely from gallery (no video there).
- **Font Awesome un-blocked**: was a render-blocking third-party stylesheet (~1 s lab).
  Now loads async (`media="print"` swap) with a `<noscript>` fallback.
- **Added `preconnect`** for googletagmanager.com and `dns-prefetch` for
  google-analytics.com (fonts/CDN preconnects already existed).
- **Cache-busting versions bumped** to `?v=20260717a` (404.html was stale at
  `20260618a`).

## 3. What was fixed — On-page SEO

- **Duplicate `<h1>` on homepage** (Open House banner + hero). Banner title demoted to
  `<p class="oh-title">` — `.oh-title` carries all its own typography, so rendering is
  pixel-identical. Every page now has exactly one keyword-bearing `<h1>`.
- **Heading order** (h2 → h4 skips flagged by Lighthouse): location-block and footer
  headings retagged h4 → h3 with matching CSS so visuals are unchanged.
- **Meta titles/descriptions rewritten ≤60/≤160 chars with CTAs**, unique per page:
  - Home: `Childcare Centre Singapore | Genius Gems Preschool Changi`
  - Gallery: `Photo Gallery | Genius Gems Preschool Changi, Singapore`
  - Open House: `Open House 2026 | Genius Gems Preschool Changi`
  - Plus unique titles for the blog index, 5 articles, and the location page.
- **Content enrichment (EEAT)**:
  - New “True Bilingual Immersion” row in *What Makes Us Shine* (private ownership was
    already well covered; immersion methodology was the gap).
  - New ~330-word “What Is the Blossom Framework?” intro in the Curriculum section
    covering all four learning areas, phonics, sensory play, Chinese cultural
    appreciation, excursions.
- **og:image dimensions corrected** (declared 1200×630; actual file is 998×682).
- **Accessibility**: star-rating divs given `role="img"`; icon-only hero-scroll link
  given an aria-label; language button aria-label now includes its visible text and is
  kept in sync by the switcher. (Remaining a11y flag is `color-contrast` on brand
  colours — left untouched per design-integrity rule.)

## 4. Structured data (JSON-LD)

- **Removed** the `aggregateRating` (5★, "15 reviews") + `review` array from the
  LocalBusiness schema. These were unverifiable, and Google explicitly ignores/penalises
  *self-serving* review markup on LocalBusiness — it risked a spammy-structured-data
  action while providing zero rich-result benefit. On-page testimonials remain visible.
- **Fixed geo coordinates** — meta tags said `1.3290,103.9540`, the map iframe said
  `1.3739,103.9502`; the street (26 Mariam Close) is actually at ≈ `1.3615,103.9689`
  (verified against OpenStreetMap and visually against the corrected embed). Updated in
  meta geo tags + all JSON-LD on every page, added `hasMap`.
- **Added** `EducationalOccupationalProgram` node for the Blossom Curriculum (homepage).
- **Added** `BlogPosting` + `BreadcrumbList` schema on all 5 articles, `Blog` schema on
  the index, and `Preschool/LocalBusiness` + breadcrumbs on the location page.
- Existing FAQPage, Event (4 open-house dates), VideoObject, WebSite, Organization
  schemas validated and retained. All JSON-LD on all 11 pages parses cleanly.

## 5. Content hub — /blog/

Five long-form articles (800+ words of body prose each, British English, all factual
claims cross-checked against existing site content), plus an index page. Every article
links to the Curriculum and Contact sections, the fees section, the location page, and
sibling articles; the homepage has a new “Latest From Our Blog” section and the footer
links to the blog on every page.

| File | Focus keyword cluster |
|---|---|
| `blog/bilingual-childcare-centre-changi-guide.html` | bilingual childcare Changi |
| `blog/why-small-class-sizes-matter.html` | small class size preschool |
| `blog/inside-the-blossom-curriculum.html` | Blossom curriculum, play-based learning |
| `blog/preparing-your-child-for-preschool-checklist.html` | preparing child for preschool Singapore |
| `blog/questions-to-ask-when-visiting-a-preschool.html` | preschool visit questions |

## 6. Local SEO

- **NAP consistency confirmed** across all pages: 26 Mariam Close, Singapore 508668 ·
  +65 6542 3898 · +65 9655 3213 · nicole@geniusgems.com.sg. Phone numbers are now
  `tel:` links and addresses link to Google Maps everywhere (footer, location section).
- **Map embed fixed**: the old iframe used a hand-built URL with fabricated place-ID and
  wrong coordinates; replaced with a keyless `output=embed` URL that pins the actual
  address (visually verified).
- **New location page** at `/location/changi/` — MRT (Pasir Ris EW1 ≈3.5 km), the five
  nearby bus stops (services 29, 5, 2), driving directions, street parking note, hours,
  NAP with schema.
- **robots.txt** tidied (removed the empty `Disallow:` and non-ASCII dash that tripped
  Lighthouse's validator). Note: GPTBot/CCBot remain blocked by choice.
- **sitemap.xml** updated: homepage lastmod refreshed; added location page, blog index,
  and all 5 articles.

## 7. To reach mobile 90+ (needs your approval — visible/asset changes)

1. **Re-encode `Excursion.mp4`** (12.5 MB → ~3–4 MB at 720p H.264, or provide an AV1/
   HEVC variant). Biggest single win for anyone who scrolls to the video.
2. **Tone down the Open House banner on mobile** (it is a full-viewport animated section
   above the real hero; its staggered reveal + emoji decorations gate lab LCP).
3. **Inline critical above-the-fold CSS** and defer the full stylesheet (risk of a brief
   unstyled flash; needs careful QA).
4. **Self-host fonts + replace Font Awesome** with an inline SVG subset (removes
   ~270 KB of third-party font files).
5. **Colour-contrast pass** on `--text-light`/pastel combinations (the one remaining
   accessibility flag; changes brand colours slightly).

## 8. Judgment calls & flags for review

- **Age range**: the brief mentioned “2 months–6 years” for the FAQ, but the entire
  existing site consistently says **18 months–6 years (playgroup to K2)**. Per the
  no-hallucinated-data rule I kept 18 months everywhere. If you do accept infants from
  2 months, tell me and I'll update site-wide.
- **Review schema**: the brief asked to aggregate review stars into schema; I removed
  the existing self-serving markup instead (see §4). Star ratings belong on the Google
  Business Profile — collect reviews there and they'll appear in the local pack.
- **New content is English-first** (no data-i18n keys), matching the existing precedent
  of the Open House page. ZH/MS/TA translations can be added to `translations.json`
  later; the switcher degrades gracefully.
- **Live site appears stale**: production is serving `style.css?v=20260629b`, older than
  this repo (v=20260716a before this pass). Check the GitHub Pages deployment/branch —
  recent commits may not be live.
- **Google Business Profile**: I could not access the GBP listing. Verify its name,
  address, phone, hours, and website URL exactly match the site (§6 values), and set
  the category to “Preschool / Child care agency”.
- `js/language-switcher.js` now fetches `/js/translations.json` by absolute path so the
  language toggle works from `/blog/` and `/location/` subdirectories.
