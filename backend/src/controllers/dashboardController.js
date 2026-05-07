const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const { getTodayRange, getMonthRange } = require('../utils/date');
const { buildMonthlySummary } = require('../utils/billing');

const getDashboardStats = async (req, res, next) => {
  try {
    const ownedCustomers = await Customer.find({ owner: req.admin._id }).select('_id');
    const ownedCustomerIds = ownedCustomers.map((customer) => customer._id);

    const totalCustomers = ownedCustomerIds.length;

    const { start, end } = getTodayRange();
    const todaysDeliveries = await Delivery.find({
      customerId: { $in: ownedCustomerIds },
      date: { $gte: start, $lt: end },
      delivered: true,
    }).populate('customerId', 'name phone pricePerLitre');

    const todayQuantity = todaysDeliveries.reduce((sum, d) => sum + d.quantity, 0);
    const todayRevenue = todaysDeliveries.reduce(
      (sum, d) => sum + d.quantity * d.customerId.pricePerLitre,
      0
    );

    // Current month stats
    const now = new Date();
    const currentMonth = getMonthRange(`${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`);

    const { summaries, totals } = await buildMonthlySummary({
      start: currentMonth.start,
      end: currentMonth.end,
      year: currentMonth.year,
      month: currentMonth.month,
      ownerId: req.admin._id,
    });

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        todayDeliveries: todaysDeliveries.length,
        todayQuantity: Number(todayQuantity.toFixed(2)),
        todayRevenue: Number(todayRevenue.toFixed(2)),
        monthlyRevenue: totals.totalAmount,
        monthlyQuantity: totals.totalLitres,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTodayDeliveries = async (req, res, next) => {
  try {
    const { start, end } = getTodayRange();

    const ownedCustomers = await Customer.find({ owner: req.admin._id }).select('_id');
    const ownedCustomerIds = ownedCustomers.map((customer) => customer._id);

    const deliveries = await Delivery.find({
      customerId: { $in: ownedCustomerIds },
      date: { $gte: start, $lt: end },
    })
      .populate('customerId', 'name phone pricePerLitre')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: deliveries,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getTodayDeliveries,
};
