import path = require('node:path');
import fs = require('node:fs');
import * as vscode from 'vscode';

export class LaunchProvider implements vscode.TreeDataProvider<Option> {

	private _onDidChangeTreeData: vscode.EventEmitter<Option | undefined | void> = new vscode.EventEmitter<Option | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Option | undefined | void> = this._onDidChangeTreeData.event;
  inputs: any;

	constructor(private launchJSON: string ) {
    fs.watch(launchJSON,(eventType)=>{
      if (eventType === 'change') {
        this.refresh();
      }
    });
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Option): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Option): Thenable<Option[]> {
		if (!this.launchJSON) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(this.getInputsInLaunchJson());
    }
	}

  private getInputsInLaunchJson(){
    const launchJSONPath = this.launchJSON;
    if(this.pathExists(launchJSONPath)){
      // beware of end of line comma
      this.inputs = this.getLaunchFile().inputs;

      const toOpt = (option: {
        default: string;id:string,type:string
}) =>{
        const item =new Option(option.id,option.default,option.type,vscode.TreeItemCollapsibleState.None);
        item.command = {
          title: 'Edit',
          command: "extendeddebugging.editValue",
          arguments: [item]
        };
        return item; 
      };

      const opts = this.inputs.map((input: { id: string;  default: string;type: string; }) => toOpt(input));

      return opts;
    } else {
      return [];
    }
  }

  private getLaunchFile(){
    return JSON.parse(fs.readFileSync(this.launchJSON,{encoding: "utf-8"}));
  }

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}

  public async editValue(element: Option){
    const newValue = await vscode.window.showInputBox({
      placeHolder: element.value,
      prompt: `Enter a new value for ${element.label}`,
    });
    if( newValue !== undefined ){
      const editedFile = this.getLaunchFile();
      editedFile.inputs.find((e: { id: string; }) => e.id === element.label).default = newValue;
      fs.writeFileSync(this.launchJSON,JSON.stringify(editedFile,null,"\t"),{
        encoding: 'utf-8',
      });
    }
  }
}

export class Option extends vscode.TreeItem {

	constructor(
		public readonly label: string,
    public  value: string,
		private readonly inputType: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public command?: vscode.Command
	) {
   
		super(label, collapsibleState);

		this.tooltip = `${this.label}`;
		this.description = `${value}`;
	}

	contextValue = 'option';
}
