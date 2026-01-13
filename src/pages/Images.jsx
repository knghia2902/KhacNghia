import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const Images = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [likedImages, setLikedImages] = useState(new Set()); // Using Set for faster lookups

    const images = [
        {
            id: 1,
            title: "Morning Light",
            category: "Architecture",
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnfO7DrW0CN_06WuYOdw4b3e2LH37g7c0zp9Ml5Pk_kLMrQMr67aSHNAZhHhGRAc6vfYtug9tEMjd59q6oSq8weu9YL4X7pVz0xPdnJk6iKcRaG89QkkXRySQ2rfe0CX5VS8cuuZMFFmKl_ivRPIgkn_YuvOLfThHIHdy5zYeXU30RV_H2xI2Y7Yr1Q_cdrtFhAxcBQcn3BvuHIpaSy8X4SyKdeTxMV4isYItXMM5RCkX6ZhgQkhcAmyoKciAkystLbyfULWTCQvk7",
            desc: "Captured during the golden hour, showing modern lines.",
            tags: ["#architecture", "#light"],
            resolution: "4096 x 2160"
        },
        {
            id: 2,
            title: "Abstract Flow",
            category: "Abstract",
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT6PhmLCdcVB7qzGKCOwi1D78AIPdh3ohMxvbRao0UigwnX7wAobawJ9t6h7PRXJkUqb1rBkRY1ZCrrkZPBhz_fCM_tAA2L31XgFiS7ynlrnKJmEQ4iEu_TxedcK_E1CSTqIuSfb7sC-_7PQLLCXm_Ki_GcJavojKjGm3XmnESqN93a9wm_GPXEK9wyIm3o-qVk9tiCuEUbovYPBQdI79XgYPkS1Qah-Vgbh6mmIz7_REURFcOU5qXMRjjiJuPlq-EzkfzGW9M11Jd",
            desc: "Fluid shapes and calming colors.",
            tags: ["#abstract", "#minimal"],
            resolution: "3840 x 2160"
        },
        {
            id: 3,
            title: "Clean Lines",
            category: "Minimalism",
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDR4tASLGop3a8rDIF-bv0yf0X8KJNN_Vy7RNyV2GS0DVm2D0OB0tU6QQAGKFHaIviKyP4mNOWrz3y17eFouSh8UvD21zJLW_I0dgfE0B2WwbCM13s7ec_fZ_4HLLF8xey0x_igXuHwCkWIpLx_b3K_sT3YcPzIVdakty46qM_KdvLQeSDmVRLboc22i1c6R9HJSxwPHoY0XmOXjoWcqmLHv6doNHZsHSQUJiPbw2J4ONxJ96UBXhDLxIzbAG94LjnsPCMmX-BPdFIP",
            desc: "Stark contrast and geometric perfection.",
            tags: ["#minimal", "#structure"],
            resolution: "5120 x 2880"
        },
        {
            id: 4,
            title: "Natural Form",
            category: "Nature",
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOzf8tmMZk402qD6Y9P0iundYS6oaRQLtdZueqPRWSRfVnhQEda1AUjRDieo29C-wEsmJIT-FUMMJUjZcxGoV2gKPWFn-Adk9To0_jPl6rqS5XwfqVMz98dowIFclrahouPPbmd5b80q11DzphTCpdcLmX6nqD46lYigCNjpHz2z7aDk_TZWvR-06j9-m1JagegA-ZG5mlJDUR7qjOxOl-c7Cplh0vW4lZdnskZV3yZoeOOEQpHAZ8xH3qp3tY8GISAMlrPyONAk17",
            desc: "Organic patterns found in nature.",
            tags: ["#nature", "#green"],
            resolution: "4000 x 6000"
        },
        {
            id: 5,
            title: "Workspace Zen",
            category: "Interior",
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrBbiFoNx9WbI5cY9Gzf41Xz6OE1rdp9Q9hkAuEe9_HPdcRW_JKfn2UNtqjj_mDBie7gW4JSeytjK_6nTAAfFNp3vh0bJV8K6C3cKa-a_vcUj6L-nlo3PHTbi_KA1rz5z_Q5mwNsP03UCYbZOR16d286QBWVA-lhAhWH3Rwgf5KSRUZGmZ8WeB36lJoUxp-uyMH4YXaZtokm6_lWDNVjuifLJ3b4jp0ay6-fKvPoTaIJWSqwNxWzeK8Jm4MBTuFFBMuc5GmxXesEI7",
            desc: "A perfect setup for productivity.",
            tags: ["#workspace", "#desk"],
            resolution: "3840 x 2160"
        },
        {
            id: 6,
            title: "Texture Study",
            category: "Texture",
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1TXqAi-3lJ2thVuEGCILtkP3-SXcacXlrr319N0Vd6NOqGV2FY7B8wTW1fUVGZTI9Ms-Kxrh6v6oFpXZjnNVv97JbiMYTI6z8faMYlKKxCWwNThvGp4CkIUjbDtVvlE__v0weBUw4GW_veQGPq2s7HmQY2QGSHQGRRSUi3CQu0bcs0a7mvE-gt6x6fhznUO5H9Talz8yMlJ-Opn8pEXczKdcEX8HYyc4Glb2tBrmpzpBueIk9VJbt9rxM82Jc1bwMKTKeZmUpvafh",
            desc: "Detailed surface textures in macro.",
            tags: ["#texture", "#detail"],
            resolution: "4500 x 3000"
        }
    ];

    // Get unique categories
    const categories = useMemo(() => {
        return ['All', ...new Set(images.map(img => img.category))];
    }, [images]);

    // Filter images
    const filteredImages = useMemo(() => {
        return images.filter(img => {
            const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
            const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [images, selectedCategory, searchQuery]);

    const toggleLike = (e, id) => {
        e.stopPropagation();
        const newLiked = new Set(likedImages);
        if (newLiked.has(id)) {
            newLiked.delete(id);
        } else {
            newLiked.add(id);
        }
        setLikedImages(newLiked);
    };

    const handleDownload = (e, url, filename) => {
        e.stopPropagation();
        // Since these are external URLs, we open them in a new tab for now to avoid CORS issues in this demo environment
        // In a real app with same-origin images, we would fetch blob and create object URL
        window.open(url, '_blank');
    };

    return (
        <>
            <div className={`flex flex-col h-full transition-all duration-500 ${selectedImage ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-8 pt-6 pb-2 border-b border-white/20 dark:border-white/5 shrink-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1d2624] dark:text-white tracking-tight">
                            Visual <span className="bg-gradient-to-r from-[#4ecdc4] to-[#ffbe76] bg-clip-text text-transparent">Sanctuary</span>
                        </h1>
                        <p className="text-[#1d2624]/60 dark:text-white/60 text-sm md:text-base font-medium mt-2">
                            A curated collection of calm. Explore, collect, and find your focus.
                        </p>
                    </div>
                    <div className="relative w-full md:w-64 group/search">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#1d2624]/40 dark:text-white/40 text-[20px]">search</span>
                        <input
                            className="w-full pl-11 pr-4 py-2 bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-[#1d2624]/40"
                            placeholder="Search inspiration..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Filter Bar */}
                <div className="shrink-0 px-8 py-4 flex gap-2 overflow-x-auto custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-[#1d2624] dark:bg-white text-white dark:text-black shadow-lg scale-105'
                                : 'bg-white/20 dark:bg-white/5 text-[#1d2624]/60 dark:text-white/60 hover:bg-white/40 dark:hover:bg-white/10'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-4 pb-32">
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                        {filteredImages.map((img) => (
                            <div key={img.id} className="break-inside-avoid relative group rounded-[1.5rem] overflow-hidden bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/5 shadow-sm hover:translate-y-[-4px] transition-all duration-500 cursor-zoom-in" onClick={() => setSelectedImage(img)}>
                                <div
                                    className={`absolute top-3 right-3 size-8 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full transition-all duration-300 hover:bg-white/40 hover:scale-110 z-10 ${likedImages.has(img.id) ? 'opacity-100 bg-peach-soft' : 'opacity-0 group-hover:opacity-100'}`}
                                    onClick={(e) => toggleLike(e, img.id)}
                                >
                                    <span className={`material-symbols-outlined text-[16px] transition-colors ${likedImages.has(img.id) ? 'text-secondary-dark fill-current font-variation-settings-fill' : 'text-white'}`}>favorite</span>
                                </div>
                                {useAuth().isAuthenticated && (
                                    <button
                                        className="absolute top-3 left-3 size-8 flex items-center justify-center bg-red-500/80 backdrop-blur-md rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:scale-110 z-10 text-white"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            alert('Delete functionality would be here');
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                )}
                                <img src={img.url} alt={img.title} className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <span className="text-white font-bold text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.title}</span>
                                    <span className="text-white/70 text-[9px] uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{img.category}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredImages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="material-symbols-outlined text-4xl text-[#1d2624]/20 dark:text-white/20 mb-4">image_not_supported</span>
                            <p className="text-[#1d2624]/40 dark:text-white/40 font-medium">No images found for "{selectedCategory}"</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-3xl bg-white/60 dark:bg-black/80 animate-[fadeIn_0.3s_ease-out]">
                    <div className="absolute inset-0" onClick={() => setSelectedImage(null)}></div>
                    <div className="relative w-full max-w-5xl h-[75vh] bg-white dark:bg-[#18181b] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 dark:border-white/10 z-10">
                        <button className="absolute top-6 left-6 z-20 size-10 flex items-center justify-center rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md text-white hover:bg-black/40 transition-colors" onClick={() => setSelectedImage(null)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="flex-1 bg-gray-100 dark:bg-black/50 relative flex items-center justify-center overflow-hidden">
                            <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-full object-contain p-8 md:p-12" />
                        </div>
                        <div className="w-full md:w-[320px] bg-white dark:bg-[#18181b] border-l border-gray-100 dark:border-white/5 flex flex-col overflow-y-auto custom-scrollbar p-8">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">{selectedImage.title}</h2>
                                        <button
                                            onClick={(e) => toggleLike(e, selectedImage.id)}
                                            className={`p-2 rounded-full transition-colors ${likedImages.has(selectedImage.id) ? 'bg-peach-soft text-secondary-dark' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}
                                        >
                                            <span className="material-symbols-outlined font-variation-settings-fill">favorite</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="size-6 rounded-full bg-gray-200"></div>
                                        <span className="text-sm font-medium text-gray-500">by Alex M.</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Resolution</span>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{selectedImage.resolution}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Format</span>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">JPG</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">About</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedImage.desc}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedImage.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full bg-peach-soft text-secondary-dark text-xs font-bold">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-auto pt-8">
                                <button onClick={(e) => handleDownload(e, selectedImage.url, selectedImage.title)} className="w-full py-3 rounded-xl bg-[#1d2624] dark:bg-white text-white dark:text-black font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Images;
