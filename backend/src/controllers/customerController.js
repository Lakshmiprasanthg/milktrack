const Customer = require('../models/Customer');

const isDuplicateKeyError = (error) => error?.code === 11000;

const getAllCustomers = async (req, res, next) => {
  try {
    // return only customers belonging to the authenticated admin
    const customers = await Customer.find({ owner: req.admin._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }

    if (!customer.owner.equals(req.admin._id)) {
      res.status(403);
      return next(new Error('Forbidden'));
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { cdNumber, name, phone, address, pricePerLitre } = req.body;

    const existingCustomer = await Customer.findOne({
      owner: req.admin._id,
      cdNumber,
    });

    if (existingCustomer) {
      res.status(409);
      return next(new Error('A customer with this CD number already exists for this admin'));
    }

    const customer = new Customer({
      owner: req.admin._id,
      cdNumber,
      name,
      phone,
      address,
      pricePerLitre,
    });

    await customer.save();

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409);
      return next(new Error('A customer with this CD number already exists for this admin'));
    }
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cdNumber, name, phone, address, pricePerLitre } = req.body;

    const customer = await Customer.findById(id);

    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }

    if (!customer.owner.equals(req.admin._id)) {
      res.status(403);
      return next(new Error('Forbidden'));
    }

    const duplicateCustomer = await Customer.findOne({
      _id: { $ne: id },
      owner: req.admin._id,
      cdNumber,
    });

    if (duplicateCustomer) {
      res.status(409);
      return next(new Error('A customer with this CD number already exists for this admin'));
    }

    customer.cdNumber = cdNumber;
    customer.name = name;
    customer.phone = phone;
    customer.address = address;
    customer.pricePerLitre = pricePerLitre;

    await customer.save();

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409);
      return next(new Error('A customer with this CD number already exists for this admin'));
    }
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }

    if (!customer.owner.equals(req.admin._id)) {
      res.status(403);
      return next(new Error('Forbidden'));
    }

    await customer.remove();

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
