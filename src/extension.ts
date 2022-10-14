import * as vscode from 'vscode';
import { LaunchProvider } from './treeProvider';

export function activate(context: vscode.ExtensionContext) {
  const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0)) ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
  const vsPath = rootPath + '/.vscode/launch.json';
  console.log(rootPath,vsPath);
  
  const provider = new LaunchProvider(vsPath);
  vscode.window.registerTreeDataProvider('extended', provider);
  vscode.commands.registerCommand('extendeddebugging.editValue',(e) =>provider.editValue(e));
  vscode.commands.registerCommand('extendeddebugging.refresh', () =>
    provider.refreshManually()
  );

}
export function deactivate() {}
