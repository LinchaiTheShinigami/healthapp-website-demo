/**
 * Ayuta Health — Partnership Enquiry Handler
 * Google Apps Script Web App
 *
 * SETUP INSTRUCTIONS
 * ──────────────────
 * 1. Go to https://script.google.com → New project
 * 2. Paste this entire file into the editor (replacing the default code)
 * 3. Update NOTIFY_EMAIL below to the address that should receive enquiries
 * 4. Click Deploy → New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy → copy the Web App URL
 * 6. Paste that URL into scripts/partnership-page.js as APPS_SCRIPT_URL
 * 7. On first run, Google will ask you to authorise — click "Allow"
 *
 * TODO: 2FA REQUIREMENT
 * ─────────────────────
 * The Google account used to deploy this script must have 2-Step Verification
 * enabled before Google will allow the "Execute as: Me" authorisation flow.
 * Steps:
 *   a) Go to https://myaccount.google.com/security → enable 2-Step Verification
 *   b) Then return here and proceed with the deployment authorisation
 * Do NOT deploy from an account without 2FA — Google may block or revoke access.
 *
 * The script will:
 *   • Send you a Gmail notification for every enquiry
 *   • Log every submission to a Google Sheet called "Partnership Enquiries"
 *     (auto-created in your Google Drive on the first submission)
 */

// ── CONFIG ──────────────────────────────────────────────────────────────────
const NOTIFY_EMAIL  = 'ayuta.info@gmail.com'; // ← change to your inbox
const SHEET_NAME    = 'Partnership Enquiries';
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handles POST requests from the partnership form.
 * Google Apps Script calls doPost() automatically for Web App POST requests.
 */
function doPost(e) {
  try {
    const params = e.parameter || {};

    const name    = sanitise(params.name);
    const email   = sanitise(params.email);
    const gym     = sanitise(params.gym);
    const model   = sanitise(params.model);
    const message = sanitise(params.message);
    const ts      = new Date().toISOString();

    // Validate required fields server-side
    if (!name || !email || !gym || !message) {
      return jsonResponse({ success: false, error: 'Missing required fields.' });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ success: false, error: 'Invalid email address.' });
    }

    // 1. Send Gmail notification
    sendNotificationEmail({ name, email, gym, model, message, ts });

    // 2. Log to Google Sheet
    logToSheet({ name, email, gym, model, message, ts });

    return jsonResponse({ success: true });

  } catch (err) {
    console.error('Partnership form error:', err);
    return jsonResponse({ success: false, error: 'Server error. Please try again.' });
  }
}

/**
 * Handles GET requests — returns a health-check so you can verify the URL works.
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'Ayuta partnership enquiries' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sendNotificationEmail({ name, email, gym, model, message, ts }) {
  const subject = `New partnership enquiry — ${gym}`;
  const body = [
    `New gym partnership enquiry received on ${new Date(ts).toLocaleString('en-GB')}.`,
    '',
    `Name:             ${name}`,
    `Email:            ${email}`,
    `Gym or studio:    ${gym}`,
    `Preferred model:  ${model || 'Not specified'}`,
    '',
    'Message:',
    message,
    '',
    '───────────────────────────────────',
    'Logged automatically by Ayuta Health partnership form.',
    'Reply directly to this email to respond to the enquiry.'
  ].join('\n');

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: email,
    subject,
    body
  });
}

function logToSheet({ name, email, gym, model, message, ts }) {
  const ss = getOrCreateSheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  // Add header row if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Gym / Studio', 'Model', 'Message', 'Status']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(ts).toLocaleString('en-GB'),
    name,
    email,
    gym,
    model || '',
    message,
    'New'  // status column — update manually to "Contacted", "Declined", etc.
  ]);
}

function getOrCreateSheet() {
  // Reuse an existing spreadsheet named "Ayuta Partnership Enquiries" in Drive,
  // or create it fresh on the first run.
  const files = DriveApp.getFilesByName('Ayuta Partnership Enquiries');
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  const ss = SpreadsheetApp.create('Ayuta Partnership Enquiries');
  return ss;
}

function sanitise(value) {
  if (!value) return '';
  // Strip HTML tags and trim whitespace
  return String(value).replace(/<[^>]*>/g, '').trim().substring(0, 2000);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
