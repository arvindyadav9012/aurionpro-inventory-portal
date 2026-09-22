/** NMRC Inventory Google Drive backup endpoint.
 * Deploy as a Web App (Execute as: Me; access: anyone who is authorized to use it).
 * Creates a live Google Sheet plus a real XLSX export in Google Drive.
 */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var sheetName = String(body.sheetName || 'NMRC_INVENTORY_BACKUP');
    var xlsxName = String(body.filename || 'NMRC_INVENTORY_BACKUP.xlsx');
    var ss = findOrCreateSpreadsheet_(sheetName);

    (body.sheets || []).forEach(function(sheetDef) {
      var title = String(sheetDef.name || 'Sheet1').slice(0, 99);
      var sh = ss.getSheetByName(title) || ss.insertSheet(title);
      sh.clearContents();
      var rows = sheetDef.rows || [];
      if (!rows.length) return;
      var headers = Object.keys(rows[0]);
      var values = [headers].concat(rows.map(function(r) {
        return headers.map(function(h) { return r[h] == null ? '' : String(r[h]); });
      }));
      sh.getRange(1, 1, values.length, headers.length).setValues(values);
      sh.setFrozenRows(1);
      sh.autoResizeColumns(1, headers.length);
    });
    SpreadsheetApp.flush();

    // Create a real, openable .xlsx file from the Google Sheet.
    var exportUrl = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=xlsx';
    var response = UrlFetchApp.fetch(exportUrl, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (response.getResponseCode() !== 200) {
      throw new Error('XLSX export failed: HTTP ' + response.getResponseCode());
    }
    var xlsxBlob = response.getBlob().setName(xlsxName);
    var existing = DriveApp.getFilesByName(xlsxName);
    while (existing.hasNext()) existing.next().setTrashed(true);
    var xlsxFile = DriveApp.createFile(xlsxBlob);

    var deletedFolderName = String(body.deletedFolder || 'NMRC_INVENTORY_DELETED');
    var folders = DriveApp.getFoldersByName(deletedFolderName);
    var delFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder(deletedFolderName);
    (body.deletedRecords || []).forEach(function(rec, i) {
      var id = String(rec.id || ('deleted_' + i));
      var fileName = 'deleted_' + id.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
      var old = delFolder.getFilesByName(fileName);
      while (old.hasNext()) old.next().setTrashed(true);
      delFolder.createFile(fileName, JSON.stringify(rec, null, 2), MimeType.PLAIN_TEXT);
    });

    return json_({
      ok: true,
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      xlsxFileId: xlsxFile.getId(),
      xlsxUrl: 'https://drive.google.com/open?id=' + xlsxFile.getId(),
      deletedFolderUrl: delFolder.getUrl(),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function findOrCreateSpreadsheet_(name) {
  var files = DriveApp.getFilesByName(name);
  while (files.hasNext()) {
    var f = files.next();
    if (f.getMimeType() === MimeType.GOOGLE_SHEETS) return SpreadsheetApp.openById(f.getId());
  }
  return SpreadsheetApp.create(name);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
