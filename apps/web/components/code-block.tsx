"use client";

import { Editor, OnMount } from "@monaco-editor/react";
import { FileTab } from "@repo/types";
import { useEffect, useRef } from "react";

interface CodeEditorProps {
  activeFile: FileTab;
  onChange: (value: string | undefined) => void;
}

export function CodeEditor({ activeFile, onChange }: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorMount: OnMount = (editor, _monaco) => {
    editorRef.current = editor;
    editor.focus();
  };

  useEffect(() => {
    const current = editorRef.current;
    if (current) {
      const model = current.getModel();
      if (model && model.getValue() !== activeFile.code) {
        model.setValue(activeFile.code);
      }
    }
  }, [activeFile]);

  return (
    <Editor
      height="100%"
      language={activeFile.language}
      theme="vs-dark"
      path={activeFile.name}
      value={activeFile.code}
      onChange={onChange}
      onMount={handleEditorMount}
      loading={<div className="p-4">Loading editor...</div>}
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
