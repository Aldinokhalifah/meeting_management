'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useNote, useCreateNote, useUpdateNote } from '@/hooks/useNotes'
import { Bold, Italic, List, ListOrdered, Heading2, Save } from 'lucide-react'

const ToolbarBtn = ({ onClick, active, children, title }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        className={`p-1.5 rounded transition ${
        active ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-100'
        }`}
    >
        {children}
    </button>
    )

export default function NotesSection({ meetingId, canEdit }) {
    const { data: note, isLoading, isFetching } = useNote(meetingId)
    const { mutate: createNote, isPending: creating } = useCreateNote()
    const { mutate: updateNote, isPending: updating } = useUpdateNote()
    const [isDirty, setIsDirty] = useState(false)
    const [hasLoadedNote, setHasLoadedNote] = useState(false)

    const editor = useEditor({
        extensions: [StarterKit],
        editable: canEdit,
        immediatelyRender: false,
        onUpdate: () => setIsDirty(true),
        editorProps: {
        attributes: {
            class: 'prose prose-sm max-w-full break-words whitespace-pre-wrap focus:outline-none min-h-[200px] max-h-[300px] overflow-y-auto text-gray-800',
        },
        },
    })

    useEffect(() => {
        if (!editor || !note || isDirty) return

        const content = note.content || ''
        editor.commands.setContent(content)
        setIsDirty(false)
        setHasLoadedNote(true)
    }, [editor, note?.content, isDirty])

    const handleSave = () => {
        if (!editor) return
        const content = editor.getJSON()
        if (note) {
        updateNote(
            { meeting_id: meetingId, content },
            { onSuccess: () => { setIsDirty(false) } }
        )
        } else {
        createNote(
            { meeting_id: meetingId, content },
            { onSuccess: () => { setIsDirty(false) } }
        )
        }
    }

    // ← Hanya show skeleton saat pertama kali load (bukan saat refetch)
    if (isLoading && !hasLoadedNote) return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse h-48" />
    )

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 ">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Notulen</p>
                {/* Indikator refetch yang tidak ganggu editor */}
                {isFetching && !isDirty && (
                    <span className="text-xs text-gray-300">menyinkronkan...</span>
                )}
                </div>
                {canEdit && (
                <button
                    onClick={handleSave}
                    disabled={!isDirty || creating || updating}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    <Save size={12} />
                    {creating || updating ? 'Menyimpan...' : 'Simpan'}
                </button>
                )}
            </div>

            {canEdit && editor && (
                <div className="flex items-center gap-0.5 p-1.5 mb-2 border border-gray-100 rounded-lg bg-gray-50">
                <ToolbarBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
                    <Bold size={14} />
                </ToolbarBtn>
                <ToolbarBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
                    <Italic size={14} />
                </ToolbarBtn>
                <ToolbarBtn title="Heading" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
                    <Heading2 size={14} />
                </ToolbarBtn>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <ToolbarBtn title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
                    <List size={14} />
                </ToolbarBtn>
                <ToolbarBtn title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
                    <ListOrdered size={14} />
                </ToolbarBtn>
                </div>
            )}

            <div className={`${canEdit ? 'border border-gray-100 rounded-lg p-3 overflow-x-auto' : 'overflow-x-auto'}`}>
                {!canEdit && !note ? (
                <p className="text-sm text-gray-400 py-4 text-center">Belum ada notulen</p>
                ) : (
                <EditorContent editor={editor} />
                )}
            </div>
        </div>
    )
}