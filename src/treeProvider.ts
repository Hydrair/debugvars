import * as vscode from 'vscode';

interface LaunchVariable {
  value: string;
  label: string;
}
export class LaunchProvider implements vscode.TreeDataProvider<Option> {

	private _onDidChangeTreeData: vscode.EventEmitter<Option | undefined | void> = new vscode.EventEmitter<Option | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Option | undefined | void> = this._onDidChangeTreeData.event;
  inputs: {[k:string]: string} = {};
  launchJSON: string;

	constructor(private rootPath: string ) {
    this.launchJSON = `${rootPath}/.vscode/launch.json`;
    this.init();
	}

  private init(): void {
    if(this.launchJSON){
      const config = vscode.workspace.getConfiguration(
        'launch'
      );
      this.inputs=JSON.parse(JSON.stringify(config.get('variables')));
    }
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
		if (!this.launchJSON) {
			vscode.window.showInformationMessage('No launch.json found in workspace');
			return Promise.resolve([]);
		}

		if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(this.getInputsInLaunchJson());
    }
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
      const opts = [];
      if(this.launchJSON){ 
        for (const key in this.inputs) {
          opts.push(this.toOpt(
            {value:this.inputs[key],label:key}
          ));
        }
      }
      return opts;
  }

  public async editValue(element: Option){
    const newValue = await vscode.window.showInputBox({
      placeHolder: element.value,
      prompt: `Enter a new value for ${element.label}`,
    });
    if( newValue !== undefined ){
      this.inputs[element.label] = newValue;
      if(this.launchJSON){
        const config = vscode.workspace.getConfiguration(
          'launch',
        );
        config.update(`variables`,this.inputs);
      }
      this.refresh();
    }
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
