import * as vscode from 'vscode';
import { LaunchProvider } from './treeProvider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new LaunchProvider();
  context.subscriptions.push(
    provider,
    vscode.window.registerTreeDataProvider('extended', provider),
    vscode.commands.registerCommand('debugvars.editValue', (e) => provider.editValue(e)),
    vscode.commands.registerCommand('debugvars.refresh', () =>
      provider.refreshManually()
    )
  );
  // returned for the integration tests
  return provider;
}
export function deactivate() {}
