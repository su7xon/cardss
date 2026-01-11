
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-rose-900/30 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="font-mystic text-2xl text-rose-300 mb-4">Pooja Gupta</h3>
          <p className="text-slate-400 max-w-sm mb-4">
            Helping you navigate the cosmos through the wisdom of stars and the healing energy of crystals. Based in Bhondsi, Gurgaon, serving globally.
          </p>
          <div className="flex gap-4">
            {['Instagram', 'Facebook', 'LinkedIn'].map(social => (
              <a key={social} href="#" className="text-rose-200/50 hover:text-rose-400 transition-colors text-sm">{social}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-rose-100 mb-4">Services</h4>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li>Birth Chart Reading</li>
            <li>Crystal Healing</li>
            <li>Tarot Insights</li>
            <li>Vastu Consultation</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-rose-100 mb-4">Contact</h4>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li>Block A, Gali No. 2, Rayan Enclave</li>
            <li>Near Shiv Mandir, Bhondsi</li>
            <li>Gurgaon, Haryana - 122102</li>
            <li className="pt-2 text-rose-200/80">pooja.gupta639783@gmail.com</li>
            <li className="text-rose-200/80">+91 70426 20928</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs tracking-widest">
        &copy; {new Date().getFullYear()} HEALING CRYSTAL SUTRA. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};

export default Footer;
