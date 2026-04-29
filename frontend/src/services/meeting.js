import fetchClient from "@/lib/fetchClient";

export const getMeetings = async () => {
    return await fetchClient('/meetings');
}

export const getMeetingById = async (id) => {
    return await fetchClient(`/meetings/${id}`);
}

export const createMeeting = async (body) => {
    return await fetchClient('/meetings', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export const updateMeeting = async (id, body) => {
    return await fetchClient(`/meetings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

export const deleteMeeting = async (id) => {
    return await fetchClient(`/meetings/${id}`, {
        method: 'DELETE',
    });
}

export const addParticipant = async (meeting_id, user_id) => {
    return await fetchClient(`/meetings/${meeting_id}/participants`, {
        method: 'POST',
        body: JSON.stringify({ user_id }),
    });
}

export const removeParticipant = async (meeting_id, user_id) => {
    return await fetchClient(`/meetings/${meeting_id}/participants/${user_id}`, {
        method: 'DELETE',
    });
}

export const updateParticipantRole = async (meeting_id, user_id, role) => {
    return await fetchClient(`/meetings/${meeting_id}/participants/${user_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
    });
}