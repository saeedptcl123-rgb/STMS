// Quick setup check: run with `npm run check`.
// Prints which env variables are set (never their values) and tests the database.
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { PrismaClient } from "@prisma/client"

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}

loadEnvFile(join(process.cwd(), ".env"))

const required = ["DATABASE_URL", "ADMIN_USERNAME", "ADMIN_PASSWORD", "AUTH_SECRET"]
let ok = true

console.log("Environment variables:")
for (const name of required) {
  const set = Boolean(process.env[name]?.trim())
  if (!set) ok = false
  console.log(`  ${set ? "OK     " : "MISSING"}  ${name}`)
}

if (process.env.DATABASE_URL && !/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL)) {
  ok = false
  console.log("  DATABASE_URL must start with postgresql://")
}

const prisma = new PrismaClient()
try {
  await prisma.$queryRaw`SELECT 1`
  console.log("\nDatabase connection: OK")
  const [students, payments, feeTypes, feeStructures, settings] = await Promise.all([
    prisma.student.count(),
    prisma.payment.count(),
    prisma.feeType.count(),
    prisma.feeStructure.count(),
    prisma.schoolSettings.count(),
  ])
  console.log(`  students=${students} payments=${payments} feeTypes=${feeTypes} feeStructures=${feeStructures} settingsRow=${settings}`)
} catch (error) {
  ok = false
  console.log("\nDatabase connection: FAILED")
  console.log(`  ${error instanceof Error ? error.message.split("\n").slice(-3).join(" ") : error}`)
  console.log("  Check the DATABASE_URL host and password, and run `npx prisma migrate deploy`.")
} finally {
  await prisma.$disconnect()
}

console.log(ok ? "\nSetup looks good." : "\nSetup has problems, see above.")
process.exit(ok ? 0 : 1)
