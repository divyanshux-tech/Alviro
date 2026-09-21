import Reservation from '../models/Reservation.js';
import ReservationItem from '../models/ReservationItem.js';
import UserDetail from '../models/UserDetail.js';
import {
    sendReservationPendingEmail,
    sendReservationConfirmedEmail,
    sendReservationCancelledEmail
} from '../utils/emailService.js';

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

// ─────────────────────────────────────────────────────────────────────────────
// Valid State Transitions
// ─────────────────────────────────────────────────────────────────────────────
const VALID_TRANSITIONS = {
    'Pending':   ['Confirmed', 'Cancelled'],
    'Confirmed': ['Cancelled', 'Completed'],
    'Completed': [],       // Terminal state
    'Cancelled': []        // Terminal state
};

export const createReservation = async (req, res) => {
    try {
        const { name, email, phone, date, time, guests, specialRequest } = req.body;
        const newReservation = await Reservation.create({
            name: name || "Valued Guest",
            email: email || "guest@alviro.com",
            phone: phone || "+1 (555) 019-2834",
            date: date || new Date().toISOString().split('T')[0],
            time: time || "8:00 PM",
            guests: Number(guests) || 2,
            status: "Pending",
            specialRequest: specialRequest || "Booked via DineMate AI Assistant"
        });

        // Upsert guest profile in UserDetail
        _upsertGuestUserDetail({
            name: newReservation.name,
            email: newReservation.email,
            phone: newReservation.phone
        }).catch(err => console.error('[UserDetail] Async error:', err));

        // Trigger Pending email
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

        res.status(201).json(newReservation);
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ message: "Error creating reservation", error: error.message });
    }
};


export const getReservations = async (req, res) => {
    try {
        let reservations = await Reservation.find().sort({ createdAt: -1 });

        // Seed initial sample reservations if database is empty for realistic testing
        if (!reservations || reservations.length === 0) {
            const sampleReservations = [
                {
                    name: "Lord Harrison Vance",
                    email: "harrison.vance@luxury.com",
                    phone: "+1 (555) 234-5678",
                    date: "2026-09-02",
                    time: "8:00 PM",
                    guests: 4,
                    status: "Confirmed",
                    specialRequest: "Window table with Barolo DOCG pairing"
                },
                {
                    name: "Sophia Rossi",
                    email: "sophia.rossi@milan.it",
                    phone: "+1 (555) 876-5432",
                    date: "2026-09-02",
                    time: "7:30 PM",
                    guests: 2,
                    status: "Confirmed",
                    specialRequest: "Vegetarian tasting menu requested"
                },
                {
                    name: "Dr. Alexander Wright",
                    email: "alexander.wright@oxford.edu",
                    phone: "+1 (555) 345-6789",
                    date: "2026-09-03",
                    time: "8:30 PM",
                    guests: 6,
                    status: "Pending",
                    specialRequest: "Chef's table anniversary celebration"
                }
            ];

            await Reservation.insertMany(sampleReservations);
            reservations = await Reservation.find().sort({ createdAt: -1 });
        }

        res.status(200).json(reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({ message: "Error fetching reservations", error: error.message });
    }
};

export const updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Validate state transition
        const currentStatus = reservation.status;
        const allowed = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                message: `Invalid status transition: ${currentStatus} → ${status}. Allowed: [${allowed.join(', ')}]`
            });
        }

        reservation.status = status;
        await reservation.save();

        // Trigger stage-specific emails
        if (status === 'Confirmed') {
            // Fetch pre-order items for this reservation to include in the email
            const preOrderItems = await ReservationItem.find({ reservationId: reservation._id });
            try {
                await sendReservationConfirmedEmail({
                    email: reservation.email,
                    name: reservation.name,
                    date: reservation.date,
                    time: reservation.time,
                    guests: reservation.guests,
                    preOrderItems
                });
                console.log('[ReservationEmail] Confirmed email sent successfully.');
            } catch (err) {
                console.error('[ReservationEmail] Confirmed email error:', err);
            }
        }

        if (status === 'Cancelled') {
            try {
                await sendReservationCancelledEmail({
                    email: reservation.email,
                    name: reservation.name,
                    date: reservation.date,
                    time: reservation.time,
                    reason: reason || ''
                });
                console.log('[ReservationEmail] Cancelled email sent successfully.');
            } catch (err) {
                console.error('[ReservationEmail] Cancelled email error:', err);
            }
        }

        res.status(200).json(reservation);
    } catch (error) {
        console.error("Error updating reservation:", error);
        res.status(500).json({ message: "Error updating reservation", error: error.message });
    }
};
