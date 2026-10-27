-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "feeStructureId" TEXT,
    "amountPaid" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "isVoided" BOOLEAN NOT NULL DEFAULT false,
    "voidedAt" DATETIME,
    "voidReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "FeeStructure" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amountPaid", "createdAt", "feeStructureId", "id", "paymentDate", "receiptNumber", "studentId") SELECT "amountPaid", "createdAt", "feeStructureId", "id", "paymentDate", "receiptNumber", "studentId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_receiptNumber_key" ON "Payment"("receiptNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
