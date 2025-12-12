// controllers/dietPlanController.js
import DietPlan from '../models/DietPlan.js';
import telegramService from '../services/telegramService.js';
import { Op } from 'sequelize'; // Import Op
import sequelize from '../config/database.js'; // Import sequelize instance

// Create new diet plan
export const createDietPlan = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      height,
      weight,
      targetWeight,
      email,
      phone,
      mainGoal,
      dietType,
      foodRestrictions,
      dislikedFoods,
      preferredContact,
      followUpConsultation,
      additionalNotes
    } = req.body;

    // Validate required fields
    const requiredFields = ['fullName', 'age', 'gender', 'height', 'weight', 'email', 'phone', 'mainGoal', 'dietType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Create diet plan
    const dietPlan = await DietPlan.create({
      fullName,
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      email,
      phone,
      mainGoal,
      dietType,
      foodRestrictions: foodRestrictions || null,
      dislikedFoods: dislikedFoods || null,
      preferredContact: preferredContact || 'WhatsApp',
      followUpConsultation: followUpConsultation || 'no',
      additionalNotes: additionalNotes || null,
      status: 'pending',
      telegramNotificationSent: false
    });

    // Send Telegram notification
    try {
      // First, ensure Telegram is initialized
      if (!telegramService.isReady) {
        await telegramService.init();
      }
      
      if (telegramService.isReady) {
        const message = telegramService.formatDietPlan(dietPlan);
        // Use the appropriate method (check your telegramService for correct method name)
        // If telegramService has sendMessage, use that. If it has sendNotification, use that.
        let notificationSent = false;
        
        if (typeof telegramService.sendMessage === 'function') {
          notificationSent = await telegramService.sendMessage(message, true); // true for HTML formatting
        } else if (typeof telegramService.sendNotification === 'function') {
          notificationSent = await telegramService.sendNotification(message);
        }
        
        if (notificationSent) {
          await dietPlan.update({ telegramNotificationSent: true });
          console.log('✅ Telegram notification sent for diet plan:', dietPlan.id);
        } else {
          console.log('⚠️ Failed to send Telegram notification');
        }
      } else {
        console.log('⚠️ Telegram service not ready, skipping notification');
      }
    } catch (telegramError) {
      console.error('❌ Failed to send Telegram notification:', telegramError.message || telegramError);
      // Continue even if Telegram fails - don't fail the whole request
    }

    res.status(201).json({
      success: true,
      message: 'Diet plan submitted successfully! Our nutritionist will contact you soon.',
      data: {
        id: dietPlan.id,
        fullName: dietPlan.fullName,
        email: dietPlan.email,
        status: dietPlan.status,
        submittedAt: dietPlan.createdAt,
        telegramNotificationSent: dietPlan.telegramNotificationSent
      }
    });

  } catch (error) {
    console.error('❌ Create diet plan error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit diet plan',
      error: error.message
    });
  }
};

// Get all diet plans
export const getAllDietPlans = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      sortBy = 'createdAt', 
      order = 'DESC',
      search = '' 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    
    // Add search functionality
    if (search && search.trim() !== '') {
      whereClause[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { mainGoal: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const { count, rows: dietPlans } = await DietPlan.findAndCountAll({
      where: whereClause,
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      success: true,
      data: dietPlans,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Get diet plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diet plans',
      error: error.message
    });
  }
};

// Get single diet plan by ID
export const getDietPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dietPlan = await DietPlan.findByPk(id);
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: dietPlan
    });
    
  } catch (error) {
    console.error('Get diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diet plan',
      error: error.message
    });
  }
};

// Update diet plan status
export const updateDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const dietPlan = await DietPlan.findByPk(id);
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    // Only allow specific fields to be updated
    const allowedUpdates = ['status', 'notes'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    await dietPlan.update(filteredUpdates);
    
    res.status(200).json({
      success: true,
      message: 'Diet plan updated successfully',
      data: dietPlan
    });
    
  } catch (error) {
    console.error('Update diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diet plan',
      error: error.message
    });
  }
};

// Delete diet plan
export const deleteDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dietPlan = await DietPlan.findByPk(id);
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    await dietPlan.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Diet plan deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete diet plan',
      error: error.message
    });
  }
};

// Resend Telegram notification
export const resendDietPlanNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dietPlan = await DietPlan.findByPk(id);
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    // Use the correct method name - formatDietPlan instead of formatDietPlanMessage
    const message = telegramService.formatDietPlan(dietPlan);
    
    let notificationSent = false;
    if (typeof telegramService.sendMessage === 'function') {
      notificationSent = await telegramService.sendMessage(message, true);
    } else if (typeof telegramService.sendNotification === 'function') {
      notificationSent = await telegramService.sendNotification(message);
    }
    
    if (notificationSent) {
      await dietPlan.update({ telegramNotificationSent: true });
      
      res.status(200).json({
        success: true,
        message: 'Notification resent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send notification'
      });
    }
    
  } catch (error) {
    console.error('Resend notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend notification',
      error: error.message
    });
  }
};

// Get statistics
export const getDietPlanStats = async (req, res) => {
  try {
    // Get total count
    const total = await DietPlan.count();
    
    // Get counts by status
    const byStatus = await DietPlan.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });
    
    // Get counts by goal
    const byGoal = await DietPlan.findAll({
      attributes: ['mainGoal', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['mainGoal']
    });
    
    // Get counts by diet type
    const byDietType = await DietPlan.findAll({
      attributes: ['dietType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['dietType']
    });
    
    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await DietPlan.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });
    
    // Get counts for each status
    const pendingCount = await DietPlan.count({ where: { status: 'pending' } });
    const contactedCount = await DietPlan.count({ where: { status: 'contacted' } });
    const processingCount = await DietPlan.count({ where: { status: 'processing' } });
    const completedCount = await DietPlan.count({ where: { status: 'completed' } });
    
    // Get this week's count
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const thisWeekCount = await DietPlan.count({
      where: {
        createdAt: {
          [Op.gte]: startOfWeek
        }
      }
    });
    
    // Get this month's count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonthCount = await DietPlan.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        pending: pendingCount,
        contacted: contactedCount,
        processing: processingCount,
        completed: completedCount,
        today: todayCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount,
        byStatus,
        byGoal,
        byDietType
      }
    });
    
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Test Telegram for diet plans
export const testDietPlanTelegram = async (req, res) => {
  try {
    let sent = false;
    if (typeof telegramService.formatTestMessage === 'function') {
      const message = telegramService.formatTestMessage();
      
      if (typeof telegramService.sendMessage === 'function') {
        sent = await telegramService.sendMessage(message, true);
      } else if (typeof telegramService.sendNotification === 'function') {
        sent = await telegramService.sendNotification(message);
      }
    } else {
      // Create a test message if formatTestMessage doesn't exist
      const testMessage = `📋 **Test Diet Plan Notification**\n\n` +
                         `This is a test notification from your diet plan system.\n` +
                         `Time: ${new Date().toLocaleString()}`;
      
      if (typeof telegramService.sendMessage === 'function') {
        sent = await telegramService.sendMessage(testMessage, true);
      } else if (typeof telegramService.sendNotification === 'function') {
        sent = await telegramService.sendNotification(testMessage);
      }
    }
    
    if (sent) {
      res.status(200).json({
        success: true,
        message: "Test notification sent to Telegram!"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test notification"
      });
    }
    
  } catch (error) {
    console.error("Test Telegram error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: error.message
    });
  }
};