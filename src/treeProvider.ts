import * as vscode from 'vscode';

export class LaunchProvider implements vscode.TreeDataProvider<Option> {

	private _onDidChangeTreeData: vscode.EventEmitter<Option | undefined | void> = new vscode.EventEmitter<Option | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Option | undefined | void> = this._onDidChangeTreeData.event;
  inputs: {[k:string]: string} = {};
  folders: readonly vscode.WorkspaceFolder[] | undefined;

	constructor(private launchJSON: string ) {
    this.folders =vscode.workspace.workspaceFolders; 
    this.init();
	}

  private init(): void {
    if(this.folders){
      const config = vscode.workspace.getConfiguration(
        'launch',
        this.folders[0].uri
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

  private getInputsInLaunchJson(){
      const opts = [];
      if(this.folders){
        
        const toOpt = (option: {
          default: string;id:string}) =>{
          const item =new Option(option.id,option.default,vscode.TreeItemCollapsibleState.None);
          item.command = {
            title: 'Edit',
            command: "extendeddebugging.editValue",
            arguments: [item]
          };
          return item; 
        };
  
        for (const key in this.inputs) {
          opts.push(toOpt({default:this.inputs[key],id:key}));
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
      element.value = newValue;
      const folders =vscode.workspace.workspaceFolders; 
      if(folders){
        const config = vscode.workspace.getConfiguration(
          'launch',
          folders[0].uri
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
