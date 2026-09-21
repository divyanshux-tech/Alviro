import express from 'express';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMenuItems);
router.post('/', auth, addMenuItem);
router.patch('/:id', auth, updateMenuItem);
router.delete('/:id', auth, deleteMenuItem);

export default router;
