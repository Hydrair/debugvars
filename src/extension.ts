// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LaunchProvider } from './treeProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "extendeddebugging" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('extendeddebugging.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from ExtendedDebugging!');
	// });

	// context.subscriptions.push(disposable);
  
  
  const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0)) ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
  const vsPath = rootPath + '/.vscode/launch.json';
  console.log(rootPath,vsPath);
  
  const provider = new LaunchProvider(vsPath);
  vscode.window.registerTreeDataProvider('extended', provider);
  vscode.commands.registerCommand('extendeddebugging.editValue',(e) =>provider.editValue(e));

}

// This method is called when your extension is deactivated
export function deactivate() {}
