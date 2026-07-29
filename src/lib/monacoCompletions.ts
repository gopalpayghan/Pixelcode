/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Monaco } from "@monaco-editor/react";

const registeredLanguages = new Set<string>();

interface SnippetSuggestion {
  label: string;
  insertText: string;
  detail: string;
  documentation?: string;
  kind?: number;
}

const LANGUAGE_SUGGESTIONS: Record<string, SnippetSuggestion[]> = {
  javascript: [
    {
      label: "clg",
      insertText: "console.log(${1:value});",
      detail: "Console Log",
      documentation: "Log message to browser or Node console",
    },
    {
      label: "cerr",
      insertText: "console.error(${1:error});",
      detail: "Console Error",
      documentation: "Log error to console",
    },
    {
      label: "afn",
      insertText: "async function ${1:name}(${2:params}) {\n\t${3}\n}",
      detail: "Async Function",
      documentation: "Declare an asynchronous function",
    },
    {
      label: "arr",
      insertText: "const ${1:name} = (${2:params}) => {\n\t${3}\n};",
      detail: "Arrow Function",
      documentation: "Declare an ES6 arrow function",
    },
    {
      label: "prom",
      insertText: "new Promise((resolve, reject) => {\n\t${1}\n});",
      detail: "New Promise",
      documentation: "Create a new Promise object",
    },
    {
      label: "fetch",
      insertText: "fetch('${1:url}')\n\t.then(res => res.json())\n\t.then(data => {\n\t\t${2:console.log(data);}\n\t});",
      detail: "Fetch Request",
      documentation: "Perform HTTP fetch GET request",
    },
    {
      label: "trycatch",
      insertText: "try {\n\t${1}\n} catch (error) {\n\tconsole.error(error);\n}",
      detail: "Try Catch Block",
      documentation: "Handle exceptions with try-catch",
    },
    {
      label: "forof",
      insertText: "for (const ${1:item} of ${2:iterable}) {\n\t${3}\n}",
      detail: "For Of Loop",
      documentation: "Iterate over iterable objects",
    },
  ],

  typescript: [
    {
      label: "interface",
      insertText: "interface ${1:Name} {\n\t${2:key}: ${3:string};\n}",
      detail: "Interface Declaration",
      documentation: "Define a TypeScript interface",
    },
    {
      label: "type",
      insertText: "type ${1:Name} = ${2:string};",
      detail: "Type Alias",
      documentation: "Define a TypeScript type alias",
    },
    {
      label: "enum",
      insertText: "enum ${1:Name} {\n\t${2:Key} = '${3:Value}',\n}",
      detail: "Enum Declaration",
      documentation: "Define a TypeScript enum",
    },
    {
      label: "generic",
      insertText: "function ${1:name}<T>(${2:arg}: T): T {\n\treturn ${2:arg};\n}",
      detail: "Generic Function",
      documentation: "Define a generic TypeScript function",
    },
    {
      label: "clg",
      insertText: "console.log(${1:value});",
      detail: "Console Log",
      documentation: "Log message to console",
    },
    {
      label: "trycatch",
      insertText: "try {\n\t${1}\n} catch (error) {\n\tconsole.error(error);\n}",
      detail: "Try Catch Block",
      documentation: "Handle exceptions with try-catch",
    },
  ],

  python: [
    {
      label: "print",
      insertText: "print(${1:value})",
      detail: "Print Statement",
      documentation: "Print to standard output",
    },
    {
      label: "def",
      insertText: "def ${1:function_name}(${2:args}):\n\t\"\"\"${3:Docstring}\"\"\"\n\t${4:pass}",
      detail: "Function Definition",
      documentation: "Define a new Python function",
    },
    {
      label: "class",
      insertText: "class ${1:ClassName}:\n\tdef __init__(self, ${2:args}):\n\t\tself.${3:param} = ${2:args}",
      detail: "Class Definition",
      documentation: "Define a Python class",
    },
    {
      label: "ifmain",
      insertText: "if __name__ == '__main__':\n\t${1:main()}",
      detail: "Main Entry Point",
      documentation: "Python main script check",
    },
    {
      label: "forin",
      insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
      detail: "For Loop",
      documentation: "Iterate over a sequence",
    },
    {
      label: "tryexcept",
      insertText: "try:\n\t${1:pass}\nexcept Exception as e:\n\tprint(f'Error: {e}')",
      detail: "Try Except Block",
      documentation: "Catch exceptions in Python",
    },
    {
      label: "withopen",
      insertText: "with open('${1:filename}', '${2:r}') as ${3:f}:\n\t${4:content = f.read()}",
      detail: "With Open File",
      documentation: "Safely open file context",
    },
  ],

  java: [
    {
      label: "main",
      insertText: "public static void main(String[] args) {\n\t${1:System.out.println(\"Hello World!\");}\n}",
      detail: "Main Method",
      documentation: "Java entry point main method",
    },
    {
      label: "sout",
      insertText: "System.out.println(${1:msg});",
      detail: "Print to Console",
      documentation: "Print line to System.out",
    },
    {
      label: "class",
      insertText: "public class ${1:Main} {\n\tpublic static void main(String[] args) {\n\t\t${2}\n\t}\n}",
      detail: "Public Class",
      documentation: "Java public class structure",
    },
    {
      label: "fori",
      insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}",
      detail: "For Loop",
      documentation: "Standard indexed for loop",
    },
    {
      label: "trycatch",
      insertText: "try {\n\t${1}\n} catch (Exception e) {\n\te.printStackTrace();\n}",
      detail: "Try Catch Block",
      documentation: "Catch Java exceptions",
    },
    {
      label: "arraylist",
      insertText: "List<${1:String}> ${2:list} = new ArrayList<>();",
      detail: "ArrayList Declaration",
      documentation: "Create a new ArrayList",
    },
  ],

  go: [
    {
      label: "main",
      insertText: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"${1:Hello, World!}\")\n}",
      detail: "Main Package",
      documentation: "Go main entry point package",
    },
    {
      label: "pln",
      insertText: "fmt.Println(${1:msg})",
      detail: "Print Line",
      documentation: "Print formatted line using fmt",
    },
    {
      label: "func",
      insertText: "func ${1:name}(${2:params}) ${3:error} {\n\t${4}\n\treturn nil\n}",
      detail: "Function Declaration",
      documentation: "Define a Go function",
    },
    {
      label: "uferr",
      insertText: "if err != nil {\n\treturn ${1:err}\n}",
      detail: "Error Check",
      documentation: "Standard Go error check",
    },
    {
      label: "struct",
      insertText: "type ${1:Name} struct {\n\t${2:Field} ${3:string}\n}",
      detail: "Struct Declaration",
      documentation: "Define a Go struct",
    },
    {
      label: "forr",
      insertText: "for ${1:index}, ${2:val} := range ${3:slice} {\n\t${4}\n}",
      detail: "Range Loop",
      documentation: "Iterate with range in Go",
    },
  ],

  rust: [
    {
      label: "main",
      insertText: "fn main() {\n\tprintln!(\"${1:Hello, World!}\");\n}",
      detail: "Main Function",
      documentation: "Rust main entry point",
    },
    {
      label: "pln",
      insertText: "println!(\"${1:{}}\", ${2:val});",
      detail: "Println Macro",
      documentation: "Print with format macro",
    },
    {
      label: "fn",
      insertText: "fn ${1:name}(${2:args}) -> ${3:Result<(), Box<dyn std::error::Error>>} {\n\t${4:Ok(())}\n}",
      detail: "Function Declaration",
      documentation: "Define a Rust function",
    },
    {
      label: "struct",
      insertText: "struct ${1:Name} {\n\t${2:field}: ${3:String},\n}",
      detail: "Struct Declaration",
      documentation: "Define a Rust struct",
    },
    {
      label: "match",
      insertText: "match ${1:val} {\n\t${2:Some(v)} => ${3:v},\n\t${4:None} => ${5:panic!()},\n}",
      detail: "Match Statement",
      documentation: "Pattern matching expression",
    },
    {
      label: "impl",
      insertText: "impl ${1:Name} {\n\tpub fn new() -> Self {\n\t\tSelf {}\n\t}\n}",
      detail: "Impl Block",
      documentation: "Implement methods for struct/enum",
    },
  ],

  cpp: [
    {
      label: "main",
      insertText: "#include <iostream>\n\nusing namespace std;\n\nint main() {\n\tcout << \"${1:Hello World}\" << endl;\n\treturn 0;\n}",
      detail: "Main Function",
      documentation: "C++ main program template",
    },
    {
      label: "cout",
      insertText: "std::cout << ${1:msg} << std::endl;",
      detail: "Print to Output",
      documentation: "C++ standard output stream",
    },
    {
      label: "vector",
      insertText: "std::vector<${1:int}> ${2:vec};",
      detail: "Vector Container",
      documentation: "Standard template vector",
    },
    {
      label: "fori",
      insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n\t${3}\n}",
      detail: "For Loop",
      documentation: "Standard C++ for loop",
    },
    {
      label: "class",
      insertText: "class ${1:ClassName} {\npublic:\n\t${1:ClassName}();\n\t~${1:ClassName}();\nprivate:\n\t${2}\n};",
      detail: "Class Definition",
      documentation: "C++ class template",
    },
  ],

  csharp: [
    {
      label: "main",
      insertText: "using System;\n\nnamespace ${1:Program}\n{\n\tclass Program\n\t{\n\t\tstatic void Main(string[] args)\n\t\t{\n\t\t\tConsole.WriteLine(\"${2:Hello World!}\");\n\t\t}\n\t}\n}",
      detail: "Main Program",
      documentation: "C# Main entry point template",
    },
    {
      label: "cw",
      insertText: "Console.WriteLine(${1:msg});",
      detail: "Console WriteLine",
      documentation: "Print line to C# Console",
    },
    {
      label: "prop",
      insertText: "public ${1:string} ${2:Name} { get; set; }",
      detail: "Auto Property",
      documentation: "Declare getter/setter property",
    },
    {
      label: "foreach",
      insertText: "foreach (var ${1:item} in ${2:collection})\n{\n\t${3}\n}",
      detail: "Foreach Loop",
      documentation: "Iterate collection in C#",
    },
  ],

  ruby: [
    {
      label: "puts",
      insertText: "puts \"${1:Hello World}\"",
      detail: "Print Output",
      documentation: "Ruby puts statement",
    },
    {
      label: "def",
      insertText: "def ${1:method_name}(${2:args})\n\t${3}\nend",
      detail: "Method Definition",
      documentation: "Define a Ruby method",
    },
    {
      label: "class",
      insertText: "class ${1:ClassName}\n\tdef initialize(${2:args})\n\t\t@${3:param} = ${2:args}\n\tend\nend",
      detail: "Class Definition",
      documentation: "Define a Ruby class with initialize",
    },
    {
      label: "each",
      insertText: "${1:collection}.each do |${2:item}|\n\t${3}\nend",
      detail: "Each Block",
      documentation: "Iterate over collection with each",
    },
  ],

  swift: [
    {
      label: "print",
      insertText: "print(\"${1:Hello World}\")",
      detail: "Print Statement",
      documentation: "Print to Swift console",
    },
    {
      label: "func",
      insertText: "func ${1:name}(${2:param}: ${3:String}) -> ${4:Void} {\n\t${5}\n}",
      detail: "Function Declaration",
      documentation: "Define a Swift function",
    },
    {
      label: "struct",
      insertText: "struct ${1:Name} {\n\tvar ${2:prop}: ${3:String}\n}",
      detail: "Struct Definition",
      documentation: "Define a Swift struct",
    },
    {
      label: "iflet",
      insertText: "if let ${1:unwrapped} = ${2:optional} {\n\t${3}\n}",
      detail: "If Let Unwrapping",
      documentation: "Safely unwrap Swift optional",
    },
    {
      label: "guard",
      insertText: "guard let ${1:unwrapped} = ${2:optional} else {\n\treturn ${3}\n}",
      detail: "Guard Statement",
      documentation: "Early exit guard in Swift",
    },
  ],
};

