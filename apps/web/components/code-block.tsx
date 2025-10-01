"use client";

import { Editor } from "@monaco-editor/react";
import { FileTab } from "@repo/types";

interface CodeEditorProps {
  activeFile: FileTab;
  onChange: (value: string | undefined) => void;
}

export function CodeEditor({ activeFile, onChange }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={activeFile.language}
      theme="vs-dark"
      path={activeFile.name}
      loading={<div className="p-4">Loading editor...</div>}
      value={activeFile.code}
      onChange={onChange}
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        wordWrap: "on",
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderWhitespace: "selection",
        tabSize: 2,
        insertSpaces: true,
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        autoClosingOvertype: "always",
        autoIndent: "full",
        formatOnPaste: true,
        formatOnType: true,
        bracketPairColorization: {
          enabled: true,
          independentColorPoolPerBracketType: true,
        },
        guides: {
          indentation: true,
          highlightActiveIndentation: true,
        },
      }}
    />
  );
}
