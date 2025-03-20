function doGet(request) {
  if (request.parameters.id) {
    return HtmlService.createHtmlOutputFromFile("preview").setTitle(
      "Spreadsheet Preview"
    );
  } else {
    return HtmlService.createHtmlOutputFromFile("index").setTitle(
      "PDF to Spreadsheet"
    );
  }
}

function processPdf(base64Pdf, fileName) {
  try {
    const bytes = Utilities.base64Decode(base64Pdf);
    const blob = Utilities.newBlob(bytes, "application/pdf", fileName);
    const doc = DocumentApp.create("TempDoc");
    doc.getBody().appendPageBreak(); // 最初のページ区切りを追加
    DriveApp.createFile(blob)
      .getAs("application/vnd.google-apps.document")
      .copyTo(doc);
    const text = doc.getBody().getText();
    DriveApp.getFileById(doc.getId()).setTrashed(true); // 一時ファイルを削除
    return writeTextToSpreadsheet(text, fileName);
  } catch (e) {
    Logger.log(e.toString());
    return null; // エラーが発生した場合はnullを返す
  }
}

function writeTextToSpreadsheet(text, fileName) {
  try {
    const ss = SpreadsheetApp.create(fileName.replace(".pdf", ""));
    const sheet = ss.getActiveSheet();
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      sheet.appendRow([lines[i]]);
    }
    return ss.getId();
  } catch (e) {
    Logger.log(e.toString());
    return null; // エラーが発生した場合はnullを返す
  }
}

function saveData(spreadsheetId) {
  // データの保存処理を実装
  Logger.log(`Spreadsheet ID: ${spreadsheetId} のデータを保存しました。`);
}
