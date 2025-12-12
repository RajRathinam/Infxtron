// models/DietPlan.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DietPlan = sequelize.define('DietPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 120
    }
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 50,
      max: 300
    }
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1,
      max: 500
    }
  },
  targetWeight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 1,
      max: 500
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  mainGoal: {
    type: DataTypes.ENUM(
      'Lose weight (fat loss)',
      'Gain weight (muscle gain)',
      'Maintain current weight',
      'Improve strength/performance',
      'General healthy lifestyle'
    ),
    allowNull: false
  },
  dietType: {
    type: DataTypes.ENUM('Non-Vegetarian', 'Vegetarian', 'Eggetarian'),
    allowNull: false
  },
  foodRestrictions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dislikedFoods: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preferredContact: {
    type: DataTypes.ENUM('WhatsApp', 'Email', 'Both'),
    allowNull: false,
    defaultValue: 'WhatsApp'
  },
  followUpConsultation: {
    type: DataTypes.ENUM('yes', 'no'),
    allowNull: false,
    defaultValue: 'no'
  },
  additionalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'contacted'),
    allowNull: false,
    defaultValue: 'pending'
  },
  telegramNotificationSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'diet_plans',
  timestamps: true,
  underscored: false
});

export default DietPlan;