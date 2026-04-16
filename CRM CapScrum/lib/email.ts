import nodemailer from "nodemailer";

// Configure transporter - uses environment variables
// For development: set SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER=your@gmail.com, SMTP_PASS=app_password
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@capscrum.com";
const APP_NAME = "CapScrum";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Check if SMTP is configured
function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Base HTML template
function wrapHtml(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:24px 24px 0 0;padding:40px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0;letter-spacing:-0.5px;">${APP_NAME}</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:8px 0 0;text-transform:uppercase;letter-spacing:2px;">${title}</p>
    </div>
    
    <!-- Body -->
    <div style="background:#fff;padding:40px 32px;border-radius:0 0 24px 24px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;padding:24px;color:#94a3b8;font-size:11px;">
      <p style="margin:0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p style="margin:4px 0 0;"><a href="${APP_URL}" style="color:#3b82f6;text-decoration:none;">Visit Portal</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ============ EMAIL FUNCTIONS ============

/**
 * Send a welcome email when a client is onboarded
 */
export async function sendWelcomeEmail(client: {
  email: string;
  contactPerson: string;
  companyName: string;
}) {
  if (!isSmtpConfigured()) {
    console.log(`📧 [DEV] Welcome email would be sent to: ${client.email}`);
    return;
  }

  const content = `
    <h2 style="color:#1e293b;font-size:22px;font-weight:700;margin:0 0 16px;">Welcome aboard, ${client.contactPerson}! 🎉</h2>
    <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">
      We're thrilled to welcome <strong style="color:#1e293b;">${client.companyName}</strong> to the ${APP_NAME} family.
      Your dedicated client portal is ready with everything you need.
    </p>
    
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin:0 0 24px;">
      <p style="color:#1e293b;font-weight:700;margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Your Portal Includes:</p>
      <ul style="color:#64748b;font-size:14px;line-height:2;margin:0;padding-left:20px;">
        <li>Real-time project tracking & progress</li>
        <li>Invoice management & PDF downloads</li>
        <li>Direct messaging with your team</li>
        <li>Milestone & deadline visibility</li>
      </ul>
    </div>
    
    <div style="text-align:center;margin:32px 0 0;">
      <a href="${APP_URL}/portal" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:14px;font-weight:700;">
        Access Your Portal →
      </a>
    </div>
    
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:24px 0 0;">
      Login with your email: <strong>${client.email}</strong>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: FROM,
      to: client.email,
      subject: `Welcome to ${APP_NAME} — Your Portal is Ready!`,
      html: wrapHtml("Welcome", content),
    });
    console.log(`✅ Welcome email sent to ${client.email}`);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
  }
}

/**
 * Send a project completion email
 */
export async function sendProjectCompletionEmail(project: {
  name: string;
  clientEmail: string;
  clientName: string;
  companyName: string;
}) {
  if (!isSmtpConfigured()) {
    console.log(`📧 [DEV] Completion email would be sent to: ${project.clientEmail}`);
    return;
  }

  const content = `
    <h2 style="color:#1e293b;font-size:22px;font-weight:700;margin:0 0 16px;">Project Complete! 🚀</h2>
    <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Hi ${project.clientName},<br><br>
      Great news — <strong style="color:#1e293b;">${project.name}</strong> for ${project.companyName} 
      has been marked as completed. We hope you're delighted with the results.
    </p>
    
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="color:#059669;font-size:36px;margin:0;">✓</p>
      <p style="color:#047857;font-weight:700;font-size:16px;margin:8px 0 0;">Successfully Delivered</p>
    </div>
    
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Check your portal for final deliverables and invoices. We'd love your feedback!
    </p>
    
    <div style="text-align:center;">
      <a href="${APP_URL}/portal/projects" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:14px;font-weight:700;">
        View Project →
      </a>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM,
      to: project.clientEmail,
      subject: `🎉 ${project.name} — Completed Successfully!`,
      html: wrapHtml("Project Complete", content),
    });
    console.log(`✅ Completion email sent to ${project.clientEmail}`);
  } catch (error) {
    console.error("❌ Failed to send completion email:", error);
  }
}

/**
 * Send an invoice notification email
 */
export async function sendInvoiceEmail(invoice: {
  invoiceNumber: string;
  total: number;
  dueDate: string;
  clientEmail: string;
  clientName: string;
  companyName: string;
  description: string;
}) {
  if (!isSmtpConfigured()) {
    console.log(`📧 [DEV] Invoice email would be sent to: ${invoice.clientEmail}`);
    return;
  }

  const content = `
    <h2 style="color:#1e293b;font-size:22px;font-weight:700;margin:0 0 16px;">New Invoice Issued</h2>
    <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Hi ${invoice.clientName}, a new invoice has been issued for ${invoice.companyName}.
    </p>
    
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin:0 0 24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Invoice</span>
        <span style="color:#1e293b;font-weight:700;">${invoice.invoiceNumber}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Description</span>
        <span style="color:#1e293b;font-weight:600;">${invoice.description}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Due Date</span>
        <span style="color:#1e293b;font-weight:600;">${new Date(invoice.dueDate).toLocaleDateString("en-IN")}</span>
      </div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#1e293b;font-size:14px;font-weight:800;">Total</span>
        <span style="color:#3b82f6;font-size:20px;font-weight:800;">₹${invoice.total.toLocaleString("en-IN")}</span>
      </div>
    </div>
    
    <div style="text-align:center;">
      <a href="${APP_URL}/portal/invoices" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:14px;font-weight:700;">
        View & Pay Invoice →
      </a>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM,
      to: invoice.clientEmail,
      subject: `New Invoice: ${invoice.invoiceNumber} — ₹${invoice.total.toLocaleString("en-IN")}`,
      html: wrapHtml("Invoice", content),
    });
    console.log(`✅ Invoice email sent to ${invoice.clientEmail}`);
  } catch (error) {
    console.error("❌ Failed to send invoice email:", error);
  }
}
