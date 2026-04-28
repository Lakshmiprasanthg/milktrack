const Customer = require('../models/Customer');
const Delivery = require('../models/Delivery');
const { getMonthRange, getDaysInMonth, getWeekRanges } = require('../utils/date');
const { buildMonthlySummary } = require('../utils/billing');
const { generateCustomerBillPdf } = require('../utils/pdf');


const getMonthlySummary = async (req, res, next) => {
  try {
    const { month, customerId } = req.query;

    const monthRange = getMonthRange(month);
    const { summaries, totals, daysInMonth } = await buildMonthlySummary({
      start: monthRange.start,
      end: monthRange.end,
      year: monthRange.year,
      month: monthRange.month,
      customerId: customerId || null,
    });

    res.status(200).json({
      success: true,
      data: {
        month: `${monthRange.year}-${String(monthRange.month).padStart(2, '0')}`,
        daysInMonth,
        summaries,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

const generateCustomerBillPdfReport = async (req, res, next) => {
  try {
    const { customerId, month } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }

    const monthRange = getMonthRange(month);
    const { summaries } = await buildMonthlySummary({
      start: monthRange.start,
      end: monthRange.end,
      year: monthRange.year,
      month: monthRange.month,
      customerId,
    });

    if (summaries.length === 0) {
      res.status(404);
      return next(new Error('No billing data found for this customer in the specified month'));
    }

    const billData = summaries[0];
    const displayMonth = `${monthRange.year}-${String(monthRange.month).padStart(2, '0')}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bill_${customer._id}_${displayMonth}.pdf"`);

    const doc = generateCustomerBillPdf({ customerSummary: billData, month: displayMonth });

    doc.pipe(res);
  } catch (error) {
    next(error);
  }
};

const generateMonthlyReportCsv = async (req, res, next) => {
  try {
    const { month } = req.params;

    const monthRange = getMonthRange(month);
    const { summaries } = await buildMonthlySummary({
      start: monthRange.start,
      end: monthRange.end,
      year: monthRange.year,
      month: monthRange.month,
    });

    const csvData = summaries.map((s) => ({
      CustomerName: s.customerName,
      Phone: s.phone,
      Address: s.address,
      PricePerLitre: s.pricePerLitre,
      TotalLitres: s.totalLitres,
      DeliveryDays: s.deliveryDays,
      NonDeliveryDays: s.nonDeliveryDays,
      TotalAmount: s.totalAmount,
    }));

    const displayMonth = `${monthRange.year}-${String(monthRange.month).padStart(2, '0')}`;
    const csvWriter = createObjectCsvWriter({
      path: null, // Will write to response instead
      header: [
        { id: 'CustomerName', title: 'Customer Name' },
        { id: 'Phone', title: 'Phone' },
        { id: 'Address', title: 'Address' },
        { id: 'PricePerLitre', title: 'Price Per Litre' },
        { id: 'TotalLitres', title: 'Total Litres' },
        { id: 'DeliveryDays', title: 'Delivery Days' },
        { id: 'NonDeliveryDays', title: 'Non-Delivery Days' },
        { id: 'TotalAmount', title: 'Total Amount' },
      ],
      encoding: 'utf8',
    });

    // Convert records to CSV string manually
    const headers = ['Customer Name', 'Phone', 'Address', 'Price Per Litre', 'Total Litres', 'Delivery Days', 'Non-Delivery Days', 'Total Amount'];
    const csvLines = [headers.join(',')];

    csvData.forEach((row) => {
      const values = [
        `"${row.CustomerName}"`,
        `"${row.Phone}"`,
        `"${row.Address}"`,
        row.PricePerLitre,
        row.TotalLitres,
        row.DeliveryDays,
        row.NonDeliveryDays,
        row.TotalAmount,
      ];
      csvLines.push(values.join(','));
    });

    // Add totals row
    const totalLitres = summaries.reduce((sum, s) => sum + s.totalLitres, 0);
    const totalDeliveryDays = summaries.reduce((sum, s) => sum + s.deliveryDays, 0);
    const totalAmount = summaries.reduce((sum, s) => sum + s.totalAmount, 0);

    csvLines.push('');
    csvLines.push(`"TOTAL",,,,${totalLitres.toFixed(2)},${totalDeliveryDays},0,${totalAmount.toFixed(2)}`);

    const csv = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report_${displayMonth}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

const getCustomerReport = async (req, res, next) => {
  try {
    const { customerId, month } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }

    const monthRange = getMonthRange(month);
    const { year, month: monthNum, start, end } = monthRange;
    const daysInMonth = getDaysInMonth(year, monthNum);

    // Fetch all deliveries for this customer in the month
    const deliveries = await Delivery.find({
      customerId,
      date: { $gte: start, $lt: end },
    })
      .sort({ date: 1 })
      .lean();

    // Build a map: dayOfMonth -> delivery
    const deliveryByDay = new Map();
    deliveries.forEach((d) => {
      const day = new Date(d.date).getUTCDate();
      deliveryByDay.set(day, d);
    });

    // Build full daily log (every day of month)
    const daily = [];
    let totalLitres = 0;
    let totalAmount = 0;
    let deliveryDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = deliveryByDay.get(day);
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (d && d.delivered) {
        const amount = Number((d.quantity * customer.pricePerLitre).toFixed(2));
        totalLitres += d.quantity;
        totalAmount += amount;
        deliveryDays += 1;
        daily.push({
          day,
          date: dateStr,
          quantity: d.quantity,
          delivered: true,
          amount,
        });
      } else {
        daily.push({
          day,
          date: dateStr,
          quantity: d ? d.quantity : 0,
          delivered: false,
          amount: 0,
        });
      }
    }

    totalLitres = Number(totalLitres.toFixed(2));
    totalAmount = Number(totalAmount.toFixed(2));

    // Build weekly breakdown
    const weekRanges = getWeekRanges(year, monthNum);
    const weekly = weekRanges.map(({ label, startDay, endDay }) => {
      const weekDays = daily.slice(startDay - 1, endDay);
      const weekLitres = Number(weekDays.reduce((s, d) => s + d.quantity * (d.delivered ? 1 : 0), 0).toFixed(2));
      const weekAmount = Number(weekDays.reduce((s, d) => s + d.amount, 0).toFixed(2));
      const weekDeliveryDays = weekDays.filter((d) => d.delivered).length;
      return {
        label,
        startDay,
        endDay,
        litres: weekLitres,
        amount: weekAmount,
        deliveryDays: weekDeliveryDays,
        totalDays: weekDays.length,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        customer: {
          _id: customer._id,
          cdNumber: customer.cdNumber,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          pricePerLitre: customer.pricePerLitre,
        },
        month: `${year}-${String(monthNum).padStart(2, '0')}`,
        daysInMonth,
        monthly: {
          totalLitres,
          totalAmount,
          deliveryDays,
          nonDeliveryDays: daysInMonth - deliveryDays,
        },
        weekly,
        daily,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlySummary,
  generateCustomerBillPdfReport,
  generateMonthlyReportCsv,
  getCustomerReport,
};
