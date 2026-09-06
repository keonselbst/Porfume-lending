import { useCallback, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { Header, Hero } from './components/brand/Hero';
import { Collection } from './components/brand/Collection';
import { Manifesto, Origin, Marquee, Invitation, Footer } from './components/brand/Editorial';
import { ProductDialog } from './components/brand/ProductDialog';
import { ContactDialog } from './components/brand/ContactDialog';
import { PrivacyDialog } from './components/brand/PrivacyDialog';
import { fetchCollection } from './lib/api';
import 'lenis/dist/lenis.css';
import './App.css';

export default function App() {
  const [products, setProducts] = useState([]);
  const [shopUrl, setShopUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [product, setProduct] = useState(null);
  const [contact, setContact] = useState(null);
  const [privacy, setPrivacy] = useState(false);

  const loadCollection = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await fetchCollection();
      setProducts(data.products); setShopUrl(data.shop_url);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCollection(); }, [loadCollection]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true, anchors: true });
    let raf;
    const frame = time => { lenis.raf(time); raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  const selectFragrance = (selected = null, intent = 'selection') => {
    setProduct(null); setContact({ product: selected, intent });
  };

  return (
    <MotionConfig reducedMotion="user">
      <a href="#collection" className="skip-link" data-testid="skip-to-collection">Перейти к коллекции</a>
      <Header onContact={() => selectFragrance()} />
      <main data-testid="brand-homepage">
        <Hero onDiscover={() => setProduct(products[0] || null)} loaded={products.length > 0} />
        <Manifesto />
        <Collection products={products} loading={loading} error={error} onRetry={loadCollection} onSelect={setProduct} />
        <Marquee />
        <Origin />
        <Invitation onContact={() => selectFragrance()} />
      </main>
      <Footer onPrivacy={() => setPrivacy(true)} onContact={() => selectFragrance()} />
      <ProductDialog product={product} onClose={() => setProduct(null)} onContact={selectFragrance} shopUrl={shopUrl} />
      <ContactDialog config={contact} products={products} onClose={() => setContact(null)} onPrivacy={() => setPrivacy(true)} />
      <PrivacyDialog open={privacy} onClose={() => setPrivacy(false)} />
      <Toaster position="bottom-center" richColors />
    </MotionConfig>
  );
}