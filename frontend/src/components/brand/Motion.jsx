import { motion } from 'framer-motion';

export const Reveal = ({ children, className = '', delay = 0, ...props }) => (
  <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }} className={className} {...props}>
    {children}
  </motion.div>
);

export const Chapter = ({ number, children, id }) => (
  <div className="chapter-label" data-testid={`${id}-chapter-label`}><span>{number} /</span><span>{children}</span></div>
);