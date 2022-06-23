import * as vscode from 'vscode';
var utils = require("./utils");
const axios = require('axios');


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
    private version = "0.0.1";
    private ProjectFolder;
    private ProjectName;

    public initialize(): void {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let doc = editor.document;
            if (doc) {
                let file: string = doc.fileName;
                if (file) {
                    this.ProjectFolder = this.getProjectFolder(file);
                    this.ProjectName = this.getProjectName(file);
                }
            }
        }
        var now = Date.now();
        this.codeData.openTime = now;
        this.codeData.codingLong = this.codeData.lastCodingTime = this.codeData.firstCodingTime = 0;
    }

    public updateConfigurations(): void {
        var configurations = vscode.workspace.getConfiguration('repotime');
        this.enableStatusBar = configurations.get('showStatus');
        // this.statusBar = vscode.window.createStatusBarItem(
        //     vscode.StatusBarAlignment.Left,
        // );
        if (this.enableStatusBar) {
            this.statusBar?.show();
            console.log('Status bar icon enabled.');
        } else {
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

    private async postMan() {
        if (this.codeData.firstCodingTime === 0) { return; }
        try {
            const params = new URLSearchParams();
            params.append('userid', '1');
            params.append('language', 'ts');
            params.append('project', this.ProjectName);
            params.append('os', 'windows');
            params.append('stTime', utils.formatDate(this.codeData.firstCodingTime));
            params.append('edTime', utils.formatDate(this.codeData.lastCodingTime));
            params.append('editor', 'VSCode/' + vscode.version);
            const response = await axios({
                method: 'post',
                url: 'http://106.15.48.207:8080/addData',
                data: params
                // data: JSON.stringify({
                //     'userid': '1',
                //     'language': 'ts',
                //     'project': this.ProjectName,
                //     'os': 'windows',
                //     'stTime': new Date(this.codeData.firstCodingTime).toISOString().slice(0, 19).replace('T', ' '),
                //     'edTime': new Date(this.codeData.lastCodingTime).toISOString().slice(0, 19).replace('T', ' '),
                //     'editor': 'VSCode/' + vscode.version,
                // })
            });
            // console.log(response);
            if (response.status === 200 || response.status === 201 || response.status === 202) {
                if (this.enableStatusBar) {
                    // this.getCodingActivity();
                    console.log(`Sending Successfully at ${utils.formatDate(new Date())}`);
                }
            } else {
                if (response && response.status === 401) {
                    console.log(`wrong ${utils.formatDate(new Date())}`);
                } else {
                    console.log(`error ${utils.formatDate(new Date())}`);
                }
            }
        } catch (ex) {
            console.log(`Sending Error: ${ex}`);
        }
    }

    //Handler VSCode Event
    public EventHandler = {
        onActiveFileChange: (doc) => {
            this.postMan();
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
            // console.log(utils.formatTime(this.codeData.codingLong));
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