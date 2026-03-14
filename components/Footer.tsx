
import React from 'react';
import { Link } from 'react-router-dom';
import { FooterSettings } from '../types';

interface FooterProps {
  footerSettings?: FooterSettings;
}

const Footer: React.FC<FooterProps> = ({ footerSettings }) => {
  const footer = {
    aboutTitle: footerSettings?.aboutTitle || 'Pooja Gupta',
    aboutDescription: footerSettings?.aboutDescription || 'Helping you navigate the cosmos through the wisdom of stars and the healing energy of crystals. Based in Bhondsi, Gurgaon, serving globally.',
    servicesTitle: footerSettings?.servicesTitle || 'Services',
    services: footerSettings?.services?.length ? footerSettings.services : ['Birth Chart Reading', 'Crystal Healing', 'Tarot Insights', 'Vastu Consultation'],
    contactTitle: footerSettings?.contactTitle || 'Contact',
    instagramUrl: footerSettings?.instagramUrl || 'https://www.instagram.com/divine_guidance_studio?utm_source=qr&igsh=MW9nbmVsOXdzczA5ZQ==',
    youtubeUrl: footerSettings?.youtubeUrl || 'https://youtube.com/@divineguidancestudio?si=1eDWWCfxg2uZbEBf',
    whatsappUrl: footerSettings?.whatsappUrl || 'https://wa.me/916397832791',
    address: footerSettings?.address || 'Block A, Gali No. 2, Rayan Enclave, Near Shiv Mandir, Bhondsi, Gurgaon, Haryana - 122102',
    email: footerSettings?.email || 'poojagupta14021994@gmail.com',
    phone: footerSettings?.phone || '+91 6397832791'
  };

  return (
    <footer className="bg-rose-50/50 border-t border-rose-200 py-8 md:py-12 px-4 mt-4 md:mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="font-mystic text-2xl text-rose-900 mb-2 md:mb-4">{footer.aboutTitle}</h3>
          <p className="text-slate-600 max-w-sm mb-2 md:mb-4">
            {footer.aboutDescription}
          </p>
          <div className="flex gap-4">
            <a href={footer.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-rose-800/60 hover:text-rose-600 transition-colors text-sm font-bold uppercase tracking-wider">Instagram</a>
            <a href={footer.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-rose-800/60 hover:text-rose-600 transition-colors text-sm font-bold uppercase tracking-wider">YouTube</a>
            <a href={footer.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-rose-800/60 hover:text-rose-600 transition-colors text-sm font-bold uppercase tracking-wider">WhatsApp</a>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-rose-900 mb-2 md:mb-4">{footer.servicesTitle}</h4>
          <ul className="space-y-2 text-slate-600 text-sm">
            {footer.services.map((service, index) => (
              <li key={`${service}-${index}`}>{service}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-rose-900 mb-2 md:mb-4">{footer.contactTitle}</h4>
          <ul className="space-y-2 text-slate-600 text-sm">
            <li className="whitespace-pre-line">{footer.address}</li>
            <li className="pt-2 text-rose-700 font-medium">{footer.email}</li>
            <li className="text-rose-700 font-medium">{footer.phone}</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-rose-200/50 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs tracking-widest gap-4">
        <div>
          &copy; {new Date().getFullYear()} DIVINE GUIDANCE STUDIO. ALL RIGHTS RESERVED.
        </div>
        <Link 
          to="/admin" 
          className="hover:text-rose-600 transition-colors opacity-60 hover:opacity-100"
        >
          SUTRA LOGIN
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
