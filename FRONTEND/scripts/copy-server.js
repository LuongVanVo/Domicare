import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const srcFile = path.resolve(__dirname, '../src/server.js')
const destFile = path.resolve(__dirname, '../dist/server/server.js')

// Copy server.js to dist/server
fs.copyFileSync(srcFile, destFile)

console.log('✅ Copied server.js to dist/server/server.js')
