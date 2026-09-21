import mongoose from 'mongoose';

const userDetailSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    totalBookings: {
        type: Number,
        default: 1
    },
    lastBookingDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

userDetailSchema.index({ email: 1 });
userDetailSchema.index({ phone: 1 });

export default mongoose.model('UserDetail', userDetailSchema);
