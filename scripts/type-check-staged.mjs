#!/usr/bin/env node
// Baseline-aware type-check gate for the pre-commit hook.
//
// Runs `vue-tsc --noEmit` on the whole project, then only fails the commit when
// a STAGED .ts/.tsx/.vue file contains a type error that is NOT part of the
// committed baseline (`.typecheck-baseline.json`).
//
// This means:
//   - Pre-existing ("legacy") errors in files you touch do NOT block the commit.
//   - Brand-new errors introduced in staged files ARE caught.
//   - Files you don't touch never affect the gate.
//
// The baseline is regenerated intentionally with `npm run type-check:baseline`
// once errors have been legitimately fixed.
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const BASELINE_PATH = ".typecheck-baseline.json";
const ERROR_RE = /^(.+?)\((\d+),(\d+)\):\s*(error TS\d+):\s*(.*)$/;

function signature(file, code, message) {
  // Key by file + code + message. Deliberately NOT line/column so that shifting
  // lines don't turn a legacy error into a "new" one.
  return `${file}|${code}|${message}`;
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return null; // null => strict mode fallback
  try {
    const arr = JSON.parse(readFileSync(BASELINE_PATH, "utf-8"));
    return new Set(arr);
  } catch {
    return null;
  }
}

// 1. Collect staged source files.
let staged = [];
try {
  const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    encoding: "utf-8",
  });
  staged = out.split("\n").map((s) => s.trim()).filter(Boolean);
} catch {
  // Not in a git tree / git failed -> don't block the commit.
  process.exit(0);
}

const exts = [".ts", ".tsx", ".vue", ".d.ts"];
const targets = staged.filter(
  (f) => exts.some((e) => f.endsWith(e)) && !f.startsWith("src/__tests__")
);
if (targets.length === 0) {
  console.log("type-check-staged: no staged TS/Vue files, skipping.");
  process.exit(0);
}

// 2. Run the full project type-check (cheap enough; gives accurate cross-file results).
const res = spawnSync(
  "npx",
  ["vue-tsc", "--noEmit", "-p", "tsconfig.typecheck.json"],
  { encoding: "utf-8", cwd: process.cwd() }
);
const output = (res.stdout || "") + (res.stderr || "");

// 3. Keep only errors that belong to staged files.
const targetSet = new Set(targets);
const baseline = loadBaseline();
const newErrors = [];
for (const line of output.split("\n")) {
  const m = line.match(ERROR_RE);
  if (!m) continue;
  const [, file, , , code, message] = m;
  if (!targetSet.has(file)) continue;
  if (baseline && baseline.has(signature(file, code, message))) continue; // legacy
  newErrors.push(line);
}

if (newErrors.length > 0) {
  console.error(
    `\n❌ type-check-staged: ${newErrors.length} new type error(s) in staged file(s):\n`
  );
  newErrors.forEach((l) => console.error(l));
  console.error(
    "\nThese are not in the baseline. Fix them before committing, or run" +
      " `npm run type-check:baseline` if they were intentionally fixed/cleared." +
      "\n(Use `git commit --no-verify` only to bypass deliberately.)"
  );
  process.exit(1);
}

console.log("type-check-staged: OK ✓");
process.exit(0);
