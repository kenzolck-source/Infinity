# Project Instructions

## Automatic GitHub version publishing

- After completing and validating any user-requested project update, run:
  `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/publish-version.ps1`
- The publisher owns version numbering. Do not manually choose or reuse a version number.
- A version commit must use `MMDD Ver.N`, for example `0717 Ver.1`. Numbering restarts at `Ver.1` on a new Shanghai calendar date.
- Publish only completed project changes. Do not publish temporary previews, logs, local executables, dependency caches, or unfinished edits.
- If the publisher reports that there are no project changes, no version should be created.

