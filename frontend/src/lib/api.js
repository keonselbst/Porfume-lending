// На Vercel фронт и бэкенд живут на одном домене, поэтому по умолчанию
// используется относительный путь `/api`, который проксируется на
// serverless-функцию через rewrites в vercel.json. Если понадобится
// отдельный бэкенд (например, при локальной разработке), задайте
// REACT_APP_BACKEND_URL — тогда запросы пойдут на указанный домен.
const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

async function request(path, options) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json();
  if (!response.ok) {
    const detail = data.detail;
    throw new Error(typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0].msg.replace('Value error, ', '') : 'Не удалось отправить заявку. Пожалуйста, попробуйте ещё раз.');
  }
  return data;
}

export const fetchCollection = () => request('/collection');
export const sendLead = (data) => request('/leads', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
});