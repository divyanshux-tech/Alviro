import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const SPOONACULAR_API_KEY = '8a0e1a6668df45abae9ec5b1e45931ad';

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected for seeding'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const cleanText = (text) => {
    return text ? text.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...' : 'Delicious and freshly prepared.';
};

const seedMenu = async () => {
    try {
        console.log('Clearing existing menu items...');
        await MenuItem.deleteMany({});

        const categories = [
            { type: 'appetizer', dbCategory: 'Starters', count: 6 },
            { type: 'main course', dbCategory: 'Mains', count: 8 },
            { type: 'dessert', dbCategory: 'Desserts', count: 6 },
            { type: 'drink', dbCategory: 'Drinks', count: 6 }
        ];

        let totalAdded = 0;

        for (const cat of categories) {
            console.log(`Fetching ${cat.dbCategory}...`);

            const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
                params: {
                    apiKey: SPOONACULAR_API_KEY,
                    type: cat.type,
                    number: cat.count,
                    addRecipeInformation: true,
                    instructionsRequired: true
                }
            });

            const items = response.data.results.map(item => ({
                name: item.title,
                description: cleanText(item.summary),
                price: Math.floor(Math.random() * (30 - 12 + 1) + 12), // Random price between $12 and $30 as API prices are sometimes weird
                category: cat.dbCategory,
                image: item.image.replace(/-\d+x\d+/, '-636x393'), // Force higher resolution
                isAvailable: true
            }));

            await MenuItem.insertMany(items);
            totalAdded += items.length;
            console.log(`Added ${items.length} ${cat.dbCategory}`);
        }

        console.log(`\nSUCCESS: Database populated with ${totalAdded} professional menu items.`);
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error.message);
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
        process.exit(1);
    }
};

seedMenu();
