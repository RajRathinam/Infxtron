import { Order, Cart, Product, User, Coupon, UserCoupon, EmiPayment, EmiInstallment, sequelize, Sequelize } from '../models/index.js';
import { generateOrderNumber } from '../utils/helpers.js';
import { calculateEMI, generateInstallmentSchedule } from '../utils/emiCalculator.js';

/**
 * @desc    Create new order from cart
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      couponCode,
      emiTenure,
      emiInterestRate
    } = req.body;
    
    // Validate shipping address
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      transaction
    });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Verify all items are available and prepare order items
    const orderItems = [];
    let totalPrice = 0;
    let shippingCost = 0;
    let taxAmount = 0;
    
    for (const item of cart.items) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }
      
      // Check stock availability (simple numeric stock check)
      const availableStock = product.stock;
      
      if (!product.availability || availableStock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}"${item.colorName ? ` (${item.colorName})` : ''} is out of stock or insufficient quantity. Available: ${availableStock}`
        });
      }
      
      const price = product.discountPrice || product.price;
      const itemTotal = price * item.quantity;
      
      // Get image for the specific color if available
      let itemImage = null;
      if (item.colorName && product.colorsAndImages && product.colorsAndImages[item.colorName]) {
        const colorImages = product.colorsAndImages[item.colorName];
        const mainImage = colorImages.find(img => img.type === 'main');
        itemImage = mainImage ? mainImage.url : (colorImages[0] ? colorImages[0].url : null);
      } else if (product.images && product.images.length > 0) {
        itemImage = product.images[0].url;
      } else if (product.colorsAndImages) {
        // Get first available color's main image
        const firstColor = Object.keys(product.colorsAndImages)[0];
        if (firstColor && product.colorsAndImages[firstColor].length > 0) {
          const mainImage = product.colorsAndImages[firstColor].find(img => img.type === 'main');
          itemImage = mainImage ? mainImage.url : product.colorsAndImages[firstColor][0].url;
        }
      }
      
      orderItems.push({
        productId: product.id,
        name: product.name,
        code: product.code,
        price,
        quantity: item.quantity,
        colorName: item.colorName || null,
        total: itemTotal,
        image: itemImage,
        variant: product.variant
      });
      
      totalPrice += itemTotal;
      taxAmount += itemTotal * (product.tax || 0) / 100;
    }
    
    // Apply coupon if provided
    let discountAmount = 0;
    let couponId = null;
    
    if (couponCode) {
      const coupon = await Coupon.findOne({
        where: {
          code: couponCode,
          isActive: true,
          validFrom: { [Sequelize.Op.lte]: new Date() },
          validUntil: { [Sequelize.Op.gte]: new Date() }
        },
        transaction
      });
      
      if (coupon) {
        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Coupon usage limit reached'
          });
        }
        
        // Check minimum order amount
        if (coupon.minOrderAmount && totalPrice < coupon.minOrderAmount) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`
          });
        }
        
        // Check if user has already used this coupon
        if (coupon.isSingleUse) {
          const userCoupon = await UserCoupon.findOne({
            where: {
              userId: req.user.id,
              couponId: coupon.id,
              isUsed: true
            },
            transaction
          });
          
          if (userCoupon) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: 'Coupon already used'
            });
          }
        }
        
        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
          discount = (totalPrice * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        
        discountAmount = discount;
        couponId = coupon.id;
        
        // Mark coupon as used
        await UserCoupon.create({
          userId: req.user.id,
          couponId: coupon.id,
          isUsed: true,
          usedAt: new Date(),
          orderId: null // Will be updated after order creation
        }, { transaction });
        
        // Increment coupon usage count
        await coupon.increment('usedCount', { transaction });
      }
    }
    
    // Calculate final amount
    const finalAmount = totalPrice + shippingCost + taxAmount - discountAmount;
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Validate EMI if payment method is EMI
    if (paymentMethod === 'emi') {
      if (!emiTenure || ![3, 6, 9, 12].includes(parseInt(emiTenure))) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Valid EMI tenure (3, 6, 9, or 12 months) is required'
        });
      }
    }
    
    // Create order
    const order = await Order.create({
      orderNumber,
      userId: req.user.id,
      orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : (paymentMethod === 'emi' ? 'pending' : 'pending'),
      orderStatus: 'pending',
      totalPrice,
      shippingCost,
      taxAmount,
      discountAmount,
      finalAmount,
      notes,
      couponId,
      emiTenure: paymentMethod === 'emi' ? parseInt(emiTenure) : null
    }, { transaction });
    
    // Deduct stock for all products in order (SIMPLE NUMERIC STOCK)
    for (const item of cart.items) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (product) {
        // Simple numeric stock decrement
        const newStock = Math.max(0, product.stock - item.quantity);
        
        await product.update({
          stock: newStock,
          availability: newStock > 0
        }, { transaction });
      }
    }
    
    // Update coupon with order ID if used
    if (couponId) {
      await UserCoupon.update(
        { orderId: order.id },
        {
          where: {
            userId: req.user.id,
            couponId,
            orderId: null
          },
          transaction
        }
      );
    }
    
    // Clear cart
    await cart.update({
      items: [],
      totalAmount: 0
    }, { transaction });
    
    // Create EMI payment if payment method is EMI
    let emiPayment = null;
    if (paymentMethod === 'emi') {
      const interestRate = emiInterestRate || 0; // Default 0% interest, can be configured
      const emiDetails = calculateEMI(finalAmount, interestRate, parseInt(emiTenure));
      const startDate = new Date(); // EMI starts from order date
      
      emiPayment = await EmiPayment.create({
        orderId: order.id,
        userId: req.user.id,
        principalAmount: finalAmount,
        interestRate: interestRate,
        tenure: parseInt(emiTenure),
        monthlyInstallment: emiDetails.monthlyInstallment,
        totalAmount: emiDetails.totalAmount,
        totalInterest: emiDetails.totalInterest,
        startDate: startDate,
        status: 'active',
        nextDueDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000), // First installment due in 30 days
        paidInstallments: 0,
        remainingInstallments: parseInt(emiTenure)
      }, { transaction });
      
      // Generate installment schedule
      const installments = generateInstallmentSchedule(
        finalAmount,
        emiDetails.monthlyInstallment,
        interestRate,
        parseInt(emiTenure),
        startDate
      );
      
      // Create installments
      await EmiInstallment.bulkCreate(
        installments.map(inst => ({
          emiPaymentId: emiPayment.id,
          installmentNumber: inst.installmentNumber,
          dueDate: inst.dueDate,
          amount: inst.amount,
          principalAmount: inst.principalAmount,
          interestAmount: inst.interestAmount,
          status: inst.status
        })),
        { transaction }
      );
    }
    
    await transaction.commit();
    
    // Include EMI details in response if EMI payment was created
    const orderResponse = order.toJSON();
    if (emiPayment) {
      const emiWithInstallments = await EmiPayment.findByPk(emiPayment.id, {
        include: [
          {
            model: EmiInstallment,
            as: 'installments',
            order: [['installmentNumber', 'ASC']]
          }
        ]
      });
      orderResponse.emiPayment = emiWithInstallments;
    }
    
    res.status(201).json({
      success: true,
      message: paymentMethod === 'emi' 
        ? 'Order created successfully with EMI payment plan' 
        : 'Order created successfully',
      data: orderResponse
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders
 * @access  Private (Customer)
 */
