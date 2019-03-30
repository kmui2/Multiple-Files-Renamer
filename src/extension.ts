import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.renameFiles",
    async (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
      if (uris) {
        const replaceType = await vscode.window.showQuickPick([
          "Substring",
          "RegExp"
        ]);

        let replaceRegExpSubstr: string | RegExp;

        if (replaceType === "RegExp") {
          const response = await vscode.window.showInputBox({
            prompt: "Regex to find and replace..."
          });

          if (response === undefined) {
            return;
          }
          replaceRegExpSubstr = response;
        } else if (replaceType === "Substring") {
          const response = await vscode.window.showInputBox({
            prompt: "Substring/Regex to find and replace..."
          });

          if (response === undefined) {
            return;
          }
          replaceRegExpSubstr = new RegExp(response);
        } else {
          return;
        }

        console.log("replaceRegexSubstr:", replaceRegExpSubstr);
        const replaceSubstr =
          (await vscode.window.showInputBox({
            prompt: "Substring to replace with..."
          })) || "";
        console.log("replaceSubstr:", replaceSubstr);

        const we = new vscode.WorkspaceEdit();

        uris.forEach(uri => {
          const pathArray = uri.path.split(path.sep);
          pathArray.pop();
          const parentPath = path.join(...pathArray);
          const basename = path.basename(uri.path);
          const replacedBasename = basename.replace(
            replaceRegExpSubstr,
            replaceSubstr
          );
          const fullNewPath = path.join(parentPath, replacedBasename);
          const newUri = vscode.Uri.parse(`file:${fullNewPath}`);
          we.renameFile(uri, newUri, { overwrite: true });
        });
        vscode.workspace.applyEdit(we);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
