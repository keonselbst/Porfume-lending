import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowDown, Menu, X, Plus } from 'lucide-react';
import { Button } from '../ui/button';

const links = [['collection', 'Коллекция'], ['philosophy', 'Философия'], ['origin', 'Наш мир']];

export const Header = ({ onContact }) => {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header" data-testid="site-header">
      <a className="wordmark" href="#" aria-label="ТИШЬ — на главную" data-testid="header-logo">тиш<span>ь</span><span className="logo-dot">®</span></a>
      <nav className="desktop-nav" aria-label="Главная навигация" data-testid="desktop-navigation">
        {links.map(([id, text]) => <a href={`#${id}`} key={id} data-testid={`nav-${id}`}>{text}</a>)}
      </nav>
      <div className="header-actions">
        <span className="locale" data-testid="site-language">RU <span> / </span> РОССИЯ</span>
        <Button variant="outline" className="header-cta" onClick={onContact} data-testid="header-select-fragrance">Найти свой аромат <ArrowUpRight size={15} /></Button>
        <button className="mobile-menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} data-testid="mobile-menu-toggle">{open ? <X /> : <Menu />}</button>
      </div>
      <AnimatePresence>{open && <motion.nav className="mobile-nav" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} aria-label="Мобильная навигация" data-testid="mobile-navigation">
        {links.map(([id, text], index) => <a href={`#${id}`} key={id} onClick={() => setOpen(false)} data-testid={`mobile-nav-${id}`}><span>0{index + 1}</span>{text}<ArrowUpRight size={20} /></a>)}
        <Button className="pill-button" onClick={() => { setOpen(false); onContact(); }} data-testid="mobile-select-fragrance">Найти свой аромат <ArrowUpRight /></Button>
      </motion.nav>}</AnimatePresence>
    </header>
  );
};

export const Hero = ({ onDiscover, loaded }) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 110]);
  const x = useSpring(pointer.x, { stiffness: 40, damping: 25 });
  const y = useSpring(pointer.y, { stiffness: 40, damping: 25 });
  const follow = e => {
    if (reduced || e.pointerType !== 'mouse') return;
    const bounds = e.currentTarget.getBoundingClientRect();
    setPointer({ x: (e.clientX - bounds.left - bounds.width / 2) * 0.009, y: (e.clientY - bounds.top - bounds.height / 2) * 0.009 });
  };
  return (
    <section className="hero" ref={ref} onPointerMove={follow} onPointerLeave={() => setPointer({ x: 0, y: 0 })} aria-label="ТИШЬ. Тишина во флаконе" data-testid="hero-section">
      <motion.div className="hero-art" style={{ y: scrollY }}>
        <motion.img src="/images/hero.webp" alt="Флакон ТИШЬ Воздух с серебряной крышкой на прозрачном стекле" fetchPriority="high" style={{ x, y }} initial={{ scale: 1.08, opacity: 0 }} animate={{ scale: 1.025, opacity: 1 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} data-testid="hero-product-image" />
      </motion.div>
      <div className="hero-wash" />
      <motion.div className="hero-topline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }} data-testid="hero-eyebrow"><span className="status-dot" /> НЕЗАВИСИМЫЙ ПАРФЮМЕРНЫЙ ДОМ <span className="hero-edition">КОЛЛЕКЦИЯ 001 — 2026</span></motion.div>
      <div className="hero-copy">
        <h1 data-testid="hero-heading">{['Тишина.', 'Во флаконе.'].map((line, i) => <span className="line-mask" key={line}><motion.span initial={{ y: '115%', rotate: 3 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: 1.2, delay: 0.2 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}>{line}</motion.span></span>)}</h1>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.9 }}>
          <p className="hero-description" data-testid="hero-description">Ароматы, которым не нужно быть громкими,<br className="desktop-break" /> чтобы остаться в памяти.</p>
          <Button asChild className="pill-button hero-cta"><a href="#collection" data-testid="hero-explore-collection">Открыть коллекцию <ArrowUpRight size={18} /></a></Button>
        </motion.div>
      </div>
      {loaded && <motion.button className="hero-product-tag" onClick={onDiscover} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} data-testid="hero-featured-product" aria-label="Подробнее об аромате Воздух"><span className="product-hotspot"><Plus size={18} /></span><span><span className="tag-eyebrow">ЗНАКОМЬТЕСЬ</span><span className="tag-title">01 — Воздух</span></span><ArrowUpRight size={17} /></motion.button>}
      <div className="hero-bottom" data-testid="hero-bottom-caption"><a href="#philosophy" className="scroll-hint" data-testid="hero-scroll-down"><ArrowDown size={15} /><span>ПОЧУВСТВУЙТЕ БОЛЬШЕ</span></a><span className="hero-bottom-center">СОЗДАНО В РОССИИ. ВДОХНОВЛЕНО ВАМИ.</span><span className="hero-page-number">01 <span>/ 03</span></span></div>
    </section>
  );
};