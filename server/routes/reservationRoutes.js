import express from 'express';
import {
    createReservationWithItems,
    getReservationItems,
    addItemToReservation,
    updateReservationItem,
    deleteReservationItem
} from '../controllers/reservationItemsController.js';
import { getReservations, updateReservationStatus } from '../controllers/reservationController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: create reservation (with optional pre-order items)
router.post('/', createReservationWithItems);

// Admin-only: list all reservations
router.get('/', auth, getReservations);

// Admin: update reservation status (Confirmed / Cancelled / Pending)
router.patch('/:id', auth, updateReservationStatus);

// Pre-order items sub-resource
router.get('/:id/items', auth, getReservationItems);
router.post('/:id/items', addItemToReservation);
router.patch('/:id/items/:itemId', updateReservationItem);
router.delete('/:id/items/:itemId', deleteReservationItem);

export default router;
