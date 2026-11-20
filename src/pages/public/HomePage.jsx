import React, { useEffect, useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import {
  getProducts,
  getCategories,
  getWebsiteContent,
  getDeliveryLocations,
  getTestimonials,
} from '../../services/dataService';
import HeroSection from '../../components/home/HeroSection';
import AboutSection from '../../components/home/AboutSection';
import CeoSection from '../../components/home/CeoSection';
import FeaturedProducts from '../../components/home/FeaturedProducts';
import WhyChooseUsSection from '../../components/home/WhyChooseUsSection';
import HowItWorksSection from '../../components/home/HowItWorksSection';
import DeliveryInfoSection from '../../components/home/DeliveryInfoSection';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import ContactSection from '../../components/home/ContactSection';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Sparkles, Headphones, Cpu } from 'lucide-react';

export default function HomePage() {
  const { triggerLandingPlayback } = useAudio();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [websiteContent, setWebsiteContent] = useState(null);
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trigger brand audio playback attempt once when landing on Home
  useEffect(() => {
    triggerLandingPlayback();
  }, [triggerLandingPlayback]);

  // Load all homepage data dynamically
  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList, content, locations, reviews] = await Promise.all([
          getProducts(),
          getCategories(),
          getWebsiteContent(),
          getDeliveryLocations(),
          getTestimonials(true),
        ]);
        setProducts(prodList);
        setCategories(catList);
        setWebsiteContent(content);
        setDeliveryLocations(locations);
        setTestimonials(reviews);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleDataChanged = () => {
      loadData();
    };

    window.addEventListener('ubh-data-changed', handleDataChanged);
    window.addEventListener('storage', handleDataChanged);
    window.addEventListener('focus', handleDataChanged);

    return () => {
      window.removeEventListener('ubh-data-changed', handleDataChanged);
      window.removeEventListener('storage', handleDataChanged);
      window.removeEventListener('focus', handleDataChanged);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <HeroSection content={websiteContent?.hero} />

      {/* 2. Category Quick Cards Banner */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug || cat.id}`}
                className="group relative rounded-2xl overflow-hidden border border-slate-200/80 p-5 bg-slate-50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white border border-slate-200 shadow-xs">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                    Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <FeaturedProducts products={products} categories={categories} />

      {/* 4. About Us Section & Mission / Vision */}
      <AboutSection
        aboutContent={websiteContent?.about}
        missionVisionContent={websiteContent?.missionVision}
      />

      {/* 5. Meet the CEO */}
      <CeoSection ceoContent={websiteContent?.ceo} />

      {/* 6. Why Choose UBAN HARKALLA */}
      <WhyChooseUsSection />

      {/* 7. How It Works (7 Steps) */}
      <HowItWorksSection />

      {/* 8. Delivery Information & Rates */}
      <DeliveryInfoSection
        locations={deliveryLocations}
        pickupContent={websiteContent?.pickup}
      />

      {/* 9. Customer Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 10. Contact Section */}
      <ContactSection contactInfo={websiteContent?.contact} />
    </div>
  );
}
