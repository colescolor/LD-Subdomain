# SEO and project inquiries

The public guide index is /guides/. Three source-linked HTML guides cover channel-lock operation, E3259BM assembly sequence, and cabinet assembly planning. Each has its own title, description, canonical, Article and breadcrumb structured data, and project-review link. These guides explain planning concepts; connector selection and machining details still need project-specific technical review.

## Vercel and indexing

Connect this repository to Vercel with the checked-in vercel.json. Production deployments automatically generate indexable public pages and a populated /sitemap.xml. Preview deployments and ordinary local builds retain noindex. The local server always adds a noindex header. For an isolated production build, run node scripts/build.mjs --production --out=.local/production-review.

Set SITE_URL to the final HTTPS origin in both build and function environments; it defaults to https://build.lockdowel.com. Connect that domain in Vercel before expecting canonical URLs to resolve. Keep one primary domain and redirect other public domains to it through Vercel domain settings.

The /projects/ examples stay noindex and are excluded from the sitemap. Vercel adds noindex headers to their pages and source files. Robots allows crawlers to see those directives: noindex is not access control. Do not add confidential files without authentication.

Verify ownership in Google Search Console using DNS or set GOOGLE_SITE_VERIFICATION to the supplied URL-prefix HTML token and redeploy. Submit the production /sitemap.xml, inspect the home page and a guide, and monitor impressions, clicks, indexing, and queries. Search Console setup and domain verification have not been performed by this code change.

Google reference: https://developers.google.com/search/docs/crawling-indexing/block-indexing

## Measurement

Enable Web Analytics in the Vercel project dashboard, set WEB_ANALYTICS_ENABLED=true for production, and redeploy. Leave WEB_ANALYTICS_EVENTS=false unless the account supports custom events (currently Pro or Enterprise). After confirming support, set it true and redeploy. The flags are read at build time. No collection is enabled by default.

Tracked events: guide_read (the review checklist reached the viewport), inquiry_started, inquiry_submitted (only after the receiver accepts it), evaluation_kit_clicked, product_clicked, drawing_downloaded, brief_downloaded, savings_exported, and video_started. This is attribution within this site; it does not establish downstream store purchases.

Only known public paths enter event properties. Pageview URLs have query strings and fragments removed. Private project paths are dropped. Contact details, free text, drawing names, and attachments are never passed to analytics. Do Not Track and Global Privacy Control disable collection. Local CustomEvents support browser verification without contacting an analytics service.

Vercel references: https://vercel.com/docs/analytics/quickstart and https://vercel.com/docs/analytics/custom-events

## Inquiry delivery: configuration still required

Choose an approved CRM, form processor, or email-delivery workflow that receives HTTPS JSON. An inbox address alone is not a webhook; it needs an email service or workflow that routes this payload to that inbox. Set INQUIRY_WEBHOOK_URL as a production server environment variable and optionally INQUIRY_WEBHOOK_TOKEN for Bearer authentication. Never place credentials in public HTML. The receiving workflow must accept the contract below and return 2xx only after it has accepted responsibility for delivery. Configure attachment decoding and downstream handling there.

Until a destination is configured, GET /api/inquiries reports available:false and the send button remains disabled. Visitors can save a local brief and use Lockdowel's direct contact page. No inquiry has been sent to a real destination during development.

POST /api/inquiries requires JSON, a matching SITE_URL Origin, contactName, email, application, material, question (10–3000 characters), and consent:true. Optional fields are company, volume, source, product, and attachment. The website honeypot must remain empty. Application choices match the form. Source paths and product context are allowlisted.

The receiver gets type:lockdowel.project-inquiry, reference (UUID), submittedAt (ISO timestamp), the validated fields, and optional attachment:{name,type,content}. Content is base64; supported types are application/pdf, image/png, and image/jpeg. Files have a 2 MiB decoded limit and signature checks. Request bodies have a 3 MiB limit. The Idempotency-Key header equals the reference; the receiver should use it to prevent duplicate handling. A manual visitor retry is a new submission, so failure copy asks them to contact the team before resubmitting when delivery is uncertain.

The function forwards only to the configured receiver, refuses redirects, and times out after 12 seconds. The browser waits up to 18 seconds. Errors preserve the form. The site does not store submissions or publish attachments; retention and access controls belong to the receiving service. Signature checks are not malware scanning. Before accepting public uploads, configure the receiver's normal attachment scanning and access controls.

A honeypot and best-effort limit of eight accepted-to-forward attempts per address per hour reduce basic abuse. The limit is per warm function instance, not a shared global guarantee. Configure Vercel Firewall rate limits or a shared limiter if traffic requires stronger enforcement.

Local/preview delivery is disabled unless INQUIRY_ALLOW_LOCAL=true is deliberately set. The example env file is documentation; these scripts do not automatically load .env files. Tests inject a mock receiver and never send email or CRM messages.

## Verification and launch checks

Run npm ci, npm run build, and npm run check. Automated coverage includes production/preview metadata, sitemap exclusions, guide structured data, inquiry validation, attachment limits, receiver failures, and existing geometry/media routes. Browser verification covers desktop/mobile guides, guide-to-form context, unavailable delivery, a failed submission that preserves fields, mocked success, local brief downloads, and no-JavaScript content.

After setting up Vercel, inspect the actual domain's canonical and robots metadata, confirm /sitemap.xml returns production URLs, and verify /api/inquiries returns the expected availability. Complete one authorized end-to-end inquiry to the chosen receiver and confirm the attachment arrives before considering inquiry delivery live. Enable and confirm analytics in the dashboard separately. A Git push is not proof of a successful deployment.
