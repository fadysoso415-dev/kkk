import { Restaurant, Order, OrderItem, Category, Product } from './types';

export interface PrintTemplateOptions {
  lang?: 'ar' | 'en';
  currency?: string;
  taxRate?: number;
}

/**
 * Generates an elegant and professional thermal receipt HTML template (standard 80mm width).
 */
export function generateThermalReceiptHtml(
  restaurant: Restaurant,
  order: Order,
  options: PrintTemplateOptions = {}
): string {
  const lang = options.lang || 'ar';
  const currency = options.currency || restaurant.currency || 'ج.م';
  
  const formattedDate = order.timestamp 
    ? new Date(order.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        timeZone: 'Africa/Cairo',
        hour12: true,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        timeZone: 'Africa/Cairo',
        hour12: true,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  const displayTax = (order as any).taxAmount || 0;
  const displayDiscount = (order as any).discountAmount || 0;
  const baseTotal = order.totalPrice - displayTax + displayDiscount;

  const paymentMethodVal = (order as any).paymentMethod || 'cash';
  const paymentMethodText = lang === 'ar' 
    ? (paymentMethodVal === 'card' ? 'بطاقة / شبكة 💳' : paymentMethodVal === 'due' ? 'ذمم / على الحساب 🤵' : 'نقداً / كاش 💵')
    : (paymentMethodVal === 'card' ? 'Card / POS 💳' : paymentMethodVal === 'due' ? 'On Account 🤵' : 'Cash 💵');

  const orderTypeVal = (order as any).orderType || 'dine_in';
  const orderTypeText = lang === 'ar'
    ? (orderTypeVal === 'takeaway' ? 'سفري / تيك اواي 🛍️' : orderTypeVal === 'delivery' ? 'توصيل / ديلفري 🛵' : 'صالة / داخلي 🍽️')
    : (orderTypeVal === 'takeaway' ? 'Takeaway 🛍️' : orderTypeVal === 'delivery' ? 'Delivery 🛵' : 'Dine In 🍽️');

  const itemsHtml = order.items.map((it: OrderItem) => `
    <tr class="item-row">
      <td class="item-name">
        ${it.name}
        ${it.size ? `<br><span class="item-size">(${it.size})</span>` : ''}
      </td>
      <td class="item-qty">x${it.quantity}</td>
      <td class="item-price">${(it.price * it.quantity).toFixed(2)} ${currency}</td>
    </tr>
  `).join('');

  const isRtl = lang === 'ar';

  return `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8">
        <title>${isRtl ? 'فاتورة' : 'Receipt'} - ${restaurant.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap');
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body { 
            font-family: ${isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"}; 
            width: 80mm; 
            margin: 0 auto; 
            padding: 12px 10px; 
            color: #000; 
            font-size: 11px;
            line-height: 1.4;
            background: #fff;
          }
          
          .text-center { text-align: center; }
          .text-left { text-align: ${isRtl ? 'right' : 'left'}; }
          .text-right { text-align: ${isRtl ? 'left' : 'right'}; }
          
          .header { 
            text-align: center; 
            margin-bottom: 12px; 
          }
          
          .logo { 
            max-width: 55px; 
            max-height: 55px; 
            border-radius: 50%; 
            margin: 0 auto 6px auto; 
            object-fit: cover;
            border: 1px solid #ddd;
          }
          
          .brand-name { 
            font-size: 15px; 
            font-weight: 800; 
            color: #111;
            margin-bottom: 2px;
          }
          
          .subtitle { 
            font-size: 9.5px; 
            color: #555; 
            margin-bottom: 4px;
          }
          
          .divider { 
            border-top: 1px dashed #222; 
            margin: 8px 0; 
          }
          
          .double-divider { 
            border-top: 2px double #222; 
            margin: 8px 0; 
          }
          
          .meta-info {
            font-size: 10px;
            margin-bottom: 8px;
            color: #333;
          }
          
          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          
          .meta-label {
            font-weight: 600;
            opacity: 0.85;
          }
          
          .meta-value {
            font-weight: 700;
          }

          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 8px 0;
          }
          
          th { 
            border-bottom: 1px dashed #222; 
            padding: 5px 0; 
            font-size: 10px; 
            font-weight: 700;
            text-align: ${isRtl ? 'right' : 'left'};
          }
          
          th.qty-col, td.item-qty {
            text-align: center;
            width: 45px;
          }
          
          th.price-col, td.item-price {
            text-align: ${isRtl ? 'left' : 'right'};
            width: 75px;
          }
          
          .item-row td {
            padding: 6px 0;
            vertical-align: top;
            font-size: 10.5px;
          }
          
          .item-name {
            font-weight: 600;
          }
          
          .item-size {
            font-size: 8.5px;
            color: #444;
            font-weight: normal;
          }
          
          .totals-table td {
            padding: 3px 0;
            font-size: 10px;
          }
          
          .totals-table .grand-total {
            font-size: 12.5px;
            font-weight: 800;
            border-top: 1px dashed #222; 
            padding-top: 6px;
          }
          
          .notes-box { 
            margin-top: 10px; 
            font-size: 9px; 
            color: #444; 
            background: #f6f6f6; 
            padding: 6px; 
            border-radius: 4px;
            border: 1px solid #eee;
            line-height: 1.3;
          }
          
          .footer { 
            text-align: center; 
            font-size: 9px; 
            margin-top: 16px; 
            color: #444; 
            line-height: 1.4; 
          }
          
          @media print {
            body { 
              width: 100%; 
              margin: 0; 
              padding: 0px 4px; 
            }
            @page { 
              size: auto; 
              margin: 0mm; 
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${restaurant.logo ? `<img class="logo" src="${restaurant.logo}" alt="Log" />` : ''}
          <div class="brand-name">${restaurant.name}</div>
          <div class="subtitle">${isRtl ? 'فاتورة حساب نقاط البيع POS' : 'POS Sales Receipt'}</div>
        </div>
        
        <div class="meta-info">
          <div class="meta-row">
            <span class="meta-label">${isRtl ? 'رقم الطلب:' : 'Order ID.'}</span>
            <span class="meta-value font-mono">${order.id ? order.id.toUpperCase().slice(0, 10) : 'N/A'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">${isRtl ? 'التاريخ والوقت:' : 'Date & Time'}</span>
            <span class="meta-value">${formattedDate}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">${isRtl ? 'نوع الطلب المختار:' : 'Delivery Type'}</span>
            <span class="meta-value">${order.tableName} ${orderTypeText}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">${isRtl ? 'طريقة السداد:' : 'Payment Method'}</span>
            <span class="meta-value">${paymentMethodText}</span>
          </div>
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th class="name-col">${isRtl ? 'الصنف والأبعاد' : 'Item Description'}</th>
              <th class="qty-col">${isRtl ? 'الكمية' : 'Qty'}</th>
              <th class="price-col">${isRtl ? 'الإجمالي' : 'Price'}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="double-divider"></div>

        <table class="totals-table">
          <tr>
            <td>${isRtl ? 'المجموع الفرعي الأولي:' : 'Subtotal:'}</td>
            <td class="text-right">${baseTotal.toFixed(2)} ${currency}</td>
          </tr>
          ${displayDiscount > 0 ? `
          <tr style="color: #000;">
            <td style="font-weight: 700;">${isRtl ? 'الخصم المباشر:' : 'Direct Discount:'}</td>
            <td class="text-right" style="font-weight: 700;">-${displayDiscount.toFixed(2)} ${currency}</td>
          </tr>
          ` : ''}
          ${displayTax > 0 ? `
          <tr>
            <td>${isRtl ? 'الخدمة وضريبة المبيعات (14%):' : 'VAT / Sales Tax (14%):'}</td>
            <td class="text-right">+${displayTax.toFixed(2)} ${currency}</td>
          </tr>
          ` : ''}
          <tr class="grand-total">
            <td>${isRtl ? 'الإجمالي النهائي المطلوب:' : 'Grand Total:'}</td>
            <td class="text-right">${order.totalPrice.toFixed(2)} ${currency}</td>
          </tr>
        </table>

        ${order.notes ? `
          <div class="notes-box">
            <strong>${isRtl ? 'ملاحظات الكاشير:' : 'Cashier Notes:'}</strong>
            <p>${order.notes}</p>
          </div>
        ` : ''}

        <div class="divider"></div>
        <div class="footer">
          ${isRtl ? 'شكراً لزيارتكم واختياركم لنا!' : 'Thank you for your business!'}
          <br>
          ${isRtl ? 'أهلاً بك وسهلاً في أي وقت 🍕🥂' : 'Come back and see us again!'}
        </div>

        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() { window.close(); }, 600);
          };
        </script>
      </body>
    </html>
  `;
}

/**
 * Universal printer function that works seamlessly inside sandboxed iframes using a hidden print context.
 */
export function printReceiptClassic(
  restaurant: Restaurant,
  order: Order,
  options: PrintTemplateOptions = {}
): boolean {
  try {
    const html = generateThermalReceiptHtml(restaurant, order, options);

    // Technique 1: Create a hidden iframe.
    // This side-steps iframe browser constraints (e.g., 'allow-popups') and avoids popup blockers.
    const iframeId = 'pos-silent-printer-frame';
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    
    if (iframe) {
      document.body.removeChild(iframe);
    }
    
    iframe = document.createElement('iframe') as HTMLIFrameElement;
    iframe.id = iframeId;
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      throw new Error('Frame context is busy or unavailable');
    }
    
    doc.open();
    doc.write(html);
    doc.close();

    // Trigger printed window call asynchronously once the asset is loaded in frame
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        // Fallback popup method if iframe printing is blocked
        const popup = window.open('', '_blank', 'width=340,height=550');
        if (popup) {
          popup.document.write(html);
          popup.document.close();
        }
      }
    }, 500);

    return true;
  } catch (error) {
    console.error('POS Printer Exception:', error);
    return false;
  }
}

