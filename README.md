# DebugVars README

This extensions enables the user to change the `inputs` property of the `launch.json` on-the-fly to enable dynamic debugging

## Features

When in debug view, there is a tree view listing all the elements of `inputs`. Clicking on one prompts for a new value and writes the edited file back.

## Requirements

- A well formatted `launch.json` without comments

## Usage
Add a new property `variables` to your `launch.json`. To use them put `{config:launch.variables.VariableName}` in your launch configuration.

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


## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.3
Cleaned up some code.
### 0.0.2
Now using `vscode.workspace` configuration api.
### 0.0.1
Initial version.

