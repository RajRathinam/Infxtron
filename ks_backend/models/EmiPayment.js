// models/EmiPayment.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmiPayment = sequelize.define('EmiPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    },
    unique: true,
    comment: 'One EMI payment per order'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  principalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total amount to be paid in installments'
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Annual interest rate percentage'
  },
  tenure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[3, 6, 9, 12]]
    },
    comment: 'EMI tenure in months (3, 6, 9, or 12)'
  },
  monthlyInstallment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monthly EMI amount'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total amount including interest'
  },
  totalInterest: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total interest amount'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'EMI start date (usually order delivery date)'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled', 'defaulted'),
    defaultValue: 'active',
    comment: 'EMI payment status'
  },
  nextDueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Next installment due date'
  },
  paidInstallments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of installments paid'
  },
  remainingInstallments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Number of installments remaining'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'emi_payments',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['next_due_date']
    }
  ]
});

export default EmiPayment;