export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { userId: req.user.id };
    if (status) where.orderStatus = status;
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']], // Changed from 'createdAt' to 'created_at'
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};
/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private (Customer)
 */
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: Coupon,
          as: 'coupon',
          attributes: ['id', 'code', 'discountType', 'discountValue']
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Enrich order items with product details
    const enrichedItems = await Promise.all(
      order.orderItems.map(async (item) => {
        const product = await Product.findByPk(item.productId, {
          attributes: ['id', 'name', 'slug', 'images']
        });
        
        return {
          ...item,
          product: product || null
        };
      })
    );
    
    const enrichedOrder = {
      ...order.toJSON(),
      orderItems: enrichedItems
    };
    
    res.status(200).json({
      success: true,
      data: enrichedOrder
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (Customer)
 */
export const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      transaction
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in "${order.orderStatus}" status`
      });
    }
    
    // Update order status
    await order.update({
      orderStatus: 'cancelled',
      paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : 'failed'
    }, { transaction });
    
    // Restore product stock (SIMPLE NUMERIC STOCK)
    for (const item of order.orderItems) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (product) {
        // Simple numeric stock increment
        const newStock = (product.stock || 0) + item.quantity;
        
        await product.update({
          stock: newStock,
          availability: newStock > 0
        }, { transaction });
      }
    }
    
    // Refund coupon if used
    if (order.couponId) {
      await UserCoupon.update(
        { isUsed: false, usedAt: null, orderId: null },
        {
          where: {
            userId: req.user.id,
            couponId: order.couponId,
            orderId: order.id
          },
          transaction
        }
      );
      
      await Coupon.decrement('usedCount', {
        where: { id: order.couponId },
        transaction
      });
    }
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
};

/**
 * @desc    Track order by tracking ID
 * @route   GET /api/orders/track/:trackingId
 * @access  Public
 */
export const trackOrder = async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    const order = await Order.findOne({
      where: { trackingId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Return limited info for public tracking
    const trackingInfo = {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      shippingAddress: order.shippingAddress,
      estimatedDelivery: order.estimatedDelivery,
      lastUpdated: order.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking order'
    });
  }
};

/**
 * @desc    Get order by order number
 * @route   GET /api/orders/number/:orderNumber
 * @access  Private (Customer)
 */
export const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({
      where: {
        orderNumber,
        userId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: Coupon,
          as: 'coupon',
          attributes: ['id', 'code', 'discountType', 'discountValue']
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};