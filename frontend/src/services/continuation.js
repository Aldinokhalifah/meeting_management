import fetchClient from "@/lib/fetchClient";

export const createContinuation = async (meeting_id, body) => {
    return await fetchClient(`/meetings/${meeting_id}/continue`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export const getPreviousMeeting = async (meeting_id, previous_meeting_id) => {
    return await fetchClient(`/meetings/${previous_meeting_id}/continue/${meeting_id}/previous`);
}