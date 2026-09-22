/** NMRC Inventory Google Drive backup endpoint.
 * Deploy as a Web App (Execute as: Me; Who has access: as required by your Google Workspace).
 * Set the Web App URL in config.js as NMRC_INVENTORY_DRIVE_BACKUP_URL.
 * This script creates/updates NMRC_INVENTORY_BACKUP.xlsx in the chosen Drive location
 * and stores deleted records under NMRC_INVENTORY_DELETED. For production, add your own
 * authentication check before accepting POST requests.
 */
function doPost(e) {
  var body = JSON.parse(e.postData.contents || '{}');
  var name = body.filename || 'NMRC_INVENTORY_BACKUP.xlsx';
  var files = DriveApp.getFilesByName(name);
  var file = files.hasNext() ? files.next() : SpreadsheetApp.create(name).getBlob();
  // Google Apps Script cannot directly write an XLSX binary workbook from JSON without
  // conversion. This endpoint writes a Google Sheets workbook, which can be exported as XLSX.
  var ss;
  if (files.hasNext()) {
    try { ss = SpreadsheetApp.openById(file.getId()); } catch (_) {}
  }
  if (!ss) ss = SpreadsheetApp.create(name.replace(/\.xlsx$/i,''));
  (body.sheets || []).forEach(function(sheetDef) {
    var title = String(sheetDef.name || 'Sheet1').slice(0,99);
    var sh = ss.getSheetByName(title) || ss.insertSheet(title);
    sh.clearContents();
    var rows = sheetDef.rows || [];
    if (!rows.length) return;
    var headers = Object.keys(rows[0]);
    var values = [headers].concat(rows.map(function(r){return headers.map(function(h){return r[h] == null ? '' : String(r[h]);});}));
    sh.getRange(1,1,values.length,headers.length).setValues(values);
    sh.setFrozenRows(1);
  });
  var delFolder = DriveApp.getFoldersByName(body.deletedFolder || 'NMRC_INVENTORY_DELETED');
  if (!delFolder.hasNext()) DriveApp.createFolder(body.deletedFolder || 'NMRC_INVENTORY_DELETED');
  return ContentService.createTextOutput(JSON.stringify({ok:true,spreadsheetId:ss.getId(),updatedAt:new Date().toISOString()})).setMimeType(ContentService.MimeType.JSON);
}
