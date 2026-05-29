
import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { subscribeToBlogs } from '../services/databaseService';
import { INITIAL_BLOGS } from '../constants';

const BlogPage: React.FC = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("BlogPage mounted, starting subscription...");
        const timeoutId = setTimeout(() => {
            console.log("Blog loading timeout reached");
            setIsLoading(false);
        }, 5000);

        try {
            const unsubscribe = subscribeToBlogs((data) => {
                console.log("Blogs received:", data.length);
                setBlogs(data);
                setIsLoading(false);
                clearTimeout(timeoutId);
            });
            return () => {
                unsubscribe();
                clearTimeout(timeoutId);
            };
        } catch (err) {
            console.error("Blog subscription execution error:", err);
            setIsLoading(false);
            clearTimeout(timeoutId);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-rose-300 font-mystic animate-pulse">Connecting to spiritual realm...</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-serif text-rose-900 mb-6 tracking-tight">Spiritual Insights</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto italic">Explore the wisdom of crystals, tarot, and energy healing through Pooja's perspective.</p>
                    <div className="w-24 h-1 bg-rose-200 mx-auto mt-6"></div>
                </div>

                {selectedBlog ? (
                    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-20">
                        <button
                            onClick={() => setSelectedBlog(null)}
                            className="group flex items-center gap-2 text-rose-500 font-bold hover:text-rose-700 transition-colors"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span>
                            BACK TO BLOGS
                        </button>

                        {selectedBlog.image && (
                            <img
                                src={selectedBlog.image}
                                alt={selectedBlog.title}
                                className="w-full h-[300px] md:h-[500px] object-cover rounded-[2rem] shadow-2xl"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1200';
                                }}
                            />
                        )}

                        <div className="space-y-4">
                            <p className="text-rose-400 font-bold text-xs uppercase tracking-[0.2em]">
                                {selectedBlog.createdAt?.toDate ? selectedBlog.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Spiritual Wisdom'}
                            </p>
                            <h2 className="text-3xl md:text-5xl font-mystic text-slate-900 leading-tight">{selectedBlog.title}</h2>
                        </div>

                        <div className="prose prose-rose prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {selectedBlog.content}
                        </div>

                        <div className="pt-12 border-t border-rose-100 mt-20 text-center">
                            <p className="font-mystic text-rose-900 text-xl mb-4">Guided by Pooja Gupta</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setSelectedBlog(null)} className="bg-rose-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg">READ MORE ARTICLES</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.length > 0 ? blogs.map((blog) => (
                            <div
                                key={blog.id}
                                className="group bg-white rounded-3xl overflow-hidden border border-rose-50 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                                onClick={() => setSelectedBlog(blog)}
                            >
                                {blog.image && (
                                    <div className="h-56 overflow-hidden relative">
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800'; // Default spiritual image
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>
                                )}
                                <div className="p-6 md:p-8 flex flex-col flex-grow space-y-4">
                                    <p className="text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                                        {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Divine Wisdom'}
                                    </p>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-rose-600 transition-colors h-14 line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                                        {blog.excerpt || blog.content.substring(0, 120) + '...'}
                                    </p>
                                    <div className="pt-4 mt-auto">
                                        <span className="text-rose-500 font-bold text-xs uppercase tracking-widest border-b border-rose-200 pb-1 group-hover:border-rose-500 transition-all">Read Insight →</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-rose-200">
                                <p className="text-slate-400 font-mystic text-2xl">Coming Soon...</p>
                                <p className="text-slate-400 text-sm mt-2">Pooja is gathering her spiritual insights to share with you.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
