---
name: design-md-library
description: Bibliothèque de référence de 84 DESIGN.md (couleurs, typo, espacements, composants, à faire / à éviter) analysés sur de vrais sites — Stripe, Linear, Vercel, Apple, Airbnb, Nike, Revolut, Spotify, Notion, Ferrari, Lamborghini, Bugatti, BMW, Tesla, SpaceX… Utiliser quand un brief de site premium cite une marque ou une ambiance de référence (« comme Linear / Stripe », « luxe automobile », « dev-tool sombre », « fintech épurée ») ou pour amorcer un design system / des design tokens.
---

# Bibliothèque DESIGN.md (sites de référence)

Source : https://github.com/VoltAgent/awesome-design-md (MIT, voir `../_licenses/awesome-design-md.LICENSE`). Chaque fichier de
`references/` décrit le langage visuel d'un site réel : en-tête YAML de tokens (couleurs, typographie, arrondis, espacements,
composants), puis Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Do's/Don'ts, Responsive.

## Mode d'emploi

1. Repérer 1 à 3 références proches du brief dans l'index ci-dessous (secteur, ambiance), ou chercher un mot-clé :
   `grep -il "luxury\|editorial\|dark" .claude/skills/design-md-library/references/*.md`.
2. Lire seulement ces fichiers. Partir de leurs tokens (palette, échelle typographique, espacements) et suivre leurs règles
   Components et Do's/Don'ts.
3. **S'inspirer, ne jamais cloner** : changer les couleurs de marque, ne reprendre ni logo ni marque déposée, remplacer les
   polices propriétaires par les équivalents libres indiqués. Écrire le résultat comme le `DESIGN.md` propre au projet du client
   (compatible avec les skills `design-system-generator` et `awwwards`).
4. Le mouvement n'est pas couvert : l'associer aux skills `gsap-*` et `awwwards`.

## Index

