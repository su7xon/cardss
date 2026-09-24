import React from 'react';
import { ArrowRight, User, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { AboutContent } from '../types';

interface AboutPageProps {
  about: AboutContent;
}

const AboutPage: React.FC<AboutPageProps> = ({ about }) => {
  return (
    <div className="pt-20 pb-20 bg-mystic-gradient min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100/50 text-rose-600 font-bold text-[10px] tracking-[0.2em] uppercase mb-4">
            {about.title || 'THE PRACTITIONER'}
          </span>
          <h1 className="text-5xl md:text-6xl font-mystic text-slate-950 mb-6">
            Meet <span className="text-rose-600">Pooja Gupta</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium italic">
            "Your companion on the journey of emotional healing, spiritual growth, and inner clarity."
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Image / Visual Area */}
          <div className="w-full lg:w-1/2 relative animate-fade-in group">
            <div className="absolute -inset-6 bg-gradient-to-tr from-rose-200/40 via-rose-50/30 to-amber-100/30 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-60"></div>
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-rose-100/50 shadow-2xl shadow-rose-200/30 bg-white p-2">
              <img 
                src={about.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800"} 
                alt={about.title} 
                className="w-full h-full object-cover rounded-[2.5rem] transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>
            
            {/* Floating Badges */}
            <div className="absolute -bottom-6 -right-6 md:-right-10 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-rose-50 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <Sparkles className="text-rose-500 fill-rose-500/20" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 font-mystic">Certified</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Practitioner</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Detailed Content */}
          <div className="w-full lg:w-1/2 space-y-10">
            <div className="space-y-6">
              <h2 className="text-3xl font-mystic text-slate-900 flex items-center gap-3">
                <span className="w-8 h-px bg-rose-300"></span>
                My Philosophy
              </h2>
              <div className="bg-white/40 backdrop-blur-sm p-8 rounded-3xl border border-rose-100/50 shadow-inner">
                <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed italic">
                  {about.description}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-mystic text-slate-900 flex items-center gap-3">
                <span className="w-8 h-px bg-rose-300"></span>
                Areas of Expertise
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {about.credentials.map((cert, i) => (
                  <div key={cert} className="flex items-center gap-4 p-5 rounded-2xl border border-rose-50 bg-white shadow-sm hover:shadow-md hover:border-rose-200 transition-all group/item">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-rose-50 group-hover/item:bg-rose-500 flex items-center justify-center transition-colors">
                      <ShieldCheck className="w-5 h-5 text-rose-500 group-hover/item:text-white" />
                    </div>
                    <span className="text-slate-700 font-bold text-sm md:text-base">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 flex flex-wrap gap-4">
              <button 
                onClick={() => window.location.href = '#contact'}
                className="bg-rose-600 text-white px-10 py-5 rounded-[2rem] font-bold tracking-[0.1em] text-sm hover:bg-rose-700 transition-all hover:translate-y-[-4px] shadow-lg shadow-rose-200 active:scale-95 flex items-center gap-2"
              >
                BOOK A CONSULTATION
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Why Shunyethra Section */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
            {[
                { icon: <Heart className="text-rose-500" />, title: "Compassionate Support", desc: "A safe and judgment-free space for your emotional and spiritual healing journey." },
                { icon: <Sparkles className="text-amber-500" />, title: "Complete Guidance", desc: "Integrating Tarot, Energy Healing, and Counseling for a holistic transformation." },
                { icon: <User className="text-slate-800" />, title: "Personalized Approach", desc: "Every session is uniquely tailored to resonate with your soul's specific needs." }
            ].map((feature, i) => (
                <div key={i} className="bg-white/80 p-8 rounded-[2rem] border border-rose-50 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-mystic text-slate-900 mb-4">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
