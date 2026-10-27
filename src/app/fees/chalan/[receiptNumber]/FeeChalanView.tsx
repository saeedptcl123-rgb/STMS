"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"

interface Student {
  id: string
  firstName: string
  lastName: string
  studentId: string
  rollNumber: string
  className: string
  section: string
  parentName: string
  parentContact: string
}

interface FeeStructure {
  id: string
  feeType: string
  amount: number
  className: string
  academicYear: string
  dueDate: string | Date
}

interface Payment {
  id: string
  receiptNumber: string
  amountPaid: number
  paymentDate: Date | string
  student: Student
  feeStructure: FeeStructure | null
}

interface FeeChalanViewProps {
  payment: Payment
}

const SCHOOL_NAME = "Excellence Public School"
const SCHOOL_SHORT = "EPS"
const SCHOOL_ADDRESS = "Main Campus, Education Road, Lahore"
const SCHOOL_PHONE = "+92-42-111-222-333"
const SCHOOL_EMAIL = "info@excellence.edu.pk"
const BANK_NAME = "National Bank of Pakistan"
const BANK_BRANCH = "Main Branch, Lahore"
const ACCOUNT_TITLE = "Excellence Public School Fee Collection"
const ACCOUNT_NUMBER = "1234-567890-12"

const COPIES = [
  { label: "BANK COPY", className: "bank-copy", accent: "#1d4ed8", note: "Bank Copy - Attach with deposit slip" },
  { label: "SCHOOL COPY", className: "school-copy", accent: "#047857", note: "School Copy - Retain for records" },
  { label: "STUDENT COPY", className: "student-copy", accent: "#c2410c", note: "Student Copy - Retain for records" },
] as const

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getAmountInWords(amount: number): string {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  function convertHundreds(num: number): string {
    let result = ""
    if (num >= 100) {
      result += units[Math.floor(num / 100)] + " Hundred "
      num %= 100
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " "
      num %= 10
    } else if (num >= 10) {
      result += teens[num - 10] + " "
      num = 0
    }
    if (num > 0) {
      result += units[num] + " "
    }
    return result
  }

  if (amount === 0) return "Zero Rupees Only"

  let rupees = Math.floor(amount)
  const paisa = Math.round((amount - rupees) * 100)

  let words = ""

  if (rupees >= 10000000) {
    words += convertHundreds(Math.floor(rupees / 10000000)) + "Crore "
    rupees %= 10000000
  }
  if (rupees >= 100000) {
    words += convertHundreds(Math.floor(rupees / 100000)) + "Lakh "
    rupees %= 100000
  }
  if (rupees >= 1000) {
    words += convertHundreds(Math.floor(rupees / 1000)) + "Thousand "
    rupees %= 1000
  }
  if (rupees > 0) {
    words += convertHundreds(rupees)
  }

  words = words.trim() + " Rupees"

  if (paisa > 0) {
    words += " and " + convertHundreds(paisa).trim() + " Paisa"
  }

  return words + " Only"
}

function buildFeeHeads(payment: Payment) {
  const { feeStructure, amountPaid } = payment
  const heads: Array<{ description: string; amount: number }> = []

  if (feeStructure) {
    heads.push({ description: feeStructure.feeType, amount: feeStructure.amount })
  } else {
    heads.push({ description: "Monthly Tuition Fee", amount: amountPaid })
  }

  return heads
}

