// export type FileNode = {
//   id: string;
//   name: string;
//   type: "file" | "folder";
//   code?: string;
//   language?: string;
//   children?: FileNode[];
// };

// export type FileTab = {
//   id: string;
//   name: string;
//   code: string;
//   language: string;
//   dirty?: boolean;
// };

// export type FileExplorerProps = {
//   files: FileNode[];
//   onSelectFile: (file: FileNode) => void;
//   className?: string;
// };

// export type CodeEditorProps = {
//   files: FileTab[];
//   activeFileId: string | null;
//   onFileChange: (value: string, id: string) => void;
//   onCloseFile: (id: string) => void;
//   onFileSelect: (id: string) => void;
//   editorTheme?: string;
// };

// export type VSCodeLayoutProps = {
//   initialFiles?: FileNode[];
//   onFilesChange?: (files: FileNode[]) => void;
// };

// export type LanguageSupport = {
//   [key: string]: {
//     name: string;
//     extensions: string[];
//   };
// };

// export const DEFAULT_LANGUAGE_MAP: LanguageSupport = {
//   javascript: {
//     name: "javascript",
//     extensions: ["js", "mjs", "cjs"],
//   },
//   typescript: {
//     name: "typescript",
//     extensions: ["ts", "tsx"],
//   },
//   html: {
//     name: "html",
//     extensions: ["html", "htm"],
//   },
//   css: {
//     name: "css",
//     extensions: ["css"],
//   },
//   json: {
//     name: "json",
//     extensions: ["json"],
//   },
//   markdown: {
//     name: "markdown",
//     extensions: ["md", "markdown"],
//   },
// };
