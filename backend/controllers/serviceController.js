import Service from '../models/Service.js';

// @desc    Get all additional services
// @route   GET /api/services
// @access  Private
export const getServices = async (req, res) => {
  try {
    const { category, isAvailable } = req.query;

    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const services = await Service.find(query).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching services',
    });
  }
};

// @desc    Create new service catalog item
// @route   POST /api/services
// @access  Private
export const createService = async (req, res) => {
  try {
    const { name, category, price, description, isAvailable, icon } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required',
      });
    }

    const service = await Service.create({
      name: name.trim(),
      category,
      price: Number(price),
      description: description || '',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      icon: icon || 'Sparkles',
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update service catalog item
// @route   PUT /api/services/:id
// @access  Private
export const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service item not found',
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete service item
// @route   DELETE /api/services/:id
// @access  Private
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
