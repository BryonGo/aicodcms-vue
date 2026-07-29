#!/usr/bin/env node
// Generate the type-check baseline (`.typecheck-baseline.json`).
//
// Run `npm run type-check:baseline` after you have intentionally fixed/cleared
// type errors, so that the pre-commit gate treats the remaining errors as the
// new "legacy" baseline instead of blocking on them.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const ERROR_RE = /^(.+?)\((\d+),(\d+)\):\s*(error TS\d+):\s*(.*)$/;
const signature = (file, code, message) => `${file}|${code}|${message}`;

const res = spawnSync(
  "npx",
  ["vue-tsc", "--noEmit", "-p", "tsconfig.typecheck.json"],
  { encoding: "utf-8", cwd: process.cwd() }
);
const output = (res.stdout || "") + (res.stderr || "");

const sigs = new Set();
let count = 0;
for (const line of output.split("\n")) {
  const m = line.match(ERROR_RE);
  if (!m) continue;
  const [, file, , , code, message] = m;
  sigs.add(signature(file, code, message));
  count++;
}

writeFileSync(".typecheck-baseline.json", JSON.stringify([...sigs].sort(), null, 2) + "\n");
console.log(`type-check-baseline: captured ${count} error(s) (${sigs.size} unique signatures).`);
