import './editor.css'

import { Editor, Extension } from "@tiptap/core"
import { EditorProvider, FloatingMenu, BubbleMenu, useEditor, EditorContent } from "@tiptap/react"
import { Plugin } from "@tiptap/pm/state"
import StarterKit from "@tiptap/starter-kit"
import { SetStateAction, useState } from 'react'
import { Node } from '@tiptap/pm/model'
import { Decoration, DecorationSet } from '@tiptap/pm/view'


function debounce<T extends (...args: any[]) => any>(delay: number): (func: T, ...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function(func: T, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const HighlightedLocations = Extension.create({
  name: 'highlightedLocations',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc }) => {
            const decorations = [];
            const regex = /@([^@]+)@/g;

            doc.descendants((node, pos) => {
              if (node.isText) {
                let match;
                while ((match = regex.exec(node.text)) !== null) {
                  const start = pos + match.index;
                  const end = start + match[0].length;

                  decorations.push(
                    Decoration.inline(start, end, {
                      class: 'highlight', // CSS class for highlighting
                    })
                  );
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});


const extensions = [StarterKit, HighlightedLocations]

const initialContent = `
{"type":"doc","content":[
  {"type":"paragraph","content":[{"type":"text","text":"Hello Traveller!"}]},
  {"type":"paragraph","content":[{"type":"text","text":"Use 'at' symbols surrounding a location to set a marker, e.g., @London@, and tildes surrounding a set of markers to specify an route, e.g., one day of your trip!"}]}
]}
`
type Props = {
  onTextChange: (text: string) => void;
};

const debouncer = debounce(2000);

function Tiptap({ onTextChange }: Props) {

  const editor = useEditor({
    extensions: extensions,
    content: JSON.parse(window.localStorage.getItem('editor-content') || initialContent),
    onUpdate: ({ editor }) => {
      debouncer(
        (editor) => {
          const jsonContent = JSON.stringify(editor.getJSON());
          console.log(jsonContent);
          window.localStorage.setItem('editor-content', jsonContent)
          const text = editor.getText();
          console.log(text);
          onTextChange(text);
        },
        editor,
      );
    },
    onCreate: ({ editor }) => {
      const text = editor.getText();
      console.log("OnCreate", text);
      onTextChange(text);
    },
  })
  return (
    <>
      <EditorContent editor={editor} />
    </>
  )
}

export default Tiptap
