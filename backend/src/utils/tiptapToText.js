const tiptapToText = (content) => {
    if (!content) return ''

    const parseNode = (node) => {
        if (!node) return ''

        switch (node.type) {
        case 'text':
                return node.text || ''
        case 'paragraph':
                return (node.content?.map(parseNode).join('') ?? '') + '\n'
        case 'heading': {
                const level = node.attrs?.level ?? 2
                const prefix = '#'.repeat(level) + ' '
                return prefix + (node.content?.map(parseNode).join('') ?? '') + '\n'
        }
        case 'bulletList':
            return (node.content?.map(parseNode).join('') ?? '') + '\n'
        case 'orderedList':
            return (node.content?.map(parseNode).join('') ?? '') + '\n'
        case 'listItem':
            return '• ' + (node.content?.map(parseNode).join('') ?? '') + '\n'
        case 'bold':
        case 'italic':
            return node.content?.map(parseNode).join('') ?? ''
        case 'hardBreak':
            return '\n'
        case 'doc':
            return node.content?.map(parseNode).join('') ?? ''
        default:
            return node.content?.map(parseNode).join('') ?? ''
        }
    }
    return parseNode(content).trim()
}

module.exports = tiptapToText;