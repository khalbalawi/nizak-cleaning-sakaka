const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
});

mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const comparison = document.querySelector('.comparison');
const comparisonRange = comparison?.querySelector('input[type="range"]');
comparisonRange?.addEventListener('input', (event) => {
  comparison.style.setProperty('--position', `${event.target.value}%`);
});

const today = new Date();
const dateInput = document.querySelector('#date');
if (dateInput) {
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  dateInput.min = localDate;
}

const form = document.querySelector('#booking-form');
const errorBox = form?.querySelector('.form-error');
const locationInput = form?.querySelector('#location');
const locationButton = form?.querySelector('#get-location');
const locationStatus = form?.querySelector('#location-status');

locationButton?.addEventListener('click', () => {
  locationStatus.className = 'location-status';

  if (!navigator.geolocation) {
    locationStatus.textContent = 'تحديد الموقع غير مدعوم في هذا المتصفح. يمكنك لصق رابط Google Maps يدويًا.';
    locationStatus.classList.add('show', 'error');
    return;
  }

  locationButton.disabled = true;
  locationButton.lastChild.textContent = ' جارٍ تحديد الموقع...';

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const latitude = coords.latitude.toFixed(6);
      const longitude = coords.longitude.toFixed(6);
      locationInput.value = `https://www.google.com/maps?q=${latitude},${longitude}`;
      locationStatus.textContent = 'تم تحديد موقع المنزل بنجاح وسيُرفق مع طلب الحجز.';
      locationStatus.classList.add('show');
      locationButton.disabled = false;
      locationButton.lastChild.textContent = ' تحديث موقعي الحالي';
    },
    (error) => {
      const denied = error.code === error.PERMISSION_DENIED;
      locationStatus.textContent = denied
        ? 'لم يتم السماح بالوصول للموقع. فعّل إذن الموقع أو الصق رابط Google Maps يدويًا.'
        : 'تعذر تحديد الموقع الآن. حاول مرة أخرى أو الصق رابط Google Maps يدويًا.';
      locationStatus.classList.add('show', 'error');
      locationButton.disabled = false;
      locationButton.lastChild.textContent = ' تحديد موقعي الحالي';
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
  );
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  errorBox.classList.remove('show');

  const data = new FormData(form);
  const services = data.getAll('service');
  const phone = String(data.get('phone') || '').trim();
  const errors = [];

  if (!String(data.get('name') || '').trim()) errors.push('يرجى إدخال الاسم الكريم.');
  if (!/^05\d{8}$/.test(phone)) errors.push('يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05.');
  if (!String(data.get('area') || '').trim()) errors.push('يرجى إدخال الحي أو المنطقة.');
  if (!services.length) errors.push('يرجى اختيار خدمة واحدة على الأقل.');
  if (!data.get('date')) errors.push('يرجى اختيار تاريخ الزيارة.');

  if (errors.length) {
    errorBox.textContent = errors.join(' ');
    errorBox.classList.add('show');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const visitDate = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { dateStyle: 'long' }).format(new Date(`${data.get('date')}T12:00:00`));
  const message = [
    'السلام عليكم، أرغب في حجز خدمة من مؤسسة نيزك أعمال:',
    '',
    `الاسم: ${data.get('name')}`,
    `رقم الجوال: ${phone}`,
    `الحي / المنطقة: ${data.get('area')}`,
    `موقع المنزل: ${data.get('location') || 'لم يُحدد'}`,
    `الخدمات المطلوبة: ${services.join('، ')}`,
    `القياسات والأمتار: ${data.get('measurements') || 'غير محدد'}`,
    `تاريخ الزيارة: ${visitDate}`,
    `الوقت المفضل: ${data.get('time')}`,
    `ملاحظات: ${data.get('notes') || 'لا توجد'}`,
  ].join('\n');

  window.open(`https://wa.me/966539397049?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
  : null;

document.querySelectorAll('.reveal').forEach((element) => {
  if (observer) observer.observe(element);
  else element.classList.add('visible');
});
