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
    const { productId, quantity = 1, colorName, imageUrl } = req.body; // ADD imageUrl here
    const userId = req.user.id;
    
    console.log('Add to cart request:', { productId, quantity, colorName, imageUrl, userId });
    
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
      name: product.name
    });
    
    // Parse product images and colors
    const productImages = parseProductImages(product);
    const colorsAndImages = parseColorsAndImages(product);
    
    // Check if product has colors defined
    const hasColors = Object.keys(colorsAndImages).length > 0;
    
    let finalColorName = null;
    let finalImageUrl = null;
    
    // Use the colorName from request if provided
    if (colorName) {
      if (hasColors) {
        const availableColors = Object.keys(colorsAndImages);
        if (availableColors.includes(colorName)) {
          finalColorName = colorName;
        } else {
          console.log('Requested color not in available colors:', colorName);
          finalColorName = null;
        }
      } else {
        // Product doesn't have defined colors, but still accept colorName from request
        finalColorName = colorName;
      }
    }
    
    // Priority for imageUrl:
    // 1. Use imageUrl from request if provided
    // 2. Use image from product based on color
    // 3. Use first product image
    
    if (imageUrl) {
      // Use the imageUrl provided in the request
      finalImageUrl = imageUrl;
      console.log('Using imageUrl from request:', finalImageUrl);
    } else if (finalColorName && colorsAndImages[finalColorName]) {
      // Get image for the selected color
      const colorImages = colorsAndImages[finalColorName];
      if (Array.isArray(colorImages) && colorImages.length > 0) {
        const mainImage = colorImages.find(img => img.type === 'main');
        finalImageUrl = mainImage ? mainImage.url : colorImages[0].url;
        console.log('Using image for color:', { color: finalColorName, imageUrl: finalImageUrl });
      }
    } else if (productImages.length > 0) {
      // Use first product image
      const firstImage = productImages[0];
      finalImageUrl = typeof firstImage === 'object' && firstImage.url ? firstImage.url : firstImage;
      console.log('Using first product image:', finalImageUrl);
    }
    
    // Check stock availability
    const requestedQuantity = parseInt(quantity) || 1;
    const totalStock = getTotalStock(product.stock);
    
    if (requestedQuantity > totalStock) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Only ${totalStock} items available in stock`
      });
    }
    
    console.log('Final values:', { 
      colorName: finalColorName, 
      imageUrl: finalImageUrl 
    });
    
    // Get or create cart
    let cart = await Cart.findOne({
      where: { userId },
      transaction,
      raw: false
    });
    
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
    
    const itemPrice = parseFloat(product.discountPrice || product.price) || 0;
    
    if (existingItemIndex > -1) {
      // Update existing item - preserve imageUrl if already exists
      items[existingItemIndex].quantity += requestedQuantity;
      items[existingItemIndex].price = itemPrice;
      items[existingItemIndex].updatedAt = new Date();
      
      // Only update imageUrl if not already set or if new imageUrl is provided
      if (!items[existingItemIndex].imageUrl && finalImageUrl) {
        items[existingItemIndex].imageUrl = finalImageUrl;
      }
      
      console.log('Updated existing item:', items[existingItemIndex]);
    } else {
      // Add new item with ALL data
      const newItem = {
        productId: String(productId),
        productName: product.name,
        quantity: requestedQuantity,
        colorName: finalColorName, // Use the determined color name
        price: itemPrice,
        imageUrl: finalImageUrl, // Use the determined image URL
        addedAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Adding new item to cart:', newItem);
      items.push(newItem);
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
    const { quantity, colorName = null, imageUrl } = req.body; // ADD imageUrl
    const userId = req.user.id;
    
    console.log('Update cart item request:', { 
      productId, 
      quantity, 
      colorName, 
      imageUrl, // Log imageUrl
      userId
    });
    
    if (!quantity || isNaN(quantity) || quantity < 1) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Valid quantity (minimum 1) is required'
      });
    }
    
    // Get cart
    const cart = await Cart.findOne({
      where: { userId },
      transaction,
      raw: false
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
    
    // Update item
    items[itemIndex].quantity = parseInt(quantity);
    items[itemIndex].updatedAt = new Date();
    
    // Update imageUrl if provided
    if (imageUrl !== undefined) {
      items[itemIndex].imageUrl = imageUrl;
    }
    
    console.log('Item after update:', items[itemIndex]);
    
    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      const itemTotal = (parseFloat(item.price) || 0) * (item.quantity || 1);
      return total + itemTotal;
    }, 0);
    
    console.log('New total amount:', totalAmount);
    
    // Update cart
    cart.setDataValue('items', items);
    cart.changed('items', true);
    cart.totalAmount = totalAmount;
    
    await cart.save({ transaction });
    
    await transaction.commit();
    
    console.log('Transaction committed');
    
    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        id: cart.id,
        userId: cart.userId,
        items: items,
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