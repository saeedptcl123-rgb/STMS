import { execSync } from "node:child_process";

const candidates = [
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
];

const available = candidates
  .map((name) => ({ name, value: process.env[name]?.trim() }))
  .filter((candidate) => candidate.value);

console.log(
  `Database environment variables present: ${
    available.map((candidate) => candidate.name).join(", ") || "none"
  }.`
);

const selected = available.find(
  (candidate) => !candidate.value.startsWith("prisma+postgres://")
);

if (!selected) {
  if (available.length > 0) {
    console.error(
      `Cannot run migrations with ${available[0].name}: it is a prisma+postgres:// (Accelerate) URL. ` +
        "Use the direct postgres:// connection string from your database dashboard as DATABASE_URL or DIRECT_URL."
    );
    process.exit(1);
  }

  console.log(
    "No database URL found in the environment; Prisma will fall back to .env."
  );
} else {
  console.log(`Applying migrations with ${selected.name}.`);
  if (/-pooler\.|pooled\./i.test(selected.value)) {
    console.warn(
      `Warning: ${selected.name} looks like a pooled connection. ` +
        "Prisma Migrate is more reliable over a direct connection; set DIRECT_URL to the unpooled string if this fails."
    );
  }
}

const env = selected
  ? { ...process.env, DATABASE_URL: selected.value }
  : process.env;

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit", env });
} catch (error) {
  process.exit(error.status ?? 1);
}
