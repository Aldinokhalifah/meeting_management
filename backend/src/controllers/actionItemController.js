const actionItemsService = require('../services/actionItemService')

const createActionItem = async (req, res, next) => {
    try {
        const { description, assigned_to, due_date } = req.body;
        if (!description) return res.status(400).json({ message: 'Description wajib diisi' });

        const item = await actionItemsService.createActionItem(
            { meeting_id: req.params.id, description, assigned_to, due_date },
            req.user.id
        );
        res.status(201).json({ message: 'Action item berhasil dibuat', data: item });
    } catch (err) {
        next(err);
    }
}

const getActionItems = async (req, res, next) => {
    try {
        const { status } = req.query;
        const items = await actionItemsService.getActionItems(req.params.id, req.user.id, status || null);
        res.json({ message: 'Berhasil mengambil action items', data: items });
    } catch (err) {
        next(err);
    }
}

const updateActionItem = async (req, res, next) => {
    try {
        const item = await actionItemsService.updateActionItem(
            req.params.id,
            req.params.itemId,
            req.body,
            req.user.id
        );
        res.status(200).json({ message: 'Action item berhasil diupdate', data: item });
    } catch (err) {
        next(err);
    }
}

const deleteActionItem = async (req, res, next) => {
    try {
        await actionItemsService.deleteActionItem(req.params.id, req.params.itemId, req.user.id);
        res.json({ message: 'Action item berhasil dihapus' });
    } catch (err) {
        next(err);
    }
}

module.exports = { createActionItem, getActionItems, updateActionItem, deleteActionItem };