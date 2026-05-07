#!/usr/bin/env node
// Optimize project screenshots: convert PNG to WebP, cap width at 1920px,
// target ~85 quality. Writes alongside the original (.webp). Use:
//   npm i -D sharp
//   node scripts/optimize-images.mjs

import { readdir, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const ROOTS = ['public/projects/dendritemcp', 'public/projects/wild2']
const MAX_WIDTH = 1920
const QUALITY = 85

async function* walk(dir) {
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry)
    const s = await stat(full)
    if (s.isDirectory()) yield* walk(full)
    else yield full
  }
}

let totalIn = 0
let totalOut = 0

for (const root of ROOTS) {
  for await (const file of walk(root)) {
    const { ext, name, dir } = parse(file)
    if (ext.toLowerCase() !== '.png') continue
    const out = join(dir, `${name}.webp`)
    const input = sharp(file)
    const meta = await input.metadata()
    const resized = meta.width && meta.width > MAX_WIDTH
      ? input.resize({ width: MAX_WIDTH })
      : input
    await resized.webp({ quality: QUALITY }).toFile(out)
    const inSize = (await stat(file)).size
    const outSize = (await stat(out)).size
    totalIn += inSize
    totalOut += outSize
    const pct = ((1 - outSize / inSize) * 100).toFixed(0)
    console.log(`${file} → ${out}  ${(inSize/1024).toFixed(0)}KB → ${(outSize/1024).toFixed(0)}KB  (-${pct}%)`)
  }
}

console.log(`\nTotal: ${(totalIn/1024/1024).toFixed(2)}MB → ${(totalOut/1024/1024).toFixed(2)}MB  (-${((1 - totalOut/totalIn)*100).toFixed(0)}%)`)
console.log('\nNext: update Projects.tsx screenshot src paths from .png to .webp, then verify visually.')
