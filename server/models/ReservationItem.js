import mongoose from 'mongoose';

const reservationItemSchema = new mongoose.Schema({
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true,
        index: true
    },
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Mains'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    status: {
        type: String,
        enum: ['preordered', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'],
        default: 'preordered'
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('ReservationItem', reservationItemSchema);
