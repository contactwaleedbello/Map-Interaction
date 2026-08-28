#!/usr/bin/env node

/**
 * Kuri'a Design System — Build Pipeline
 *
 * Reads the 3-layer GTC (Globals → Tokens → Components) JSON architecture
 * and compiles it into a single `design-system.css` file with:
 *   1. CSS custom properties for all globals
 *   2. Semantic token variables (light mode default, dark mode override)
 *   3. Component-scoped variables
 *   4. Responsive breakpoint overrides
 *   5. Utility classes for spacing, typography, and colors
 *
 * Usage:  node build.js
 * Output: design-system.css
 */

const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const ROOT = __dirname;
const GLOBALS_DIR = path.join(ROOT, 'globals');
const TOKENS_DIR = path.join(ROOT, 'tokens');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const BREAKPOINTS_FILE = path.join(ROOT, 'breakpoints.json');
const OUTPUT_FILE = path.join(ROOT, 'design-system.css');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Read and parse a JSON file */
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/** Convert a nested key path like "global.color.primary.500" to a CSS var name "--global-color-primary-500" */
function toCSSVar(keyPath) {
  return '--' + keyPath.replace(/\./g, '-');
}

/** Resolve {token.reference} strings into var(--token-reference) */
function resolveRef(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{([^}]+)\}/g, (_, ref) => `var(${toCSSVar(ref)})`);
}

/**
 * Flatten a nested JSON object into an array of { key, value, description } entries.
 * Skips _meta keys, responsive overrides (handled separately), and non-value objects.
 */
function flattenTokens(obj, prefix = '', entries = [], responsive = []) {
  for (const [key, val] of Object.entries(obj)) {
    if (key === '_meta') continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (key === 'responsive') {
      // Collect responsive overrides linked to the parent key
      for (const [bp, bpVal] of Object.entries(val)) {
        if (typeof bpVal === 'object' && !bpVal.value) {
          // Object with individual properties to override
          for (const [prop, propVal] of Object.entries(bpVal)) {
            const parentKey = prefix;
            responsive.push({
              breakpoint: bp,
              key: `${parentKey}.${prop}`,
              value: typeof propVal === 'object' && propVal.value ? propVal.value : propVal
            });
          }
        } else {
          // Direct value override
          responsive.push({
            breakpoint: bp,
            key: prefix,
            value: typeof bpVal === 'object' && bpVal.value ? bpVal.value : bpVal
          });
        }
      }
      continue;
    }

    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      if ('value' in val) {
        entries.push({
          key: fullKey,
          value: val.value,
          description: val.description || null
        });
        // Check for responsive in value objects
        if (val.responsive) {
          for (const [bp, bpVal] of Object.entries(val.responsive)) {
            if (typeof bpVal === 'object' && !bpVal.value) {
              for (const [prop, propVal] of Object.entries(bpVal)) {
                responsive.push({
                  breakpoint: bp,
                  key: `${fullKey}.${prop}`,
                  value: typeof propVal === 'object' && propVal.value ? propVal.value : propVal
                });
              }
            } else {
              responsive.push({
                breakpoint: bp,
                key: fullKey,
                value: typeof bpVal === 'object' && bpVal.value ? bpVal.value : bpVal
              });
            }
          }
        }
      } else {
        flattenTokens(val, fullKey, entries, responsive);
      }
    } else if (typeof val === 'string' || typeof val === 'number') {
      entries.push({ key: fullKey, value: String(val), description: null });
    }
  }
  return { entries, responsive };
}

/**
 * Read all JSON files in a directory and flatten them into token entries.
 * Returns { entries, responsive, darkEntries }
 */
function processLayer(dir, filter = () => true) {
  const allEntries = [];
  const allResponsive = [];
  const darkEntries = [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).filter(filter).sort();

  for (const file of files) {
    const data = readJSON(path.join(dir, file));
    const isDark = file.includes('.dark.');

    const { entries, responsive } = flattenTokens(data);

    if (isDark) {
      darkEntries.push(...entries);
    } else {
      allEntries.push(...entries);
    }
    allResponsive.push(...responsive);
  }

  return { entries: allEntries, responsive: allResponsive, darkEntries };
}

// ─── Build ───────────────────────────────────────────────────────────────────

