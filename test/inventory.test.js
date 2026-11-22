'use strict';

var assert = require('node:assert/strict');
var test = require('node:test');

var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

test('allows selling the only sellable ghee unit', function () {
  var products = [{ id: 6, name: 'A2 Gir Cow Ghee 500ml', stock: 1, reserved: 0 }];

  assert.deepEqual(inventory.check(products, [{ id: 6, qty: 1 }]), { ok: true });
});

test('allows selling the last unreserved chilli packet', function () {
  var products = [{ id: 11, name: 'Byadgi Kashmiri Chilli Powder 500g', stock: 4, reserved: 3 }];

  assert.deepEqual(inventory.check(products, [{ id: 11, qty: 1 }]), { ok: true });
});

test('allows ordering exactly the remaining sellable quantity', function () {
  var products = [{ id: 1, name: 'Rice', stock: 10, reserved: 2 }];

  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 8 }]), { ok: true });
});

test('cancelling a pending order restores physical stock and preserves reservations', function () {
  var db = {
    products: [
      { id: 6, name: 'A2 Gir Cow Ghee 500ml', stock: 0, reserved: 0 },
      { id: 4, name: 'Cold-Pressed Sunflower Oil 1L', stock: 8, reserved: 2 }
    ],
    orders: [{
      id: 1007,
      customer: 'Suresh Deshmukh',
      status: 'pending',
      paymentMode: 'cash',
      items: [{ id: 6, qty: 2 }, { id: 4, qty: 2 }]
    }]
  };

  var result = orders.cancel(db, 1007, 'Test cancellation');

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.equal(db.products[0].stock, 2);
  assert.equal(db.products[1].stock, 10);
  assert.equal(db.products[1].reserved, 2);
});
