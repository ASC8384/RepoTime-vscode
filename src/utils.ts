var vscode = require('vscode');


function cloneTextDocument(doc) {
    if (!doc) { return null; }
    return Object.assign({}, doc, { uri: cloneUri(doc.uri) });
    // https://code.visualstudio.com/api/references/vscode-api#TextDocument
    // return doc ? {
    //     fileName: doc.fileName,
    //     isUntitled: doc.isUntitled,
    //     languageId: doc.languageId,
    //     uri: {
    //         scheme: doc.uri.scheme,
    //         path: doc.uri.path,
    //         fsPath: doc.uri.fsPath,
    //         external: doc.uri.external
    //     }
    // } : doc
}

function cloneUri(uri) {
    if (!uri) { return null; }
    return vscode.Uri.parse(uri.toString());
}


module.exports = { cloneTextDocument, cloneUri };