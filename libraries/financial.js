const financial = {
    functions: {
        interestIncome: {
            description: "Calculates the interest income based on principal and annual rate",
            implementation: function(principal, rate) {
                console.log('interestIncome', principal, rate);
                return principal * rate;
            }
        },
        monthsUntilMaturity: {
            description: "Calculates the number of months to maturity of a financial instrument",
            implementation: function(maturity = null, term = null) {
                //console.log(`maturity: ${maturity}, term: ${term}`)
                let monthsUntilMaturity;
                if (maturity) {
                    const maturityDate = new Date(maturity);
                    const currentDate = new Date();
                    monthsUntilMaturity = parseInt(Math.max(1, (maturityDate.getFullYear() - currentDate.getFullYear()) * 12 + (maturityDate.getMonth() - currentDate.getMonth())));
                } else if (term) {
                    monthsUntilMaturity = term;
                } else {
                    console.warn('Neither maturity date nor term provided, defaulting to 12 months');
                    monthsUntilMaturity = 12; // Default to 12 months if neither is provided
                }
                return monthsUntilMaturity;
            }
        },
        averageBalance: {
            description: "Calculates the average balance of a loan over its term",
            implementation: function(principal, payment, maturity = null, term = null) {
                console.log('principal, payment, maturity, term', principal, payment, maturity, term)
                // Determine months until maturity using either maturity date or term
                const monthsUntilMaturity = financial.functions.monthsUntilMaturity.implementation(maturity, term);
                // Calculate the total balance over the loan period
                let totalBalance = 0;
                let currentBalance = principal;

                for (let month = 0; month < monthsUntilMaturity; month++) {
                    totalBalance += currentBalance;
                    currentBalance -= payment;
                    if (currentBalance < 0) {
                        currentBalance = 0; // Ensure balance doesn't go negative
                    }
                }

                // Calculate average balance
                const averageBalance = totalBalance / monthsUntilMaturity;
                return averageBalance.toFixed(2);
            }
        },
        profit: {
            description: "Calculates the profit of a loan",
            implementation: function(principal, rate,  maturity = null, term = null) {
                const interest = principal * rate;
                const monthsUntilMaturity = financial.functions.monthsUntilMaturity.implementation(maturity, term);
                const fundingExpense = principal * window.libraries.api.trates.values[monthsUntilMaturity];
                const originationExpense = Math.min(principal, financial.attributes.principalCostMax.value) * financial.attributes.loanOriginationFactor.value;  
                const servicingExpense = principal * financial.attributes.loanServicingFactor.value / monthsUntilMaturity * 12;
                console.log(`interest: ${interest}, funding expense: ${fundingExpense}, origination expense: ${originationExpense}, servicing expense: ${servicingExpense}`);
                return interest - fundingExpense - originationExpense - servicingExpense;
            }
        }
    },
    attributes: {
        loanServicingFactor: {
            description: "The factor used to calculate loan servicing expenses",
            value: 0.0025
        },
        loanOriginationFactor: {
            description: "The factor used to calculate loan origination expenses",
            value: 0.01
        },
        principalCostMax: {
            description: "Max principal where costs scale with loan size",
            value: 2000000
        },
        defaultRecoveryPerc: {
            description: "The default recovery percentage",
            value: 0.50
        },
        minOperatingRisk: {
            description: "The minimum operating risk percentage",
            value: 0.0015
        },
        depositUnitCost: {
            description: "The unit cost for deposits",
            value: 2
        },
        withdrawalUnitCost: {
            description: "The unit cost for withdrawals",
            value: 0.11
        },
        ddaReserveRequired: {
            description: "The required fed reserve for checking accounts / demand deposit accounts(DDA)",
            value: 0.10
        },
        savingsAnnualExpense: {
            description: "The savings account annual operating costs",
            value: 28
        }
    }
};
window.financial = financial; // Make it globally accessible