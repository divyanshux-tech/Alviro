import 'dotenv/config';
import { sendReservationConfirmation } from '../utils/emailService.js';


async function runTest() {
    console.log('Testing Email Confirmation Service...');
    
    const sampleReservation = {
        name: 'Eleanor Vance',
        email: 'dummycollege321@gmail.com',

        date: '2026-09-25',

        time: '7:30 PM',
        guests: 3,
        specialRequest: 'Anniversary celebration by the window',
        preOrderItems: [
            { name: 'Truffle Risotto', category: 'Primi', quantity: 2, notes: 'Extra parmesan' },
            { name: 'Wagyu Ribeye', category: 'Secondi', quantity: 1, notes: 'Medium rare' }
        ]
    };

    const result = await sendReservationConfirmation(sampleReservation);
    console.log('Test Result:', result);
}

runTest();
