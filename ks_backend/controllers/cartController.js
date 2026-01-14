import { Cart, Product, User, sequelize } from '../models/index.js';
import { validateCartItem } from '../utils/validators.js';
import { getTotalStock, getStockForColor } from '../utils/helpers.js';

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private (Customer)
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    if (!cart) {
      const newCart = await Cart.create({
        userId,
        items: [],
        totalAmount: 0
      });
      
      return res.status(200).json({
        success: true,
        data: newCart
      });
    }
    
    // Parse items if they're stored as JSON string
    let items = [];
    if (cart.items) {
      if (Array.isArray(cart.items)) {
        items = [...cart.items];
      } else if (typeof cart.items === 'string') {
        try {
          items = JSON.parse(cart.items);
          if (!Array.isArray(items)) items = [];
        } catch (error) {
          console.error('Error parsing cart items:', error);
          items = [];
        }
      }
    }
    
    // Enrich cart items with product details
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findByPk(item.productId, {
          attributes: [
            'id', 'name', 'slug', 'price', 'discountPrice', 
            'images', 'colorsAndImages', 'availability', 'stock', 'isActive'
          ]
        });
        
        if (!product) {
          return {
            ...item,
            product: null,
            totalPrice: 0
          };
        }
        
        // Prepare product data for response
        const productData = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          discountPrice: product.discountPrice,
          isActive: product.isActive,
          images: product.images || []
        };
        
        // If item has an imageUrl already, use it
        // Otherwise, get image from product based on color
        let imageUrl = item.imageUrl;
        
        if (!imageUrl && product.colorsAndImages && typeof product.colorsAndImages === 'object') {
          // If item has a colorName, get the image for that color
          if (item.colorName && product.colorsAndImages[item.colorName]) {
            const colorImages = product.colorsAndImages[item.colorName];
            if (Array.isArray(colorImages) && colorImages.length > 0) {
              // Get the main image (type: 'main') or first image
              const mainImage = colorImages.find(img => img.type === 'main');
              imageUrl = mainImage ? mainImage.url : colorImages[0].url;
            }
          }
        }
        
        return {
          ...item,
          product: productData,
          imageUrl: imageUrl, // Ensure imageUrl is included
          totalPrice: (product.discountPrice || product.price || 0) * (item.quantity || 1)
        };
      })
    );
    
    const totalAmount = enrichedItems.reduce((total, item) => {
      return total + (item.totalPrice || 0);
    }, 0);
    
    const enrichedCart = {
      ...cart.toJSON(),
      items: enrichedItems,
      totalAmount
    };
    
    res.status(200).json({
      success: true,
      data: enrichedCart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/items
 * @access  Private (Customer)
 */
export const addToCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { productId, quantity = 1, colorName } = req.body;
    const userId = req.user.id;
    
    console.log('Add to cart request:', { productId, quantity, colorName, userId });
    
    // Validate productId
    if (!productId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId, { transaction });
    
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.isActive) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }
    
    console.log('Product found:', { 
      id: product.id, 
      name: product.name, 
      price: product.price,
      hasColors: product.colorsAndImages ? Object.keys(product.colorsAndImages).length > 0 : false
    });
    
    // Check if product has colors defined
    const hasColors = product.colorsAndImages && 
      typeof product.colorsAndImages === 'object' && 
      Object.keys(product.colorsAndImages).length > 0;
    
    let finalColorName = null;
    let imageUrl = null;
    
    if (hasColors) {
      // Product has colors defined
      const availableColors = Object.keys(product.colorsAndImages);
      
      if (!colorName && availableColors.length > 0) {
        // If no color specified but product has colors, use the first color
        finalColorName = availableColors[0];
        console.log('No color specified, using first available color:', finalColorName);
      } else if (colorName) {
        // Validate the specified color exists
        if (!availableColors.includes(colorName)) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Color "${colorName}" is not available for this product`,
            availableColors: availableColors
          });
        }
        finalColorName = colorName;
      }
      
      // Get the image URL for the selected color
      if (finalColorName && product.colorsAndImages[finalColorName]) {
        const colorImages = product.colorsAndImages[finalColorName];
        if (Array.isArray(colorImages) && colorImages.length > 0) {
          // Get the main image (type: 'main') or first image
          const mainImage = colorImages.find(img => img.type === 'main');
          imageUrl = mainImage ? mainImage.url : colorImages[0].url;
          console.log('Selected image for color:', { color: finalColorName, imageUrl });
        }
      }
    } else {
      // Product doesn't have colors
      if (colorName) {
        console.log('Product has no colors defined, ignoring colorName:', colorName);
      }
      finalColorName = null;
      
      // Use first image from images array if available
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        // Check if images array contains objects with url property
        const firstImage = product.images[0];
        imageUrl = typeof firstImage === 'object' && firstImage.url ? firstImage.url : firstImage;
        console.log('Using product image:', imageUrl);
      }
    }
    
    console.log('Final color to use:', finalColorName, 'Image URL:', imageUrl);
    
    // Get or create cart
    let cart = await Cart.findOne({
      where: { userId },
      transaction,
      raw: false
    });
    
    console.log('Existing cart:', cart ? {
      id: cart.id,
      itemsCount: Array.isArray(cart.items) ? cart.items.length : 0
    } : 'No cart found');
    
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
        totalAmount: 0
      }, { transaction, raw: false });
      console.log('Created new cart');
    }
    
    // Ensure items is always an array
    let items = [];
    if (cart.items) {
      if (Array.isArray(cart.items)) {
        items = [...cart.items];
      } else if (typeof cart.items === 'string') {
        try {
          items = JSON.parse(cart.items);
          if (!Array.isArray(items)) items = [];
        } catch (error) {
          console.error('Error parsing cart items:', error);
          items = [];
        }
      }
    }
    
    console.log('Current items in cart:', items.length);
    
    // Check if item already exists
    const existingItemIndex = items.findIndex(item => {
      const itemProductId = String(item.productId);
      const reqProductId = String(productId);
      
      // Compare product ID
      if (itemProductId !== reqProductId) return false;
      
      // Compare color - both null or same value
      const itemColor = item.colorName || null;
      const reqColor = finalColorName || null;
      
      return itemColor === reqColor;
    });
    
    console.log('Existing item index:', existingItemIndex);
    
    const requestedQuantity = parseInt(quantity) || 1;
    const itemPrice = product.discountPrice || product.price;
    
    if (existingItemIndex > -1) {
      // Update existing item
      items[existingItemIndex].quantity += requestedQuantity;
      items[existingItemIndex].price = itemPrice;
      items[existingItemIndex].updatedAt = new Date();
      console.log('Updated existing item. New quantity:', items[existingItemIndex].quantity);
    } else {
      // Add new item
      const newItem = {
        productId: String(productId),
        productName: product.name,
        quantity: requestedQuantity,
        colorName: finalColorName, // Use the determined color
        price: itemPrice,
        imageUrl: imageUrl, // Include the image URL
        addedAt: new Date(),
        updatedAt: new Date()
      };
      
      items.push(newItem);
      console.log('Added new item:', newItem);
    }
    
    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + ((item.price || 0) * (item.quantity || 1));
    }, 0);
    
    console.log('Total items in cart:', items.length);
    console.log('Total amount:', totalAmount);
    
    // Save cart
    await cart.update({
      items: items,
      totalAmount: totalAmount
    }, { transaction });
    
    await transaction.commit();
    
    console.log('Transaction committed successfully');
    
    // Return response with items
    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        id: cart.id,
        userId: cart.userId,
        items: items,
        totalAmount: totalAmount,
        itemCount: items.length
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding item to cart',
      error: error.message
    });
  }
};

export const updateCartItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { productId } = req.params;
    const { quantity, colorName = null } = req.body;
    const userId = req.user.id;
    
    console.log('Update cart item request:', { 
      productId, 
      quantity, 
      colorName, 
      userId
    });
    
    if (!quantity || isNaN(quantity) || quantity < 1) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Valid quantity (minimum 1) is required'
      });
    }
    
    // Get cart WITH raw: false to get the instance
    const cart = await Cart.findOne({
      where: { userId },
      transaction,
      raw: false // This is important!
    });
    
    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    console.log('Cart found:', cart.id);
    console.log('Cart items type:', typeof cart.items);
    
    // Parse items - handle both string and array
    let items = [];
    if (cart.items) {
      if (Array.isArray(cart.items)) {
        items = [...cart.items];
      } else if (typeof cart.items === 'string') {
        try {
          items = JSON.parse(cart.items);
          if (!Array.isArray(items)) items = [];
        } catch (error) {
          console.error('Error parsing cart items:', error);
          items = [];
        }
      }
    }
    
    console.log('Items in cart:', items.length);
    
    // Find item in cart
    const itemIndex = items.findIndex(item => {
      const itemProductId = String(item.productId);
      const reqProductId = String(productId);
      
      // Compare product ID
      if (itemProductId !== reqProductId) return false;
      
      // Compare color - both null or same value
      const itemColor = item.colorName || null;
      const reqColor = colorName || null;
      
      return itemColor === reqColor;
    });
    
    if (itemIndex === -1) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    console.log('Item before update:', items[itemIndex]);
    
    // Check product stock if needed
    const product = await Product.findByPk(productId, { transaction });
    if (product) {
      const totalStock = getTotalStock(product.stock);
      if (quantity > totalStock) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Only ${totalStock} items available in stock`
        });
      }
      
      // Update price from current product price
      items[itemIndex].price = product.discountPrice || product.price;
    }
    
    // Update item quantity
    items[itemIndex].quantity = parseInt(quantity);
    items[itemIndex].updatedAt = new Date();
    
    console.log('Item after update:', items[itemIndex]);
    
    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      const itemTotal = (parseFloat(item.price) || 0) * (item.quantity || 1);
      return total + itemTotal;
    }, 0);
    
    console.log('New total amount:', totalAmount);
    
    // CRITICAL FIX: Force Sequelize to see items as changed
    // Method 1: Set the items field directly and mark it as changed
    cart.setDataValue('items', items);
    cart.changed('items', true); // Force change detection
    
    // Also update totalAmount
    cart.totalAmount = totalAmount;
    
    console.log('Changed fields:', cart.changed());
    
    // Save the cart - this should now include items in the UPDATE
    await cart.save({ transaction });
    
    console.log('Cart saved');
    
    // Reload to verify
    await cart.reload({ transaction });
    console.log('Cart after reload - items[0].quantity:', cart.items[0]?.quantity);
    
    await transaction.commit();
    
    console.log('Transaction committed');
    
    // Enrich items for response
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findByPk(item.productId, {
          attributes: [
            'id', 'name', 'slug', 'price', 'discountPrice', 
            'images', 'colorsAndImages', 'availability', 'stock', 'isActive'
          ]
        });
        
        if (!product) {
          return {
            ...item,
            product: null,
            totalPrice: 0
          };
        }
        
        const productData = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          discountPrice: product.discountPrice,
          isActive: product.isActive,
          images: product.images || []
        };
        
        return {
          ...item,
          product: productData,
          totalPrice: (product.discountPrice || product.price || 0) * (item.quantity || 1)
        };
      })
    );
    
    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        id: cart.id,
        userId: cart.userId,
        items: enrichedItems,
        totalAmount: totalAmount
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart item',
      error: error.message
    });
  }
};
/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:productId
 * @access  Private (Customer)
 */
