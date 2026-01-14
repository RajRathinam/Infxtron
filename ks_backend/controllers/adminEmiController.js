// controllers/adminEmiController.js - Admin EMI Controller
import { EmiPayment, EmiInstallment, Order, User } from '../models/index.js';
import { sequelize, Sequelize } from '../models/index.js';
import { sendEMIReminderSMS } from '../services/smsService.js';

/**
 * @desc    Get all EMI payments (admin)
 * @route   GET /api/admin/emi/payments
 * @access  Private (Admin)
 */
export const getAllEMIPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      userId,
      dateFrom,
      dateTo,
      search
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Sequelize.Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Sequelize.Op.lte] = new Date(dateTo);
    }
    
    const { count, rows: emiPayments } = await EmiPayment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email'],
          ...(search ? {
            where: {
              [Sequelize.Op.or]: [
                { name: { [Sequelize.Op.like]: `%${search}%` } },
                { phone: { [Sequelize.Op.like]: `%${search}%` } },
                { email: { [Sequelize.Op.like]: `%${search}%` } }
              ]
            }
          } : {})
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'finalAmount']
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
    console.error('Get all EMI payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching EMI payments'
    });
  }
};

/**
 * @desc    Get EMI payment details (admin)
 * @route   GET /api/admin/emi/payments/:id
 * @access  Private (Admin)
 */
export const getEMIPaymentDetailsAdmin = async (req, res) => {
  try {
    const emiPayment = await EmiPayment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email', 'address']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'finalAmount', 'orderStatus', 'orderItems', 'shippingAddress']
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
    console.error('Get EMI payment details admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching EMI payment details'
    });
  }
};

/**
 * @desc    Get all pending installments (admin)
 * @route   GET /api/admin/emi/installments/pending
 * @access  Private (Admin)
 */
export const getPendingInstallments = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: installments } = await EmiInstallment.findAndCountAll({
      where: {
        status: 'pending'
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['dueDate', 'ASC']],
      include: [
        {
          model: EmiPayment,
          as: 'emiPayment',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'phone', 'email']
            },
            {
              model: Order,
              as: 'order',
              attributes: ['id', 'orderNumber']
            }
          ]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        installments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending installments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending installments'
    });
  }
};

/**
 * @desc    Get overdue installments (admin)
 * @route   GET /api/admin/emi/installments/overdue
 * @access  Private (Admin)
 */
export const getOverdueInstallmentsAdmin = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: installments } = await EmiInstallment.findAndCountAll({
      where: {
        status: 'pending',
        dueDate: {
          [Sequelize.Op.lt]: today
        }
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['dueDate', 'ASC']],
      include: [
        {
          model: EmiPayment,
          as: 'emiPayment',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'phone', 'email']
            },
            {
              model: Order,
              as: 'order',
              attributes: ['id', 'orderNumber']
            }
          ]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        installments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get overdue installments admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue installments'
    });
  }
};

/**
 * @desc    Mark installment as paid (admin)
 * @route   PUT /api/admin/emi/installments/:id/mark-paid
 * @access  Private (Admin)
 */
export const markInstallmentPaid = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { paymentMethod, transactionId, paidDate, notes } = req.body;
    
    const installment = await EmiInstallment.findByPk(req.params.id, {
      include: [
        {
          model: EmiPayment,
          as: 'emiPayment',
          transaction
        }
      ],
      transaction
    });
    
    if (!installment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Installment not found'
      });
    }
    
    if (installment.status === 'paid') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Installment is already marked as paid'
      });
    }
    
    // Update installment
    await installment.update({
      status: 'paid',
      paidDate: paidDate ? new Date(paidDate) : new Date(),
      paymentMethod: paymentMethod || 'cod',
      transactionId: transactionId || null,
      notes: notes || null
    }, { transaction });
    
    // Update EMI payment stats
    const emiPayment = installment.emiPayment;
    const paidCount = await EmiInstallment.count({
      where: {
        emiPaymentId: emiPayment.id,
        status: 'paid'
      },
      transaction
    });
    
    await emiPayment.update({
      paidInstallments: paidCount,
      remainingInstallments: emiPayment.tenure - paidCount
    }, { transaction });
    
    // Check if all installments are paid
    if (paidCount === emiPayment.tenure) {
      await emiPayment.update({
        status: 'completed',
        nextDueDate: null
      }, { transaction });
    } else {
      // Update next due date
      const nextInstallment = await EmiInstallment.findOne({
        where: {
          emiPaymentId: emiPayment.id,
          status: 'pending'
        },
        order: [['dueDate', 'ASC']],
        transaction
      });
      
      if (nextInstallment) {
        await emiPayment.update({
          nextDueDate: nextInstallment.dueDate
        }, { transaction });
      }
    }
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Installment marked as paid successfully',
      data: installment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Mark installment paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking installment as paid'
    });
  }
};

