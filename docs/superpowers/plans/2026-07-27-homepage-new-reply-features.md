# Homepage New Reply Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage messaging around HighEQ's new reply workflow: 5 smart candidates, style labels, regenerate, screenshot recognition, and continue-chat sessions.

**Architecture:** Keep the existing React/Tailwind single-page homepage and reuse current UI primitives. Update page copy, local data arrays, visible sections, React SEO metadata, prerender SEO injection, and noscript fallback together so browser-rendered and prerendered HTML stay aligned.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vite, react-helmet-async, Playwright prerender script.

---

### Task 1: Reframe Homepage Content

**Files:**
- Modify: `high-eq-front/client/src/pages/Home.tsx`

- [ ] Update hero title and subtitle to position HighEQ as a continued conversation assistant, not just a one-shot reply generator.
- [ ] Replace the demo copy with a 5-candidate workflow using dynamic `styleLabel` examples.
- [ ] Add a dedicated continue-chat section explaining context memory and session history.
- [ ] Update feature cards to include style labels, regenerate, screenshot recognition, and continue-chat.

### Task 2: Sync SEO And Prerender Metadata

**Files:**
- Modify: `high-eq-front/client/src/pages/Home.tsx`
- Modify: `high-eq-front/scripts/prerender-home.mjs`
- Modify: `high-eq-front/client/index.html`

- [ ] Update runtime SEO title, description, keywords, and JSON-LD description.
- [ ] Update prerender homepage SEO block with the same message.
- [ ] Update noscript fallback to mention 5 replies, style labels, continue-chat, and screenshot recognition.

### Task 3: Verify

**Files:**
- Check: `high-eq-front/client/src/pages/Home.tsx`
- Check: `high-eq-front/scripts/prerender-home.mjs`
- Check: `high-eq-front/client/index.html`

- [ ] Run `pnpm check`.
- [ ] Run `pnpm build` to verify prerender output.
- [ ] Refresh `http://localhost:3000/` and inspect the visible homepage.
