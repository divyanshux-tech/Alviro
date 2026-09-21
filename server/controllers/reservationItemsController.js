import Reservation from '../models/Reservation.js';
import ReservationItem from '../models/ReservationItem.js';
import MenuItem from '../models/MenuItem.js';
import UserDetail from '../models/UserDetail.js';
import { sendReservationPendingEmail } from '../utils/emailService.js';

// Helper to upsert guest details in user_details collection
const _upsertGuestUserDetail = async ({ name, email, phone }) => {
    try {
        const cleanEmail = email?.trim().toLowerCase();
        const cleanPhone = phone?.trim();

        if (!cleanEmail && !cleanPhone) return;

        let query = null;
        if (cleanEmail && cleanPhone) {
            query = { $or: [{ email: cleanEmail }, { phone: cleanPhone }] };
        } else if (cleanEmail) {
            query = { email: cleanEmail };
        } else if (cleanPhone) {
            query = { phone: cleanPhone };
        }

        const existing = await UserDetail.findOne(query);

        if (existing) {
            if (name && name !== 'Valued Guest') existing.name = name;
            if (cleanEmail) existing.email = cleanEmail;
            if (cleanPhone) existing.phone = cleanPhone;
            existing.totalBookings += 1;
            existing.lastBookingDate = new Date();
            await existing.save();
            console.log('[UserDetail] Guest profile updated:', existing.email || existing.phone);
            return existing;
        }

        const newGuest = await UserDetail.create({
            name: name || 'Valued Guest',
            email: cleanEmail || '',
            phone: cleanPhone || '',
            totalBookings: 1,
            lastBookingDate: new Date()
        });
        console.log('[UserDetail] New guest profile created:', newGuest.email || newGuest.phone);
        return newGuest;
    } catch (err) {
        console.error('[UserDetail] Upsert Error:', err);
    }
};

// Configurable cutoff in hours before reservation time — modify here to change policy
const PRE_ORDER_CUTOFF_HOURS = 2;

/**
 * Checks if the pre-order modification window is still open for a reservation.
 */
const _isCutoffPassed = (reservationDate, reservationTime) => {
    try {
        const dateStr = typeof reservationDate === 'string' ? reservationDate : new Date(reservationDate).toISOString().split('T')[0];
        const combined = new Date(`${dateStr} ${reservationTime}`);
        if (isNaN(combined.getTime())) return false;
        const cutoff = new Date(combined.getTime() - PRE_ORDER_CUTOFF_HOURS * 60 * 60 * 1000);
        return new Date() > cutoff;
    } catch {
        return false;
    }
};

/**
 * POST /api/reservations
 * Creates a reservation + associated pre-order items atomically.
 * If item creation fails, the reservation is rolled back.
 */
export const createReservationWithItems = async (req, res) => {
    const { name, email, phone, date, time, guests, specialRequest, status, preOrderItems } = req.body;

    let newReservation = null;
    try {
        const hasPreOrder = Array.isArray(preOrderItems) && preOrderItems.length > 0;

        // Step 1: Create the reservation
        newReservation = await Reservation.create({
            name: name || 'Valued Guest',
            email: email || 'guest@alviro.com',
            phone: phone || '+1 (555) 019-2834',
            date: date || new Date().toISOString().split('T')[0],
            time: time || '8:00 PM',
            guests: Number(guests) || 2,
            status: 'Pending',
            specialRequest: specialRequest || 'Booked via DineMate AI Assistant',
            hasPreOrder
        });

        // Upsert guest profile in UserDetail
        _upsertGuestUserDetail({
            name: newReservation.name,
            email: newReservation.email,
            phone: newReservation.phone
        }).catch(err => console.error('[UserDetail] Async error:', err));

        // Step 2: Create reservation items if any
        if (hasPreOrder) {
            const itemDocs = preOrderItems.map(item => ({
                reservationId: newReservation._id,
                menuItemId: item.menuItemId || item._id,
                name: item.name,
                category: item.category || 'Mains',
                quantity: Math.max(1, Number(item.quantity) || 1),
                status: 'preordered',
                notes: item.notes || ''
            }));

            try {
                await ReservationItem.insertMany(itemDocs, { ordered: true });
            } catch (itemErr) {
                // Rollback: delete the reservation if items fail
                await Reservation.findByIdAndDelete(newReservation._id);
                console.error('[ReservationItems] Rollback triggered:', itemErr.message);
                return res.status(500).json({ message: 'Failed to save pre-order items. Reservation rolled back.', error: itemErr.message });
            }
        }

        // Step 3: Return populated reservation
        const populated = await ReservationItem.find({ reservationId: newReservation._id });

        // Trigger asynchronous Pending email
        try {
            await sendReservationPendingEmail({
                email: newReservation.email,
                name: newReservation.name,
                date: newReservation.date,
                time: newReservation.time,
                guests: newReservation.guests,
                reservationId: newReservation._id.toString()
            });
            console.log('[ReservationEmail] Pending email sent successfully.');
        } catch (err) {
            console.error('[ReservationEmail] Pending email error:', err);
        }

        return res.status(201).json({ ...newReservation.toObject(), preOrderItems: populated });


    } catch (error) {
        console.error('[createReservationWithItems] Error:', error);
        return res.status(500).json({ message: 'Error creating reservation', error: error.message });
    }
};

