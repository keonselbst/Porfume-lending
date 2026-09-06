import { ArrowUpRight, Plus, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Chapter, Reveal } from './Motion';
import { Button } from '../ui/button';

export const formatPrice = price => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';

export const Collection = ({ products, loading, error, onRetry, onSelect }) => (
  <section id="collection" className="collection-section section-shell" data-testid="collection-section">
    <Reveal><Chapter number="02" id="collection">КОЛЛЕКЦИЯ СОСТОЯНИЙ</Chapter>
      <div className="section-heading-row"><h2 className="editorial-heading" data-testid="collection-heading">Не просто аромат.<br /><span className="muted">Ваше состояние.</span></h2><p className="section-aside" data-testid="collection-intro">Три характера. Три способа быть собой.<br />Найдите тот, что звучит в унисон с вами.</p></div>
    </Reveal>
    {loading ? <div className="product-grid" aria-busy="true" data-testid="collection-loading">{[1, 2, 3].map(n => <div className="product-skeleton" key={n} />)}</div> : error ? <div className="collection-error" role="alert" data-testid="collection-error"><p>Коллекция не загрузилась. Попробуем ещё раз?</p><Button variant="outline" onClick={onRetry} data-testid="collection-retry"><RotateCw size={16} /> Обновить коллекцию</Button></div> : <div className="product-grid" data-testid="collection-products">
      {products.map((product, i) => <Reveal key={product.id} delay={i * 0.1} className="product-card" data-testid={`product-card-${product.id}`}>
        <motion.button className={`product-image-button image-${product.id}`} onClick={() => onSelect(product)} whileHover="hover" initial="rest" aria-label={`Открыть аромат ${product.name}`} data-testid={`product-open-${product.id}`}>
          <motion.img src={product.image} alt={`Парфюмерная вода ТИШЬ ${product.name}, ${product.volume} мл`} loading="lazy" variants={{ rest: { scale: 1 }, hover: { scale: 1.045 } }} transition={{ duration: 0.7 }} data-testid={`product-image-${product.id}`} />
          <span className="product-number">№ {product.number}</span><span className="product-family">{product.family}</span><span className="product-plus"><Plus size={20} strokeWidth={1.3} /></span>
        </motion.button>
        <div className="product-caption"><div><button className="product-name" onClick={() => onSelect(product)} data-testid={`product-name-${product.id}`}>{product.name}<ArrowUpRight size={20} /></button><p className="product-notes" data-testid={`product-notes-${product.id}`}>{product.notes.join(' · ')}</p></div><div className="product-pricing" data-testid={`product-price-${product.id}`}><span>{formatPrice(product.price)}</span><small>EAU DE PARFUM · {product.volume} МЛ</small></div></div>
      </Reveal>)}
    </div>}
    <Reveal><div className="collection-footnote" data-testid="collection-footnote"><span>БЕЗ ГЕНДЕРА. БЕЗ ПРАВИЛ. ТОЛЬКО ОЩУЩЕНИЯ.</span><span>ПЕРВАЯ КОЛЛЕКЦИЯ <span className="tiny-dot" /> ПРЕДЗАПУСК</span></div></Reveal>
  </section>
);