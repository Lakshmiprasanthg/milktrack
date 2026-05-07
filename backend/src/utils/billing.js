const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const { getDaysInMonth } = require('./date');

const buildMonthlySummary = async ({ start, end, year, month, customerId = null, ownerId = null }) => {
  const customerFilter = {};

  if (customerId) {
    customerFilter._id = customerId;
  }

  if (ownerId) {
    customerFilter.owner = ownerId;
  }

  const customers = await Customer.find(customerFilter).sort({ name: 1 });

  const customerIds = customers.map((customer) => customer._id);

  const deliveryFilter = {
    date: { $gte: start, $lt: end },
  };

  if (customerIds.length > 0) {
    deliveryFilter.customerId = { $in: customerIds };
  } else if (customerId) {
    deliveryFilter.customerId = customerId;
  }

  const deliveries = await Delivery.find(deliveryFilter).lean();
  const map = new Map();

  deliveries.forEach((delivery) => {
    const key = String(delivery.customerId);
    if (!map.has(key)) {
      map.set(key, { totalLitres: 0, deliveryDays: 0 });
    }

    const current = map.get(key);
    if (delivery.delivered) {
      current.totalLitres += delivery.quantity;
      current.deliveryDays += 1;
    }
    map.set(key, current);
  });

  const daysInMonth = getDaysInMonth(year, month);

  const summaries = customers.map((customer) => {
    const stats = map.get(String(customer._id)) || { totalLitres: 0, deliveryDays: 0 };
    const totalAmount = stats.totalLitres * customer.pricePerLitre;

    return {
      customerId: customer._id,
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address,
      pricePerLitre: customer.pricePerLitre,
      totalLitres: Number(stats.totalLitres.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      deliveryDays: stats.deliveryDays,
      nonDeliveryDays: Math.max(daysInMonth - stats.deliveryDays, 0),
    };
  });

  const totals = summaries.reduce(
    (acc, item) => {
      acc.totalLitres += item.totalLitres;
      acc.totalAmount += item.totalAmount;
      acc.totalDeliveryDays += item.deliveryDays;
      return acc;
    },
    { totalLitres: 0, totalAmount: 0, totalDeliveryDays: 0 }
  );

  totals.totalLitres = Number(totals.totalLitres.toFixed(2));
  totals.totalAmount = Number(totals.totalAmount.toFixed(2));

  return { summaries, totals, daysInMonth };
};

module.exports = { buildMonthlySummary };
