import * as vscode from 'vscode';

interface LaunchVariable {
  value: string;
  label: string;
}
export class LaunchProvider implements vscode.TreeDataProvider<Option>, vscode.Disposable {

	private _onDidChangeTreeData: vscode.EventEmitter<Option | undefined | void> = new vscode.EventEmitter<Option | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Option | undefined | void> = this._onDidChangeTreeData.event;
  inputs: {[k:string]: string} = {};
  private configListener: vscode.Disposable;

	constructor() {
    this.init();
    // pick up changes made directly in launch.json
    this.configListener = vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('launch')) {
        this.refreshManually();
      }
    });
	}

  private get workspaceFolder(): vscode.WorkspaceFolder | undefined {
    return vscode.workspace.workspaceFolders?.[0];
  }

  // scoped to the folder so reads and writes use its .vscode/launch.json
  private getLaunchConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('launch', this.workspaceFolder?.uri);
  }

  private init(): void {
    // copy, the returned configuration object is read-only; `variables` may be missing
    this.inputs = { ...this.getLaunchConfig().get<{[k:string]: string}>('variables') };
  }

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

  refreshManually(): void {
    this.init();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Option): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Option): Thenable<Option[]> {
		if (element || !this.workspaceFolder) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.getInputsInLaunchJson());
	}

  private toOpt(option: LaunchVariable){
    const item =new Option(option.label,option.value,vscode.TreeItemCollapsibleState.None);
    item.command = {
      title: 'Edit',
      command: "debugvars.editValue",
      arguments: [item]
    };
    return item;
  };

  private getInputsInLaunchJson(){
      const opts = [];
      for (const key in this.inputs) {
        opts.push(this.toOpt(
          {value:this.inputs[key],label:key}
        ));
      }
      return opts;
  }

  public async editValue(element: Option){
    if (!element || !this.workspaceFolder) {
      return;
    }
    const newValue = await vscode.window.showInputBox({
      placeHolder: element.value,
      prompt: `Enter a new value for ${element.label}`,
    });
    if( newValue !== undefined ){
      this.inputs[element.label] = newValue;
      try {
        await this.getLaunchConfig().update('variables', this.inputs, vscode.ConfigurationTarget.WorkspaceFolder);
      } catch (e) {
        vscode.window.showErrorMessage(`DebugVars: could not write launch.json: ${e}`);
      }
      this.refresh();
    }
  }

  dispose(): void {
    this.configListener.dispose();
    this._onDidChangeTreeData.dispose();
  }
}

export class Option extends vscode.TreeItem {

	constructor(
		public readonly label: string,
    public  value: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public command?: vscode.Command
	) {

		super(label, collapsibleState);

		this.tooltip = `${this.label}`;
		this.description = `${value}`;
	}

	contextValue = 'option';
}
