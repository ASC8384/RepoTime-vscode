import * as vscode from 'vscode';

import { RepoTime } from './repotime';

var repotime: RepoTime;

export function activate(context: vscode.ExtensionContext) {
	repotime = new RepoTime();

	console.log('Congratulations, your extension "repotime" is now active!');

	let editor = vscode.window.activeTextEditor;
	if (editor) {
		let doc = editor.document;
		if (doc) {
			let file: string = doc.fileName;
			if (file) {
				let disposable = vscode.commands.registerCommand('repotime.helloWorld', () => {
					// Get project name and folder
					// Display a message box to the user
					vscode.window.showInformationMessage('Hello World from ' + repotime.getProjectFolder(file) + '!');
					vscode.window.showInformationMessage('Hello World from ' + repotime.getProjectName(file) + '!');
				});
				context.subscriptions.push(disposable);
			}
		}
	}
}

export function deactivate() { }
