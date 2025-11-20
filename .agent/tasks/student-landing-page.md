---
description: Update home page for non-logged-in users to target students
---

# Student Landing Page Plan

## Goal
Update the home page to show a dedicated landing page for users who are not logged in, specifically targeting students with a mobile-first design.

## Tasks

- [x] Create `StudentLanding` component
    - [x] Mobile-first layout
    - [x] Hero section with student-focused copy
    - [x] "Sign In" / "Get Started" Call to Action
    - [x] Feature highlights (optional but good for conversion)
- [x] Update `HomeContent` to conditionally render
    - [x] Use `useMe` to check auth state
    - [x] Show `StudentLanding` if not logged in
    - [x] Show existing dashboard if logged in
- [x] Verify design and responsiveness
