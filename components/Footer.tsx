
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-rose-50/50 border-t border-rose-200 py-8 md:py-12 px-4 mt-4 md:mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="font-mystic text-2xl text-rose-900 mb-2 md:mb-4">Pooja Gupta</h3>
          <p className="text-slate-600 max-w-sm mb-2 md:mb-4">
            Helping you navigate the cosmos through the wisdom of stars and the healing energy of crystals. Based in Bhondsi, Gurgaon, serving globally.
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/divine_guidance_studio?utm_source=qr&igsh=MW9nbmVsOXdzczA5ZQ==" target="_blank" rel="noopener noreferrer" className="text-rose-800/60 hover:text-rose-600 transition-colors text-sm font-bold uppercase tracking-wider">Instagram</a>
            <a href="https://youtube.com/@divineguidancestudio?si=1eDWWCfxg2uZbEBf" target="_blank" rel="noopener noreferrer" className="text-rose-800/60 hover:text-rose-600 transition-colors text-sm font-bold uppercase tracking-wider">YouTube</a>
            <a href="https://wa.me/916397832791" target="_blank" rel="noopener noreferrer" className="text-rose-800/60 hover:text-rose-600 transition-colors text-sm font-bold uppercase tracking-wider">WhatsApp</a>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-rose-900 mb-2 md:mb-4">Services</h4>
          <ul className="space-y-2 text-slate-600 text-sm">
            <li>Birth Chart Reading</li>
            <li>Crystal Healing</li>
            <li>Tarot Insights</li>
            <li>Vastu Consultation</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-rose-900 mb-2 md:mb-4">Contact</h4>
          <ul className="space-y-2 text-slate-600 text-sm">
            <li>Block A, Gali No. 2, Rayan Enclave</li>
            <li>Near Shiv Mandir, Bhondsi</li>
            <li>Gurgaon, Haryana - 122102</li>
            <li className="pt-2 text-rose-700">poojagupta14021994@gmail.com</li>
            <li className="text-rose-700">+91 6397832791</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-rose-200/50 text-center text-slate-500 text-xs tracking-widest">
        &copy; {new Date().getFullYear()} DIVINE GUIDANCE STUDIO. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};

export default Footer;
