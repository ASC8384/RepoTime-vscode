import * as vscode from 'vscode';

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

function formatTime(time): String {
    var sec = Math.round(time / 1000);
    var min = Math.round(sec / 60);
    var hour = Math.round(min / 60);
    sec = sec % 60;
    min = min % 60;
    hour = hour % 24;

    if (hour === 0) {
        if (min === 0) {
            return `${sec < 10 ? `0${sec}` : sec}s`;
        } else {
            return `${min < 10 ? `0${min}` : min}m ${sec < 10 ? `0${sec}` : sec}s`;
        }
    } else {
        return `${hour < 10 ? `0${hour}` : hour}h ${min < 10 ? `0${min}` : min}m ${sec < 10 ? `0${sec}` : sec}s`;
    }
}

function formatDate(date: Date): String {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = { cloneTextDocument, cloneUri, formatTime, formatDate };