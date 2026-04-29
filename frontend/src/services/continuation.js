import fetchClient from "@/lib/fetchClient";

export const createContinuation = async (meeting_id, body) => {
    return await fetchClient(`/meetings/${meeting_id}/continue`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export const getPreviousMeeting = async (meeting_id) => {
    return await fetchClient(`/meetings/${meeting_id}/continue/previous`);
}