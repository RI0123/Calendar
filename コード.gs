function doGet() {
    return HtmlService.createHtmlOutputFromFile('index');
}

function processPdf(base64Pdf) {
    try {
    const pdfData = Utilities.base64Decode(base64Pdf);
    const pdfBlob = Utilities.newBlob(pdfData, 'application/pdf');
    const resource = {
        title: 'uploaded.pdf',
        mimeType: 'application/pdf'
    };
    const uploadedFile = Drive.Files.insert(resource, pdfBlob);

    // PDFからテキスト抽出（OCR）
    const extractedText = extractTextFromPdf(uploadedFile.id);

    // テキストをスプレッドシートに書き込む
    writeTextToSpreadsheet(extractedText);

    // アップロードされたファイルを削除（必要に応じて）
    Drive.Files.remove(uploadedFile.id);

    return 'スプレッドシートへの書き込みが完了しました。';
    } catch (e) {
    return 'エラーが発生しました: ' + e.toString();
    }
}

function extractTextFromPdf(fileId) {
  // Cloud Vision APIを使用してPDFからテキストを抽出
    const visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate';
  const apiKey = 'YOUR_CLOUD_VISION_API_KEY'; // Cloud Vision APIキーを設定
    const fileUrl = 'https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media';
    const payload = {
    requests: [{
        image: {
        source: {
            imageUri: fileUrl
        }
        },
        features: [{
        type: 'DOCUMENT_TEXT_DETECTION'
        }]
    }]
    };
    const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
        Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    },
    payload: JSON.stringify(payload)
    };
    const response = UrlFetchApp.fetch(visionApiUrl, options);
    const json = JSON.parse(response.getContentText());
    if (json.responses && json.responses[0].fullTextAnnotation) {
    return json.responses[0].fullTextAnnotation.text;
    } else {
    return 'テキスト抽出に失敗しました。';
    }
}

function writeTextToSpreadsheet(text) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    sheet.appendRow([text]);
}