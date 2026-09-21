import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, default: "guest@alviro.com" },
    phone: { type: String, default: "+1 (555) 019-2834" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Pending'
    },

    specialRequest: { type: String, default: "Booked via DineMate AI Assistant" },
    hasPreOrder: { type: Boolean, default: false }
}, { timestamps: true });


export default mongoose.model('Reservation', reservationSchema);
