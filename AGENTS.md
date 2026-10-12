# Guide for AI coding agents

## Project overview

Game Badges is a Decky plugin for Steam Deck. It adds editable, per-game badges to the Steam library app overview. A badge can be a free-form tag, one of four statuses (pending, in progress, completed, or abandoned), a version, or a date. Tags can appear multiple times per app, but status, version, and date badges are limited to one each per app.

## How the code is organized

- `src/index.tsx` registers the plugin, loads settings, installs the game-page patch, and removes that patch when the plugin is unloaded.
- `src/patches/gamePatch.tsx` hooks the `/library/app/:appid` route and inserts the badge UI into the app overview.
- `src/components/badges-container.tsx` displays a game's badges and opens the editor.
- `src/components/badges-modal.tsx` edits, reorders, and removes badges.
- `src/hooks/useSettings.ts` defines the badge/settings types, exposes settings to React components, and calls the Decky backend.
- `main.py` implements the Python settings bridge (`get_setting`, `set_setting`, and `reload_settings`). Settings are stored under the plugin's `settings` key; the plugin settings file is named `gamebadges.json`.
- `backend/` contains a native C backend example; the current badge UI and settings flow use `main.py`.

## Settings data shape

Settings are keyed by Steam app ID, using keys of the form `badges-<appid>`. Each value is an ordered array of badges:

```ts
type TagBadge = { type: "tag"; value: string };
type StatusBadge = {
  type: "status";
  status: "pending" | "completed" | "in-progress" | "abandoned";
};
type VersionBadge = { type: "version"; value: string };
type DateBadge = { type: "date"; value: string };
```

Keep frontend types and the data persisted by the Python bridge compatible. Badge ordering is meaningful because it controls display order. `status`, `version`, and `date` are singular badge types: at most one of each may exist per app, enforced by the editor (`isSingularBadgeType` in `src/hooks/useSettings.ts`).

## Development and checks

- Install dependencies with `pnpm install`.
- Build the frontend bundle with `pnpm run build` (Rollup config is in `rollup.config.js`; output goes to `dist/`).
- `pnpm run watch` runs the Rollup build in watch mode.
- `./build.sh` builds, packages a dev-labeled archive without changing the plugin identity, and copies it to the Deck using the `deck` SSH alias. Override the target or remote directory with `DECK_SSH_TARGET` or `DECK_REMOTE_DIR`.
- There is no automated test suite configured: the `test` script in `package.json` intentionally exits with “no test specified.”
- TypeScript is configured in `tsconfig.json` with strict checks. A standalone check can be run with `pnpm exec tsc --noEmit`.

## Editing guidance

- Make feature changes in `src/`, not in generated bundles or source maps under `dist/`.
- Preserve Decky lifecycle cleanup when changing route patches or subscriptions.
- Keep UI components consistent with the existing React and `@decky/ui` patterns.
- Treat `deck.json` as local deployment configuration; do not change its connection settings as part of unrelated work.
- The root `README.md` still contains Decky template guidance, so verify project-specific behavior in the source before relying on it.