export const removeFromCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { productId } = req.params;
    const { colorName } = req.query; // Optional: color name
    const userId = req.user.id;
    
    console.log('Remove from cart:', { productId, colorName, userId });
    
    // Get cart
    const cart = await Cart.findOne({
      where: { userId },
      transaction
    });
    
    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Parse items
    let items = [];
    if (cart.items) {
      if (Array.isArray(cart.items)) {
        items = [...cart.items];
      } else if (typeof cart.items === 'string') {
        try {
          items = JSON.parse(cart.items);
          if (!Array.isArray(items)) items = [];
        } catch (error) {
          console.error('Error parsing cart items:', error);
          items = [];
        }
      }
    }
    
    console.log('Current items before removal:', items);
    
    // Find item in cart
    const itemIndex = items.findIndex(item => {
      const itemProductId = String(item.productId);
      const reqProductId = String(productId);
      
      // Compare product ID
      if (itemProductId !== reqProductId) return false;
      
      // Compare color if specified
      if (colorName !== undefined) {
        const itemColor = item.colorName || null;
        const reqColor = colorName || null;
        return itemColor === reqColor;
      }
      
      // If no color specified, match any color
      return true;
    });
    
    console.log('Found item at index:', itemIndex);
    
    if (itemIndex === -1) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Remove item
    const removedItem = items.splice(itemIndex, 1);
    console.log('Removed item:', removedItem);
    console.log('Items after removal:', items);
    
    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + ((item.price || 0) * (item.quantity || 1));
    }, 0);
    
    // Update cart
    await cart.update({
      items: items,
      totalAmount: totalAmount
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        id: cart.id,
        userId: cart.userId,
        items: items,
        totalAmount: totalAmount,
        removedItem: removedItem[0]
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing item from cart',
      error: error.message
    });
  }
};
/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private (Customer)
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({
      where: { userId }
    });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    await cart.update({
      items: [],
      totalAmount: 0
    });
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
};

/**
 * @desc    Get cart item count
 * @route   GET /api/cart/count
 * @access  Private (Customer)
 */
export const getCartItemCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({
      where: { userId }
    });
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { count: 0 }
      });
    }
    
    const itemCount = cart.items.reduce((total, item) => {
      return total + (item.quantity || 1);
    }, 0);
    
    res.status(200).json({
      success: true,
      data: {
        count: itemCount,
        uniqueItems: cart.items.length
      }
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart count'
    });
  }
};