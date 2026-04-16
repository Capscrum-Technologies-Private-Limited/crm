import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

// Dynamic import for jsPDF to avoid SSR issues
async function generatePDF(invoice: any) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  
  const isUSD = invoice.client.currency === "USD";
  const currencySymbol = isUSD ? "$" : "Rs.";
  const locale = isUSD ? "en-US" : "en-IN";

  // --- Top Left: Logo ---
  try {
    const logoPath = path.join(process.cwd(), "public", "logo-full.jpg");
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString("base64")}`;
    // The image width/height. Typical logo is wide, e.g. 40x12
    doc.addImage(logoBase64, "JPEG", 20, 20, 40, 12);
  } catch (err) {
    console.warn("Logo file not found, skipping image injection.", err);
    doc.setFillColor(26, 26, 26);
    doc.roundedRect(20, 20, 6, 6, 1, 1, 'F');
    doc.roundedRect(24, 24, 6, 6, 1, 1, 'F');
    doc.roundedRect(20, 28, 6, 6, 1, 1, 'F');
    
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CAPSCRUM", 36, 28);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("MANAGEMENT PLATFORM", 36, 33);
  }

  // --- Top Right: INVOICE title ---
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 190, 32, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184); // light gray
  doc.text(`INVOICE NO : #${invoice.invoiceNumber}`, 190, 42, { align: "right" });
  doc.text(`DATE : ${new Date(invoice.createdAt).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()}`, 190, 48, { align: "right" });

  // --- Middle Left: Invoice To ---
  let yPos = 65;
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice To", 20, yPos);
  
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 3, 90, yPos + 3);

  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.client.companyName, 20, yPos + 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(invoice.client.contactPerson, 20, yPos + 18);
  doc.text(invoice.client.email, 20, yPos + 23);
  if (invoice.client.phone) {
    doc.text(invoice.client.phone, 20, yPos + 28);
  }

  // --- Table ---
  const tableStartY = yPos + 40;
  const tableData = invoice.items.length > 0
    ? invoice.items.map((item: any) => [
        item.description,
        item.quantity.toString(),
        `${currencySymbol} ${item.rate.toLocaleString(locale, { minimumFractionDigits: 2 })}`,
        `${currencySymbol} ${item.amount.toLocaleString(locale, { minimumFractionDigits: 2 })}`,
      ])
    : [[
        invoice.description || "Service",
        "1",
        `${currencySymbol} ${(invoice.amount || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}`,
        `${currencySymbol} ${(invoice.amount || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}`,
      ]];

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      { content: "ITEM DESCRIPTION", styles: { halign: 'left' } },
      { content: "QTY", styles: { halign: 'center' } },
      { content: "PRICE", styles: { halign: 'right' } },
      { content: "TOTAL", styles: { halign: 'right' } }
    ]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [26, 26, 26],   // Black header
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 9, bottom: 9, left: 5, right: 5 },
    },
    bodyStyles: {
      fillColor: [243, 244, 246], // Light gray body
      textColor: [30, 41, 59],
      fontSize: 9,
      fontStyle: "bold",
      cellPadding: { top: 8, bottom: 8, left: 5, right: 5 },
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246], // Force single color background for entire block
    },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 25, halign: "center", textColor: [100, 116, 139] },
      2: { cellWidth: 40, halign: "right", textColor: [100, 116, 139] },
      3: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });

  // --- Totals Section ---
  const finalY = (doc as any).lastAutoTable.finalY;

  const subtotal = invoice.subtotal || invoice.amount || 0;
  const taxAmt = invoice.taxAmount || 0;
  const disc = invoice.discount || 0;
  const total = invoice.total || invoice.amount || 0;

  let currentY = finalY + 10;
  
  if (subtotal !== total) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Subtotal", 130, currentY);
    doc.setTextColor(30, 41, 59);
    doc.text(`${currencySymbol} ${subtotal.toLocaleString(locale, { minimumFractionDigits: 2 })}`, 190, currentY, { align: "right" });
    
    if (invoice.taxRate > 0) {
      currentY += 8;
      doc.setTextColor(100, 116, 139);
      doc.text(`Tax (${invoice.taxRate}%)`, 130, currentY);
      doc.setTextColor(30, 41, 59);
      doc.text(`${currencySymbol} ${taxAmt.toLocaleString(locale, { minimumFractionDigits: 2 })}`, 190, currentY, { align: "right" });
    }
    
    if (disc > 0) {
      currentY += 8;
      doc.setTextColor(100, 116, 139);
      doc.text("Discount", 130, currentY);
      doc.setTextColor(30, 41, 59);
      doc.text(`-${currencySymbol} ${disc.toLocaleString(locale, { minimumFractionDigits: 2 })}`, 190, currentY, { align: "right" });
    }
    currentY += 8;
  }

  // Black Total Block
  doc.setFillColor(26, 26, 26);
  // Match width roughly of the last two columns (x=115 to 190 width = 75)
  doc.rect(115, currentY, 75, 22, 'F');
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL :", 125, currentY + 14);
  doc.text(`${currencySymbol} ${total.toLocaleString(locale, { minimumFractionDigits: 2 })}`, 185, currentY + 14, { align: "right" });

  // --- Footer Info ---
  // Push terms to the bottom of the page or under the table
  const bottomY = Math.max(currentY + 40, 240);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("TERMS & CONDITION", 20, bottomY);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const termsText = "Payment is due within the stipulated date. Late payment may incur standard delay fees as per the master service agreement.";
  const splitTerms = doc.splitTextToSize(termsText, 80);
  doc.text(splitTerms, 20, bottomY + 6);

  // Payment Info
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("PAYMENT INFO", 115, bottomY);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Method :", 115, bottomY + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Bank Transfer, Stripe", 135, bottomY + 6);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 26, 26);
  doc.text("Thank You For Your Business", 115, bottomY + 18);

  return Buffer.from(doc.output("arraybuffer"));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: { select: { companyName: true, contactPerson: true, email: true, phone: true, currency: true } },
        project: { select: { name: true } },
        items: { orderBy: { createdAt: "asc" } },
        template: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Authorization: clients can only download their own invoices
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findFirst({ where: { userId: session.user.id } });
      if (!client || client.id !== invoice.clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const pdfBuffer = await generatePDF(invoice);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
