# DebugVars README

This extensions enables the user to use the `variables` property of the `launch.json` on-the-fly to enable dynamic debugging

## Features

When in debug view, there is a tree view listing all the elements of `variables`. Clicking on one prompts for a new value and writes the edited file back.

## Requirements

- VS Code 1.90 or newer

## Usage
Add a new property `variables` to your `launch.json`. To use them put `${config:launch.variables.VariableName}` in your launch configuration.

For example: 
```
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "e2e",
      "args": [
        "run",
        "--grep",
        "${config:launch.variables.Title}",
        "${config:launch.variables.Arguments}"
      ],
      "program": "${workspaceFolder}/node_modules/.bin/codeceptjs"
    },
  ],
  "variables": {
    "Title": "myTest",
    "Headless": "true",
  }
}
```

In the `Debug` view in VS Code is a new TreeView. Clicking on a variable prompts for a new value and writes the edited file back. The launch configuration then uses the values in `variables`
## Known Issues

- VS Code's `launch.json` schema does not know the `variables` property and shows a "Property variables is not allowed" warning. It can be ignored.


## Release Notes

Users appreciate release notes as you update your extension.

### 1.1.0
- Works with current VS Code versions (tested on 1.90 and 1.144).
- No longer fails when `launch.json` has no `variables`.
- The view updates when `launch.json` is edited by hand.
- Writes go to the workspace folder's `launch.json` (also in multi-root workspaces).
- Updated build and test tooling.
### 0.0.3
Cleaned up some code.
### 0.0.2
Now using `vscode.workspace` configuration api.
### 0.0.1
Initial version.

