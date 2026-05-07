const marked = require('marked');

const invitationTemplate = ({ recipientName, meetingTitle, scheduledAt, endTime, location, hostName }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const timeRange = endTime
    ? `${formatTime(scheduledAt)} – ${formatTime(endTime)}`
    : formatTime(scheduledAt)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width:560px;margin:40px auto;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">

    <!-- Header & Brand -->
    <div style="padding:32px 40px 0 40px;">
      <p style="margin:0;color:#6366f1;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">
        Probesco Meeting Management
      </p>
      <h1 style="margin:8px 0 0;color:#0f172a;font-size:22px;font-weight:700;letter-spacing:-0.02em;">
        Undangan Pertemuan Baru
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:24px 40px 32px 40px;">
      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
        Halo <strong>${recipientName}</strong>, Anda telah diundang untuk menghadiri pertemuan dengan detail sebagai berikut:
      </p>

      <!-- Meeting Card -->
      <div style="background-color:#f1f5f9;border-radius:10px;padding:24px;">
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:17px;font-weight:600;line-height:1.4;">
          ${meetingTitle}
        </h2>
        
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;width:32px;vertical-align:top;">📅</td>
            <td style="padding:8px 0 8px 8px;">
              <div style="color:#64748b;font-size:12px;text-transform:uppercase;font-weight:600;">Tanggal</div>
              <div style="color:#1e293b;font-size:14px;font-weight:500;">${formatDate(scheduledAt)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;width:32px;vertical-align:top;">⏰</td>
            <td style="padding:8px 0 8px 8px;">
              <div style="color:#64748b;font-size:12px;text-transform:uppercase;font-weight:600;">Waktu</div>
              <div style="color:#1e293b;font-size:14px;font-weight:500;">${timeRange}</div>
            </td>
          </tr>
          ${location ? `
          <tr>
            <td style="padding:8px 0;width:32px;vertical-align:top;">📍</td>
            <td style="padding:8px 0 8px 8px;">
              <div style="color:#64748b;font-size:12px;text-transform:uppercase;font-weight:600;">Lokasi</div>
              <div style="color:#1e293b;font-size:14px;font-weight:500;">${location}</div>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:8px 0;width:32px;vertical-align:top;">👤</td>
            <td style="padding:8px 0 8px 8px;">
              <div style="color:#64748b;font-size:12px;text-transform:uppercase;font-weight:600;">Host</div>
              <div style="color:#1e293b;font-size:14px;font-weight:500;">${hostName}</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">
        Silakan buka aplikasi Meeting Management untuk melihat detail selengkapnya.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;background-color:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5;">
        Ini adalah pesan otomatis dari <strong>Probesco Meeting Management</strong>.<br>
        Harap tidak membalas email ini secara langsung.
      </p>
    </div>
  </div>
</body>
</html>`
}

const meetingSummaryTemplate = ({
  recipientName,
  meetingTitle,
  scheduledAt,
  location,
  aiSummary,
  noteText,
  myActionItems = [],
}) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

  const formatDueDate = (date) =>
    date ? new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    }) : 'Tidak ada deadline'

  // Konversi markdown sederhana ke HTML untuk AI summary
  const markdownToHtml = (text) => {
    if (!text) return '';
    
    let html = text
      .replace(/^### (.*$)/gm, '<h3 style="margin:16px 0 8px;color:#0f172a;font-size:16px;font-weight:600;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="margin:18px 0 10px;color:#0f172a;font-size:17px;font-weight:600;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f172a;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^[•*-] (.*$)/gm, '<li style="margin:6px 0;margin-left:20px;">$1</li>');

    // Membungkus <li> yang berurutan ke dalam <ul>
    html = html.replace(/(<li.*<\/li>)/gs, '<ul style="padding:0;margin:12px 0;">$1</ul>');
    
    return html.replace(/\n/g, '<br>');
  };

  // Bagian pengolahan Action Items (ActionItemsHtml)
const actionItemsHtml = myActionItems && myActionItems.length > 0 ? `
<div style="margin-top:32px;">
  <h3 style="margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:600;display:flex;align-items:center;">
    Tindakan Lanjut (Action Items)
  </h3>
  <div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    ${myActionItems.map((item, index) => `
      <div style="padding:16px;background-color:#ffffff;border-bottom:${index === myActionItems.length - 1 ? 'none' : '1px solid #f1f5f9'};">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:24px;vertical-align:top;padding-top:2px;">
              <div style="width:16px;height:16px;border:2px solid #10b981;border-radius:4px;"></div>
            </td>
            <td style="padding-left:12px;">
              <p style="margin:0;color:#1e293b;font-size:14px;font-weight:500;line-height:1.5;">${item.description}</p>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">
                Tenggat: <span style="color:#64748b;font-weight:500;">${formatDueDate(item.due_date)}</span>
              </p>
            </td>
          </tr>
        </table>
      </div>
    `).join('')}
  </div>
</div>` : '';

// Template Utama
return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Styling untuk hasil marked.parse */
    .ai-content table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 16px 0; 
      font-size: 13px;
    }
    .ai-content th, .ai-content td { 
      border: 1px solid #e2e8f0; 
      padding: 10px; 
      text-align: left; 
    }
    .ai-content th { 
      background-color: #f8fafc; 
      color: #0f172a; 
      font-weight: 600; 
    }
    .ai-content ul, .ai-content ol { 
      padding-left: 20px; 
      margin: 12px 0;
    }
    .ai-content li { 
      margin-bottom: 6px; 
    }
    .ai-content h3 { 
      font-size: 16px; 
      margin-top: 20px; 
      color: #0f172a; 
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter', -apple-system, sans-serif;">
  <div style="max-width:600px;margin:40px auto;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">

    <!-- Header -->
    <div style="background-color:#0f172a;padding:32px 40px;">
      <p style="margin:0 0 8px;color:#6366f1;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">
        Ringkasan Selesai
      </p>
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;line-height:1.3;">
        ${meetingTitle}
      </h1>
      <p style="margin:12px 0 0;color:#94a3b8;font-size:13px;display:flex;align-items:center;">
        ${formatDate(scheduledAt)} ${location ? ` • ${location}` : ''}
      </p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.6;">
        Halo <strong>${recipientName}</strong>, berikut adalah laporan rangkuman dari pertemuan yang telah dilaksanakan.
      </p>

      <!-- AI Summary -->
      ${aiSummary ? `
      <div style="margin-bottom:32px;">
        <h3 style="margin:0 0 12px;color:#0f172a;font-size:15px;font-weight:600;">
          ✨ AI Ringkasan Intisari
        </h3>
        <div class="ai-content" style="color:#334155;font-size:14px;line-height:1.8;">
          ${marked.parse(aiSummary)}
        </div>
      </div>` : ''}

      <!-- Notulen -->
      ${noteText ? `
      <div style="margin-bottom:32px;">
        <h3 style="margin:0 0 12px;color:#0f172a;font-size:15px;font-weight:600;">
          📝 Catatan Diskusi
        </h3>
        <div style="background-color:#ffffff;border:1px solid #f1f5f9;border-radius:10px;padding:16px;color:#64748b;font-size:14px;line-height:1.7;white-space:pre-wrap;font-style:italic;">
          ${noteText}
        </div>
      </div>` : ''}

      <!-- Action Items -->
      ${actionItemsHtml}

      <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">
        Buka aplikasi untuk melihat detail selengkapnya.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:24px 40px;background-color:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">
        Email dikirim secara otomatis oleh <strong>Probesco Meeting Management</strong>.
      </p>
    </div>
  </div>
</body>
</html>
`
}

module.exports = { invitationTemplate, meetingSummaryTemplate }