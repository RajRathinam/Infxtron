// services/telegramService.js
import TelegramBot from 'node-telegram-bot-api';

// Simple Telegram service
export class TelegramService {
  constructor() {
    this.bot = null;
    this.chatIds = []; // Now an array for multiple recipients
    this.isReady = false;
  }

  async init() {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatIdsEnv = process.env.TELEGRAM_CHAT_IDS;
      
      if (!token || !chatIdsEnv) {
        console.log('⚠️ Telegram: Missing BOT_TOKEN or CHAT_IDS in .env');
        console.log('   Add these to your .env file:');
        console.log('   TELEGRAM_BOT_TOKEN=your_token_here');
        console.log('   TELEGRAM_CHAT_IDS=chat_id_1,chat_id_2,chat_id_3');
        return false;
      }
      
      // Parse multiple chat IDs (comma-separated)
      this.chatIds = chatIdsEnv
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '' && !isNaN(id));
      
      if (this.chatIds.length === 0) {
        console.log('⚠️ Telegram: No valid chat IDs found');
        return false;
      }
      
      this.bot = new TelegramBot(token, { polling: false });
      this.isReady = true;
      
      console.log('✅ Telegram bot initialized');
      console.log(`   Chat IDs: ${this.chatIds.join(', ')} (${this.chatIds.length} recipients)`);
      
      // Test the connection to first recipient
      // await this.sendTestMessage();
      
