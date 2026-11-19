import React, { useEffect, useState } from 'react';
import { getWebsiteContent, getDeliveryLocations } from '../../services/dataService';
import ContactSection from '../../components/home/ContactSection';
import DeliveryInfoSection from '../../components/home/DeliveryInfoSection';

export default function ContactPage() {
  const [content, setContent] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    async function load() {
      const [c, l] = await Promise.all([getWebsiteContent(), getDeliveryLocations()]);
      setContent(c);
      setLocations(l);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
            Reach Out To Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
            Contact & Store Location
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl mx-auto">
            We are always here to answer your questions, assist with your orders, or arrange your physical pickup.
          </p>
        </div>
      </div>

      <ContactSection contactInfo={content?.contact} />
      <DeliveryInfoSection locations={locations} pickupContent={content?.pickup} />
    </div>
  );
}
