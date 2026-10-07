import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BiolegendLogo } from '@/components/ui/biolegend-logo';
import HeroSlider from '@/components/HeroSlider';
import IntroSection from '@/components/IntroSection';
import ProductCarousel from '@/components/ProductCarousel';
import { PublicFooter } from '@/components/PublicFooter';
import { useWebCategories } from '@/hooks/useWebCategories';
import { useSEO } from '@/hooks/useSEO';
import { generateOrganizationSchema } from '@/utils/seoHelpers';
import { useCompanyConfig } from '@/hooks/useCompanyConfig';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const companyConfig = useCompanyConfig();
  const { categories } = useWebCategories();

  useSEO(
    {
      title: `Home - ${companyConfig.name}`,
      description: companyConfig.description || 'Trusted distributor of critical care supplies, hospital consumables, and furniture. Over 10 years of serving healthcare facilities across Africa.',
      keywords: 'medical supplies, hospital equipment, critical care, healthcare distributor, Africa',
      url: '/',
      image: companyConfig.logo_url,
    },
    generateOrganizationSchema(companyConfig)
  );

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '#about' },
    {
      label: 'Our Products',
      href: '#',
      submenu: categories.map((cat) => ({ name: cat.name, slug: cat.slug })),
    },
    { label: 'Talk to us', href: '#talk-to-us' },
  ];

  const partners = [
    { name: 'Merck Millipore', icon: '🔬', image: '/partner-logos/merck-millipore.png', type: 'Manufacturer' },
    { name: 'Sartorius', icon: '⚗️', image: '/partner-logos/sartorius.png', type: 'Manufacturer' },
    { name: 'Sigma', icon: '🧪', image: '/partner-logos/sigma-aldrich.png', type: 'Manufacturer' },
    { name: 'Memmert', icon: '🌡️', image: '/partner-logos/memmert.png', type: 'Manufacturer' },
    { name: 'Hanna Instruments', icon: '📟', image: '', type: 'Manufacturer' },
    { name: 'Palintest', icon: '💧', image: '/partner-logos/palintest.png', type: 'Manufacturer' },
    { name: 'Scion Instruments', icon: '🔭', image: '/partner-logos/scion-instruments.png', type: 'Manufacturer' },
    { name: 'SLEE GmbH', icon: '🧬', image: '/partner-logos/slee.png', type: 'Manufacturer' },
    { name: 'HERMLE LaborTechnik', icon: '🔁', image: '/partner-logos/hermle.png', type: 'Manufacturer' },
    { name: 'TRACE 2O', icon: '🌊', image: '/partner-logos/trace2o.png', type: 'Manufacturer' },
    { name: 'MOPEC', icon: '🏥', image: '/partner-logos/mopec.png', type: 'Manufacturer' },
    { name: 'MOIST TECH CORP', icon: '💧', image: '/partner-logos/moist-tech.png', type: 'Manufacturer' },
  ];


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-md z-50 border-b border-transparent bg-gradient-to-r from-white via-white to-neutral-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-20 gap-4 sm:gap-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <BiolegendLogo size="md" showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 ml-auto">
              {navigationItems.map((item) => {
              if (item.label === 'Talk to us') {
                return (
                  <Link
                    key={item.label}
                    to="/contact"
                    className="text-gray-700 hover:text-primary transition-colors font-medium text-sm lg:text-base px-2 py-2 rounded hover:bg-gray-100"
                    aria-label={`Talk to us - Contact ${companyConfig.name}`}
                  >
                    {item.label}
                  </Link>
                );
              }
              if (item.label === 'About Us') {
                return (
                  <Link
                    key={item.label}
                    to="/about-us"
                    className="text-gray-700 hover:text-primary transition-colors font-medium text-sm lg:text-base px-2 py-2 rounded hover:bg-gray-100"
                    aria-label={`About Us - Learn about ${companyConfig.name}`}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div key={item.label} className="relative group">
                  <a
                    href={item.href}
                    className="text-gray-700 hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm lg:text-base px-2 py-2 rounded hover:bg-gray-100"
                    role="button"
                    aria-haspopup="true"
                  >
                    {item.label}
                    {item.submenu && <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-200" />}
                  </a>
                  {item.submenu && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-100 before:absolute before:bottom-full before:right-8 before:w-6 before:h-4 before:bg-white before:border-t-2 before:border-l-2 before:border-gray-100 before:rotate-45" style={{ minWidth: 'min(500px, calc(100vw - 2rem))' }}>
                      <div className="grid grid-cols-3 lg:grid-cols-5 gap-x-4 lg:gap-x-8 gap-y-4 p-4 lg:p-6">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.slug}
                            to={`/products/${sub.slug}`}
                            className="flex flex-col items-center text-center group/item transition-all duration-200 hover:scale-110"
                            role="menuitem"
                          >
                            <div className="mb-2 transition-transform group-hover/item:scale-125 text-xl lg:text-2xl">
                              {categories.find((c) => c.slug === sub.slug)?.icon || '📦'}
                            </div>
                            <span className="text-xs lg:text-sm text-gray-700 group-hover/item:text-primary group-hover/item:font-semibold transition-colors leading-tight">
                              {sub.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1 border-t border-gray-200" id="mobile-nav" role="navigation" aria-label="Mobile menu">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  {item.label === 'Talk to us' ? (
                    <Link
                      to="/contact"
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-primary/10 active:bg-primary/20 rounded font-medium text-base transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : item.label === 'About Us' ? (
                    <Link
                      to="/about-us"
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-primary/10 active:bg-primary/20 rounded font-medium text-base transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : item.label === 'Home' ? (
                    <Link
                      to="/"
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-primary/10 active:bg-primary/20 rounded font-medium text-base transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          item.submenu && setProductsDropdownOpen(!productsDropdownOpen)
                        }
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-primary/10 active:bg-primary/20 rounded flex justify-between items-center font-medium text-base transition-colors"
                        aria-expanded={productsDropdownOpen}
                        aria-controls="mobile-products-submenu"
                      >
                        {item.label}
                        {item.submenu && item.submenu.length > 0 && (
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                      {item.submenu && productsDropdownOpen && (
                        <div className="bg-gray-50 pl-4 py-2 space-y-1" id="mobile-products-submenu">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.slug}
                              to={`/products/${sub.slug}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:text-primary hover:bg-primary/5 active:bg-primary/10 rounded transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section with Slider */}
      <HeroSlider />

      {/* Intro Section */}
      <IntroSection />

      {/* Product Carousel Section */}
      <ProductCarousel />

      {/* Our Goals Section */}
      <section className="py-12 sm:py-24 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3 sm:mb-4">Our Goals</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Committed to delivering excellence in healthcare solutions across Africa
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="group relative bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Quality Products</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Supply only the highest quality hospital consumables and equipment to ensure patient safety and care excellence.
                </p>
              </div>
            </div>
            <div className="group relative bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Affordable Pricing</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Make quality healthcare products accessible to all healthcare institutions across Africa.
                </p>
              </div>
            </div>
            <div className="group relative bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Fast Delivery</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Reliable and timely delivery of critical care supplies to healthcare facilities across the continent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-12 sm:py-24 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3 sm:mb-4">Our Partners</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Trusted by leading healthcare institutions across Africa
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-start min-h-auto shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 hover:border-maroon cursor-pointer"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-maroon/0 via-transparent to-neutral-500/0 group-hover:from-maroon/10 group-hover:to-neutral-500/10 transition-all duration-300 rounded-xl sm:rounded-2xl"></div>

                {/* Gradient border accent */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-maroon to-neutral-700 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-start text-center w-full gap-2 sm:gap-3">
                  {/* Icon */}
                  <div className="group-hover:scale-125 transition-transform duration-300 flex-shrink-0">
                    {partner.image ? (
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="h-12 sm:h-20 w-auto object-contain"
                      />
                    ) : (
                      <div className="text-2xl sm:text-4xl">
                        {partner.icon}
                      </div>
                    )}
                  </div>

                  {/* Partner Name */}
                  <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-3 break-words">
                    {partner.name}
                  </p>

                  {/* Partner Type Badge */}
                  <span className="inline-block text-[10px] sm:text-xs font-semibold px-2 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-neutral-100 to-neutral-100 text-gray-700 group-hover:from-neutral-200 group-hover:to-neutral-200 transition-colors duration-300 flex-shrink-0">
                    {partner.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Talk to Us Section */}
      <section id="talk-to-us" className="bg-gradient-to-r from-maroon via-maroon to-neutral-700 text-white py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 hidden sm:block">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mb-48"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">Talk to us</h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-6 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Interested in our products? Let's connect and discuss how we can support your healthcare needs across Africa.
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-white text-maroon hover:bg-gray-100 font-bold text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              Contact
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter productCategories={categories} />
    </div>
  );
}
