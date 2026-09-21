import React from 'react';
import Hero from '../components/Hero';
import InteractiveMenu from '../components/InteractiveMenu';
import About from '../components/About';
import AIRecommendations from '../components/AIRecommendations';
import Team from '../components/Team';
import ReservationSection from '../components/ReservationSection';

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen bg-cream">
            {/* 1. Hero Section */}
            <Hero />

            {/* 2. Interactive Chef's Table Section */}
            <InteractiveMenu />

            {/* 3. About Heritage Section */}
            <About />

            {/* 4. AI-Powered Dynamic Popular Dishes & Crowd Favorites Section */}
            <AIRecommendations />

            {/* 5. Culinary Master Team Section */}
            <Team />

            {/* 6. Table Reservation Section */}
            <ReservationSection />
        </div>
    );
};

export default Home;
