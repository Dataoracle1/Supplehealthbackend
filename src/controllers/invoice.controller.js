const PDFDocument = require('pdfkit');
const Order = require('../models/Order');

// @desc    Generate a downloadable PDF invoice for an order
// @route   GET /api/orders/:id/invoice
// @access  Private (owner of the order, or admin)
const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only the order's owner or an admin can download the invoice
    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
    doc.pipe(res);

    // ── Header ──
    doc.fontSize(20).fillColor('#16a34a').text('SuppleHealth', { align: 'left' });
    doc.fontSize(10).fillColor('#6b7280').text('Premium Health Supplements', { align: 'left' });
    doc.moveDown(1.5);

    doc.fontSize(16).fillColor('#111827').text('INVOICE', { align: 'right' });
    doc.fontSize(10).fillColor('#6b7280').text(`Order #: ${order.orderNumber}`, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'right' });
    doc.text(`Status: ${order.status.toUpperCase()}`, { align: 'right' });
    doc.moveDown(1.5);

    // ── Bill to / Ship to ──
    doc.fontSize(11).fillColor('#111827').text('Bill To:', { underline: true });
    doc.fontSize(10).fillColor('#374151');
    doc.text(order.user?.name || 'Customer');
    doc.text(order.user?.email || '');
    doc.moveDown(0.5);
    doc.text(`${order.shippingAddress.street}`);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`);
    doc.text(`${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    doc.moveDown(1.5);

    // ── Items table ──
    const tableTop = doc.y;
    const col = { name: 50, qty: 300, price: 370, total: 460 };

    doc.fontSize(10).fillColor('#ffffff');
    doc.rect(50, tableTop, 500, 22).fill('#16a34a');
    doc.fillColor('#ffffff')
      .text('Item', col.name, tableTop + 6)
      .text('Qty', col.qty, tableTop + 6)
      .text('Price', col.price, tableTop + 6)
      .text('Total', col.total, tableTop + 6);

    let y = tableTop + 30;
    doc.fillColor('#374151').fontSize(10);

    order.items.forEach((item, i) => {
      if (i % 2 === 1) {
        doc.rect(50, y - 4, 500, 20).fill('#f9fafb');
        doc.fillColor('#374151');
      }
      doc.text(item.name, col.name, y, { width: 240 });
      doc.text(String(item.quantity), col.qty, y);
      doc.text(`${order.currencySymbol || '₦'}${item.price.toFixed(2)}`, col.price, y);
      doc.text(`${order.currencySymbol || '₦'}${(item.price * item.quantity).toFixed(2)}`, col.total, y);
      y += 22;
    });

    doc.moveTo(50, y + 4).lineTo(550, y + 4).strokeColor('#e5e7eb').stroke();
    y += 16;

    // ── Totals ──
    const currency = order.currencySymbol || '₦';
    const totalsLine = (label, value, bold = false) => {
      doc.fontSize(bold ? 12 : 10).fillColor(bold ? '#111827' : '#6b7280');
      doc.text(label, 370, y, { width: 90 });
      doc.text(`${currency}${value.toFixed(2)}`, col.total, y);
      y += bold ? 20 : 16;
    };

    totalsLine('Subtotal', order.subtotal);
    totalsLine('Shipping', order.shippingCost);
    totalsLine('Tax', order.tax);
    if (order.discountAmount > 0) {
      doc.fillColor('#16a34a');
      doc.text('Discount', 370, y, { width: 90 });
      doc.text(`-${currency}${order.discountAmount.toFixed(2)}`, col.total, y);
      y += 16;
    }
    doc.moveTo(370, y).lineTo(550, y).strokeColor('#e5e7eb').stroke();
    y += 8;
    totalsLine('Total', order.totalAmount, true);

    doc.moveDown(3);
    doc.fontSize(9).fillColor('#9ca3af').text(
      'Thank you for shopping with SuppleHealth. For questions about this invoice, contact support@supplehealth.com',
      50, doc.y, { align: 'center', width: 500 }
    );

    doc.end();
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
};

module.exports = { generateInvoice };