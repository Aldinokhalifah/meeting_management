import fetchClient from "@/lib/fetchClient";

export const getNote = async (meeting_id) => {
    return await fetchClient(`/meetings/${meeting_id}/notes`);
}

export const createNote = async (meeting_id, content) => {
    return await fetchClient(`/meetings/${meeting_id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
}

export const updateNote = async (meeting_id, content) => {
    return await fetchClient(`/meetings/${meeting_id}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
    });
}