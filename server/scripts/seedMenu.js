import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const menuItems = [
    // Starters
    {
        name: "Truffle Arancini",
        description: "Crispy risotto balls infused with black truffle, served with garlic aioli.",
        price: 14,
        category: "Starters",
        image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        isAvailable: true
    },
    {
        name: "Burrata & Peach",
        description: "Fresh burrata cheese, grilled peaches, basil pesto, and balsamic glaze.",
        price: 18,
        category: "Starters",
        image: "https://loremflickr.com/800/600/burrata,peach?lock=1",
        isAvailable: true
    },
    {
        name: "Wagyu Beef Carpaccio",
        description: "Thinly sliced raw wagyu beef, parmesan shavings, capers, and truffle oil.",
        price: 22,
        category: "Starters",
        image: "https://loremflickr.com/800/600/carpaccio,beef?lock=2",
        isAvailable: true
    },

    // Mains
    {
        name: "Pan-Seared Scallops",
        description: "Jumbo diver scallops with cauliflower purée, crispy pancetta, and lemon butter.",
        price: 34,
        category: "Mains",
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        isAvailable: true
    },
    {
        name: "Herb-Crusted Lamb Rack",
        description: "Served pink with fondant potatoes, seasonal greens, and a red wine reduction.",
        price: 42,
        category: "Mains",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        isAvailable: true
    },
    {
        name: "Wild Mushroom Risotto",
        description: "Arborio rice cooked with porcini mushrooms, parmesan, and fresh herbs.",
        price: 28,
        category: "Mains",
        image: "https://loremflickr.com/800/600/risotto,mushroom?lock=3",
        isAvailable: true
    },
    {
        name: "Miso Glazed Black Cod",
        description: "Sustainably sourced cod fillet marinated in miso, served with bok choy.",
        price: 36,
        category: "Mains",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        isAvailable: true
    },

    // Desserts
    {
        name: "Dark Chocolate Fondant",
        description: "Molten center chocolate cake served with vanilla bean ice cream.",
        price: 14,
        category: "Desserts",
        image: "https://loremflickr.com/800/600/chocolate,fondant?lock=4",
        isAvailable: true
    },
    {
        name: "Lemon Tart",
        description: "Zesty lemon curd in a buttery pastry shell, topped with Italian meringue.",
        price: 12,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        isAvailable: true
    },
    {
        name: "Pistachio Baklava",
        description: "Layers of phyllo pastry filled with chopped pistachios and honey syrup.",
        price: 13,
        category: "Desserts",
        image: "https://loremflickr.com/800/600/baklava?lock=5",
        isAvailable: true
    },

    // Drinks
    {
        name: "Signature Old Fashioned",
        description: "Bourbon, smoked maple syrup, angostura bitters, and orange peel.",
        price: 16,
        category: "Drinks",
        image: "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        isAvailable: true
    },
    {
        name: "Berry Basil Smash",
        description: "Gin, fresh muddled berries, basil leaves, lemon juice, and soda.",
        price: 15,
        category: "Drinks",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        isAvailable: true
    }
];

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB connected');
        await MenuItem.deleteMany({}); // Clear existing menu
        await MenuItem.insertMany(menuItems);
        console.log('Menu seeded successfully');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