function build() {
  console.log('🌱 Kuri\'a Design System — Building CSS...\n');

  const breakpoints = readJSON(BREAKPOINTS_FILE).breakpoints;

  // ── Layer 1: Globals ────────────────────────────────────────────────────

  console.log('  Layer 1: Globals');
  const globals = processLayer(GLOBALS_DIR);
  console.log(`    ✓ ${globals.entries.length} global primitives`);

  // ── Layer 2: Semantic Tokens ────────────────────────────────────────────

  console.log('  Layer 2: Semantic Tokens');
  const tokens = processLayer(TOKENS_DIR);
  console.log(`    ✓ ${tokens.entries.length} light tokens`);
  console.log(`    ✓ ${tokens.darkEntries.length} dark overrides`);
  console.log(`    ✓ ${tokens.responsive.length} responsive overrides`);

  // ── Layer 3: Component Tokens ───────────────────────────────────────────

  console.log('  Layer 3: Component Tokens');
  const components = processLayer(COMPONENTS_DIR);
  console.log(`    ✓ ${components.entries.length} component tokens`);

  // ── Assemble CSS ────────────────────────────────────────────────────────

  const lines = [];

  lines.push('/**');
  lines.push(` * Kuri'a Design System — Generated CSS Custom Properties`);
  lines.push(` * Generated: ${new Date().toISOString()}`);
  lines.push(` *`);
  lines.push(` * Architecture: GTC (Globals → Tokens → Components)`);
  lines.push(` * Fonts: Inter (body) + Outfit (headings)`);
  lines.push(` * Spacing: 8px base unit`);
  lines.push(` * DO NOT EDIT — regenerate with: node build.js`);
  lines.push(' */\n');

  // Google Fonts import
  lines.push('@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap\');\n');

  // ── :root (globals + light tokens + components) ─────────────────────────

  lines.push('/* ═══════════════════════════════════════════════════════════');
  lines.push('   Layer 1: Global Primitives');
  lines.push('   ═══════════════════════════════════════════════════════════ */\n');

  lines.push(':root {');

  // Group globals by first key segment
  let lastGroup = '';
  for (const entry of globals.entries) {
    const group = entry.key.split('.').slice(0, 2).join('.');
    if (group !== lastGroup) {
      if (lastGroup) lines.push('');
      lines.push(`  /* — ${group} — */`);
      lastGroup = group;
    }
    const comment = entry.description ? `  /* ${entry.description} */` : '';
    lines.push(`  ${toCSSVar(entry.key)}: ${resolveRef(entry.value)};${comment}`);
  }

  lines.push('}\n');

  // ── Semantic tokens (light default) ─────────────────────────────────────

  lines.push('/* ═══════════════════════════════════════════════════════════');
  lines.push('   Layer 2: Semantic Tokens (Light Mode)');
  lines.push('   ═══════════════════════════════════════════════════════════ */\n');

  lines.push(':root {');
  lastGroup = '';
  for (const entry of tokens.entries) {
    const group = entry.key.split('.').slice(0, 2).join('.');
    if (group !== lastGroup) {
      if (lastGroup) lines.push('');
      lines.push(`  /* — ${group} — */`);
      lastGroup = group;
    }
    const comment = entry.description ? `  /* ${entry.description} */` : '';
    lines.push(`  ${toCSSVar(entry.key)}: ${resolveRef(entry.value)};${comment}`);
  }
  lines.push('}\n');

  // ── Dark mode overrides ─────────────────────────────────────────────────

  if (tokens.darkEntries.length > 0) {
    lines.push('/* ═══════════════════════════════════════════════════════════');
    lines.push('   Layer 2: Dark Mode Overrides');
    lines.push('   ═══════════════════════════════════════════════════════════ */\n');

    lines.push('[data-theme="dark"],');
    lines.push('.dark {');
    for (const entry of tokens.darkEntries) {
      const comment = entry.description ? `  /* ${entry.description} */` : '';
      lines.push(`  ${toCSSVar(entry.key)}: ${resolveRef(entry.value)};${comment}`);
    }
    lines.push('}\n');

    lines.push('@media (prefers-color-scheme: dark) {');
    lines.push('  :root:not([data-theme="light"]) {');
    for (const entry of tokens.darkEntries) {
      lines.push(`    ${toCSSVar(entry.key)}: ${resolveRef(entry.value)};`);
    }
    lines.push('  }');
    lines.push('}\n');
  }

  // ── Component tokens ────────────────────────────────────────────────────

  lines.push('/* ═══════════════════════════════════════════════════════════');
  lines.push('   Layer 3: Component Tokens');
  lines.push('   ═══════════════════════════════════════════════════════════ */\n');

  lines.push(':root {');
  lastGroup = '';
  for (const entry of components.entries) {
    const group = entry.key.split('.').slice(0, 2).join('.');
    if (group !== lastGroup) {
      if (lastGroup) lines.push('');
      lines.push(`  /* — ${group} — */`);
      lastGroup = group;
    }
    lines.push(`  ${toCSSVar(entry.key)}: ${resolveRef(entry.value)};`);
  }
  lines.push('}\n');

  // ── Responsive overrides ────────────────────────────────────────────────

  const allResponsive = [...tokens.responsive, ...components.responsive];

  if (allResponsive.length > 0) {
    lines.push('/* ═══════════════════════════════════════════════════════════');
    lines.push('   Responsive Overrides');
    lines.push('   ═══════════════════════════════════════════════════════════ */\n');

    // Group by breakpoint
    const byBP = {};
    for (const r of allResponsive) {
      if (!byBP[r.breakpoint]) byBP[r.breakpoint] = [];
      byBP[r.breakpoint].push(r);
    }

    for (const [bpName, overrides] of Object.entries(byBP)) {
      const bp = breakpoints[bpName];
      if (!bp) continue;

      let mediaQuery;
      if (bp.max && bp.min) {
        mediaQuery = `(min-width: ${bp.min}) and (max-width: ${bp.max})`;
      } else if (bp.max) {
        mediaQuery = `(max-width: ${bp.max})`;
      } else if (bp.min) {
        mediaQuery = `(min-width: ${bp.min})`;
      }

      if (mediaQuery) {
        lines.push(`@media ${mediaQuery} {`);
        lines.push('  :root {');
        for (const o of overrides) {
          lines.push(`    ${toCSSVar(o.key)}: ${resolveRef(o.value)};`);
        }
        lines.push('  }');
        lines.push('}\n');
      }
    }
  }

  // ── Utility Classes ─────────────────────────────────────────────────────

  lines.push('/* ═══════════════════════════════════════════════════════════');
  lines.push('   Utility Classes');
  lines.push('   ═══════════════════════════════════════════════════════════ */\n');

  // Typography
  lines.push('/* Typography */');
  lines.push('.heading-xl { font: var(--token-typography-heading-xl-fontWeight) var(--token-typography-heading-xl-fontSize)/var(--token-typography-heading-xl-lineHeight) var(--token-typography-heading-xl-fontFamily); letter-spacing: var(--token-typography-heading-xl-letterSpacing); }');
  lines.push('.heading-lg { font: var(--token-typography-heading-lg-fontWeight) var(--token-typography-heading-lg-fontSize)/var(--token-typography-heading-lg-lineHeight) var(--token-typography-heading-lg-fontFamily); letter-spacing: var(--token-typography-heading-lg-letterSpacing); }');
  lines.push('.heading-md { font: var(--token-typography-heading-md-fontWeight) var(--token-typography-heading-md-fontSize)/var(--token-typography-heading-md-lineHeight) var(--token-typography-heading-md-fontFamily); letter-spacing: var(--token-typography-heading-md-letterSpacing); }');
  lines.push('.heading-sm { font: var(--token-typography-heading-sm-fontWeight) var(--token-typography-heading-sm-fontSize)/var(--token-typography-heading-sm-lineHeight) var(--token-typography-heading-sm-fontFamily); letter-spacing: var(--token-typography-heading-sm-letterSpacing); }');
  lines.push('.heading-xs { font: var(--token-typography-heading-xs-fontWeight) var(--token-typography-heading-xs-fontSize)/var(--token-typography-heading-xs-lineHeight) var(--token-typography-heading-xs-fontFamily); letter-spacing: var(--token-typography-heading-xs-letterSpacing); }');
  lines.push('.body-lg   { font: var(--token-typography-body-lg-fontWeight) var(--token-typography-body-lg-fontSize)/var(--token-typography-body-lg-lineHeight) var(--token-typography-body-lg-fontFamily); }');
  lines.push('.body-md   { font: var(--token-typography-body-md-fontWeight) var(--token-typography-body-md-fontSize)/var(--token-typography-body-md-lineHeight) var(--token-typography-body-md-fontFamily); }');
  lines.push('.body-sm   { font: var(--token-typography-body-sm-fontWeight) var(--token-typography-body-sm-fontSize)/var(--token-typography-body-sm-lineHeight) var(--token-typography-body-sm-fontFamily); }');
  lines.push('.label-lg  { font: var(--token-typography-label-lg-fontWeight) var(--token-typography-label-lg-fontSize)/var(--token-typography-label-lg-lineHeight) var(--token-typography-label-lg-fontFamily); }');
  lines.push('.label-md  { font: var(--token-typography-label-md-fontWeight) var(--token-typography-label-md-fontSize)/var(--token-typography-label-md-lineHeight) var(--token-typography-label-md-fontFamily); }');
  lines.push('.label-sm  { font: var(--token-typography-label-sm-fontWeight) var(--token-typography-label-sm-fontSize)/var(--token-typography-label-sm-lineHeight) var(--token-typography-label-sm-fontFamily); }');
  lines.push('');

  // Text colors
  lines.push('/* Text Colors */');
  lines.push('.text-primary   { color: var(--token-color-text-primary); }');
  lines.push('.text-secondary { color: var(--token-color-text-secondary); }');
  lines.push('.text-tertiary  { color: var(--token-color-text-tertiary); }');
  lines.push('.text-heading   { color: var(--token-color-text-heading); }');
  lines.push('.text-link      { color: var(--token-color-text-link); }');
  lines.push('.text-error     { color: var(--token-color-text-error); }');
  lines.push('.text-success   { color: var(--token-color-text-success); }');
  lines.push('.text-warning   { color: var(--token-color-text-warning); }');
  lines.push('.text-info      { color: var(--token-color-text-info); }');
  lines.push('');

  // Background colors
  lines.push('/* Background Colors */');
  lines.push('.bg-page     { background-color: var(--token-color-bg-page); }');
  lines.push('.bg-surface  { background-color: var(--token-color-bg-surface); }');
  lines.push('.bg-muted    { background-color: var(--token-color-bg-muted); }');
  lines.push('.bg-primary  { background-color: var(--token-color-bg-primary); }');
  lines.push('.bg-error    { background-color: var(--token-color-bg-error); }');
  lines.push('.bg-success  { background-color: var(--token-color-bg-success); }');
  lines.push('.bg-warning  { background-color: var(--token-color-bg-warning); }');
  lines.push('.bg-info     { background-color: var(--token-color-bg-info); }');
  lines.push('');

  // Border radius
  lines.push('/* Border Radius */');
  lines.push('.rounded-none { border-radius: var(--token-radius-none); }');
  lines.push('.rounded-sm   { border-radius: var(--token-radius-sm); }');
  lines.push('.rounded-md   { border-radius: var(--token-radius-md); }');
  lines.push('.rounded-lg   { border-radius: var(--token-radius-lg); }');
  lines.push('.rounded-xl   { border-radius: var(--token-radius-xl); }');
  lines.push('.rounded-full { border-radius: var(--token-radius-full); }');
  lines.push('');

  // Elevation
  lines.push('/* Elevation */');
  lines.push('.shadow-none     { box-shadow: var(--token-elevation-none); }');
  lines.push('.shadow-card     { box-shadow: var(--token-elevation-card); }');
  lines.push('.shadow-dropdown { box-shadow: var(--token-elevation-dropdown); }');
  lines.push('.shadow-modal    { box-shadow: var(--token-elevation-modal); }');
  lines.push('.shadow-toast    { box-shadow: var(--token-elevation-toast); }');
  lines.push('');

  // ── Base reset ──────────────────────────────────────────────────────────

  lines.push('/* ═══════════════════════════════════════════════════════════');
  lines.push('   Base Reset & Defaults');
  lines.push('   ═══════════════════════════════════════════════════════════ */\n');

  lines.push(`*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--global-typography-fontFamily-body);
  font-size: var(--global-typography-fontSize-md);
  line-height: var(--global-typography-lineHeight-normal);
  color: var(--token-color-text-primary);
  background-color: var(--token-color-bg-page);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100vh;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--global-typography-fontFamily-heading);
  color: var(--token-color-text-heading);
  font-weight: var(--global-typography-fontWeight-bold);
}

a {
  color: var(--token-color-text-link);
  text-decoration: none;
  transition: color var(--global-motion-duration-fast) var(--global-motion-easing-ease-in-out);
}

a:hover {
  color: var(--token-color-text-link-hover);
}

:focus-visible {
  outline: none;
  box-shadow: var(--token-elevation-input-focus);
}

img, video, svg {
  display: block;
  max-width: 100%;
}
`);

  // ── Write output ────────────────────────────────────────────────────────

  const css = lines.join('\n');
  fs.writeFileSync(OUTPUT_FILE, css, 'utf-8');

  const stats = {
    globals: globals.entries.length,
    lightTokens: tokens.entries.length,
    darkTokens: tokens.darkEntries.length,
    componentTokens: components.entries.length,
    responsiveOverrides: allResponsive.length,
    totalVars: globals.entries.length + tokens.entries.length + components.entries.length,
    fileSize: (Buffer.byteLength(css) / 1024).toFixed(1)
  };

  console.log(`\n  ✅ Generated ${OUTPUT_FILE}`);
  console.log(`     ${stats.totalVars} CSS custom properties`);
  console.log(`     ${stats.darkTokens} dark mode overrides`);
  console.log(`     ${stats.responsiveOverrides} responsive overrides`);
  console.log(`     ${stats.fileSize} KB\n`);
}

build();
