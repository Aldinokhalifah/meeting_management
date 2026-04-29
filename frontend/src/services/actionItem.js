import fetchClient from "@/lib/fetchClient";

export const getActionItems = async (meeting_id, status = null) => {
    const query = status ? `?status=${status}` : '';
    return await fetchClient(`/meetings/${meeting_id}/action-items${query}`);
}

export const createActionItem = async (meeting_id, body) => {
    return await fetchClient(`/meetings/${meeting_id}/action-items`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export const updateActionItem = async (meeting_id, item_id, body) => {
    return await fetchClient(`/meetings/${meeting_id}/action-items/${item_id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

export const deleteActionItem = async (meeting_id, item_id) => {
    return await fetchClient(`/meetings/${meeting_id}/action-items/${item_id}`, {
        method: 'DELETE',
    });
}