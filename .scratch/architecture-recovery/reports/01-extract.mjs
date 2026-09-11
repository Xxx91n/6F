#!/usr/bin/env node
// 01-extract.mjs v3 -- S1 定位收敛：意图语料 + 交付语料抽取器 (A-001)
// 产出: 01-corpora.json
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const OUT = process.env.OUT || 'D:/Aworker/6F/.scratch/architecture-recovery/reports/01-corpora.json';

const REPOS = [
  { id: 'env-manager',   dir: 'D:/Aworker/env-manager' },
  { id: 'jiahao',        dir: 'D:/Aworker/jiahao' },
  { id: 'anysearch-cli', dir: 'D:/Aworker/anysearch-cli' },
];

const NOISE_SUBJECT = /^(merge\b|Merge\b|wip\b|WIP\b|GitButler Workspace Commit|Revert\b|Merge pull request)/;
const NOISE_DIR = /^(node_modules|\.git|dist|obj|bin|release|\.next|coverage|\.scratch|test-artifacts|bench-artifacts|probe-artifacts|StrykerOutput|\.codegraph|\.codex-tmp|\.code-tmp)$/;

const readIf = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } };
const git = (dir, args) => { try { return execFileSync('git', args, { cwd: dir, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 }); } catch { return ''; } };

function cleanReadme(md) {
  return md
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r/g, '');
}

function parseBlocks(md) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;
  let inCode = false;
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*```/.test(l)) { inCode = !inCode; i++; continue; }
    if (inCode) { i++; continue; }
    if (!l.trim()) { i++; continue; }
    const h = l.match(/^(#{1,6})\s+(.*)$/);
    if (h) { blocks.push({ type: 'h', level: h[1].length, text: h[2].trim() }); i++; continue; }
    const li = l.match(/^\s*[-*+]\s+(.*)$/);
    if (li) { blocks.push({ type: 'li', text: li[1].trim() }); i++; continue; }
    if (/^\s*\|/.test(l)) { blocks.push({ type: 'tr', text: l.trim() }); i++; continue; }
    if (/^\s*>/.test(l)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      blocks.push({ type: 'quote', text: buf.join(' ').trim() });
      continue;
    }
    const buf = [l.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*[-*+]\s|\s*\||\s*>|\s*```)/.test(lines[i])) { buf.push(lines[i].trim()); i++; }
    blocks.push({ type: 'p', text: buf.join(' ').trim() });
  }
  return blocks;
}

function splitSentences(text) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  const parts = t.split(/(?<=[.!?;])\s+/);
  const out = [];
  for (const part of parts) {
    const q = part.replace(/[`*_]/g, '').trim();
    if (q.length >= 20 && q.length <= 360) out.push(q);
  }
  return out;
}

const POS = /what (it|this) (does|is)|features|overview|why |highlights|capabilities|goals?|positioning|about|introduction|简介|定位|特性|功能|能力/i;
const NEG = /build|test|install|usage|reference|licen[cs]e|contribut|changelog|before you|quick ?start|getting started|prerequisit|roadmap/i;

function isPositioning(text) {
  const t = String(text).replace(/[`*_]/g, '').trim();
  if (t.length < 20 || t.length > 360) return false;
  if (t.startsWith('[!')) return false;
  if (t.split(/\s+/).length < 5) return false;
  return true;
}

