import MenuItem from '../models/MenuItem.js';

export const getMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Error fetching menu items" });
    }
};

export const addMenuItem = async (req, res) => {
    try {
        const newItem = await MenuItem.create(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Error adding menu item" });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: "Error updating menu item" });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        await MenuItem.findByIdAndDelete(id);
        res.status(200).json({ message: "Menu item deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting menu item" });
    }
};
