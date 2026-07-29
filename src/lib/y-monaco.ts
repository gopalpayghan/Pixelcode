/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Y from "yjs";
import type { editor as MonacoEditor, SelectionDirection } from "monaco-editor";

class RelativeSelection {
  start: Y.RelativePosition;
  end: Y.RelativePosition;
  direction: SelectionDirection;

  constructor(
    start: Y.RelativePosition,
    end: Y.RelativePosition,
    direction: SelectionDirection
  ) {
    this.start = start;
    this.end = end;
    this.direction = direction;
  }
}

const createRelativeSelection = (
  editor: MonacoEditor.IStandaloneCodeEditor,
  monacoModel: MonacoEditor.ITextModel,
  type: Y.Text
) => {
  const sel = editor.getSelection();
  if (sel !== null) {
    const startPos = sel.getStartPosition();
    const endPos = sel.getEndPosition();
    const start = Y.createRelativePositionFromTypeIndex(
      type,
      monacoModel.getOffsetAt(startPos)
    );
    const end = Y.createRelativePositionFromTypeIndex(
      type,
      monacoModel.getOffsetAt(endPos)
    );
    return new RelativeSelection(start, end, sel.getDirection());
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMonacoSelectionFromRelativeSelection = (
  editor: MonacoEditor.IEditor,
  type: Y.Text,
  relSel: RelativeSelection,
  doc: Y.Doc,
  monacoInstance: any
) => {
  const start = Y.createAbsolutePositionFromRelativePosition(relSel.start, doc);
  const end = Y.createAbsolutePositionFromRelativePosition(relSel.end, doc);
  if (
    start !== null &&
    end !== null &&
    start.type === type &&
    end.type === type
  ) {
    const model = editor.getModel() as MonacoEditor.ITextModel;
    const startPos = model.getPositionAt(start.index);
    const endPos = model.getPositionAt(end.index);
    return monacoInstance.Selection.createWithDirection(
      startPos.lineNumber,
      startPos.column,
      endPos.lineNumber,
      endPos.column,
      relSel.direction
    );
  }
  return null;
};

export class MonacoBinding {
  doc: Y.Doc;
  ytext: Y.Text;
  monacoModel: MonacoEditor.ITextModel;
  editors: Set<MonacoEditor.IStandaloneCodeEditor>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  awareness: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monacoInstance: any;
  public onlineUserNames: Set<string> = new Set();
  public onCursorPositionChange?: (userName: string, lineNumber: number) => void;
  private _savedSelections: Map<MonacoEditor.IStandaloneCodeEditor, RelativeSelection>;
  private _beforeTransaction: () => void;
  private _decorations: Map<MonacoEditor.IStandaloneCodeEditor, string[]>;
  private _rerenderDecorations: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _ytextObserver: (event: Y.YTextEvent) => void;
  private _monacoChangeHandler: { dispose: () => void };
  private _monacoDisposeHandler: { dispose: () => void };

  public setOnlineUserNames(names: Set<string>) {
    this.onlineUserNames = names;
    if (this._rerenderDecorations) {
      this._rerenderDecorations();
    }
  }

  constructor(
    ytext: Y.Text,
    monacoModel: MonacoEditor.ITextModel,
    editors: Set<MonacoEditor.IStandaloneCodeEditor> = new Set(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    awareness: any = null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    monacoInstance: any = null
  ) {
    this.doc = ytext.doc as Y.Doc;
    this.ytext = ytext;
    this.monacoModel = monacoModel;
    this.editors = editors;
    this.awareness = awareness;
    this.monacoInstance = monacoInstance;

    let isTransacting = false;

    this._savedSelections = new Map();
    this._beforeTransaction = () => {
      if (isTransacting) return;
      this._savedSelections = new Map();
      editors.forEach((editor) => {
        if (editor.getModel() === monacoModel) {
          const rsel = createRelativeSelection(editor, monacoModel, ytext);
          if (rsel !== null) {
            this._savedSelections.set(editor, rsel);
          }
        }
      });
    };
    this.doc.on("beforeAllTransactions", this._beforeTransaction);
    this._decorations = new Map();

    this._rerenderDecorations = () => {
      if (!awareness) return;

      const localState = awareness.getLocalState();
      const localUserName = localState?.user?.name;

      // Group awareness states by user name to guarantee EXACTLY 1 cursor per user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activeUserStates = new Map<string, { state: any; clientID: number }>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      awareness.getStates().forEach((state: any, clientID: number) => {
        if (clientID === this.doc.clientID) return;
        if (!state.selection || !state.selection.anchor || !state.selection.head) return;

        const userName = state.user?.name;
        if (!userName) return;

        // Skip rendering remote cursor decoration for self (local user already has Monaco's native cursor)
        if (localUserName && userName === localUserName) return;

        // STRICT RULE: Render ONLY cursors for users who are active and online in the Liveblocks room!
        if (this.onlineUserNames.size > 0 && !this.onlineUserNames.has(userName)) {
          return;
        }

        // Deduplicate: keep only the latest clientID per online user name
        const existing = activeUserStates.get(userName);
        if (!existing || clientID > existing.clientID) {
          activeUserStates.set(userName, { state, clientID });
        }
      });

      if (typeof document !== "undefined") {
        let styleEl = document.getElementById("yjs-monaco-cursor-styles");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "yjs-monaco-cursor-styles";
          document.head.appendChild(styleEl);
        }

        let cssText = "";
        activeUserStates.forEach(({ state, clientID }) => {
          if (state.user) {
            const user = state.user;
            const name = (user.name || `Developer ${clientID}`).replace(/"/g, '\\"');
            const color = user.color || "#64B5F6";
            const colorLight = user.colorLight || "#64B5F640";

            cssText += `
@keyframes monaco-remote-cursor-blink-${clientID} {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
.yRemoteSelection-${clientID} {
  background-color: ${colorLight} !important;
}
.yRemoteSelectionHead-${clientID} {
  position: absolute;
  border-left: 2px solid ${color} !important;
  height: 100%;
  box-sizing: border-box;
  animation: monaco-remote-cursor-blink-${clientID} 1s step-end infinite !important;
}
.yRemoteSelectionHead-${clientID}:hover::after,
.yRemoteSelectionHead-${clientID}.yRemoteSelectionHead-active::after {
  content: "${name}";
  position: absolute;
  top: -1.4em;
  left: -2px;
  background-color: ${color};
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  font-family: var(--font-geist-sans), ui-sans-serif, sans-serif;
  padding: 2px 5px;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
`;
          }
        });
        styleEl.textContent = cssText;
      }

      editors.forEach((editor) => {
        if (editor.getModel() === monacoModel && this.monacoInstance) {
          const currentDecorations = this._decorations.get(editor) || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newDecorations: any[] = [];

          activeUserStates.forEach(({ state, clientID }) => {
            const anchorAbs = Y.createAbsolutePositionFromRelativePosition(
              state.selection.anchor,
              this.doc
            );
            const headAbs = Y.createAbsolutePositionFromRelativePosition(
              state.selection.head,
              this.doc
            );
            if (
              anchorAbs !== null &&
              headAbs !== null &&
              anchorAbs.type === ytext &&
              headAbs.type === ytext
            ) {
              let start, end, afterContentClassName, beforeContentClassName;
              const isRange = anchorAbs.index !== headAbs.index;
              const className = isRange ? "yRemoteSelection yRemoteSelection-" + clientID : null;

              const activeClass = isRange ? " yRemoteSelectionHead-active" : "";

              if (anchorAbs.index < headAbs.index) {
                start = monacoModel.getPositionAt(anchorAbs.index);
                end = monacoModel.getPositionAt(headAbs.index);
                afterContentClassName =
                  "yRemoteSelectionHead yRemoteSelectionHead-" + clientID + activeClass;
                beforeContentClassName = null;
              } else {
                start = monacoModel.getPositionAt(headAbs.index);
                end = monacoModel.getPositionAt(anchorAbs.index);
                afterContentClassName = null;
                beforeContentClassName =
                  "yRemoteSelectionHead yRemoteSelectionHead-" + clientID + activeClass;
              }
              newDecorations.push({
                range: new this.monacoInstance.Range(
                  start.lineNumber,
                  start.column,
                  end.lineNumber,
                  end.column
                ),
                options: {
                  className,
                  afterContentClassName,
                  beforeContentClassName,
                },
              });
            }
          });

          activeUserStates.forEach(({ state }, userName) => {
            if (this.onCursorPositionChange && state.selection?.head) {
              const headAbs = Y.createAbsolutePositionFromRelativePosition(
                state.selection.head,
                this.doc
              );
              if (headAbs && headAbs.type === ytext) {
                const pos = monacoModel.getPositionAt(headAbs.index);
                this.onCursorPositionChange(userName, pos.lineNumber);
              }
            }
          });

          this._decorations.set(
            editor,
            editor.deltaDecorations(currentDecorations, newDecorations)
          );
        } else {
          this._decorations.delete(editor);
        }
      });
    };

    this._ytextObserver = (event: Y.YTextEvent) => {
      if (isTransacting) return;
      isTransacting = true;
      try {
        let index = 0;
        event.delta.forEach((op) => {
          if (op.retain !== undefined) {
            index += op.retain;
          } else if (op.insert !== undefined) {
            const pos = monacoModel.getPositionAt(index);
            const range = this.monacoInstance
              ? new this.monacoInstance.Selection(
                  pos.lineNumber,
                  pos.column,
                  pos.lineNumber,
                  pos.column
                )
              : {
                  startLineNumber: pos.lineNumber,
                  startColumn: pos.column,
                  endLineNumber: pos.lineNumber,
                  endColumn: pos.column,
                };
            const insert = op.insert as string;
            monacoModel.applyEdits([{ range, text: insert }]);
            index += insert.length;
          } else if (op.delete !== undefined) {
            const pos = monacoModel.getPositionAt(index);
            const endPos = monacoModel.getPositionAt(index + op.delete);
            const range = this.monacoInstance
              ? new this.monacoInstance.Selection(
                  pos.lineNumber,
                  pos.column,
                  endPos.lineNumber,
                  endPos.column
                )
              : {
                  startLineNumber: pos.lineNumber,
                  startColumn: pos.column,
                  endLineNumber: endPos.lineNumber,
                  endColumn: endPos.column,
                };
            monacoModel.applyEdits([{ range, text: "" }]);
          }
        });
        this._savedSelections.forEach((rsel, editor) => {
          if (this.monacoInstance) {
            const sel = createMonacoSelectionFromRelativeSelection(
              editor,
              ytext,
              rsel,
              this.doc,
              this.monacoInstance
            );
            if (sel !== null) {
              editor.setSelection(sel);
            }
          }
        });
      } finally {
        isTransacting = false;
      }
      this._rerenderDecorations();
    };
    ytext.observe(this._ytextObserver);

    const ytextValue = ytext.toString();
    if (monacoModel.getValue() !== ytextValue) {
      monacoModel.setValue(ytextValue);
    }

    this._monacoChangeHandler = monacoModel.onDidChangeContent((event) => {
      if (isTransacting) return;
      isTransacting = true;
      try {
        this.doc.transact(() => {
          event.changes
            .sort((c1, c2) => c2.rangeOffset - c1.rangeOffset)
            .forEach((change) => {
              ytext.delete(change.rangeOffset, change.rangeLength);
              ytext.insert(change.rangeOffset, change.text);
            });
        }, this);
      } finally {
        isTransacting = false;
      }
    });

    this._monacoDisposeHandler = monacoModel.onWillDispose(() => {
      this.destroy();
    });

    if (awareness) {
      editors.forEach((editor) => {
        editor.onDidChangeCursorSelection(() => {
          if (editor.getModel() === monacoModel) {
            const sel = editor.getSelection();
            if (sel === null) return;
            let anchor = monacoModel.getOffsetAt(sel.getStartPosition());
            let head = monacoModel.getOffsetAt(sel.getEndPosition());
            if (
              this.monacoInstance &&
              sel.getDirection() === this.monacoInstance.SelectionDirection.RTL
            ) {
              const tmp = anchor;
              anchor = head;
              head = tmp;
            }
            awareness.setLocalStateField("selection", {
              anchor: Y.createRelativePositionFromTypeIndex(ytext, anchor),
              head: Y.createRelativePositionFromTypeIndex(ytext, head),
            });
          }
        });
        awareness.on("change", this._rerenderDecorations);
      });
    }
  }

  destroy() {
    this._monacoChangeHandler.dispose();
    this._monacoDisposeHandler.dispose();
    this.ytext.unobserve(this._ytextObserver);
    this.doc.off("beforeAllTransactions", this._beforeTransaction);
    if (this.awareness) {
      this.awareness.off("change", this._rerenderDecorations);
      try {
        this.awareness.setLocalState(null);
      } catch {}
    }
  }
}
