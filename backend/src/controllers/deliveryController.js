const Delivery = require('../models/Delivery');
const { normalizeDate } = require('../utils/date');

const getDeliveries = async (req, res, next) => {
  try {
    const { customerId, startDate, endDate } = req.query;

    const filter = {};

    if (customerId) {
      filter.customerId = customerId;
    }

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        const normalized = normalizeDate(startDate);
        filter.date.$gte = normalized;
      }

      if (endDate) {
        const normalized = normalizeDate(endDate);
        filter.date.$lte = normalized;
      }
    }

    const deliveries = await Delivery.find(filter)
      .populate('customerId', 'name phone pricePerLitre')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: deliveries,
    });
  } catch (error) {
    next(error);
  }
};

const getDeliveryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id).populate('customerId');

    if (!delivery) {
      res.status(404);
      return next(new Error('Delivery not found'));
    }

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

const createDelivery = async (req, res, next) => {
  try {
    const { customerId, date, quantity, delivered } = req.body;

    const normalizedDate = normalizeDate(date);

    // Check for duplicate
    const existingDelivery = await Delivery.findOne({
      customerId,
      date: normalizedDate,
    });

    if (existingDelivery) {
      res.status(409);
      return next(new Error('Delivery already exists for this customer on this date'));
    }

    const delivery = new Delivery({
      customerId,
      date: normalizedDate,
      quantity,
      delivered: delivered || false,
    });

    await delivery.save();
    await delivery.populate('customerId', 'name phone pricePerLitre');

    res.status(201).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

const updateDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, delivered } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { quantity, delivered },
      { new: true, runValidators: true }
    ).populate('customerId', 'name phone pricePerLitre');

    if (!delivery) {
      res.status(404);
      return next(new Error('Delivery not found'));
    }

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

const toggleDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      res.status(404);
      return next(new Error('Delivery not found'));
    }

    delivery.delivered = !delivery.delivered;
    await delivery.save();
    await delivery.populate('customerId', 'name phone pricePerLitre');

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findByIdAndDelete(id);

    if (!delivery) {
      res.status(404);
      return next(new Error('Delivery not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Delivery deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  toggleDeliveryStatus,
  deleteDelivery,
};
