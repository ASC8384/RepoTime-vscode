import * as vscode from 'vscode';
import * as os from 'os';
var utils = require("./utils");
const axios = require('axios');

export class RepoTime {
    private userid: string;
    private os: string;
    private arch: string;
    private minTime: number;
    private maxTime: number;
    private codeData = {
        openTime: 0,
        firstCodingTime: 0,
        codingLong: 0,
        nowcodingLong: 0,
        lastCodingTime: 0,
        language: ""
    };
    private serverURL: string;
    private statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
    );// vscode.StatusBarItem = undefined;
    private enableStatusBar: boolean;
    private version = "0.1.0";
    private ProjectFolder: string;
    private ProjectName: string;

    // 需要忽略的一些模式
    private INVALID_SCHEMES = [
        // git 相关
        'git-index',
        'git',
        // 输出
        'output',
        // 输入
        'input',
        // 预览
        'private',
        'markdown'
    ];

    public initialize(): void {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let doc = editor.document;
            if (doc) {
                let file: string = doc.fileName;
                if (file) {
                    this.ProjectFolder = this.getProjectFolder(file);
                    this.ProjectName = this.getProjectName(file);
                    this.os = this.getOS();
                    this.arch = this.getArch();
                }
            }
        }
        var now = Date.now();
        this.codeData.openTime = now;
        this.codeData.codingLong = this.codeData.nowcodingLong = this.codeData.lastCodingTime = this.codeData.firstCodingTime = 0;
    }

    public updateConfigurations(): void {
        var configurations = vscode.workspace.getConfiguration('repotime');
        this.enableStatusBar = configurations.get('showStatus');
        this.userid = configurations.get('userid');
        this.minTime = Number(configurations.get('minTime')) * 1000;
        this.maxTime = Number(configurations.get('maxTime')) * 1000;
        this.serverURL = configurations.get('serverURL');
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
        // console.log("enableStatusBar: " + this.enableStatusBar);
        // console.log(this.userid);
    }

    //Handler VSCode Event
    public EventHandler = {
        onActiveFileChange: (doc) => {
            this.postMan();
            var now = Date.now();
            this.codeData.language = this.getLanguage(doc);
            this.codeData.openTime = now;
            this.codeData.codingLong = this.codeData.nowcodingLong = this.codeData.lastCodingTime = this.codeData.firstCodingTime = 0;
        },
        onFileCoding: (doc) => {
            //ignore event if it is not a coding action
            if (!doc || this.INVALID_SCHEMES.indexOf(doc.uri.scheme) >= 0) { return; }
            var now = Date.now();
            //If time is too short to calling this function then just ignore it
            if (this.isLegalTime(now)) {
                //If is first time coding in this file, begin to record time
                if (!this.codeData.firstCodingTime) {
                    this.codeData.firstCodingTime = now;
                }
                // If need to upload
                if (this.isNeedUpdate()) {
                    this.postMan();
                    this.codeData.nowcodingLong = 0;
                    this.codeData.firstCodingTime = now - 1000;
                }
                this.codeData.codingLong += 1000;
                this.codeData.nowcodingLong += 1000;
                this.codeData.lastCodingTime = now;
                this.updateStatusBarText(utils.formatTime(this.codeData.codingLong));
            }
            // console.log(utils.formatTime(this.codeData.codingLong));
        }
    };


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
            params.append('userid', this.userid);
            params.append('language', this.codeData.language);
            params.append('project', this.ProjectName);
            params.append('os', this.os);
            params.append('arch', this.arch);
            params.append('stTime', utils.formatDate(this.codeData.firstCodingTime));
            params.append('edTime', utils.formatDate(this.codeData.lastCodingTime));
            params.append('editor', 'VSCode/' + vscode.version);
            const response = await axios({
                method: 'post',
                url: `${this.serverURL}/addData`,
                data: params
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


    private isNeedUpdate(): boolean {
        return this.maxTime < this.codeData.nowcodingLong;
    }

    private isLegalTime(now: number): boolean {
        return now - this.minTime >= this.codeData.lastCodingTime;
    }

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

    private getLanguage(doc: vscode.TextDocument): string {
        return doc.languageId || '';
    }

    private getOS(): string {
        let osname = os.platform() as string;
        if (osname === 'win32') {
            osname = 'windows';
        }
        return osname;
    }

    private getArch(): string {
        const arch = os.arch();
        if (arch.indexOf('32') > -1) { return '386'; }
        if (arch.indexOf('x64') > -1) { return 'amd64'; }
        return arch;
    }

    public getCodeData(foo: string): string {
        return foo + ": " + this.codeData[foo];
    }
}