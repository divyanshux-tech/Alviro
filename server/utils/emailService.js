import axios from 'axios';
import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────────────────────────────────
// ALVIRO Email Templates — Multi-Stage Reservation Lifecycle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared base template shell for all ALVIRO emails.
 * Accepts inner body HTML and renders within the branded wrapper.
 */
const _wrapInTemplate = (innerBodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ALVIRO Fine Dining</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #111111; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td align="center" style="padding: 40px 30px 30px; background: linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, rgba(17, 17, 17, 1) 100%); border-bottom: 1px solid rgba(212, 175, 55, 0.2);">
                            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; letter-spacing: 4px; color: #d4af37; text-transform: uppercase;">ALVIRO</h1>
                            <p style="margin: 8px 0 0; color: #94a3b8; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Fine Dining & Fine Experiences</p>
                        </td>
                    </tr>

                    <!-- Content Body -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            ${innerBodyHtml}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 24px 30px; background-color: #0a0a0a; border-top: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; font-size: 12px;">
                            <p style="margin: 0 0 6px; color: #94a3b8;"><strong>ALVIRO Fine Dining</strong></p>
                            <p style="margin: 0;">Sent from Registered Administration Email: <em>${process.env.GMAIL_USER || process.env.ADMIN_EMAIL || 'Alvirothefinedining@gmail.com'}</em></p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Booking Summary Card — reusable block showing date, time, guests, and status badge.
 */
const _bookingSummaryCard = ({ date, time, guests, statusText, statusColor, statusBorderColor, statusBgColor }) => `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #171717; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 28px;">
    <tr>
        <td style="padding: 20px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td width="50%" style="padding-bottom: 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; display: block;">Date</span>
                        <strong style="color: #ffffff; font-size: 16px;">${date}</strong>
                    </td>
                    <td width="50%" style="padding-bottom: 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; display: block;">Time</span>
                        <strong style="color: #ffffff; font-size: 16px;">${time}</strong>
                    </td>
                </tr>
                <tr>
                    <td width="50%">
                        <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; display: block;">Party Size</span>
                        <strong style="color: #ffffff; font-size: 16px;">${guests} Guest${guests > 1 ? 's' : ''}</strong>
                    </td>
                    <td width="50%">
                        <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; display: block;">Status</span>
                        <span style="display: inline-block; background-color: ${statusBgColor}; color: ${statusColor}; border: 1px solid ${statusBorderColor}; font-size: 12px; font-weight: bold; padding: 2px 10px; border-radius: 12px; text-transform: uppercase;">${statusText}</span>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
`;

/**
 * Pre-Ordered Items table — renders the list of pre-ordered dishes.
 */
const _preOrderSection = (preOrderItems) => {
    const itemsFormatted = Array.isArray(preOrderItems) && preOrderItems.length > 0
        ? preOrderItems.map(item => `
            <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid rgba(212, 175, 55, 0.15); color: #e2e8f0; font-size: 14px;">
                    <strong style="color: #ffffff;">${item.name || 'Special Dish'}</strong>
                    ${item.category ? `<br/><span style="font-size: 12px; color: #94a3b8;">${item.category}</span>` : ''}
                    ${item.notes ? `<br/><em style="font-size: 12px; color: #d4af37;">Note: ${item.notes}</em>` : ''}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid rgba(212, 175, 55, 0.15); color: #d4af37; font-weight: bold; text-align: center; font-size: 14px;">
                    x${item.quantity || 1}
                </td>
            </tr>
        `).join('')
        : `
            <tr>
                <td colspan="2" style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic; font-size: 13px;">
                    No pre-ordered dishes attached. You may order directly at your table upon arrival.
                </td>
            </tr>
        `;

    return `
    <h3 style="margin: 0 0 12px; font-family: Georgia, serif; color: #d4af37; font-size: 17px; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 8px;">
        Pre-Ordered Food Selection
    </h3>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #171717; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 28px;">
        <thead>
            <tr style="background-color: #1f1f1f;">
                <th align="left" style="padding: 10px 16px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                <th align="center" style="padding: 10px 16px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
            </tr>
        </thead>
        <tbody>
            ${itemsFormatted}
        </tbody>
    </table>
    `;
};


// ─────────────────────────────────────────────────────────────────────────────
// STAGE 1: PENDING EMAIL — Sent when user submits reservation request
// ─────────────────────────────────────────────────────────────────────────────

const generatePendingEmailTemplate = ({ name, date, time, guests, reservationId }) => {
    const innerBody = `
        <h2 style="margin: 0 0 16px; font-family: Georgia, serif; color: #ffffff; font-size: 22px; font-weight: normal;">
            Reservation Request Received
        </h2>
        <p style="margin: 0 0 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            Dear <strong style="color: #d4af37;">${name || 'Valued Guest'}</strong>,<br/>
            Thank you for choosing <strong>ALVIRO</strong>. We have received your table reservation request and it is currently <strong style="color: #f59e0b;">pending confirmation</strong> by our team. You will receive another email once it is confirmed.
        </p>

        ${_bookingSummaryCard({
            date, time, guests,
            statusText: 'Pending',
            statusColor: '#f59e0b',
            statusBorderColor: 'rgba(245, 158, 11, 0.3)',
            statusBgColor: 'rgba(245, 158, 11, 0.15)'
        })}

        ${reservationId ? `
        <div style="background-color: #171717; border-left: 3px solid #d4af37; padding: 16px 20px; border-radius: 8px; margin-bottom: 28px;">
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                Reference ID: <strong style="color: #d4af37;">${reservationId}</strong>
            </p>
        </div>
        ` : ''}

        <div style="background-color: #171717; border-left: 3px solid #d4af37; padding: 16px 20px; border-radius: 8px; margin-bottom: 28px; text-align: center;">
            <p style="margin: 0; color: #d4af37; font-family: Georgia, serif; font-size: 15px; font-weight: bold;">
                Your request is under review — we'll confirm shortly!
            </p>
        </div>

        <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center;">
            If you need to modify or cancel your booking, please contact us at least 2 hours in advance.
        </p>
    `;
    return _wrapInTemplate(innerBody);
};


// ─────────────────────────────────────────────────────────────────────────────
// STAGE 2: CONFIRMED EMAIL — Sent when admin confirms the reservation
// ─────────────────────────────────────────────────────────────────────────────

const generateConfirmedEmailTemplate = ({ name, date, time, guests, preOrderItems }) => {
    const innerBody = `
        <h2 style="margin: 0 0 16px; font-family: Georgia, serif; color: #ffffff; font-size: 22px; font-weight: normal;">
            Reservation Confirmed
        </h2>
        <p style="margin: 0 0 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            Dear <strong style="color: #d4af37;">${name || 'Valued Guest'}</strong>,<br/>
            Great news! Your table reservation at <strong>ALVIRO</strong> has been <strong style="color: #4ade80;">officially confirmed</strong> by our team. Here are the details of your upcoming visit:
        </p>

        ${_bookingSummaryCard({
            date, time, guests,
            statusText: 'Confirmed',
            statusColor: '#4ade80',
            statusBorderColor: 'rgba(34, 197, 94, 0.3)',
            statusBgColor: 'rgba(34, 197, 94, 0.15)'
        })}

        ${_preOrderSection(preOrderItems)}

        <div style="background-color: #171717; border-left: 3px solid #d4af37; padding: 16px 20px; border-radius: 8px; margin-bottom: 28px; text-align: center;">
            <p style="margin: 0; color: #d4af37; font-family: Georgia, serif; font-size: 15px; font-weight: bold;">
                Thank You for Choosing ALVIRO | We're Delighted to Have You!
            </p>
        </div>

        <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center;">
            If you need to modify or cancel your booking, please contact us at least 2 hours in advance.
        </p>
    `;
    return _wrapInTemplate(innerBody);
};


// ─────────────────────────────────────────────────────────────────────────────
// STAGE 3: CANCELLED EMAIL — Sent when admin cancels/rejects the reservation
// ─────────────────────────────────────────────────────────────────────────────

const generateCancelledEmailTemplate = ({ name, date, time, reason }) => {
    const innerBody = `
        <h2 style="margin: 0 0 16px; font-family: Georgia, serif; color: #ffffff; font-size: 22px; font-weight: normal;">
            Reservation Update: Cancelled
        </h2>
        <p style="margin: 0 0 24px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            Dear <strong style="color: #d4af37;">${name || 'Valued Guest'}</strong>,<br/>
            We regret to inform you that your table reservation at <strong>ALVIRO</strong> for <strong>${date}</strong> at <strong>${time}</strong> has been <strong style="color: #f87171;">cancelled</strong>.
        </p>

        ${reason ? `
        <div style="background-color: #171717; border-left: 3px solid #f87171; padding: 16px 20px; border-radius: 8px; margin-bottom: 28px;">
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                <strong style="color: #f87171;">Reason:</strong> ${reason}
            </p>
        </div>
        ` : ''}

        <div style="background-color: #171717; border-left: 3px solid #d4af37; padding: 16px 20px; border-radius: 8px; margin-bottom: 28px; text-align: center;">
            <p style="margin: 0; color: #d4af37; font-family: Georgia, serif; font-size: 15px; font-weight: bold;">
                We hope to welcome you at ALVIRO in the near future.
            </p>
        </div>

        <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center;">
            If you believe this is an error or wish to rebook, please contact us directly.
        </p>
    `;
    return _wrapInTemplate(innerBody);
};


// ─────────────────────────────────────────────────────────────────────────────
// CORE EMAIL TRANSPORT — Gmail SMTP → Resend API → Simulation Fallback
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends an email with the given subject and HTML content.
 * Tries Gmail SMTP first, then Resend API, then falls back to simulation.
 */
const _sendEmail = async ({ to, subject, html }) => {
    const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASS || process.env.EMAIL_PASS;
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'DineMate AI Assistant <onboarding@resend.dev>';
    const recipientEmail = to || 'guest@alviro.com';

    // Option 1: Gmail SMTP
    if (gmailUser && gmailPass) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass }
            });

            const info = await transporter.sendMail({
                from: `"DineMate AI Assistant" <${gmailUser}>`,
                to: recipientEmail,
                subject,
                html
            });

            console.log(`[EmailService] Gmail SMTP sent to ${recipientEmail}. MessageId: ${info.messageId}`);
            return { success: true, messageId: info.messageId, provider: 'gmail_smtp' };
        } catch (smtpErr) {
            console.error('[EmailService] Gmail SMTP error:', smtpErr.message);
            // Fallthrough to Resend API
        }
    }

    // Option 2: Resend API
    if (resendApiKey) {
        try {
            const response = await axios.post(
                'https://api.resend.com/emails',
                {
                    from: adminEmail,
                    to: [recipientEmail],
                    subject,
                    html
                },
                {
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`[EmailService] Resend API sent to ${recipientEmail}. Resend ID: ${response.data.id}`);
            return { success: true, resendId: response.data.id, provider: 'resend_api' };
        } catch (resendErr) {
            console.error('[EmailService] Resend API error:', resendErr.response?.data || resendErr.message);
            return { success: false, error: resendErr.response?.data || resendErr.message };
        }
    }

    // Fallback: Simulation Mode
    console.log('====================================================');
    console.log(`[EmailService] SIMULATED EMAIL`);
    console.log(`[EmailService] TO: ${recipientEmail}`);
    console.log(`[EmailService] FROM: ${gmailUser || adminEmail}`);
    console.log(`[EmailService] SUBJECT: ${subject}`);
    console.log('====================================================');
    return { success: true, simulated: true };
};


// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API — Stage-Specific Email Senders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stage 1: Sends "Reservation Request Received (Pending)" email.
 * Called when a new reservation is submitted by the user.
 */
export const sendReservationPendingEmail = async ({ email, name, date, time, guests, reservationId }) => {
    const html = generatePendingEmailTemplate({ name, date, time, guests, reservationId });
    return _sendEmail({
        to: email,
        subject: `ALVIRO Reservation Request Received — Pending Confirmation (${date})`,
        html
    });
};

/**
 * Stage 2: Sends "Reservation Confirmed!" email with pre-order details.
 * Called when admin confirms the reservation.
 */
export const sendReservationConfirmedEmail = async ({ email, name, date, time, guests, preOrderItems }) => {
    const html = generateConfirmedEmailTemplate({ name, date, time, guests, preOrderItems });
    return _sendEmail({
        to: email,
        subject: `ALVIRO Table Reservation Confirmed! (${date})`,
        html
    });
};

/**
 * Stage 3: Sends "Reservation Cancelled" notification email.
 * Called when admin cancels/rejects the reservation.
 */
export const sendReservationCancelledEmail = async ({ email, name, date, time, reason }) => {
    const html = generateCancelledEmailTemplate({ name, date, time, reason });
    return _sendEmail({
        to: email,
        subject: `ALVIRO Reservation Update: Cancelled (${date})`,
        html
    });
};

/**
 * Legacy alias — kept for backward compatibility.
 * Maps to the Confirmed email template.
 */
export const sendReservationConfirmation = sendReservationConfirmedEmail;

export default {
    sendReservationPendingEmail,
    sendReservationConfirmedEmail,
    sendReservationCancelledEmail,
    sendReservationConfirmation
};
