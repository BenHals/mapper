import './editor.css'

import { Editor, Extension } from "@tiptap/core"
import { EditorProvider, FloatingMenu, BubbleMenu, useEditor, EditorContent } from "@tiptap/react"
import { Plugin } from "@tiptap/pm/state"
import StarterKit from "@tiptap/starter-kit"
import { SetStateAction, useState } from 'react'
import { Node } from '@tiptap/pm/model'
import { Decoration, DecorationSet } from '@tiptap/pm/view'



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

const content = '<p>Hello World!</p>'

type Props = {
  onTextChange: (text: string) => void;
};

function Tiptap({ onTextChange }: Props) {

  const editor = useEditor({
    extensions: extensions,
    content: content,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      console.log(text);
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