/**
 * Generates an elegant, professional, print-optimized A4/Letter restaurant menu layout.
 */
export function generateMenuPrintHtml(
  restaurant: Restaurant,
  categories: Category[],
  products: Product[],
  options: { lang?: 'ar' | 'en' } = {}
): string {
  const lang = options.lang || 'ar';
  const isRtl = lang === 'ar';
  
  const resName = isRtl ? restaurant.name : (restaurant.nameEn || restaurant.name);
  const resSubtitle = isRtl ? restaurant.welcomeSubtitle : (restaurant.welcomeSubtitleEn || restaurant.welcomeSubtitle);
  const resAddress = isRtl ? restaurant.address : (restaurant.addressEn || restaurant.address);
  const currency = isRtl ? (restaurant.currency || 'ج.م') : (restaurant.currencyEn || restaurant.currency || 'EGP');

  const menuUrl = `${window.location.origin}${window.location.pathname}?menu=${restaurant.slug}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(menuUrl)}&color=0-0-0&margin=5`;

  // Sort active categories
  const sortedCategories = [...categories]
    .filter(c => c.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const categoriesHtml = sortedCategories.map(cat => {
    const catName = isRtl ? cat.name : (cat.nameEn || cat.name);
    
    // Get products for this category
    const catProducts = [...products]
      .filter(p => p.categoryId === cat.id && p.isAvailable !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (catProducts.length === 0) return '';

    const productsHtml = catProducts.map(p => {
      const pName = isRtl ? p.name : (p.nameEn || p.name);
      const pDesc = isRtl ? p.description : (p.descriptionEn || p.description);
      const pPrice = p.price;

      // Sizes
      let sizesHtml = '';
      if (p.sizes && p.sizes.length > 0) {
        const sizeLabels = p.sizes.map(sz => {
          const szName = isRtl ? sz.name : (sz.nameEn || sz.name);
          const szPrice = pPrice + (sz.priceAdded || 0);
          return `${szName}: ${szPrice.toFixed(2)} ${currency}`;
        });
        sizesHtml = `<div class="product-sizes">${sizeLabels.join(' | ')}</div>`;
      }

      return `
        <div class="product-item">
          <div class="product-header">
            <span class="product-name">${pName}</span>
            <span class="product-dots"></span>
            <span class="product-price">${pPrice.toFixed(2)} ${currency}</span>
          </div>
          ${pDesc ? `<div class="product-description">${pDesc}</div>` : ''}
          ${sizesHtml}
        </div>
      `;
    }).join('');

    return `
      <div class="category-block">
        <h2 class="category-title">${catName}</h2>
        <div class="menu-grid">
          ${productsHtml}
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8">
        <title>${isRtl ? 'قائمة الطعام' : 'Menu'} - ${resName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: ${isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"};
            color: #1e293b;
            background: #fff;
            padding: 10mm;
            font-size: 13px;
            line-height: 1.5;
          }
          
          /* Print optimization */
          @media print {
            body {
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
            @page {
              size: A4;
              margin: 15mm 10mm 15mm 10mm;
            }
            .category-block {
              page-break-inside: avoid;
            }
          }
          
          .menu-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #b45309; /* elegant amber border */
            padding: 30px;
            position: relative;
            border-radius: 12px;
          }
          
          /* Inner elegant thin border */
          .menu-container::after {
            content: '';
            position: absolute;
            top: 4px;
            left: 4px;
            right: 4px;
            bottom: 4px;
            border: 1px solid #f59e0b;
            pointer-events: none;
            border-radius: 8px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 2;
          }
          
          .restaurant-name {
            font-size: 28px;
            font-weight: 900;
            color: #78350f; /* deep warm amber-900 */
            margin-bottom: 6px;
            letter-spacing: -0.5px;
          }
          
          .restaurant-subtitle {
            font-size: 14px;
            font-weight: 600;
            color: #451a03;
            margin-bottom: 12px;
          }
          
          .restaurant-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 11px;
            color: #475569;
            font-weight: 600;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .separator {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
          }
          
          .separator-line {
            flex: 1;
            height: 1px;
            background: linear-gradient(to right, transparent, #d97706, transparent);
          }
          
          .separator-icon {
            color: #d97706;
            font-size: 16px;
            padding: 0 10px;
          }
          
          .category-block {
            margin-bottom: 30px;
          }
          
          .category-title {
            font-size: 16px;
            font-weight: 800;
            color: #78350f;
            text-align: center;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
          }
          
          .category-title::before, .category-title::after {
            content: '';
            height: 1px;
            flex-grow: 1;
            background: #f59e0b;
          }
          
          .menu-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px 25px;
          }
          
          @media (max-width: 640px) {
            .menu-grid {
              grid-template-columns: 1fr;
            }
          }
          
          .product-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
            page-break-inside: avoid;
          }
          
          .product-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
          }
          
          .product-name {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
          }
          
          .product-dots {
            flex-grow: 1;
            border-bottom: 1px dashed #cbd5e1;
            margin: 0 8px;
            position: relative;
            top: -4px;
          }
          
          .product-price {
            font-size: 13px;
            font-weight: 800;
            color: #b45309;
            white-space: nowrap;
          }
          
          .product-description {
            font-size: 10.5px;
            color: #64748b;
            line-height: 1.4;
          }
          
          .product-sizes {
            font-size: 9.5px;
            font-weight: 600;
            color: #854d0e;
            margin-top: 2px;
          }
          
          .footer-qr-container {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #f59e0b;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            text-align: center;
            page-break-inside: avoid;
          }
          
          .qr-text {
            font-size: 11px;
            font-weight: 700;
            color: #451a03;
            max-width: 250px;
            line-height: 1.5;
          }
          
          .qr-image {
            width: 70px;
            height: 70px;
            border: 2.5px solid #b45309;
            border-radius: 6px;
            padding: 1px;
            background: #fff;
          }
        </style>
      </head>
      <body>
        <div class="menu-container">
          <div class="header">
            <h1 class="restaurant-name">${resName}</h1>
            ${resSubtitle ? `<p class="restaurant-subtitle">${resSubtitle}</p>` : ''}
            <div class="restaurant-info">
              ${restaurant.address ? `
                <div class="info-item">
                  <span>📍</span>
                  <span>${resAddress}</span>
                </div>
              ` : ''}
              ${restaurant.phoneNumber ? `
                <div class="info-item">
                  <span>📞</span>
                  <span>${restaurant.phoneNumber}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="separator">
            <span class="separator-line"></span>
            <span class="separator-icon">✨🍽️✨</span>
            <span class="separator-line"></span>
          </div>
          
          <!-- Categories & Products -->
          ${categoriesHtml}
          
          <!-- QR Code Footer -->
          <div class="footer-qr-container">
            <div class="qr-text">
              ${isRtl 
                ? '📱 امسح الرمز لمشاهدة المنيو التفاعلي والصور، والطلب مباشرة!' 
                : '📱 Scan this code to view the interactive menu, photos, and order directly!'}
            </div>
            <img class="qr-image" src="${qrImageSrc}" alt="Menu QR Code" />
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Silent iframe printer for standard A4 Menu printing (owners can download/print as PDF).
 */
export function printMenuA4(
  restaurant: Restaurant,
  categories: Category[],
  products: Product[],
  options: { lang?: 'ar' | 'en' } = {}
): boolean {
  try {
    const html = generateMenuPrintHtml(restaurant, categories, products, options);

    const iframeId = 'menu-silent-printer-frame';
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    
    if (iframe) {
      document.body.removeChild(iframe);
    }
    
    iframe = document.createElement('iframe') as HTMLIFrameElement;
    iframe.id = iframeId;
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      throw new Error('Frame context is busy or unavailable');
    }
    
    doc.open();
    doc.write(html);
    doc.close();

    // Trigger printing
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        const popup = window.open('', '_blank');
        if (popup) {
          popup.document.write(html);
          popup.document.close();
        }
      }
    }, 800);

    return true;
  } catch (error) {
    console.error('Menu PDF Printer Exception:', error);
    return false;
  }
}
