import * as vscode from 'vscode';
var utils = require("./utils");

export class RepoTime {
    private activeDocument;
    private codeData = {
        openTime: 0,
        firstCodingTime: 0,
        codingLong: 0,
        lastCodingTime: 0
    };
    private statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
    );// vscode.StatusBarItem = undefined;
    private enableStatusBar: boolean;

    public initialize(): void {
        var configurations = vscode.workspace.getConfiguration('repotime');
        this.enableStatusBar = configurations.get('showStatus');
        // this.statusBar = vscode.window.createStatusBarItem(
        //     vscode.StatusBarAlignment.Left,
        // );
        if (this.enableStatusBar) {
            this.statusBar?.show();
            console.log('Status bar icon enabled.');
        }else{
            this.statusBar?.hide();
            console.log('Status bar icon disable.');
        }

        this.updateStatusBarText("");
        console.log("enableStatusBar: " + this.enableStatusBar);
        console.log(this.statusBar);
    }

    private updateStatusBarText(text?: string): void {
        if (!this.enableStatusBar) { return; }
        if (!text) {
            this.statusBar.text = '$(clock)';
        } else {
            this.statusBar.text = '$(clock) ' + text;
        }
    }

    //Handler VSCode Event
    public EventHandler = {
        onActiveFileChange: (doc) => {
            var now = Date.now();
            this.activeDocument = utils.cloneTextDocument(doc);
            this.codeData.openTime = now;
            this.codeData.codingLong = this.codeData.lastCodingTime = this.codeData.firstCodingTime = 0;
        },
        onFileCoding: (doc) => {
            //ignore event if it is not a coding action
            if (!doc || doc.uri.scheme === 'git-index') { return; }
            var now = Date.now();
            //If time is too short to calling this function then just ignore it
            if (now - 1000 < this.codeData.lastCodingTime) { return; }
            //If is first time coding in this file, begin to record time
            if (!this.codeData.firstCodingTime) {
                this.codeData.firstCodingTime = now;
            }
            this.codeData.codingLong += 1000;
            this.codeData.lastCodingTime = now;
            this.updateStatusBarText(utils.formatTime(this.codeData.codingLong));
            console.log(utils.formatTime(this.codeData.codingLong));
        }
    };

    public getProjectName(file: string): string {
        if (!vscode.workspace) { return ''; }
        let uri = vscode.Uri.file(file);
        let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            try {
                return workspaceFolder.name;
            } catch (e) { }
        }
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
            return vscode.workspace.workspaceFolders[0].name;
        }
        return vscode.workspace.name || '';
    }

    public getProjectFolder(file: string): string {
        if (!vscode.workspace) { return ''; }
        let uri = vscode.Uri.file(file);
        let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            try {
                return workspaceFolder.uri.fsPath;
            } catch (e) { }
        }
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        return '';
    }

    public getCodeData(foo: string): string {
        return foo + ": " + this.codeData[foo];
    }
}