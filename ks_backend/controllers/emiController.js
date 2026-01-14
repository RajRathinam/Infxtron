// controllers/emiController.js - Customer EMI Controller
import { EmiPayment, EmiInstallment, Order, User, sequelize, Sequelize } from '../models/index.js';
import { calculateEMI, generateInstallmentSchedule } from '../utils/emiCalculator.js';

/**
 * @desc    Calculate EMI options for an order amount
 * @route   POST /api/emi/calculate
 * @access  Private (Customer)
 */
export const calculateEMIOptions = async (req, res) => {
  try {
    const { amount, emiConfig } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    const { getEMIOptions } = await import('../utils/emiCalculator.js');
    const options = getEMIOptions(parseFloat(amount), emiConfig);
    
    res.status(200).json({
      success: true,
      data: {
        amount: parseFloat(amount),
        options
      }
    });
  } catch (error) {
    console.error('Calculate EMI options error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating EMI options'
    });
  }
};

/**
 * @desc    Get user's EMI payments
 * @route   GET /api/emi/my-payments
 * @access  Private (Customer)
 */
export const getMyEMIPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { userId: req.user.id };
    if (status) where.status = status;
    
    const { count, rows: emiPayments } = await EmiPayment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'finalAmount', 'orderStatus']
        },
        {
          model: EmiInstallment,
          as: 'installments',
          order: [['installmentNumber', 'ASC']]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        emiPayments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my EMI payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching EMI payments'
    });
  }
};

/**
 * @desc    Get single EMI payment details
 * @route   GET /api/emi/:id
 * @access  Private (Customer)
 */
export const getEMIPaymentDetails = async (req, res) => {
  try {
    const emiPayment = await EmiPayment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'finalAmount', 'orderStatus', 'orderItems']
        },
        {
          model: EmiInstallment,
          as: 'installments',
          order: [['installmentNumber', 'ASC']]
        }
      ]
    });
    
    if (!emiPayment) {
      return res.status(404).json({
        success: false,
        message: 'EMI payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: emiPayment
    });
  } catch (error) {
    console.error('Get EMI payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching EMI payment details'
    });
  }
};

/**
 * @desc    Get upcoming installments
 * @route   GET /api/emi/upcoming
 * @access  Private (Customer)
 */
export const getUpcomingInstallments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const emiPayments = await EmiPayment.findAll({
      where: {
        userId: req.user.id,
        status: 'active'
      },
      include: [
        {
          model: EmiInstallment,
          as: 'installments',
          where: {
            status: 'pending',
            dueDate: {
              [Sequelize.Op.gte]: today
            }
          },
          required: true,
          order: [['dueDate', 'ASC']]
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber']
        }
      ]
    });
    
    // Flatten installments
    const upcomingInstallments = [];
    emiPayments.forEach(emiPayment => {
      emiPayment.installments.forEach(installment => {
        upcomingInstallments.push({
          ...installment.toJSON(),
          emiPayment: {
            id: emiPayment.id,
            orderNumber: emiPayment.order.orderNumber
          }
        });
      });
    });
    
    // Sort by due date
    upcomingInstallments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    res.status(200).json({
      success: true,
      data: {
        installments: upcomingInstallments,
        count: upcomingInstallments.length
      }
    });
  } catch (error) {
    console.error('Get upcoming installments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming installments'
    });
  }
};

/**
 * @desc    Get overdue installments
 * @route   GET /api/emi/overdue
 * @access  Private (Customer)
 */
export const getOverdueInstallments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const emiPayments = await EmiPayment.findAll({
      where: {
        userId: req.user.id,
        status: 'active'
      },
      include: [
        {
          model: EmiInstallment,
          as: 'installments',
          where: {
            status: 'pending',
            dueDate: {
              [Sequelize.Op.lt]: today
            }
          },
          required: true,
          order: [['dueDate', 'ASC']]
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber']
        }
      ]
    });
    
    // Flatten installments
    const overdueInstallments = [];
    emiPayments.forEach(emiPayment => {
      emiPayment.installments.forEach(installment => {
        overdueInstallments.push({
          ...installment.toJSON(),
          emiPayment: {
            id: emiPayment.id,
            orderNumber: emiPayment.order.orderNumber
          }
        });
      });
    });
    
    res.status(200).json({
      success: true,
      data: {
        installments: overdueInstallments,
        count: overdueInstallments.length
      }
    });
  } catch (error) {
    console.error('Get overdue installments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue installments'
    });
  }
};

