import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { sendLead } from '../../lib/api';

export const ContactDialog = ({ config, products, onClose, onPrivacy }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [preference, setPreference] = useState('');
  const [selected, setSelected] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (config) {
      setName(''); setContact(''); setPreference(''); setSelected(config.product?.id || '');
      setConsent(false); setError(''); setSuccess(null);
    }
  }, [config]);

  const submit = async e => {
    e.preventDefault(); setError('');
    if (name.trim().length < 2 || !/\p{L}/u.test(name)) { setError('Пожалуйста, укажите ваше имя — не менее двух символов.'); return; }
    if (!contact.trim()) { setError('Укажите телефон или email, чтобы мы могли связаться с вами.'); return; }
    const digits = contact.replace(/\D/g, '');
    const validContact = contact.includes('@') ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.trim()) : /^\+?[\d\s()\-]+$/.test(contact.trim()) && digits.length >= 10 && digits.length <= 15;
    if (!validContact) { setError('Укажите корректный телефон или email.'); return; }
    if (!consent) { setError('Пожалуйста, подтвердите согласие на обработку данных.'); return; }
    setBusy(true);
    try { setSuccess(await sendLead({ name: name.trim(), contact: contact.trim(), preference, product_id: selected || null, intent: config.intent, consent })); }
    catch (err) { setError(err.message || 'Не удалось отправить заявку. Попробуйте ещё раз.'); }
    finally { setBusy(false); }
  };

  return <Dialog open={!!config} onOpenChange={open => !open && !busy && onClose()}><DialogContent className="contact-dialog brand-dialog" data-testid="contact-dialog" data-lenis-prevent>
    {success ? <div className="success-state" data-testid="contact-success"><div className="success-icon"><Check size={28} strokeWidth={1.2} /></div><span className="eyebrow">НАЧАЛО ВАШЕЙ ИСТОРИИ</span><DialogTitle data-testid="contact-success-title">Приятно познакомиться,<br />{name}.</DialogTitle><DialogDescription data-testid="contact-success-description">Ваша заявка сохранена. Вы сделали первый шаг навстречу своей тишине.</DialogDescription><span className="request-number" data-testid="contact-request-number">ЗАЯВКА № {success.id.slice(0, 8).toUpperCase()}</span><Button className="pill-button" onClick={onClose} data-testid="contact-success-close">Вернуться к коллекции <ArrowUpRight /></Button></div> : <>
      <span className="eyebrow" data-testid="contact-eyebrow">ТИШЬ / ЛИЧНОЕ ЗНАКОМСТВО</span><DialogTitle className="contact-title" data-testid="contact-title">{config?.intent === 'availability' ? 'В предвкушении тишины.' : 'Почувствуйте своё.'}</DialogTitle><DialogDescription className="contact-description" data-testid="contact-description">{config?.intent === 'availability' ? 'Оставьте контакт, чтобы узнать о выходе первой коллекции.' : 'Несколько слов о вас — начало знакомства с вашим ароматом.'}</DialogDescription>
      <form onSubmit={submit} noValidate className="contact-form" data-testid="contact-form">
        <div className="form-field"><label htmlFor="contact-name" data-testid="contact-name-label">Как к вам обращаться</label><Input id="contact-name" autoComplete="given-name" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={80} disabled={busy} data-testid="contact-name" /></div>
        <div className="form-field"><label htmlFor="contact-channel" data-testid="contact-channel-label">Телефон или email</label><Input id="contact-channel" autoComplete="off" placeholder="+7 999 123-45-67 или you@mail.ru" value={contact} onChange={e => setContact(e.target.value)} required maxLength={160} disabled={busy} data-testid="contact-channel" /></div>
        <fieldset className="fragrance-choice" disabled={busy}><legend data-testid="contact-fragrance-label">Какое настроение вам ближе?</legend><div className="choice-options">{[{ id: '', name: 'Ещё ищу' }, ...products].map(p => <button type="button" key={p.id} className={selected === p.id ? 'active' : ''} aria-pressed={selected === p.id} onClick={() => setSelected(p.id)} data-testid={`contact-choice-${p.id || 'undecided'}`}>{p.name}</button>)}</div></fieldset>
        <div className="form-field"><label htmlFor="contact-preference" data-testid="contact-preference-label">Что вы любите? <span>Необязательно</span></label><textarea id="contact-preference" placeholder="Запах моря, чистого белья или леса после дождя…" value={preference} onChange={e => setPreference(e.target.value)} maxLength={1000} rows={2} disabled={busy} data-testid="contact-preference" /></div>
        <div className="consent-row"><Checkbox id="contact-consent" checked={consent} onCheckedChange={v => setConsent(v === true)} disabled={busy} data-testid="contact-consent" /><div><label htmlFor="contact-consent" data-testid="contact-consent-label">Даю согласие на обработку персональных данных.</label> <button type="button" onClick={onPrivacy} data-testid="contact-privacy-link">Подробнее</button></div></div>
        {error && <p role="alert" className="form-error" data-testid="contact-error">{error}</p>}
        <Button type="submit" disabled={busy} className="pill-button submit-button" data-testid="contact-submit">{busy ? <><Loader2 className="animate-spin" /> Сохраняем заявку…</> : <>Начать знакомство <ArrowUpRight /></>}</Button>
      </form></>}
  </DialogContent></Dialog>;
};