/**
 * @desc    Send reminder for due installments
 * @route   POST /api/admin/emi/installments/:id/send-reminder
 * @access  Private (Admin)
 */
export const sendInstallmentReminder = async (req, res) => {
  try {
    const installment = await EmiInstallment.findByPk(req.params.id, {
      include: [
        {
          model: EmiPayment,
          as: 'emiPayment',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'phone', 'email']
            },
            {
              model: Order,
              as: 'order',
              attributes: ['id', 'orderNumber']
            }
          ]
        }
      ]
    });
    
    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Installment not found'
      });
    }
    
    if (installment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send reminder for paid installment'
      });
    }
    
    // Send SMS reminder
    const user = installment.emiPayment.user;
    const orderNumber = installment.emiPayment.order.orderNumber;
    const dueDate = new Date(installment.dueDate).toLocaleDateString();
    
    try {
      await sendEMIReminderSMS(
        user.phone,
        orderNumber,
        installment.installmentNumber,
        installment.amount,
        dueDate
      );
      
      // Update reminder status
      await installment.update({
        reminderSent: true,
        reminderSentAt: new Date()
      });
      
      res.status(200).json({
        success: true,
        message: 'Reminder sent successfully',
        data: {
          installmentId: installment.id,
          reminderSentAt: new Date()
        }
      });
    } catch (smsError) {
      console.error('Error sending SMS reminder:', smsError);
      res.status(500).json({
        success: false,
        message: 'Reminder sent but SMS notification failed'
      });
    }
  } catch (error) {
    console.error('Send installment reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending reminder'
    });
  }
};

/**
 * @desc    Get EMI statistics (admin)
 * @route   GET /api/admin/emi/stats
 * @access  Private (Admin)
 */
export const getEMIStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get counts
    const [
      totalEMIPayments,
      activeEMIPayments,
      completedEMIPayments,
      totalPendingInstallments,
      totalOverdueInstallments,
      totalAmountPending,
      totalAmountCollected
    ] = await Promise.all([
      EmiPayment.count(),
      EmiPayment.count({ where: { status: 'active' } }),
      EmiPayment.count({ where: { status: 'completed' } }),
      EmiInstallment.count({ where: { status: 'pending' } }),
      EmiInstallment.count({
        where: {
          status: 'pending',
          dueDate: { [Sequelize.Op.lt]: today }
        }
      }),
      EmiInstallment.sum('amount', {
        where: { status: 'pending' }
      }),
      EmiInstallment.sum('amount', {
        where: { status: 'paid' }
      })
    ]);
    
    // Get installments due in next 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const dueInNextWeek = await EmiInstallment.count({
      where: {
        status: 'pending',
        dueDate: {
          [Sequelize.Op.between]: [today, nextWeek]
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalEMIPayments,
        activeEMIPayments,
        completedEMIPayments,
        totalPendingInstallments,
        totalOverdueInstallments,
        dueInNextWeek,
        totalAmountPending: totalAmountPending || 0,
        totalAmountCollected: totalAmountCollected || 0
      }
    });
  } catch (error) {
    console.error('Get EMI stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching EMI statistics'
    });
  }
};



