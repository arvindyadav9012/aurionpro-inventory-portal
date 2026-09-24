/** NMRC Inventory Google Drive backup endpoint.
 * Creates one Google Sheet + one real XLSX file per report, plus a consolidated backup.
 * Deploy as a Web App (Execute as: Me; access: Anyone with the deployed URL as configured).
 */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var mode = String(body.mode || 'all');
    var folderName = String(body.reportFolder || 'NMRC_INVENTORY_REPORTS');
    var folder = findOrCreateFolder_(folderName);

    if (mode === 'report') {
      var def = body.report;
      if (!def || !def.name) throw new Error('Report definition is missing.');
      var result = backupOneReport_(def, folder);
      if (body.deletedRecord) backupDeletedRecord_(body.deletedRecord, String(body.deletedFolder || 'NMRC_INVENTORY_DELETED'));
      return json_({ok:true, mode:'report', report:result, updatedAt:new Date().toISOString()});
    }

    if (mode === 'consolidated') {
      var consolidatedName = sanitizeFileName_(String(body.sheetName || 'NMRC_INVENTORY_BACKUP'));
      var consolidated = findOrCreateSpreadsheetInFolder_(consolidatedName, folder);
      clearSpreadsheet_(consolidated);
      (body.sheets || []).forEach(function(sheetDef) {
        var title = sanitizeSheetTitle_(String(sheetDef.name || 'Sheet1'));
        var sh = consolidated.getSheetByName(title) || consolidated.insertSheet(title);
        sh.clearContents();
        writeRows_(sh, sheetDef.rows || []);
      });
      SpreadsheetApp.flush();
      var consolidatedXlsx = exportSpreadsheetToXlsx_(consolidated, consolidatedName + '.xlsx', folder);
      return json_({ok:true, mode:'consolidated', spreadsheetId:consolidated.getId(), spreadsheetUrl:consolidated.getUrl(), xlsxFileId:consolidatedXlsx.getId(), xlsxUrl:'https://drive.google.com/open?id='+consolidatedXlsx.getId(), updatedAt:new Date().toISOString()});
    }

    // Legacy/all mode: retained for compatibility, but process reports one-by-one.
    var reportFiles = [];
    (body.sheets || []).forEach(function(sheetDef) { reportFiles.push(backupOneReport_(sheetDef, folder)); });
    if (body.deletedRecords) body.deletedRecords.forEach(backupDeletedRecord_);
    return json_({ok:true, mode:'all', reportCount:reportFiles.length, reportFiles:reportFiles, folderName:folder.getName(), folderUrl:folder.getUrl(), updatedAt:new Date().toISOString()});
  } catch (err) {
    return json_({ok:false, error:String(err && err.message || err), stack:String(err && err.stack || '')});
  }
}

function backupOneReport_(sheetDef, folder) {
  var name = sanitizeFileName_(String(sheetDef.name || 'Report'));
  var safeSheetName = name.slice(0, 90) || 'Report';
  var rows = sheetDef.rows || [];
  var ss = findOrCreateSpreadsheetInFolder_(safeSheetName, folder);
  var sh = ss.getSheets()[0];
  sh.setName(safeSheetName.slice(0, 99));
  sh.clearContents();
  writeRows_(sh, rows);
  SpreadsheetApp.flush();
  var xlsxName = safeSheetName + '.xlsx';
  var xlsxFile = exportSpreadsheetToXlsx_(ss, xlsxName, folder);
  return {name:xlsxName, spreadsheetName:ss.getName(), spreadsheetId:ss.getId(), spreadsheetUrl:ss.getUrl(), xlsxFileId:xlsxFile.getId(), xlsxUrl:'https://drive.google.com/open?id='+xlsxFile.getId()};
}

function backupDeletedRecord_(rec, folderName) {
  if (!rec) return;
  var folder = findOrCreateFolder_(String(folderName || 'NMRC_INVENTORY_DELETED'));
  var id = String(rec.recordKey || rec.id || ('deleted_' + new Date().getTime()));
  var fileName = 'deleted_' + id.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
  var old = folder.getFilesByName(fileName);
  while (old.hasNext()) old.next().setTrashed(true);
  folder.createFile(fileName, JSON.stringify(rec, null, 2), MimeType.PLAIN_TEXT);
}

function writeRows_(sh, rows) {
  if (!rows || !rows.length) {
    sh.getRange(1,1).setValue('No records');
    sh.setFrozenRows(0);
    return;
  }
  var headers = Object.keys(rows[0]);
  var values = [headers].concat(rows.map(function(r) {
    return headers.map(function(h) { return r[h] == null ? '' : String(r[h]); });
  }));
  sh.getRange(1, 1, values.length, headers.length).setValues(values);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

function clearSpreadsheet_(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (i === 0) {
      sheets[i].clearContents();
      sheets[i].setName('Backup');
    } else {
      ss.deleteSheet(sheets[i]);
    }
  }
}

function findOrCreateFolder_(name) {
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function findOrCreateSpreadsheetInFolder_(name, folder) {
  var files = folder.getFilesByName(name);
  while (files.hasNext()) {
    var f = files.next();
    if (f.getMimeType() === MimeType.GOOGLE_SHEETS) return SpreadsheetApp.openById(f.getId());
  }
  var ss = SpreadsheetApp.create(name);
  var file = DriveApp.getFileById(ss.getId());
  file.moveTo(folder);
  return ss;
}

function exportSpreadsheetToXlsx_(ss, xlsxName, folder) {
  var exportUrl = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=xlsx';
  var response = UrlFetchApp.fetch(exportUrl, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) {
    throw new Error('XLSX export failed for ' + xlsxName + ': HTTP ' + response.getResponseCode());
  }
  var blob = response.getBlob().setName(xlsxName);
  var existing = folder.getFilesByName(xlsxName);
  while (existing.hasNext()) existing.next().setTrashed(true);
  return folder.createFile(blob);
}

function sanitizeFileName_(name) {
  return name.replace(/[\\/:*?"<>|#%{}]/g, '_').replace(/\s+/g, ' ').trim() || 'Report';
}
function sanitizeSheetTitle_(name) {
  return sanitizeFileName_(name).slice(0, 99) || 'Sheet1';
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
