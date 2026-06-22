import { Restaurant, Order, OrderItem } from '../types';

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
