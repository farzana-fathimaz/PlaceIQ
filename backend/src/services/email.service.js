const nodemailer = require('nodemailer')

let transporter = null

const getTransporter = () => {
  if (transporter) return transporter

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not set. Email sending disabled.')
    return null
  }

  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  return transporter
}

const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter()
  if (!transport) {
    console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`)
    return false
  }

  try {
    await transport.sendMail({
      from: `"PlaceIQ" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || subject,
    })
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`)
    return true
  } catch (err) {
    console.error(`[EMAIL FAILED] To: ${to} | Error: ${err.message}`)
    return false
  }
}

const buildDriveOpenEmail = (studentName, drive) => ({
  subject: `New Drive Open: ${drive.company} — ${drive.title}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #2563eb; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">PlaceIQ</h1>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Placement ERP</p>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 15px; color: #374151; margin-bottom: 16px;">Hi <strong>${studentName}</strong>,</p>
        <p style="color: #6b7280; line-height: 1.6;">A new placement drive is now open for applications and you are eligible to apply.</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827;">${drive.title}</p>
          <p style="margin: 0 0 4px; color: #6b7280; font-size: 13px;">Company: <strong>${drive.company}</strong></p>
          ${drive.jobRole ? `<p style="margin: 0 0 4px; color: #6b7280; font-size: 13px;">Role: <strong>${drive.jobRole}</strong></p>` : ''}
          ${drive.salaryLPA ? `<p style="margin: 0 0 4px; color: #6b7280; font-size: 13px;">Package: <strong>₹${drive.salaryLPA} LPA</strong></p>` : ''}
          ${drive.lastApplyDate ? `<p style="margin: 0; color: #dc2626; font-size: 13px; font-weight: 600;">Apply by: ${new Date(drive.lastApplyDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>` : ''}
        </div>
        <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">Log in to PlaceIQ to apply for this drive.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          This is an automated notification from PlaceIQ Placement ERP.
        </p>
      </div>
    </div>
  `,
})

const buildApplicationUpdateEmail = (studentName, drive, status, note) => {
  const statusColors = {
    shortlisted: '#059669',
    in_rounds:   '#7c3aed',
    placed:      '#16a34a',
    rejected:    '#dc2626',
    withdrawn:   '#6b7280',
  }
  const color = statusColors[status] || '#2563eb'

  return {
    subject: `Application Update: ${drive.company} — ${status.replace(/_/g, ' ').toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #2563eb; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">PlaceIQ</h1>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 15px; color: #374151; margin-bottom: 16px;">Hi <strong>${studentName}</strong>,</p>
          <p style="color: #6b7280; line-height: 1.6;">Your application status for <strong>${drive.company} — ${drive.title}</strong> has been updated.</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="background: ${color}20; color: ${color}; border: 1px solid ${color}40; padding: 8px 24px; border-radius: 999px; font-size: 16px; font-weight: 600; text-transform: uppercase;">
              ${status.replace(/_/g, ' ')}
            </span>
          </div>
          ${note ? `<div style="background: #f9fafb; border-left: 3px solid #2563eb; padding: 12px 16px; border-radius: 0 4px 4px 0; margin: 16px 0;"><p style="margin: 0; color: #374151; font-size: 13px;"><strong>Officer note:</strong> ${note}</p></div>` : ''}
          <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">Log in to PlaceIQ to view full details and track your application.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            This is an automated notification from PlaceIQ Placement ERP.
          </p>
        </div>
      </div>
    `,
  }
}

const buildGeneralEmail = (recipientName, title, message) => ({
  subject: title,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #2563eb; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">PlaceIQ</h1>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 15px; color: #374151; margin-bottom: 16px;">Hi <strong>${recipientName}</strong>,</p>
        <h2 style="color: #111827; font-size: 17px; margin-bottom: 12px;">${title}</h2>
        <p style="color: #6b7280; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          This is a notification from PlaceIQ Placement ERP.
        </p>
      </div>
    </div>
  `,
})

module.exports = {
  sendEmail,
  buildDriveOpenEmail,
  buildApplicationUpdateEmail,
  buildGeneralEmail,
}