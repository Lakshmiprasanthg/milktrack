const Customer = require('../models/Customer');

const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

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

    const customer = new Customer({
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
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cdNumber, name, phone, address, pricePerLitre } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { cdNumber, name, phone, address, pricePerLitre },
      { new: true, runValidators: true }
    );

    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found'));
    }

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
