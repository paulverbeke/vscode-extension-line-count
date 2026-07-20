import * as vscode from "vscode";

let myStatusBarItem: vscode.StatusBarItem;

export function activate({ subscriptions }: vscode.ExtensionContext) {
  // register a command that is invoked when the status bar
  // item is selected
  const myCommandId = "ext.showSelectionCount";
  subscriptions.push(
    vscode.commands.registerCommand(myCommandId, () => {
      let n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
      vscode.window.showInformationMessage(
        `${n} line${n ? "s" : ""} selected.`
      );
    })
  );

  // create a new status bar item that we can now manage
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    10000
  );
  myStatusBarItem.command = myCommandId;
  subscriptions.push(myStatusBarItem);

  // register some listener that make sure the status bar
  // item always up-to-date
  subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
  );
  subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem)
  );

  // update status bar item once at start
  updateStatusBarItem();
}

function updateStatusBarItem(): void {
  let n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
  if (n > 1) {
    myStatusBarItem.text = `$(list-selection) ${n} lines`;
    myStatusBarItem.tooltip = `${n} lines selected`;
    myStatusBarItem.show();
  } else {
    myStatusBarItem.hide();
  }
}

function getNumberOfSelectedLines(
  editor: vscode.TextEditor | undefined
): number {
  if (!editor) {
    return 0;
  }
  const selectedLines = new Set<number>();
  for (const selection of editor.selections) {
    // When a selection ends at character 0 of a line, that line itself is not
    // selected — only a cursor sits at its start. Exclude it unless the
    // selection is entirely on that line (i.e. a zero-width cursor).
    const endLine =
      selection.end.character === 0 && selection.end.line > selection.start.line
        ? selection.end.line - 1
        : selection.end.line;
    for (let line = selection.start.line; line <= endLine; line++) {
      selectedLines.add(line);
    }
  }
  return selectedLines.size;
}
