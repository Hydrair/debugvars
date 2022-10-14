import * as vscode from 'vscode';
import { LaunchProvider } from './treeProvider';

export function activate(context: vscode.ExtensionContext) {
  const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0)) ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
  const vsPath = rootPath + '/.vscode/launch.json';
  
  const provider = new LaunchProvider(rootPath!);
  vscode.window.registerTreeDataProvider('extended', provider);
  vscode.commands.registerCommand('debugvars.editValue',(e) =>provider.editValue(e));
  vscode.commands.registerCommand('debugvars.refresh', () =>
    provider.refreshManually()
  );

}
export function deactivate() {}