      return true;
    } catch (error) {
      console.error('❌ Telegram init failed:', error.message);
      return false;
    }
  }

  // Send message to all recipients
  async sendMessage(text, isHTML = false) {
    if (!this.isReady) {
      console.log('⚠️ Telegram not ready, skipping message:', text.substring(0, 50) + '...');
      return false;
    }

    const options = isHTML ? { parse_mode: 'HTML' } : {};
    let allSuccess = true;
    const results = [];

    try {
      // Send to all chat IDs
      for (const chatId of this.chatIds) {
        try {
          await this.bot.sendMessage(chatId, text, options);
          results.push({ chatId, success: true });
          console.log(`📤 Telegram message sent to ${chatId}`);
        } catch (error) {
          console.error(`❌ Telegram send failed for ${chatId}:`, error.message);
          results.push({ chatId, success: false, error: error.message });
          allSuccess = false;
        }
      }
      
      // Log summary
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      console.log(`📊 Telegram send summary: ${successCount} succeeded, ${failCount} failed`);
      
      return allSuccess;
    } catch (error) {
      console.error('❌ Telegram send failed completely:', error.message);
      return false;
    }
  }

  // Send message to specific recipients only
  async sendMessageToSpecific(chatIds, text, isHTML = false) {
    if (!this.isReady) {
      console.log('⚠️ Telegram not ready');
      return false;
    }

    const options = isHTML ? { parse_mode: 'HTML' } : {};
    const targetChatIds = Array.isArray(chatIds) ? chatIds : [chatIds];
    let allSuccess = true;

    try {
      for (const chatId of targetChatIds) {
        try {
          await this.bot.sendMessage(chatId, text, options);
          console.log(`📤 Telegram message sent to ${chatId}`);
        } catch (error) {
          console.error(`❌ Telegram send failed for ${chatId}:`, error.message);
          allSuccess = false;
        }
      }
      
      return allSuccess;
    } catch (error) {
      console.error('❌ Telegram send failed:', error.message);
      return false;
    }
  }

  // Get status of all recipients
  getStatus() {
    return {
      isReady: this.isReady,
      chatIds: this.chatIds,
      recipientCount: this.chatIds.length
    };
  }

  // Test all recipients
  async sendTestMessage() {
    const message = 
      '✅ Telegram Bot Connected!\n\n' +
      'System: AG Healthy Food Backend\n' +
      'Time: ' + new Date().toLocaleString() + '\n' +
      'Status: Ready to receive notifications\n' +
      'Recipients: ' + this.chatIds.length;
    
    return await this.sendMessage(message);
  }

  formatTestMessage() {
    return `
🛠️ <b>TELEGRAM BOT TEST</b>

✅ This is a test message from your backend
⏰ Time: ${new Date().toLocaleString()}
🔄 System: AG Healthy Food Backend
📊 Status: Connection test successful
👥 Recipients: ${this.chatIds.length}

<i>If you receive this, Telegram notifications are working!</i>
    `;
  }

  formatPaymentMessage(order, transaction, customer) {
    return this.formatPaymentSuccess(order, transaction);
  }

  formatDietPlan(data) {
    return `
🥗 <b>NEW DIET PLAN REQUEST</b>

👤 <b>Name:</b> ${data.fullName}
📅 <b>Age:</b> ${data.age}
⚥ <b>Gender:</b> ${data.gender}
📏 <b>Height:</b> ${data.height} cm
⚖️ <b>Weight:</b> ${data.weight} kg
🎯 <b>Target Weight:</b> ${data.targetWeight || 'Not specified'} kg

<b>Goals:</b>
🎯 <b>Main Goal:</b> ${data.mainGoal}
🥗 <b>Diet Type:</b> ${data.dietType}
🚫 <b>Restrictions:</b> ${data.foodRestrictions || 'None'}
👎 <b>Dislikes:</b> ${data.dislikedFoods || 'None'}

<b>Contact:</b>
📧 <b>Email:</b> ${data.email}
📱 <b>Phone:</b> ${data.phone}
💬 <b>Preferred Contact:</b> ${data.preferredContact}
📋 <b>Follow-up:</b> ${data.followUpConsultation}

<b>Notes:</b>
${data.additionalNotes || 'None'}

⏰ <i>Submitted: ${new Date().toLocaleString()}</i>
<i>Recipients: ${this.chatIds.length} people notified</i>
    `;
  }

  formatPaymentSuccess(order, transaction) {
    // Format products list if available
    let productsList = '';
    
    if (order.products && Array.isArray(order.products)) {
      order.products.forEach((product, index) => {
        const productName = product.productName || product.packName || `Product ${index + 1}`;
        const quantity = product.quantity || 1;
        const price = product.price || 0;
        const total = quantity * price;
        const orderType = product.orderType || "xxx";
        const packName = product.packName || "ooo";
        
        productsList += `${index + 1}. ${productName}.(${packName}).(${orderType}) × ${quantity} = ₹${total}\n`;
      });
    } else {
      productsList = 'No products listed\n';
    }
    
    // Calculate total items
    const totalItems = order.products ? 
      order.products.reduce((sum, product) => sum + (product.quantity || 1), 0) : 0;
    
    // Format delivery date
    const deliveryDate = order.deliveryDate ? 
      new Date(order.deliveryDate).toLocaleDateString('en-GB') : 'Not scheduled';
    
    // Format current time
    const currentTime = new Date().toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    // Build the message exactly as requested
    const message = `✅ PAYMENT SUCCESSFUL!\n\n` +
      `Order ID: #${order.id}\n` +
      `Transaction ID: ${transaction.transactionId}\n` +
      `Payment Method: ${order.paymentMethod || 'phonepay'}\n` +
      `Time: ${currentTime}\n` +
      `Recipients: ${this.chatIds.length}\n\n` +
      `Customer Details:\n` +
      `👤 Name: ${order.name}\n` +
      `📱 Phone: ${order.phone}\n` +
      `📍 Address: ${order.address || 'Not specified'}\n\n` +
      `Delivery Details:\n` +
      `🏠 Delivery Address: ${order.deliveryAddress || order.address || 'Not specified'}\n` +
      `📅 Delivery Date: ${deliveryDate}\n` +
      `💰 Delivery Charge: ₹${order.deliveryCharge || 0}\n\n` +
      `Products:\n${productsList}\n` +
      `Total Items: ${totalItems}\n` +
      `Total Amount: ₹${transaction.amount || order.totalPrice || 0}\n\n` +
      `Order Status: ${order.status || 'order taken'}\n` +
      `---\n` +
      `🔄 Next Step: Process the order for delivery`;
    
    return message;
  }
}

// Create singleton instance
const telegramService = new TelegramService();
export default telegramService;