import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB Connection Error in Seed Script:', err);
        process.exit(1);
    });

const seedAdmin = async () => {
    try {
        const adminEmail = 'alvirothefinedining@gmail.com';
        const adminPass = 'alviro';

        let existingAdmin = await Admin.findOne({ username: adminEmail });
        const hashedPassword = await bcrypt.hash(adminPass, 12);

        if (existingAdmin) {
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('Admin password updated successfully');
        } else {
            await Admin.create({
                username: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created successfully');
        }

        console.log(`Username: ${adminEmail}`);
        console.log(`Password: ${adminPass}`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
