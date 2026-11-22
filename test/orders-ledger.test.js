'use strict';

var assert = require('node:assert/strict');
var test = require('node:test');

var dates = require('../lib/dates');
var ledger = require('../lib/ledger');
var orders = require('../lib/orders');

var datedOrders = [
  { id: 1001, date: '28/12/2021' },
  { id: 1004, date: '30/01/2022' },
  { id: 1007, date: '04/03/2022' },
  { id: 1008, date: '15/03/2022' }
];

test('order history sorts by actual date with newest first', function () {
  var result = orders.list({ orders: datedOrders }, { status: 'all' });

  assert.deepEqual(result.map(function (order) { return order.id; }), [1008, 1007, 1004, 1001]);
});

test('order history date range includes only dates within the selected range', function () {
  var result = orders.list({ orders: datedOrders }, {
    status: 'all',
    from: '2022-01-01',
    to: '2022-01-31'
  });

  assert.deepEqual(result.map(function (order) { return order.id; }), [1004]);
});

test('fiscal year calculation accepts both supported date formats', function () {
  assert.equal(dates.getFiscalYear('31/03/2022'), 'FY21-22');
  assert.equal(dates.getFiscalYear('2022-03-31'), 'FY21-22');
  assert.equal(dates.getFiscalYear('01/04/2022'), 'FY22-23');
});

test('settling with a string amount adds numerically and recalculates the balance', function () {
  var db = {
    nextSettlementId: 501,
    customers: [{
      id: 1,
      name: 'Meera Joshi',
      openingBalance: 450,
      totalBilled: 1982.01,
      totalSettled: 1200
    }],
    settlements: []
  };

  var result = ledger.recordSettlement(db, 1, '500', 'upi', 'Counter payment');

  assert.equal(result.ok, true);
  assert.equal(result.customer.totalSettled, 1700);
  assert.equal(result.customer.balance, 732.01);
  assert.equal(result.settlement.amount, 500);
});
