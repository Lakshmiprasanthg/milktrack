const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const { normalizeDate } = require('../utils/date');

const getOwnedCustomerIds = async (adminId) => {
  const customers = await Customer.find({ owner: adminId }).select('_id');
  return customers.map((customer) => customer._id);
};

const getDeliveries = async (req, res, next) => {
  try {
    const { customerId, startDate, endDate } = req.query;
    const ownedCustomerIds = await getOwnedCustomerIds(req.admin._id);

    const filter = {};

    if (ownedCustomerIds.length > 0) {
      filter.customerId = { $in: ownedCustomerIds };
    }

    if (customerId) {
      if (!ownedCustomerIds.some((ownedId) => String(ownedId) === String(customerId))) {
        res.status(403);
        return next(new Error('Forbidden'));
      }
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

    const delivery = await Delivery.findById(id).populate('customerId', 'owner name phone pricePerLitre');

    if (!delivery) {
      res.status(404);
      return next(new Error('Delivery not found'));
    }

    if (!delivery.customerId?.owner?.equals(req.admin._id)) {
      res.status(403);
      return next(new Error('Forbidden'));
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
    const ownedCustomerIds = await getOwnedCustomerIds(req.admin._id);

    if (!ownedCustomerIds.some((ownedId) => String(ownedId) === String(customerId))) {
      res.status(403);
      return next(new Error('Forbidden'));
    }

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
    ).populate('customerId', 'name phone pricePerLitre owner');

    if (!delivery) {
      res.status(404);
      return next(new Error('Delivery not found'));
    }

    if (!delivery.customerId?.owner?.equals(req.admin._id)) {
      res.status(403);
      return next(new Error('Forbidden'));
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

    const populatedDelivery = await delivery.populate('customerId', 'owner');
    if (!populatedDelivery.customerId?.owner?.equals(req.admin._id)) {
      res.status(403);
      return next(new Error('Forbidden'));
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

    const delivery = await Delivery.findById(id).populate('customerId', 'owner');

    if (!delivery) {
      res.status(404);
      return next(new Error('Delivery not found'));
    }

    if (!delivery.customerId?.owner?.equals(req.admin._id)) {
      res.status(403);
      return next(new Error('Forbidden'));
    }

    await delivery.deleteOne();

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