| Fichier | Langage visuel |
| --- | --- |
| `1win.md` | An analysis of 1win's design language — a near-black crypto casino and sportsbook built on Inter at heavy weights, where a vivid green action color an… |
| `airbnb.md` | A warm, generous consumer marketplace anchored on a clean white canvas and Airbnb Rausch (#ff385c), the single brand voltage that carries every primar… |
| `airtable.md` | A sober, editorial workflow-software interface anchored on white canvas and dark-ink type, where brand voltage comes from full-bleed signature cards i… |
| `aljazeera.md` | An analysis of Al Jazeera's design language — a hard-news editorial system built on flat white paper and dense Roboto headline stacks, signed by one s… |
| `apple.md` | A photography-first interface that turns marketing into a museum gallery. Edge-to-edge product tiles alternate light and dark canvases, framed by SF P… |
| `binance.md` | A confident financial-platform interface anchored on a deep near-black canvas, where Binance's iconic yellow (#FCD535) carries every primary CTA, bran… |
| `bmw-m.md` | A motorsport-engineering interface anchored on a near-black canvas with white BMW Type Next Latin display headlines in confident UPPERCASE. The brand… |
| `bmw.md` | BMW's corporate site — distinct from BMW M's motorsport-bombastic variant, this is a measured and settled corporate-automotive interface. On a light (… |
| `bugatti.md` | An austere luxury-automotive interface that uses near-pure black canvas, white uppercase letterspaced display, and full-bleed automotive photography a… |
| `cal.md` | A clean, calendar-software-first interface anchored on white canvas with black primary CTAs and custom Cal Sans display typography. The system reads a… |
| `claude.md` | A warm-canvas editorial interface for Anthropic's Claude product. The system anchors on a tinted cream canvas with serif display headlines, warm coral… |
| `clay.md` | A vibrant claymation-meets-data interface for Clay.com (GTM data-orchestration platform). Anchors on white canvas with dark-navy primary CTAs, custom… |
| `clickhouse.md` | A high-performance database interface anchored on near-pure black canvas with electric yellow as the brand voltage. White typography in confident sans… |
| `cohere.md` | Cohere's 2026 web system is a controlled enterprise AI interface built from stark white editorial space, deep green-black product bands, soft mineral… |
| `coinbase.md` | An institutional-grade crypto exchange whose marketing surfaces read like a quietly-confident financial-services brand. The base canvas is pure white;… |
| `composio.md` | A developer-tools brand for AI-agent tool integration whose marketing surfaces lean into a dark, technical aesthetic with a single deep-electric-blue… |
| `cursor.md` | An AI-first code editor whose marketing site reads like a quietly-confident developer-tools brand with a warm-cream editorial canvas (`#f7f7f4`) inste… |
| `dell-1996.md` | An inspired interpretation of Dell.com's 1996 design language — a catalog-era enterprise web design built around a literal black page frame, vivid fla… |
| `dji.md` | An analysis of DJI's design language — a product-photography showroom for drones and cameras, where full-bleed studio renders sit in square, gutter-se… |
| `elevenlabs.md` | A voice-AI brand whose marketing surfaces read like a quietly editorial print magazine. The base canvas is off-white (`#f5f5f5`) holding warm near-bla… |
| `expo.md` | A React Native developer-platform whose marketing site reads like a quietly-confident infrastructure brand. The base canvas is pure white with a soft… |
| `ferrari.md` | A luxury-automotive brand whose marketing surfaces read as cinematic editorial. The base canvas is **near-black** (`#181818`) holding pure white displ… |
| `figma.md` | A confident black-and-white editorial frame interrupted by oversized, hand-cut pastel color blocks. The marketing canvas is rigorously monochrome — fi… |
| `framer.md` | A confident dark-canvas builder marketing site that treats the page like a working artboard — pure black surfaces, white display type set in GT Walshe… |
| `hashicorp.md` | An enterprise-infrastructure marketing canvas built around a near-black ground (#000000) and a system of per-product accent colors — Terraform purple,… |
| `hp.md` | a white-paper enterprise-consumer system anchored by HP Electric Blue (`#024ad8`) as the lone signal CTA, near-black ink (`#1a1a1a`) for headlines, ge… |
| `ibm.md` | An enterprise-marketing canvas faithful to Carbon Design System: white surfaces, charcoal type, IBM Blue (#0f62fe) as the single confident accent, and… |
| `intercom.md` | An editorial customer-service marketing canvas built around a soft cream-white ground, charcoal type set in Saans (Intercom's proprietary geometric sa… |
| `jobright.md` | An analysis of Jobright's design language — an AI job-hunting platform built on an energetic spring-mint green against black and white, with pale-mint… |
| `kraken.md` |  |
| `lamborghini.md` |  |
| `linear.app.md` | A near-black product-focused marketing canvas built around #010102 (the deepest dark surface of any tool in this collection), light gray text (#f7f8f8… |
| `lovable.md` |  |
| `mastercard.md` |  |
| `mercury.md` | An analysis of Mercury's design language — a fintech system that moves between a deep ink-violet night world on the homepage and a pale, near-white li… |
| `meta.md` | Meta's design system spans hardware commerce (Quest VR, Ray-Ban Meta AI glasses) and brand surfaces with a confident product-merchandising voice. The… |
| `minimax.md` | MiniMax presents itself as a premium AI infrastructure brand through a striking duality — bold black-pill CTAs and stark white canvas for marketing, p… |
| `mintlify.md` | Mintlify presents documentation infrastructure with a dual-mode aesthetic — atmospheric sky-gradient marketing heroes (cloud illustration backdrops, s… |
| `miro.md` | Miro presents itself as the AI-powered visual workspace through a confident, almost playful brand voice — anchored by its signature canary yellow ({co… |
| `mistral.ai.md` | Mistral AI brands itself with a singular signature — atmospheric sunset gradients (mustard, orange, deep red) layered over photography of mountains, p… |
| `mongodb.md` | MongoDB carries a strong dual-mode visual identity — dark deep-teal hero bands with bright MongoDB green ({colors.brand-green}) CTAs paired with stark… |
| `mydealz.md` | An analysis of mydealz's design language — a high-density German deals-community system built on a confident brand green, where a stacked white-card f… |
| `nerdwallet.md` | An analysis of NerdWallet's design language — a personal-finance comparison platform built almost entirely from one deep green and a ladder of mints b… |
| `nike.md` | | |
| `nintendo-2001.md` | An analysis of Nintendo.com's 2001 design language — a brushed-periwinkle "console chrome" interface where every panel is a beveled metal plate, navig… |
| `notion.md` | Notion presents itself as the all-in-one workspace through a confident, illustration-rich brand voice — anchored by a deep navy hero band ({colors.bra… |
| `nvidia.md` | | |
| `ollama.md` | | |
| `opencode.ai.md` | | |
| `oracle.md` | An analysis of Oracle's design language — an enterprise system built on a warm neutral ladder rather than a colour palette. Six numbered greys carry a… |
| `oura.md` | An analysis of Oura's design language — a warm-paper wellness system that pairs a high-contrast Editorial serif with a quiet grotesque sans, wraps eve… |
| `pinterest.md` | | |
| `playstation.md` | | |
| `posthog.md` | | |
| `raycast.md` | | |
| `renault.md` | | |
| `replicate.md` | | |
| `resend.md` | | |
| `revolut.md` | | |
| `runwayml.md` |  |
| `sanity.md` |  |
| `sap.md` | An analysis of SAP's design language — an enterprise system that keeps almost everything on white and spends its structure on two greys and one blue.… |
| `sentry.md` | a developer-tools brand built on a deep purple-violet midnight canvas, electric lime accents, and a slightly subversive illustrated personality. The s… |
| `shopify.md` | a cinematic commerce platform that runs two parallel design tracks. The marketing-hero and product-narrative pages live on near-black canvases with fu… |
| `slack.md` | a workplace messaging brand built on a deep aubergine primary, with cream-lavender hero gradients, blue inline links, and pill CTAs. The system pairs… |
| `spacex.md` | a mission-oriented aerospace brand built on pure black canvas, full-bleed photographic and video heroes of rockets and Mars landscapes, and uppercase… |
| `spotify.md` |  |
| `starbucks.md` |  |
| `stripe.md` | a financial-infrastructure brand built on a deep navy ink, an electric indigo primary, and a recurring atmospheric gradient mesh that occupies the upp… |
| `supabase.md` | an open-source database platform built on a clean white-and-near-black system with a single signature emerald-green CTA, a custom humanist sans displa… |
| `superhuman.md` | a fast-email productivity brand split between an editorial dark hero (deep indigo navy with violet-sky atmospheric backdrop and a portrait subject) an… |
| `tesla.md` |  |
| `theverge.md` |  |
| `together.ai.md` | an AI infrastructure platform whose surface alternates between near-black hero bands (with a three-color orange-magenta-periwinkle gradient as the sin… |
| `uber.md` | a transportation-and-delivery super-app brand whose web surface is a black-and-white duet, framed by a custom geometric display sans, accented by a si… |
| `vercel.md` | a developer-platform brand whose surface is a stark black-and-ink duet on near-white canvas, broken at hero scale by a multi-color mesh gradient (cyan… |
| `vodafone.md` | a telecom super-brand whose web surface alternates between editorial photography hero bands with massive uppercase display headlines and clean white c… |
| `voltagent.md` | a developer-focused AI agent engineering platform whose surface is an unrelenting near-black canvas broken only by a single electric-green brand accen… |
| `warp.md` | an agentic terminal-and-development-environment brand whose surface is a warm near-charcoal canvas (a tint warmer than pure black), broken only by cle… |
| `webflow.md` | a visual web development platform whose surface contrasts a deep near-black `#080808` primary against a generous white canvas, broken by a five-stop c… |
| `wired.md` | a flagship technology-magazine brand whose surface is a strict editorial duet of stark black wordmark on white canvas, anchored by a tall narrow custo… |
| `wise.md` | a global money-transfer brand whose surface combines an unusually heavy near-black display sans (weight 900 at 64–126 px) with a vivid lime-green bran… |
| `x.ai.md` | Elon Musk's frontier-AI company whose web surface is a strict near-black canvas broken only by white pill outlines, occasional warm sunset / dusk grad… |
| `zapier.md` | a workflow-automation platform whose surface combines warm-cream neutrals (`#fffefb` canvas, `#f8f4f0` soft cream) with deep coffee ink (`#201515`) an… |
