'use strict';

var assert = require('node:assert/strict');
var test = require('node:test');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');
var reports = require('../lib/reports');

test('invoice HSN tax and CGST/SGST match the customer order when gstRate is absent', function () {
  var items = [{ id: 1, name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 100, qty: 1 }];
  var ledger = pricing.computeTotals(items, '');
  var bill = invoice.computeInvoiceFigures({ items: items, coupon: '' });

  assert.equal(ledger.tax, 5);
  assert.equal(ledger.cgst, 2.5);
  assert.equal(ledger.sgst, 2.5);
  assert.equal(ledger.total, 105);
  assert.equal(bill.rows[0].gstPercent, 5);
  assert.equal(bill.tax, 5);
  assert.equal(bill.cgst, 2.5);
  assert.equal(bill.sgst, 2.5);
  assert.equal(bill.total, 105);
});

test('invoice applies the same subtotal coupon discount and tax as the customer order', function () {
  var items = [{ id: 1, name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 600, qty: 1 }];
  var ledger = pricing.computeTotals(items, 'SAVE10');
  var bill = invoice.computeInvoiceFigures({ items: items, coupon: 'SAVE10' });

  assert.equal(ledger.subtotal, 600);
  assert.equal(ledger.discount, 60);
  assert.equal(ledger.tax, 27);
  assert.equal(ledger.total, 567);
  assert.equal(bill.discount, 60);
  assert.equal(bill.tax, 27);
  assert.equal(bill.total, 567);
});

test('invoice applies configured coupon maximum discount like the customer order', function () {
  var items = [{ id: 1, name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 3000, qty: 1 }];
  var ledger = pricing.computeTotals(items, 'SAVE10');
  var bill = invoice.computeInvoiceFigures({ items: items, coupon: 'SAVE10' });

  assert.equal(ledger.discount, 150);
  assert.equal(ledger.total, 2992.5);
  assert.equal(bill.discount, 150);
  assert.equal(bill.tax, 142.5);
  assert.equal(bill.total, 2992.5);
});

test('reconciliation reports matching invoice and stored ledger figures', function () {
  var items = [{ id: 1, name: 'Rice', sku: 'RICE-1', hsn: '1006', price: 100, qty: 1 }];
  var ledger = pricing.computeTotals(items, '');
  var db = {
    orders: [{
      id: 42,
      date: '22/11/2026',
      customer: 'Walk-in',
      coupon: '',
      status: 'completed',
      items: items,
      subtotal: ledger.subtotal,
      discount: ledger.discount,
      tax: ledger.tax,
      total: ledger.total
    }],
    products: [],
    customers: []
  };
  var result = reports.getGstReconciliation(db);

  assert.equal(result.totalChecked, 1);
  assert.equal(result.mismatchCount, 0);
  assert.equal(result.rows[0].invoiceTax, 5);
  assert.equal(result.rows[0].invoiceTotal, 105);
  assert.equal(result.rows[0].delta, 0);
  assert.equal(result.rows[0].matched, true);
});
