#!/usr/bin/env node

/**
 * Prepare the Next.js standalone build for Electron packaging.
 * Resolves symlinks and copies everything into a flat directory structure.
 */

import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, lstatSync, readlinkSync, unlinkSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STANDALONE = path.join(ROOT, '.next', 'standalone')
const DEST = path.join(ROOT, 'electron', 'server')

console.log('Preparing standalone build for Electron...')

// Clean previous
if (existsSync(DEST)) {
  rmSync(DEST, { recursive: true, force: true })
}
mkdirSync(DEST, { recursive: true })

// Copy standalone output, dereferencing symlinks
cpSync(STANDALONE, DEST, { recursive: true, dereference: true })

// Fix any remaining symlinks
function fixSymlinks(dir) {
  if (!existsSync(dir)) return
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    try {
      const stat = lstatSync(fullPath)
      if (stat.isSymbolicLink()) {
        const target = readlinkSync(fullPath)
        if (path.isAbsolute(target) || !target.startsWith('.')) {
          const scope = path.basename(path.dirname(fullPath))
          const moduleName = entry.name.replace(/-[a-f0-9]+$/, '')
          const resolvedInDest = path.join(DEST, 'node_modules', scope, moduleName)
          if (existsSync(resolvedInDest)) {
            console.log(`  Fixing symlink: ${path.relative(DEST, fullPath)}`)
            unlinkSync(fullPath)
            cpSync(resolvedInDest, fullPath, { recursive: true, dereference: true })
          } else {
            unlinkSync(fullPath)
          }
        }
      } else if (stat.isDirectory()) {
        fixSymlinks(fullPath)
      }
    } catch {
      // Skip errors
    }
  }
}

fixSymlinks(path.join(DEST, '.next', 'node_modules'))

// pnpm standalone uses symlinks extensively. Hoist all packages from
// .pnpm virtual store to flat node_modules so Node can resolve them.
const nmDir = path.join(DEST, 'node_modules')
const pnpmDir = path.join(nmDir, '.pnpm')

if (existsSync(pnpmDir)) {
  console.log('Hoisting pnpm virtual store packages...')

  // Collect all real packages from .pnpm/<pkg>/node_modules/<name>
  const pnpmEntries = readdirSync(pnpmDir)
  for (const pkgDir of pnpmEntries) {
    if (pkgDir === 'node_modules') continue
    const pkgNmDir = path.join(pnpmDir, pkgDir, 'node_modules')
    if (!existsSync(pkgNmDir)) continue

    const pkgEntries = readdirSync(pkgNmDir, { withFileTypes: true })
    for (const entry of pkgEntries) {
      const src = path.join(pkgNmDir, entry.name)
      const stat = lstatSync(src)

      // Skip symlinks — we only want the actual package directories
      if (stat.isSymbolicLink()) continue

      // Determine destination (handle @scoped packages)
      let dest
      if (entry.name.startsWith('@')) {
        // Scoped package — need to check subdirectories
        const scopedEntries = readdirSync(src, { withFileTypes: true })
        for (const scopedEntry of scopedEntries) {
          const scopedSrc = path.join(src, scopedEntry.name)
          dest = path.join(nmDir, entry.name, scopedEntry.name)
          if (!existsSync(dest)) {
            mkdirSync(path.dirname(dest), { recursive: true })
            cpSync(scopedSrc, dest, { recursive: true, dereference: true })
          }
        }
      } else {
        dest = path.join(nmDir, entry.name)
        if (!existsSync(dest)) {
          cpSync(src, dest, { recursive: true, dereference: true })
        }
      }
    }
  }

  // Remove .pnpm directory — no longer needed
  rmSync(pnpmDir, { recursive: true, force: true })
  console.log('  Removed .pnpm virtual store')

  // Remove any remaining top-level symlinks (replace with real copies)
  const topEntries = readdirSync(nmDir, { withFileTypes: true })
  for (const entry of topEntries) {
    const fullPath = path.join(nmDir, entry.name)
    try {
      const stat = lstatSync(fullPath)
      if (stat.isSymbolicLink()) {
        const realPath = path.resolve(path.dirname(fullPath), readlinkSync(fullPath))
        unlinkSync(fullPath)
        if (existsSync(realPath)) {
          cpSync(realPath, fullPath, { recursive: true, dereference: true })
        }
      }
    } catch { /* skip */ }
  }
}

// Copy static files
const staticSrc = path.join(ROOT, '.next', 'static')
const staticDest = path.join(DEST, '.next', 'static')
if (existsSync(staticSrc)) {
  cpSync(staticSrc, staticDest, { recursive: true })
}

// Copy public directory
const publicSrc = path.join(ROOT, 'public')
const publicDest = path.join(DEST, 'public')
if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true })
}

// Remove unnecessary large packages
const pruneList = [
  'typescript', '@img', 'sharp',
  '@next/swc-linux-x64-gnu', '@next/swc-linux-x64-musl',
  '@next/swc-linux-arm64-gnu', '@next/swc-linux-arm64-musl',
  '@next/swc-win32-x64-msvc', '@next/swc-win32-arm64-msvc',
]
for (const pkg of pruneList) {
  const pkgPath = path.join(DEST, 'node_modules', pkg)
  if (existsSync(pkgPath)) {
    rmSync(pkgPath, { recursive: true, force: true })
    console.log(`  Pruned: node_modules/${pkg}`)
  }
}

// Remove build artifacts
for (const localPath of ['dist-electron']) {
  const p = path.join(DEST, localPath)
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true })
  }
}

// Verify no symlinks remain (cross-platform)
function findSymlinks(dir, results = []) {
  if (!existsSync(dir)) return results
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      try {
        if (lstatSync(fullPath).isSymbolicLink()) {
          results.push(fullPath)
        } else if (lstatSync(fullPath).isDirectory()) {
          findSymlinks(fullPath, results)
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return results
}
const remaining = findSymlinks(DEST)
if (remaining.length > 0) {
  console.log(`\nWarning: ${remaining.length} symlinks remaining`)
} else {
  console.log('\nNo symlinks remaining - clean build!')
}

// Copy ytgrab vendor files (solver script loaded at runtime via fs.readFileSync)
const ytgrabVendorSrc = path.join(ROOT, 'node_modules', 'ytgrab', 'vendor')
const ytgrabVendorDest = path.join(DEST, 'node_modules', 'ytgrab', 'vendor')
if (existsSync(ytgrabVendorSrc)) {
  mkdirSync(ytgrabVendorDest, { recursive: true })
  cpSync(ytgrabVendorSrc, ytgrabVendorDest, { recursive: true })
  console.log('  Copied ytgrab vendor files')
}

console.log('Done! Standalone server prepared at electron/server/')
