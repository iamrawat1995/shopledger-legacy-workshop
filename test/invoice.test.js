var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

// Synthetic orders model the reported scenarios. Omit gstRate to exercise HSN lookup.
function assertFigures(order, expectedInvoice, expectedCheckout) {
  var printed = invoice.computeInvoiceFigures(order);
  var checkout = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual({
    subtotal: printed.subtotal,
    discount: printed.discount,
    tax: printed.tax,
    cgst: printed.cgst,
    sgst: printed.sgst,
    total: printed.total,
    gstPercent: printed.rows.map(function (row) { return row.gstPercent; }),
    lineTax: printed.rows.map(function (row) { return row.lineTax; })
  }, expectedInvoice, 'printable invoice figures');

  assert.deepEqual({
    subtotal: checkout.subtotal,
    discount: checkout.discount,
    tax: checkout.tax,
    cgst: checkout.cgst,
    sgst: checkout.sgst,
    total: checkout.total,
    gstPercent: checkout.lines.map(function (line) { return line.gstPercent; }),
    lineTax: checkout.lines.map(function (line) { return line.tax; })
  }, expectedCheckout, 'checkout figures');
}

test('#1001 invoice uses the 5% and 12% HSN slabs without a coupon', function () {
  var order = {
    id: 1001,
    coupon: '',
    items: [
      { id: 1, name: 'Rice', sku: 'RICE', hsn: '1006', price: 100, qty: 2 },
      { id: 2, name: 'Ghee', sku: 'GHEE', hsn: '0405', price: 300, qty: 1 }
    ]
  };

  var expected = {
    subtotal: 500, discount: 0, tax: 46, cgst: 23, sgst: 23, total: 546,
    gstPercent: [5, 12], lineTax: [10, 36]
  };

  assertFigures(order, expected, expected);
});

test('#1002 invoice applies SAVE10 before GST', function () {
  var order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { id: 1, name: 'Rice', sku: 'RICE', hsn: '1006', price: 120, qty: 5 }
    ]
  };

  var expected = {
    subtotal: 600, discount: 60, tax: 27, cgst: 13.50, sgst: 13.50, total: 567,
    gstPercent: [5], lineTax: [27]
  };

  assertFigures(order, expected, expected);
});

test('#1004 invoice caps SAVE10 at 150 before GST on a 2240 subtotal', function () {
  var order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { id: 3, name: 'Tea', sku: 'TEA', hsn: '0902', price: 280, qty: 8 }
    ]
  };

  var expected = {
    subtotal: 2240, discount: 150, tax: 376.20, cgst: 188.10, sgst: 188.10, total: 2466.20,
    gstPercent: [18], lineTax: [376.20]
  };

  assertFigures(order, expected, expected);
});

test('CURRENT BEHAVIOUR: #1008 invoice matches checkout for all 18% items without a coupon', function () {
  var order = {
    id: 1008,
    coupon: '',
    items: [
      { id: 3, name: 'Tea', sku: 'TEA', hsn: '0902', price: 50, qty: 2 },
      { id: 4, name: 'Coffee', sku: 'COFFEE', hsn: '0901', gstRate: 18, price: 250, qty: 1 }
    ]
  };
  var expected = {
    subtotal: 350, discount: 0, tax: 63, cgst: 31.50, sgst: 31.50, total: 413,
    gstPercent: [18, 18], lineTax: [18, 45]
  };

  assertFigures(order, expected, expected);
});

test('invoice uses checkout GST slabs and applies capped SAVE10 before tax', function () {
  var order = {
    coupon: 'SAVE10',
    items: [
      { id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 10 },
      { id: 2, name: 'Ghee', hsn: '0405', price: 100, qty: 10 }
    ]
  };
  var expected = {
    subtotal: 2000, discount: 150, tax: 157.25, cgst: 78.63, sgst: 78.62, total: 2007.25,
    gstPercent: [5, 12], lineTax: [46.25, 111]
  };

  assertFigures(order, expected, expected);
});
