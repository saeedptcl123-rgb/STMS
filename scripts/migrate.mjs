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

const isPostgresUrl = (value) => /^postgres(ql)?:\/\//i.test(value);
const isAccelerateUrl = (value) => /^prisma\+postgres:\/\//i.test(value);

const selected = available.find((candidate) =>
  isPostgresUrl(candidate.value)
);
const accelerate = available.find((candidate) =>
  isAccelerateUrl(candidate.value)
);
const invalid = available.filter(
  (candidate) =>
    !isPostgresUrl(candidate.value) && !isAccelerateUrl(candidate.value)
);

if (!selected) {
  if (accelerate) {
    console.error(
      `Cannot run migrations with ${accelerate.name}: it is a prisma+postgres:// (Accelerate) URL. ` +
        "Use the direct postgres:// connection string from your database dashboard as DATABASE_URL or DIRECT_URL."
    );
    process.exit(1);
  }

  if (invalid.length > 0) {
    const scheme = `${invalid[0].value.split(":")[0]}:`;
    console.error(
      `${invalid.map((candidate) => candidate.name).join(", ")} is not a PostgreSQL connection string ` +
        `(found "${scheme}"). Set DATABASE_URL to the postgresql:// string from your database dashboard.`
    );
    process.exit(1);
  }

  console.log(
    "No database URL found in the environment; Prisma will fall back to .env."
  );
} else {
  console.log(`Applying migrations with ${selected.name}.`);

  if (invalid.length > 0) {
    console.warn(
      `Ignoring ${invalid.map((candidate) => candidate.name).join(", ")}: not a PostgreSQL URL.`
    );
  }

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