function extractIntent(repo) {
  const md = cleanReadme(readIf(path.join(repo.dir, 'README.md')));
  const blocks = parseBlocks(md);
  const units = [];
  const push = (text, source) => { const t = String(text).replace(/\s+/g, ' ').trim(); if (t) units.push({ text: t, source }); };

  const h1 = blocks.find((b) => b.type === 'h' && b.level === 1);
  if (h1) push(h1.text, 'readme:h1');

  const firstP = blocks.find((b) => b.type === 'p');
  if (firstP) { const ss = splitSentences(firstP.text); if (ss.length) push(ss.join(' ').slice(0, 360), 'readme:lede'); }

  for (const b of blocks) {
    if (b.type !== 'p') continue;
    const m = b.text.match(/\*\*["“]([^"”]{12,200})["”]\*\*/);
    if (m) push(m[1], 'readme:tagline');
  }

  let inSec = false;
  for (const b of blocks) {
    if (b.type === 'h') { inSec = POS.test(b.text) && !NEG.test(b.text); continue; }
    if (!inSec) continue;
    if (b.type === 'li') { if (isPositioning(b.text)) push(b.text, 'readme:bullet'); continue; }
    if (b.type === 'p') { for (const sn of splitSentences(b.text)) push(sn, 'readme:para'); continue; }
    if (b.type === 'tr') {
      const cells = b.text.split('|').map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2 && !/^-+$/.test(cells[0])) {
        const joined = cells.slice(0, 2).join(' -- ');
        if (isPositioning(joined)) push(joined, 'readme:table');
      }
    }
  }

  try {
    const j = JSON.parse(readIf(path.join(repo.dir, 'package.json')));
    if (j.description) push(j.description, 'package:description');
  } catch { /* noop */ }

  const seen = new Set();
  return units.filter((u) => { const k = u.text.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}

function extractDelivery(repo) {
  const logRows = git(repo.dir, ['log', '--format=%cI%x09%s', '-n', '600']).split('\n').filter(Boolean)
    .map((l) => { const i = l.indexOf('\t'); return { date: i >= 0 ? l.slice(0, i) : '', subject: i >= 0 ? l.slice(i + 1) : l }; })
    .filter((c) => c.subject && !NOISE_SUBJECT.test(c.subject));
  const commits = [...new Set(logRows.map((c) => c.subject))];

  const paths = [];
  const walk = (rel, depth) => {
    if (depth > 2) return;
    let ents = [];
    try { ents = fs.readdirSync(path.join(repo.dir, rel), { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (!e.isDirectory() || NOISE_DIR.test(e.name) || e.name.startsWith('.')) continue;
      paths.push(rel ? rel + '/' + e.name : e.name);
      if (['packages', 'apps', 'src', 'docs', 'domains', 'adapters', 'hooks', 'schemas', 'frontend', 'scripts'].includes(e.name)) walk(rel ? rel + '/' + e.name : e.name, depth + 1);
    }
  };
  walk('', 1);

  const pkg = {};
  try {
    const j = JSON.parse(readIf(path.join(repo.dir, 'package.json')));
    pkg.name = j.name;
    pkg.description = j.description;
    pkg.keywords = j.keywords || [];
    pkg.bin = j.bin ? Object.keys(j.bin) : [];
    pkg.scripts = j.scripts ? Object.keys(j.scripts) : [];
  } catch { /* noop */ }

  const changelog = [];
  for (const m of readIf(path.join(repo.dir, 'CHANGELOG.md')).matchAll(/^#{2,3}\s+(.+)$/gm)) changelog.push(m[1].trim());

  const nWin = 5;
  const per = Math.max(1, Math.ceil(logRows.length / nWin));
  const windows = [];
  for (let w = 0; w < nWin; w++) {
    const chunk = logRows.slice(w * per, (w + 1) * per);
    if (!chunk.length) continue;
    windows.push({ label: 'W' + (w + 1), from: chunk[chunk.length - 1].date, to: chunk[0].date, n: chunk.length, subjects: [...new Set(chunk.map((c) => c.subject))] });
  }

  const units = [];
  for (const c of commits) units.push({ kind: 'commit', text: c });
  for (const p of paths) units.push({ kind: 'path', text: p });
  if (pkg.name) units.push({ kind: 'pkg', text: pkg.name });
  if (pkg.description) units.push({ kind: 'pkg', text: pkg.description });
  for (const k of pkg.keywords) units.push({ kind: 'pkg', text: String(k) });
  for (const b of pkg.bin) units.push({ kind: 'pkg', text: 'bin ' + b });
  for (const s of pkg.scripts) units.push({ kind: 'pkg', text: 'script ' + s });
  for (const c of changelog) units.push({ kind: 'changelog', text: c });

  return { commits, paths, pkg, changelog, windows, units };
}

const out = { generated_at: new Date().toISOString(), repos: {} };
for (const r of REPOS) {
  const intent = extractIntent(r);
  const delivery = extractDelivery(r);
  out.repos[r.id] = { id: r.id, dir: r.dir, intent, delivery };
  console.log(r.id + ': intent=' + intent.length + ' delivery_units=' + delivery.units.length + ' commits=' + delivery.commits.length + ' paths=' + delivery.paths.length);
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2), { encoding: 'utf8' });
console.log('wrote ' + OUT + ' (' + fs.statSync(OUT).size + ' bytes)');
