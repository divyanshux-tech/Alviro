import React from 'react';
import { motion } from 'framer-motion';

const Team = () => {
    return (
        <section id="team" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20 text-center border-b border-gray-100 pb-16">
                    {[
                        { num: "14", label: "Restaurants" },
                        { num: "08", label: "Years Of Experience" },
                        { num: "20", label: "Chef In Kitchen" },
                        { num: "200", label: "Food Dishes" }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <h3 className="text-6xl md:text-8xl font-header font-medium text-secondary mb-4">{stat.num}</h3>
                            <p className="text-gray-400 font-body text-xs uppercase tracking-[0.2em]">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Team Section */}
                <div className="text-center mb-16 pt-0">
                    <span className="text-primary font-sans font-bold tracking-[0.3em] uppercase text-xs block mb-4">The Experts</span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-header font-medium text-secondary mb-6"
                    >
                        OUR TEAM
                    </motion.h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8"></div>
                    <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
                        Meet the culinary bohemians behind Alviro's award-winning flavors. Dedicated to the art of gastronomy, our team brings passion and precision to every plate.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-16">
                    {[
                        { name: "JOHNATHAN TYLER", role: "Founder & Head Chef", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" },
                        { name: "WADE WARREN", role: "Sous Chef", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" },
                        { name: "JHON DOE", role: "Fast Food Chef", img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" },
                        { name: "ALEX COAL", role: "Senior Chef", img: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" }
                    ].map((member, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-56 h-56 rounded-full overflow-hidden mb-8 border-4 border-gray-50 shadow-2xl group relative">
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-500 z-10"></div>
                                <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                            </div>
                            <h3 className="text-2xl font-header font-bold text-secondary uppercase tracking-widest mb-2">{member.name}</h3>
                            <p className="text-primary text-xs uppercase tracking-[0.2em] font-bold">{member.role}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
