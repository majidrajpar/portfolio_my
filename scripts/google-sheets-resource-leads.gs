/**
 * Google Apps Script Webhook for Majid Mumtaz Portfolio Resource Downloads
 *
 * Setup Instructions:
 * 1. Open Google Sheets (https://sheets.new) and name the spreadsheet: "Portfolio Resource Leads".
 * 2. In the top menu, go to: Extensions > Apps Script.
 * 3. Replace any code in Code.gs with this entire file.
 * 4. Click Save (Ctrl+S or disk icon).
 * 5. Click the blue "Deploy" button at the top right > "New deployment".
 * 6. Under "Select type", choose "Web app".
 * 7. Configure:
 *    - Description: "Resource Leads Webhook"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"
 * 8. Click "Deploy", review permissions, and authorize with your Google account.
 * 9. Copy the "Web app URL" (format: https://script.google.com/macros/s/.../exec).
 * 10. Paste the Web app URL into `src/config/resources.ts` in your portfolio repository.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent writes
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Auto-create header row with professional corporate styling if sheet is new
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp (UTC)",
        "Email",
        "Resource Title",
        "Filename",
        "Category",
        "Referrer Page"
      ]);
      
      var headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1d3557");
      headerRange.setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Append lead row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.email || "",
      data.resourceTitle || "",
      data.filename || "",
      data.category || "",
      data.referrer || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Lead recorded" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      message: "Resource Leads Webhook is active and listening for POST requests."
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
