import * as vscode from 'vscode';
import { RepoTime } from './repotime';

var rt: RepoTime;

export function activate(context: vscode.ExtensionContext) {
	rt = new RepoTime();

	rt.EventHandler.onActiveFileChange((vscode.window.activeTextEditor || {}).document);
	var subscriptions = context.subscriptions;
	//Listening VSCode event to record coding activity
	subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(
			e => {
				return rt.EventHandler.onFileCoding((e || {}).document);
			}));
	subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(
			e => {
				return rt.EventHandler.onActiveFileChange((e || {}).document);
			}));
	rt.initialize();
	const { onDidChangeConfiguration } = vscode.workspace;
	//Listening configurations
	subscriptions.push(
		onDidChangeConfiguration(() => rt.initialize())
	);
	// vscode.workspace.onDidChangeConfiguration(rt.initialize);

	console.log('Congratulations, your extension "repotime" is now active!');

	let editor = vscode.window.activeTextEditor;
	if (editor) {
		let doc = editor.document;
		if (doc) {
			let file: string = doc.fileName;
			if (file) {
				let disposable = vscode.commands.registerCommand('repotime.helloWorld', () => {
					vscode.window.showInformationMessage(rt.getCodeData("openTime") + '!');
					vscode.window.showInformationMessage(rt.getCodeData("firstCodingTime") + '!');
					vscode.window.showInformationMessage(rt.getCodeData("codingLong") + '!');
					vscode.window.showInformationMessage(rt.getCodeData("lastCodingTime") + '!');
				});
				context.subscriptions.push(disposable);
			}
		}
	}
}

export function deactivate() { }
