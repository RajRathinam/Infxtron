// utils/emiCalculator.js

/**
 * Calculate EMI (Equated Monthly Installment)
 * Formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
 * Where:
 * P = Principal amount
 * R = Monthly interest rate (annual rate / 12 / 100)
 * N = Number of installments
 * 
 * @param {number} principal - Principal amount
 * @param {number} annualInterestRate - Annual interest rate percentage
 * @param {number} tenureMonths - Tenure in months (3, 6, 9, or 12)
 * @returns {object} EMI calculation details
 */
export const calculateEMI = (principal, annualInterestRate = 0, tenureMonths) => {
  if (!principal || principal <= 0) {
    throw new Error('Principal amount must be greater than 0');
  }
  
  if (![3, 6, 9, 12].includes(tenureMonths)) {
    throw new Error('Tenure must be 3, 6, 9, or 12 months');
  }
  
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const numberOfInstallments = tenureMonths;
  
  let monthlyInstallment;
  let totalInterest = 0;
  let totalAmount = 0;
  
  if (monthlyInterestRate === 0 || annualInterestRate === 0) {
    // No interest - simple division
    monthlyInstallment = principal / numberOfInstallments;
    totalInterest = 0;
    totalAmount = principal;
  } else {
    // Calculate EMI using formula
    const power = Math.pow(1 + monthlyInterestRate, numberOfInstallments);
    monthlyInstallment = (principal * monthlyInterestRate * power) / (power - 1);
    
    totalAmount = monthlyInstallment * numberOfInstallments;
    totalInterest = totalAmount - principal;
  }
  
  // Round to 2 decimal places
  monthlyInstallment = Math.round(monthlyInstallment * 100) / 100;
  totalAmount = Math.round(totalAmount * 100) / 100;
  totalInterest = Math.round(totalInterest * 100) / 100;
  
  return {
    principal: parseFloat(principal.toFixed(2)),
    interestRate: parseFloat(annualInterestRate.toFixed(2)),
    tenure: tenureMonths,
    monthlyInstallment: parseFloat(monthlyInstallment.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    numberOfInstallments: numberOfInstallments
  };
};

/**
 * Generate installment schedule
 * @param {number} principal - Principal amount
 * @param {number} monthlyInstallment - Monthly EMI amount
 * @param {number} annualInterestRate - Annual interest rate percentage
 * @param {number} tenureMonths - Tenure in months
 * @param {Date} startDate - Start date for EMI
 * @returns {array} Array of installment objects
 */
export const generateInstallmentSchedule = (
  principal,
  monthlyInstallment,
  annualInterestRate,
  tenureMonths,
  startDate = new Date()
) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const installments = [];
  let remainingPrincipal = principal;
  
  for (let i = 1; i <= tenureMonths; i++) {
    // Calculate due date (start date + i months)
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    // Calculate interest for this month
    const interestAmount = remainingPrincipal * monthlyInterestRate;
    const principalAmount = monthlyInstallment - interestAmount;
    
    // Update remaining principal
    remainingPrincipal -= principalAmount;
    
    // For the last installment, adjust to ensure exact payment
    let finalPrincipalAmount = principalAmount;
    let finalInterestAmount = interestAmount;
    let finalInstallmentAmount = monthlyInstallment;
    
    if (i === tenureMonths) {
      // Last installment - adjust to pay off remaining balance
      finalPrincipalAmount = remainingPrincipal + principalAmount;
      finalInterestAmount = monthlyInstallment - finalPrincipalAmount;
      remainingPrincipal = 0;
    }
    
    installments.push({
      installmentNumber: i,
      dueDate: new Date(dueDate),
      amount: parseFloat(finalInstallmentAmount.toFixed(2)),
      principalAmount: parseFloat(finalPrincipalAmount.toFixed(2)),
      interestAmount: parseFloat(finalInterestAmount.toFixed(2)),
      status: 'pending'
    });
  }
  
  return installments;
};

/**
 * Get EMI options for a given amount
 * @param {number} amount - Order amount
 * @param {object} emiConfig - EMI configuration with interest rates per tenure
 * @returns {array} Available EMI options
 */
export const getEMIOptions = (amount, emiConfig = {}) => {
  const defaultConfig = {
    3: 0,   // 0% interest for 3 months
    6: 2,   // 2% annual interest for 6 months
    9: 3,   // 3% annual interest for 9 months
    12: 5   // 5% annual interest for 12 months
  };
  
  const config = { ...defaultConfig, ...emiConfig };
  const options = [];
  
  [3, 6, 9, 12].forEach(tenure => {
    try {
      const emiDetails = calculateEMI(amount, config[tenure], tenure);
      options.push({
        tenure,
        monthlyInstallment: emiDetails.monthlyInstallment,
        totalAmount: emiDetails.totalAmount,
        totalInterest: emiDetails.totalInterest,
        interestRate: emiDetails.interestRate,
        ...emiDetails
      });
    } catch (error) {
      console.error(`Error calculating EMI for ${tenure} months:`, error);
    }
  });
  
  return options;
};



