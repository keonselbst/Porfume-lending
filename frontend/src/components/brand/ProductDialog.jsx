import { ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { formatPrice } from './Collection';

export const ProductDialog = ({ product, onClose, onContact, shopUrl }) => (
  <Dialog open={!!product} onOpenChange={open => !open && onClose()}>
    <DialogContent className="product-dialog brand-dialog" data-testid="product-dialog" data-lenis-prevent>
      {product && <><div className={`detail-image image-${product.id}`}><img src={product.image} alt={`Флакон ТИШЬ ${product.name}`} data-testid="product-detail-image" /><span className="detail-image-caption">ТИШЬ / КОЛЛЕКЦИЯ 001</span></div><div className="detail-copy"><span className="eyebrow" data-testid="product-detail-number">№ {product.number} · {product.family}</span><DialogTitle className="detail-title" data-testid="product-detail-title">{product.name}</DialogTitle><p className="detail-subtitle" data-testid="product-detail-subtitle">{product.subtitle}</p><DialogDescription className="detail-description" data-testid="product-detail-description">{product.description}</DialogDescription><div className="notes-pyramid" data-testid="product-detail-notes">{Object.entries(product.pyramid).map(([label, notes], i) => <div key={label} data-testid={`product-note-level-${i}`}><span>{label}</span><span>{notes}</span></div>)}</div><div className="detail-price-row" data-testid="product-detail-price"><span>{formatPrice(product.price)}</span><span>EAU DE PARFUM · {product.volume} МЛ</span></div>
        {shopUrl ? <Button asChild className="pill-button detail-action"><a href={shopUrl} target="_blank" rel="noopener noreferrer" data-testid="product-shop-link">Перейти в магазин <ArrowUpRight /></a></Button> : <><Button className="pill-button detail-action" onClick={() => onContact(product, 'availability')} data-testid="product-availability-button">Узнать о старте продаж <ArrowUpRight /></Button><p className="detail-launch-note" data-testid="product-launch-notice">Готовим первую коллекцию. Оставьте заявку, чтобы узнать о её выходе.</p></>}
        <button className="text-link" onClick={() => onContact(product)} data-testid="product-personal-selection">Подойдёт ли мне? Помогите с выбором <ArrowUpRight size={14} /></button>
      </div></>}
    </DialogContent>
  </Dialog>
);