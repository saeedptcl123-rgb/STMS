-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentContact" TEXT NOT NULL,
    "admissionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Student" ("address", "admissionDate", "className", "contact", "createdAt", "dateOfBirth", "email", "firstName", "gender", "id", "lastName", "parentContact", "parentName", "photo", "rollNumber", "section", "studentId", "updatedAt") SELECT "address", "admissionDate", "className", "contact", "createdAt", "dateOfBirth", "email", "firstName", "gender", "id", "lastName", "parentContact", "parentName", "photo", "rollNumber", "section", "studentId", "updatedAt" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");
CREATE UNIQUE INDEX "Student_rollNumber_className_section_key" ON "Student"("rollNumber", "className", "section");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
