import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import type { LaunchProvider } from '../treeProvider';

const launchJsonPath = () => path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, '.vscode', 'launch.json');

function waitForLaunchChange(): Promise<void> {
	return new Promise(resolve => {
		const d = vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('launch')) {
				d.dispose();
				resolve();
			}
		});
	});
}

async function labels(provider: LaunchProvider) {
	const items = await provider.getChildren();
	return items.map(i => `${i.label}=${i.value}`);
}

suite('DebugVars', () => {
	let provider: LaunchProvider;
	let original: string;

	suiteSetup(async () => {
		original = fs.readFileSync(launchJsonPath(), 'utf8');
		provider = await vscode.extensions.getExtension('hydrair.debugvars')!.activate();
	});

	teardown(async () => {
		if (fs.readFileSync(launchJsonPath(), 'utf8') !== original) {
			const changed = waitForLaunchChange();
			fs.writeFileSync(launchJsonPath(), original);
			await changed;
		}
	});

	test('lists the variables from launch.json', async () => {
		assert.deepStrictEqual(await labels(provider), ['Title=myTest', 'Headless=true']);
	});

	test('editing writes launch.json and is used by ${config:launch.variables.*}', async () => {
		const showInputBox = vscode.window.showInputBox;
		(vscode.window as any).showInputBox = async () => 'changed';
		try {
			const [title] = await provider.getChildren();
			await vscode.commands.executeCommand('debugvars.editValue', title);
		} finally {
			(vscode.window as any).showInputBox = showInputBox;
		}

		const written = JSON.parse(fs.readFileSync(launchJsonPath(), 'utf8'));
		assert.deepStrictEqual(written.variables, { Title: 'changed', Headless: 'true' });
		assert.deepStrictEqual(await labels(provider), ['Title=changed', 'Headless=true']);

		let resolved: vscode.DebugConfiguration | undefined;
		const d = vscode.debug.registerDebugConfigurationProvider('debugvars-probe', {
			resolveDebugConfigurationWithSubstitutedVariables(_folder, config) {
				resolved = config;
				return undefined; // abort the launch
			}
		});
		try {
			await vscode.debug.startDebugging(vscode.workspace.workspaceFolders![0], 'probe');
		} finally {
			d.dispose();
		}
		assert.strictEqual(resolved?.title, 'changed');
	});

	test('picks up manual edits to launch.json', async () => {
		const changed = waitForLaunchChange();
		fs.writeFileSync(launchJsonPath(), original.replace('"myTest"', '"edited"'));
		await changed;
		assert.deepStrictEqual(await labels(provider), ['Title=edited', 'Headless=true']);
	});

	test('handles a launch.json without variables', async () => {
		const changed = waitForLaunchChange();
		const { variables: _, ...rest } = JSON.parse(original);
		fs.writeFileSync(launchJsonPath(), JSON.stringify(rest, null, 2));
		await changed;
		assert.deepStrictEqual(await labels(provider), []);
	});
});