export function registerMonacoLanguageCompletions(monaco: Monaco) {
  if (!monaco || !monaco.languages) return;

  const languages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "go",
    "rust",
    "cpp",
    "csharp",
    "ruby",
    "swift",
  ];

  languages.forEach((lang) => {
    if (registeredLanguages.has(lang)) return;
    registeredLanguages.add(lang);

    const suggestions = LANGUAGE_SUGGESTIONS[lang] || [];

    // Register Autocomplete/Snippet Completion Provider
    monaco.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        return {
          suggestions: suggestions.map((item) => ({
            label: item.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: item.insertText,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: item.detail,
            documentation: item.documentation,
            range,
          })),
        };
      },
    });

    // Register Ghost-Text Inline Suggestions Provider
    monaco.languages.registerInlineCompletionsProvider(lang, {
      provideInlineCompletions: (model: any, position: any) => {
        const lineContent = model.getLineContent(position.lineNumber);
        const prefix = lineContent.substring(0, position.column - 1).trim();

        if (!prefix) return { items: [] };

        const matched = suggestions.filter((s) =>
          s.label.toLowerCase().startsWith(prefix.toLowerCase())
        );

        return {
          items: matched.map((item) => {
            // Clean up snippet placeholder syntax (e.g. ${1:val} -> val) for inline ghost text preview
            const cleanText = item.insertText.replace(/\$\{\d+:?([^}]*)\}/g, "$1");
            return {
              insertText: cleanText,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: position.column + cleanText.length,
              },
            };
          }),
        };
      },
      freeInlineCompletions: () => {},
    });
  });
}
