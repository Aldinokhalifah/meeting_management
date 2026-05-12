const MAX_NOTE_CHARS = 3500

const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

const formatTime = (date) =>
    new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

const invitationMessage = ({ recipientName, meetingTitle, scheduledAt, endTime, location, hostName }) => {
    const timeRange = endTime
        ? `${formatTime(scheduledAt)} – ${formatTime(endTime)}`
        : formatTime(scheduledAt)

    const lines = [
        `Halo ${recipientName},`,
        '',
        `Anda diundang ke pertemuan: *${meetingTitle}*`,
        `📅 ${formatDate(scheduledAt)}`,
        `⏰ ${timeRange}`,
    ]
    if (location) lines.push(`📍 ${location}`)
    lines.push(`👤 Host: ${hostName}`)
    lines.push('', 'Sampai jumpa di meeting.')
    return lines.join('\n')
}

const meetingSummaryMessage = ({
    recipientName,
    meetingTitle,
    scheduledAt,
    location,
    aiSummary,
    noteText,
    myActionItems,
}) => {
    const lines = [
        `Halo ${recipientName},`,
        '',
        `Pertemuan *${meetingTitle}* telah selesai.`,
        `📅 ${formatDate(scheduledAt)}`,
    ]
    if (location) lines.push(`📍 ${location}`)
    lines.push('')

    if (aiSummary) {
        lines.push('*Ringkasan AI:*')
        lines.push(aiSummary.trim())
        lines.push('')
    }

    if (noteText) {
        const trimmed = noteText.trim()
        const body =
            trimmed.length > MAX_NOTE_CHARS
                ? `${trimmed.slice(0, MAX_NOTE_CHARS)}…\n_(notulen dipotong; lihat lengkap di aplikasi)_`
                : trimmed
        lines.push('*Notulen:*')
        lines.push(body)
        lines.push('')
    }

    if (myActionItems && myActionItems.length > 0) {
        lines.push('*Action items untuk Anda:*')
        myActionItems.forEach((item, i) => {
            lines.push(`${i + 1}. ${item.description}`)
        })
    } else {
        lines.push('Tidak ada action item terbuka yang ditugaskan kepada Anda.')
    }

    lines.push('', '— Meeting Management')
    return lines.join('\n')
}

module.exports = { invitationMessage, meetingSummaryMessage }
