import React, { useEffect, useState } from 'react';
import { getWebsiteContent } from '../../services/dataService';
import AboutSection from '../../components/home/AboutSection';
import CeoSection from '../../components/home/CeoSection';
import WhyChooseUsSection from '../../components/home/WhyChooseUsSection';

export default function AboutPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    async function load() {
      const c = await getWebsiteContent();
      setContent(c);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">
            About Our Company
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
            The Story of UBAN HARKALLA
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl mx-auto">
            Providing reliable consumer electronics, genuine smartphones, and dedicated retail excellence in Kano and nationwide.
          </p>
        </div>
      </div>

      <AboutSection
        aboutContent={content?.about}
        missionVisionContent={content?.missionVision}
      />

      <CeoSection ceoContent={content?.ceo} />

      <WhyChooseUsSection />
    </div>
  );
}
