const actionItemsRepo = require('../repositories/actionItemRepository')
const meetingRepo = require('../repositories/meetingRepository')

const VALID_STATUS = ['open', 'done', 'carried_over']

const assertMeetingAccess = async (meeting_id, user_id) => {

    const meeting = await meetingRepo.getMeetingById(meeting_id)

    if (!meeting) throw new Error('MEETING_NOT_FOUND')

    const participant = await meetingRepo.isParticipant(meeting_id, user_id)

    if (!participant) throw new Error('ACCESS_FORBIDDEN')

    return meeting
}

const assertActionItemInMeeting = async (meeting_id, item_id) => {

    const item = await actionItemsRepo.getActionItemById(item_id)

    if (!item || item.meeting_id !== meeting_id) throw new Error('ACTION_ITEM_NOT_FOUND')

    return item
}

const validateDueDate = (due_date) => {

    if (due_date === undefined) return

    if (due_date === null) return

    const isValidDate = !isNaN(new Date(due_date).getTime())

    if (!isValidDate) throw new Error('INVALID_DATE_FORMAT')

    if (new Date(due_date) < new Date().setHours(0, 0, 0, 0)) throw new Error('DUE_DATE_IN_THE_PAST')

}

const validateAssigneeIsParticipant = async (meeting_id, assigned_to) => {

    if (assigned_to === undefined || assigned_to === null) return

    const assigneeIsParticipant = await meetingRepo.isParticipant(meeting_id, assigned_to)

    if (!assigneeIsParticipant) throw new Error('ASSIGNEE_MUST_BE_PARTICIPANT')
}

const buildHostSecretaryPatch = async (meeting_id, body) => {

    const patch = {}

    if (body.description !== undefined) {
        if (!body.description || !String(body.description).trim()) {
            throw new Error('DESCRIPTION_REQUIRED')
        }
        patch.description = String(body.description).trim()
    }

    if (body.assigned_to !== undefined) {
        await validateAssigneeIsParticipant(meeting_id, body.assigned_to)
        patch.assigned_to = body.assigned_to
    }

    if (body.due_date !== undefined) {
        validateDueDate(body.due_date)
        patch.due_date = body.due_date
    }

    if (body.status !== undefined) {
        if (!VALID_STATUS.includes(body.status)) throw new Error('INVALID_ACTION_ITEM_STATUS')
        patch.status = body.status
    }
    return patch
}

const createActionItem = async ({ meeting_id, description, assigned_to, due_date }, user_id) => {

    if (due_date) {
        validateDueDate(due_date)
    }

    await assertMeetingAccess(meeting_id, user_id)

    const role = await meetingRepo.getUserRole(meeting_id, user_id)

    if (!['host', 'secretary'].includes(role)) {
        throw new Error('ONLY_HOST_SECRETARY_CAN_CREATE_ACTION_ITEM')
    }

    await validateAssigneeIsParticipant(meeting_id, assigned_to)

    return await actionItemsRepo.createActionItem({ meeting_id, description, assigned_to, due_date })

}

const getActionItems = async (meeting_id, user_id, status = null) => {

    await assertMeetingAccess(meeting_id, user_id)

    if (status && !VALID_STATUS.includes(status)) throw new Error('INVALID_STATUS_FILTER')

    return await actionItemsRepo.getActionItemsByMeetingId(meeting_id, status)
}

const updateActionItem = async (meeting_id, item_id, body, user_id) => {

    await assertMeetingAccess(meeting_id, user_id)

    const item = await assertActionItemInMeeting(meeting_id, item_id)

    const role = await meetingRepo.getUserRole(meeting_id, user_id)

    const isHostOrSecretary = ['host', 'secretary'].includes(role)

    const isAssignee = item.assigned_to === user_id

    if (isHostOrSecretary) {
        const patch = await buildHostSecretaryPatch(meeting_id, body)

        if (Object.keys(patch).length === 0) return item

        return await actionItemsRepo.updateActionItem(item_id, patch)
    }

    if (isAssignee) {
        const restrictedFields = ['description', 'assigned_to', 'due_date']

        const hasRestrictedField = restrictedFields.some((f) => body[f] !== undefined)

        if (hasRestrictedField) throw new Error('ASSIGNEE_CANNOT_EDIT_ACTION_ITEM_FIELDS')

        if (body.status !== 'done') throw new Error('ASSIGNEE_CAN_ONLY_MARK_DONE')

        if (item.status === 'carried_over') throw new Error('ACTION_ITEM_CANNOT_BE_UPDATED')

        return await actionItemsRepo.updateActionItem(item_id, { status: 'done' })
    }

    throw new Error('ONLY_HOST_SECRETARY_OR_ASSIGNEE_CAN_UPDATE')
}

const deleteActionItem = async (meeting_id, item_id, user_id) => {
    await assertMeetingAccess(meeting_id, user_id)

    const role = await meetingRepo.getUserRole(meeting_id, user_id)

    if (!['host', 'secretary'].includes(role)) {
        throw new Error('ONLY_HOST_SECRETARY_CAN_DELETE_ACTION_ITEM')
    }
    await assertActionItemInMeeting(meeting_id, item_id)

    await actionItemsRepo.deleteActionItem(item_id)

}

module.exports = { createActionItem, getActionItems, updateActionItem, deleteActionItem }