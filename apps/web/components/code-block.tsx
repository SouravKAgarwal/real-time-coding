"use client";

import { Editor } from "@monaco-editor/react";
import { FileTab } from "@repo/types";

interface CodeEditorProps {
  file: FileTab;
  onChange: (value: string) => void;
}

export function CodeEditor({ file, onChange }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={file.language}
      theme="vs-dark"
      path={file.name}
      value={file.code}
      onChange={(value) => onChange(value ?? "")}
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