/**
 * GET /api/reservations/:id/items
 * Returns all pre-order items for a given reservation.
 */
export const getReservationItems = async (req, res) => {
    try {
        const { id } = req.params;
        const items = await ReservationItem.find({ reservationId: id }).populate('menuItemId', 'name price category image');
        res.status(200).json(items);
    } catch (error) {
        console.error('[getReservationItems] Error:', error);
        res.status(500).json({ message: 'Error fetching reservation items', error: error.message });
    }
};

/**
 * POST /api/reservations/:id/items
 * Adds a new dish to an existing reservation's pre-order.
 * Respects cutoff window.
 */
export const addItemToReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { menuItemId, name, category, quantity, notes } = req.body;

        const reservation = await Reservation.findById(id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

        if (_isCutoffPassed(reservation.date, reservation.time)) {
            return res.status(403).json({
                message: `Pre-order modifications are closed ${PRE_ORDER_CUTOFF_HOURS}h before your reservation. Please contact the restaurant.`,
                cutoffPassed: true
            });
        }

        // Upsert: if dish already in pre-order, increment quantity
        const existing = await ReservationItem.findOne({ reservationId: id, menuItemId });
        if (existing) {
            existing.quantity += Number(quantity) || 1;
            await existing.save();
            return res.status(200).json(existing);
        }

        const newItem = await ReservationItem.create({
            reservationId: id,
            menuItemId,
            name,
            category: category || 'Mains',
            quantity: Number(quantity) || 1,
            notes: notes || ''
        });

        // Mark reservation as having a pre-order
        await Reservation.findByIdAndUpdate(id, { hasPreOrder: true });

        res.status(201).json(newItem);
    } catch (error) {
        console.error('[addItemToReservation] Error:', error);
        res.status(500).json({ message: 'Error adding item to reservation', error: error.message });
    }
};

/**
 * PATCH /api/reservations/:id/items/:itemId
 * Updates quantity or status of a reservation item.
 */
export const updateReservationItem = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        const { quantity, status } = req.body;

        const reservation = await Reservation.findById(id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

        // Only check cutoff for quantity changes; admins can update status any time
        if (quantity !== undefined && _isCutoffPassed(reservation.date, reservation.time)) {
            return res.status(403).json({
                message: `Modifications closed ${PRE_ORDER_CUTOFF_HOURS}h before reservation. Contact restaurant.`,
                cutoffPassed: true
            });
        }

        const updates = {};
        if (quantity !== undefined) updates.quantity = Math.max(1, Number(quantity));
        if (status !== undefined) updates.status = status;

        const updated = await ReservationItem.findByIdAndUpdate(itemId, updates, { new: true });
        if (!updated) return res.status(404).json({ message: 'Item not found' });

        res.status(200).json(updated);
    } catch (error) {
        console.error('[updateReservationItem] Error:', error);
        res.status(500).json({ message: 'Error updating reservation item', error: error.message });
    }
};

/**
 * DELETE /api/reservations/:id/items/:itemId
 * Removes a dish from a reservation's pre-order.
 * Respects cutoff window.
 */
export const deleteReservationItem = async (req, res) => {
    try {
        const { id, itemId } = req.params;

        const reservation = await Reservation.findById(id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

        if (_isCutoffPassed(reservation.date, reservation.time)) {
            return res.status(403).json({
                message: `Modifications closed ${PRE_ORDER_CUTOFF_HOURS}h before reservation. Contact restaurant.`,
                cutoffPassed: true
            });
        }

        await ReservationItem.findByIdAndDelete(itemId);

        // If no items remain, clear hasPreOrder flag
        const remaining = await ReservationItem.countDocuments({ reservationId: id });
        if (remaining === 0) {
            await Reservation.findByIdAndUpdate(id, { hasPreOrder: false });
        }

        res.status(200).json({ message: 'Item removed from pre-order' });
    } catch (error) {
        console.error('[deleteReservationItem] Error:', error);
        res.status(500).json({ message: 'Error removing reservation item', error: error.message });
    }
};