function ChalanCopy({
  label,
  note,
  accent,
  copyClass,
  payment,
}: {
  label: string
  note: string
  accent: string
  copyClass: string
  payment: Payment
}) {
  const { receiptNumber, paymentDate, student, feeStructure } = payment
  const formattedDate = formatDate(paymentDate)
  const dueDate = feeStructure ? formatDate(feeStructure.dueDate) : "-"
  const feeHeads = buildFeeHeads(payment)
  const totalAmount = feeHeads.reduce((sum, h) => sum + h.amount, 0)

  return (
    <div className={`copy ${copyClass}`} style={{ "--accent": accent } as CSSProperties}>
      <div className="accent-bar">
        <span className="accent-label">{label}</span>
        <span className="accent-title">Fee Chalan</span>
      </div>

      <div className="copy-head">
        <div className="brand">
          <div className="logo">{SCHOOL_SHORT}</div>
          <div className="brand-text">
            <h2 className="school-name">{SCHOOL_NAME}</h2>
            <p className="school-line">{SCHOOL_ADDRESS}</p>
            <p className="school-line">
              {SCHOOL_PHONE} &nbsp;|&nbsp; {SCHOOL_EMAIL}
            </p>
          </div>
        </div>
      </div>

      <div className="bank-box">
        <h4>Bank Details</h4>
        <p className="bank-name">{BANK_NAME}</p>
        <p>{BANK_BRANCH}</p>
        <p>A/C Title: {ACCOUNT_TITLE}</p>
        <p>A/C No: <strong>{ACCOUNT_NUMBER}</strong></p>
      </div>

      <div className="title-bar">FEE DEPOSIT CHALAN / VOUCHER</div>

      <table className="info-table" cellSpacing="0" cellPadding="0">
        <tbody>
          <tr>
            <td className="label">Challan No:</td>
            <td className="value">{receiptNumber}</td>
            <td className="label">Roll No:</td>
            <td className="value">{student.rollNumber}</td>
          </tr>
          <tr>
            <td className="label">Student Name:</td>
            <td className="value" colSpan={3}>{student.firstName} {student.lastName}</td>
          </tr>
          <tr>
            <td className="label">Father&apos;s Name:</td>
            <td className="value">{student.parentName}</td>
            <td className="label">Grade:</td>
            <td className="value">Class {student.className} - {student.section}</td>
          </tr>
          <tr>
            <td className="label">Fee Month:</td>
            <td className="value">{feeStructure?.academicYear ?? "Current Month"}</td>
            <td className="label">Issue Date:</td>
            <td className="value">{formattedDate}</td>
          </tr>
          <tr>
            <td className="label">Due Date:</td>
            <td className="value">{dueDate}</td>
            <td className="label">Student ID:</td>
            <td className="value">{student.studentId}</td>
          </tr>
        </tbody>
      </table>

      <table className="heads-table" cellSpacing="0" cellPadding="0">
        <thead>
          <tr>
            <th className="col-no">S.No</th>
            <th>Heads of Account</th>
            <th className="col-amt">Amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {feeHeads.map((head, index) => (
            <tr key={index}>
              <td className="text-center">{index + 1}</td>
              <td>{head.description}</td>
              <td className="text-right">
                {head.amount.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan={2} className="total-label">Total Amount Payable</td>
            <td className="total-amount text-right">{formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="words-box">
        <span className="words-label">Amount in words</span>
        <span className="words-value">{getAmountInWords(totalAmount)}</span>
      </div>

      <div className="signature-section">
        <div className="sig-block">
          <div className="sig-line"></div>
          <span>Cashier Signature</span>
        </div>
        <div className="sig-block">
          <div className="sig-line"></div>
          <span>Bank Stamp &amp; Signature</span>
        </div>
      </div>

      <div className="footer-note">
        <span>{note}</span>
        <span className="footer-ref">{receiptNumber}</span>
      </div>

      <style jsx>{`
        .copy {
          --accent: #1d4ed8;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 2px solid var(--accent);
          border-radius: 10px;
          padding: 10px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
          min-height: 420px;
          overflow: hidden;
          position: relative;
        }
        .accent-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: -10px -10px 10px -10px;
          padding: 8px 10px;
          background: var(--accent);
          color: #ffffff;
        }
        .accent-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }
        .accent-title {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 1.6px;
          opacity: 0.85;
          text-transform: uppercase;
        }
        .bank-copy { box-shadow: 0 8px 24px rgba(29, 78, 216, 0.22); }
        .school-copy { box-shadow: 0 8px 24px rgba(4, 120, 87, 0.22); }
        .student-copy { box-shadow: 0 8px 24px rgba(194, 65, 12, 0.22); }
        .copy-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .brand { display: flex; gap: 8px; align-items: flex-start; }
        .logo {
          flex: 0 0 auto;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: var(--accent);
          color: #ffffff;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
        }
        .brand-text { min-width: 0; }
        .school-name {
          margin: 0 0 2px;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.2px;
          color: #0f172a;
          line-height: 1.15;
        }
        .school-line { margin: 0; font-size: 7.5px; color: #64748b; line-height: 1.35; }
        .bank-box {
          margin-top: 8px;
          padding: 6px 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-left: 3px solid var(--accent);
          border-radius: 5px;
          font-size: 7.5px;
          color: #475569;
        }
        .bank-box h4 {
          margin: 0 0 3px;
          font-size: 7px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          color: var(--accent);
        }
        .bank-box p { margin: 1px 0; line-height: 1.35; }
        .bank-name { font-weight: 700; color: #0f172a; }
        .bank-box strong { color: #0f172a; }
        .title-bar {
          margin: 8px -10px 8px -10px;
          padding: 6px;
          background: var(--accent);
          color: #ffffff;
          text-align: center;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }
        .info-table, .heads-table {
          width: 100%;
          border-collapse: collapse;
          color: #0f172a;
        }
        .info-table { font-size: 8.5px; margin-bottom: 8px; border: 1px solid #cbd5e1; }
        .info-table td { padding: 3px 5px; border: 1px solid #e2e8f0; vertical-align: middle; }
        .info-table .label {
          width: 26%;
          background: #f1f5f9;
          font-size: 7px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #475569;
          white-space: nowrap;
        }
        .info-table .value { width: 24%; font-weight: 600; font-size: 8.5px; }
        .heads-table { font-size: 8.5px; border: 1px solid #cbd5e1; margin-bottom: 8px; }
        .heads-table th {
          background: #0f172a;
          color: #ffffff;
          padding: 5px 5px;
          font-size: 7px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #0f172a;
        }
        .heads-table td { padding: 4px 5px; border: 1px solid #e2e8f0; }
        .heads-table .col-no { width: 10%; }
        .heads-table .col-amt { width: 28%; }
        .heads-table .text-center { text-align: center; }
        .heads-table .text-right { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
        .heads-table tbody tr:nth-child(even) td { background: #f8fafc; }
        .total-row td {
          background: #eef2f7 !important;
          border-top: 2px solid var(--accent);
          padding: 6px 5px;
        }
        .total-label {
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #0f172a;
        }
        .total-amount {
          font-size: 11px;
          font-weight: 800;
          color: var(--accent);
          font-variant-numeric: tabular-nums;
        }
        .words-box {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 5px 7px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 5px;
          margin-bottom: 8px;
        }
        .words-label {
          font-size: 6.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #92400e;
        }
        .words-value {
          font-size: 8px;
          font-weight: 600;
          color: #78350f;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          line-height: 1.3;
        }
        .signature-section {
          display: flex;
          gap: 10px;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px dashed #cbd5e1;
        }
        .sig-block { flex: 1; text-align: center; }
        .sig-line { border-bottom: 1.5px solid #334155; height: 32px; margin-bottom: 4px; }
        .sig-block span {
          font-size: 7px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #64748b;
        }
        .footer-note {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-top: 8px;
          padding-top: 5px;
          border-top: 1px solid #e2e8f0;
          font-size: 6.5px;
          font-style: italic;
          color: #94a3b8;
        }
        .footer-ref { font-style: normal; font-weight: 700; letter-spacing: 0.3px; }
        @media print {
          .copy {
            border: 1.5px solid #000;
            border-radius: 0;
            box-shadow: none;
            min-height: 188mm;
            padding: 6px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .copy:not(:last-child) { border-right: 2px solid #475569; }
          .accent-bar { margin: -6px -6px 6px -6px; padding: 6px 8px; }
          .logo, .accent-bar, .accent-label, .accent-title, .bank-box, .title-bar, .words-box {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .title-bar { margin: 6px -6px; }
          .school-name { font-size: 12px; }
        }
      `}</style>
    </div>
  )
}

export function FeeChalanView({ payment }: FeeChalanViewProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="chalan-container" data-chalan-layout="modern-v2">
      <div className="toolbar no-print">
        <Link href="/" className="back-link">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="toolbar-right">
          <p className="print-hint">Prints 3 copies on one A4 landscape page</p>
          <button onClick={handlePrint} className="print-btn">
            <Printer className="h-4 w-4" />
            Print Chalan (3 Copies)
          </button>
        </div>
      </div>

      <div className="chalan-grid">
        {COPIES.map((copy) => (
          <ChalanCopy
            key={copy.label}
            label={copy.label}
            note={copy.note}
            accent={copy.accent}
            copyClass={copy.className}
            payment={payment}
          />
        ))}
      </div>

      <style jsx>{`
        .chalan-container {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          font-size: 10px;
          line-height: 1.4;
          color: #0f172a;
          max-width: 297mm;
          margin: 0 auto;
          padding: 16px;
          background: #eef2f7;
        }
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #334155;
          font-weight: 600;
          font-size: 11px;
          text-decoration: none;
          padding: 7px 12px;
          border-radius: 7px;
          transition: background 0.2s, color 0.2s;
        }
        .back-link:hover { background: #f1f5f9; color: #0f172a; }
        .print-btn {
          background: #0f172a;
          color: #ffffff;
          font-weight: 600;
          font-size: 11px;
          padding: 9px 18px;
          border-radius: 7px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .print-btn:hover { background: #1e293b; }
        .print-btn:active { transform: translateY(1px); }
        .print-hint {
          font-size: 10px;
          color: #64748b;
          margin: 0;
        }
        .chalan-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 1100px) {
          .chalan-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media print {
          .no-print { display: none !important; }
          .chalan-container { padding: 0; background: #ffffff; max-width: none; }
          .chalan-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0;
          }
          @page { size: A4 landscape; margin: 6mm; }
          body { margin: 0; }
        }
      `}</style>
    </div>
  )
}
