# Skills tierces installées (10 octobre 2026)

| Pack | Source | Skills |
|---|---|---|
| Emil Kowalski | https://github.com/emilkowalski/skill | emil-design-eng, animate, animate-expo, animation-vocabulary, apple-design, ask-sonner, break-ui, find-animation-opportunities, improve-animations, mobile-native, pick-ui-library, emil-prototype (renommée : conflit avec `prototype`), review-animations, write-swift |
| Taste | https://github.com/Leonxlnx/taste-skill | design-taste-frontend, gpt-taste, high-end-visual-design, minimalist-ui, industrial-brutalist-ui, redesign-existing-projects, stitch-design-taste, full-output-enforcement, imagegen-frontend-web, imagegen-frontend-mobile, taste-brandkit et taste-image-to-code (renommées : conflits) |
| Impeccable | https://github.com/pbakaus/impeccable (Apache 2.0) | impeccable — **hooks non activés** (activer avec `/impeccable hooks on`) ; son lanceur télécharge un binaire au premier usage |

Mise à jour : recloner le dépôt source et recopier le dossier de la skill.
| HyperFrames (HeyGen) | https://github.com/heygen-com/hyperframes (Apache 2.0) | hyperframes (point d'entrée vidéo) + hyperframes-core, -cli, -animation, -keyframes, -creative, -audio, -registry, -studio (requises par l'entrée). Utilise la CLI `npx hyperframes` au premier usage. |

## Ajout du 22 octobre 2026 : sites d'agence premium et vidéo pro

Relues fichier par fichier avant installation (instructions, scripts, appels réseau). Les skills vidéo ont reçu une note
« Adaptation à ce repo » en tête de SKILL.md (conteneur Linux : faster-whisper, libx264, aucune installation lourde ni envoi
vers un service tiers sans accord).

| Pack | Source (commit) | Skills | Notes |
|---|---|---|---|
| juliobsz | https://github.com/juliobsz/skills (`ea8f145`, MIT) | awwwards, jury | Sites niveau Awwwards (Next.js/Astro, GSAP, Lenis, OGL, QA navigateur) et jury qui note un site à l'aveugle. Dépendances npm `gsap lenis ogl`, `playwright axe-core`. |
| Vercel | https://github.com/vercel-labs/agent-skills (`063bee9`, MIT selon le README) | vercel-react-best-practices, vercel-react-view-transitions, vercel-composition-patterns | `deploy-to-vercel` **non installée** : sans compte, son script de repli envoie tout le projet vers un serveur public. |
| GreenSock (officiel) | https://github.com/greensock/gsap-skills (`aed9cfd`, MIT) | gsap-core, gsap-timeline, gsap-scrolltrigger-official, gsap-plugins, gsap-utils, gsap-react, gsap-frameworks, gsap-performance | `gsap-scrolltrigger` renommée `gsap-scrolltrigger-official` (conflit) ; exemple de défilement horizontal corrigé (`Max.max` → `Math.min`, `x` en pixels). |
| Design.md | https://github.com/VoltAgent/awesome-design-md (`3b60532`, MIT) | design-md-library | Skill d'emballage écrite ici + 84 DESIGN.md de sites réels dans `references/`. S'inspirer, ne jamais cloner une marque. |
| Louise de Sadeleer | https://github.com/louisedesadeleer/cut-video (`a5a87a6`), /clipify (`5f6b75e`), /add-zooms (`34db910`), tous MIT | cut-video, clipify, add-zooms | Montage façon YouTubeur : coupes de silences et d'hésitations, shorts 9:16 avec sous-titres mot à mot, zooms d'emphase. `install.sh`, gifs et docs non copiés. `b-roll-finder` **non installée** (s'autorise à utiliser les cookies et la session du navigateur sans demander). |
| aabrole | https://github.com/aabrole/claude-video-thumbnail-skill (`ba3d3ce`, MIT) | video-thumbnail | Miniatures YouTube / Shorts. Clé GEMINI_API_KEY payante ; envoie les photos à Google, seulement avec accord. |

Écartées après relecture : superdesign (envoie le code source à un SaaS payant, prend la main sur toutes les tâches d'interface),
tponscr-debug/claude-skill-awwwards (générique, en partie faux), wshuyi/remotion-video-skill (doublon des skills Remotion, TTS
payante par défaut), eng0ai/eng0-template-skills et tellahq/skills (pas de licence). Les skills Remotion officielles
(remotion-dev/skills) ne sont pas copiées ici : leur licence n'autorise pas clairement la redistribution ; les installer avec le
plugin « Remotion » du répertoire Anthropic ou `npx skills add remotion-dev/skills`.
