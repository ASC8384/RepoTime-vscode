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
	//Listening configurations
	rt.updateConfigurations();
	const { onDidChangeConfiguration } = vscode.workspace;
	subscriptions.push(
		onDidChangeConfiguration(() => rt.updateConfigurations())
	);
	// vscode.workspace.onDidChangeConfiguration(rt.initialize);

	console.log('Congratulations, your extension "repotime" is now active!');
}

export function deactivate() { }
