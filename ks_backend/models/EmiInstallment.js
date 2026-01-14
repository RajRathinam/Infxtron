// models/EmiInstallment.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmiInstallment = sequelize.define('EmiInstallment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  emiPaymentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'emi_payments',
      key: 'id'
    }
  },
  installmentNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Installment number (1, 2, 3, etc.)'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Due date for this installment'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Installment amount'
  },
  principalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Principal portion of this installment'
  },
  interestAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Interest portion of this installment'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'pending',
    comment: 'Installment payment status'
  },
  paidDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when installment was paid'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cod', 'card', 'upi', 'netbanking'),
    allowNull: true,
    comment: 'Payment method used'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Payment transaction ID'
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether reminder was sent for this installment'
  },
  reminderSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When reminder was sent'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'emi_installments',
  timestamps: true,
  indexes: [
    {
      fields: ['emi_payment_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['due_date']
    },
    {
      unique: true,
      fields: ['emi_payment_id', 'installment_number'],
      name: 'unique_emi_installment'
    }
  ]
});

export default EmiInstallment;



