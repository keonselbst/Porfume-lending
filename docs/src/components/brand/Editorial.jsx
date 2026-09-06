import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowUp, Asterisk } from 'lucide-react';
import { Button } from '../ui/button';
import { Chapter, Reveal } from './Motion';

export const Manifesto = () => (
  <section id="philosophy" className="manifesto section-shell" data-testid="philosophy-section">
    <Reveal className="manifesto-layout"><Chapter number="01" id="philosophy">ФИЛОСОФИЯ ТИШЬ</Chapter><div className="manifesto-content"><p className="manifesto-statement" data-testid="manifesto-statement">В мире, где всё борется<br className="desktop-break" /> за внимание,<br /><span className="muted">мы выбираем</span> <span className="serif-italic">тишину.</span></p><div className="manifesto-bottom"><span className="brand-asterisk" aria-hidden="true"><Asterisk strokeWidth={0.65} size={56} /></span><p data-testid="manifesto-description">ТИШЬ — парфюмерия без лишнего.<br />Не маска. Не роль. Продолжение вас.<br />Мы создаём ароматы, которые говорят тихо.<br />И именно поэтому — о самом важном.</p></div></div></Reveal>
  </section>
);

export const Marquee = () => (
  <div className="marquee" aria-label="Меньше шума. Больше чувств." data-testid="editorial-marquee"><div className="marquee-track" aria-hidden="true">{[0, 1, 2, 3].map(n => <span className="marquee-item" key={n}>Меньше шума. <span className="serif-italic">Больше чувств.</span><Asterisk strokeWidth={0.7} /></span>)}</div></div>
);

export const Origin = () => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : -35, reduced ? 0 : 35]);
  return (
    <section id="origin" className="origin-section section-shell" ref={ref} data-testid="origin-section">
      <Reveal className="origin-photo"><motion.img src="/images/nature.webp" alt="Берёзы в утреннем тумане северного леса" loading="lazy" style={{ y }} data-testid="origin-forest-image" /><div className="photo-caption" data-testid="origin-photo-caption"><span>ТАМ, ГДЕ НАЧИНАЕТСЯ ТИШИНА</span><span>61° С. Ш. / 34° В. Д.</span></div></Reveal>
      <Reveal className="origin-copy" delay={0.1}><Chapter number="03" id="origin">БЛИЖЕ К ИСТОКАМ</Chapter><h2 className="editorial-heading" data-testid="origin-heading">Север внутри.<br /><span className="muted">Свобода снаружи.</span></h2><p data-testid="origin-description">Нас вдохновляет не мода. Нас вдохновляют прозрачный воздух, свет на воде и лес после дождя. Места, в которых не нужно ничего объяснять.</p><p className="muted" data-testid="origin-secondary-description">Мы переводим эти ощущения на язык парфюмерии. Бережно. Честно. Без лишних слов.</p><div className="origin-signature" data-testid="origin-signature"><span className="wordmark small-wordmark">тишь</span><span>НЕЗАВИСИМЫЙ ДОМ.<br />РОССИЙСКИЙ ХАРАКТЕР.</span></div></Reveal>
    </section>
  );
};

export const Invitation = ({ onContact }) => (
  <section id="selection" className="invitation section-shell" data-testid="selection-section"><Reveal className="invitation-inner"><span className="invitation-eyebrow" data-testid="selection-eyebrow"><span className="status-dot" /> ЛИЧНОЕ ЗНАКОМСТВО</span><h2 className="invitation-heading" data-testid="selection-heading">У каждого своя <span className="serif-italic">тишь.</span></h2><p data-testid="selection-description">Расскажите немного о себе.<br />А мы поможем найти аромат, который почувствуется вашим.</p><Button className="pill-button" onClick={onContact} data-testid="selection-open-form">Найти свою тишь <ArrowUpRight size={18} /></Button><span className="invitation-note" data-testid="selection-note">ПЕРСОНАЛЬНЫЙ ПОДБОР · БЕЗ СПЕШКИ И ОБЯЗАТЕЛЬСТВ</span></Reveal></section>
);

export const Footer = ({ onPrivacy, onContact }) => (
  <footer className="site-footer section-shell" data-testid="site-footer"><div className="footer-top"><a href="#" className="footer-wordmark" aria-label="ТИШЬ — к началу страницы" data-testid="footer-logo">тишь<span>®</span></a><p className="footer-tagline" data-testid="footer-tagline">Не громче.<br />Ближе.</p><div className="footer-links"><a href="#collection" data-testid="footer-collection">Коллекция <ArrowUpRight size={14} /></a><a href="#philosophy" data-testid="footer-philosophy">Философия <ArrowUpRight size={14} /></a><button onClick={onContact} data-testid="footer-contact">Связаться с нами <ArrowUpRight size={14} /></button></div></div><div className="footer-bottom"><span data-testid="footer-copyright">© ТИШЬ, {new Date().getFullYear()}</span><span className="footer-origin" data-testid="footer-origin">ПАРФЮМЕРИЯ КАК ОЩУЩЕНИЕ.</span><button onClick={onPrivacy} data-testid="footer-privacy">Конфиденциальность</button><a href="#" className="back-top" aria-label="Наверх" data-testid="footer-back-top"><ArrowUp size={16} /></a></div></footer>
);