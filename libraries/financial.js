const financial = {
    functions: {
        interestIncome: {
            description: "Calculates the interest income based on principal and annual rate",
            implementation: function(principal, rate) {
                console.log('interestIncome', principal, rate);
                return principal * rate;
            }
        },
        untilMaturity: {
            description: "Calculates the number of months and years to maturity of a financial instrument",
            implementation: function(maturity = null) {
                let monthsUntilMaturity, yearsUntilMaturity;
        
                if (maturity) {
                    const maturityDate = new Date(maturity);
                    const currentDate = new Date();
        
                    // Calculate the number of months from currentDate to maturityDate
                    const yearsDifference = maturityDate.getFullYear() - currentDate.getFullYear();
                    const monthsDifference = maturityDate.getMonth() - currentDate.getMonth();
        
                    // Total months until maturity
                    monthsUntilMaturity = yearsDifference * 12 + monthsDifference;
        
                    // Adjust if days in the current month are fewer than the day of the maturity date
                    if (currentDate.getDate() > maturityDate.getDate()) {
                        monthsUntilMaturity -= 1;
                    }
        
                    // Ensure monthsUntilMaturity is at least 1
                    monthsUntilMaturity = Math.max(1, monthsUntilMaturity);
        
                    // Calculate yearsUntilMaturity as the integer part of monthsUntilMaturity divided by 12
                    yearsUntilMaturity = monthsUntilMaturity / 12;
        
                    // Ensure yearsUntilMaturity is at least 1
                    yearsUntilMaturity = Math.max(1, yearsUntilMaturity);
        
                } else {
                    console.warn('Maturity date not provided, defaulting to 12 months and 1 year');
                    monthsUntilMaturity = 12; // Default to 12 months if no maturity date is provided
                    yearsUntilMaturity = 1;    // Default to 1 year
                }
        
                return { monthsUntilMaturity, yearsUntilMaturity };
            }
        },
        sinceOpen: {
            description: "Calculates the number of months and years from the open date of a financial instrument",
            implementation: function(open = null) {
                let monthsSinceOpen, yearsSinceOpen;
                if (open) {
                    const openDate = new Date(open);
                    const currentDate = new Date();
        
                    // Calculate the number of months from openDate to currentDate
                    const yearsDifference = currentDate.getFullYear() - openDate.getFullYear();
                    const monthsDifference = currentDate.getMonth() - openDate.getMonth();
        
                    // Total months since openDate
                    monthsSinceOpen = yearsDifference * 12 + monthsDifference;
        
                    // Adjust if days in the current month are fewer than the day of the open date
                    if (currentDate.getDate() < openDate.getDate()) {
                        monthsSinceOpen -= 1;
                    }
        
                    // Ensure monthsSinceOpen is at least 1
                    monthsSinceOpen = Math.max(1, monthsSinceOpen);
        
                    // Calculate yearsSinceOpen as the integer part of monthsSinceOpen divided by 12
                    yearsSinceOpen = monthsSinceOpen / 12;
        
                    // Ensure yearsSinceOpen is at least 1
                    yearsSinceOpen = Math.max(1, yearsSinceOpen);
        
                } else {
                    console.warn('Open date not provided, defaulting to 12 months and 1 year');
                    monthsSinceOpen = 12; // Default to 12 months if no open date is provided
                    yearsSinceOpen = 1;    // Default to 1 year
                }
        
                return { monthsSinceOpen, yearsSinceOpen };
            }
        },
        getTerm: {
            description: "Calculates the term in months and years based on the given term, open date, or maturity date",
            implementation: function(term = null, open = null, maturity = null) {
                let termInMonths, termInYears;
        
                if (term) {
                    // If term is provided, use it as termInMonths
                    termInMonths = term;
                } else if (open && maturity) {
                    const openDate = new Date(open);
                    const maturityDate = new Date(maturity);
        
                    // Calculate the number of months from openDate to maturityDate
                    const yearsDifference = maturityDate.getFullYear() - openDate.getFullYear();
                    const monthsDifference = maturityDate.getMonth() - openDate.getMonth();
        
                    // Total months in term
                    termInMonths = yearsDifference * 12 + monthsDifference;
        
                    // Adjust if days in the open month are fewer than the day of the maturity date
                    if (openDate.getDate() > maturityDate.getDate()) {
                        termInMonths -= 1;
                    }
        
                    // Ensure termInMonths is at least 1
                    termInMonths = Math.max(1, termInMonths);
        
                } else {
                    console.warn('Insufficient data provided, defaulting to 12 months and 1 year');
                    termInMonths = 12; // Default to 12 months if neither term nor both dates are provided
                }
        
                // Calculate termInYears as the integer part of termInMonths divided by 12
                termInYears = termInMonths / 12;
        
                // Ensure termInYears is at least 1
                termInYears = Math.max(1, termInYears);
        
                return { termInMonths, termInYears };
            }
        },
        averageBalance: {
            description: "Calculates the average balance of a loan over its term",
            implementation: function(principal, payment, maturity) {
                // Determine months until maturity using either maturity date or term
                const {monthsUntilMaturity, yearsUntilMaturity} = financial.functions.untilMaturity.implementation(maturity);
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
            implementation: function(principal, rate, risk, open, fees = null, maturity = null, term = null) {
                const interest = principal * rate;
                const {monthsUntilMaturity, yearsUntilMaturity} = financial.functions.untilMaturity.implementation(maturity);
                const {termInMonths, termInYears} = financial.functions.getTerm.implementation(term, open, maturity);
                const fundingExpense = principal * window.libraries.api.trates.values[monthsUntilMaturity];
                const originationExpense = Math.min(principal, financial.attributes.principalCostMax.value) * financial.attributes.loanOriginationFactor.value / (Math.min(termInYears, 5));  
                const servicingExpense = principal * financial.attributes.loanServicingFactor.value;

                //const probabilityOfDefault = //I need a littel ai translation 
                //console.log('risk key:', aiTranslater(Object.keys(window.analytics.loan), 'risk'));
                const riskObject =  window.analytics.loan[aiTranslater(Object.keys(window.analytics.loan), 'risk')];
                //console.log('risk data:', riskObject, Object.hasOwn(riskObject, "convexProbability"), riskObject.convexProbability);
                let probabilityOfDefault = .02;
                if (Object.hasOwn(riskObject, "convexProbability")) {  // risk data reached statistical signifigance
                    if (typeof risk === "string") {
                        const match = risk.match(/^(\d+)([a-zA-Z])$/);
                        if (match) {
                            // Extract the number part and convert it to a number
                            risk = parseInt(match[1], 10) + 0.5;
                        }
                    }
                    if (Object.hasOwn(riskObject.convexProbability, `'${risk}'`)) {
                        probabilityOfDefault = riskObject.convexProbability[`'${risk}'`] * .01;
                    } else {
                        console.warn('cannot find key in convexProbability:', risk);
                    }
                } 
                let nonInterestIncome = 0;
                if (fees !== null) {
                    nonInterestIncome = fees / termInYears;
                }
                const expectedLossProvision = probabilityOfDefault * (principal - (principal / .8 * financial.attributes.defaultRecoveryPerc.value)) / yearsUntilMaturity; 
                console.log(`principal: ${principal}, risk: ${risk}, fees: ${fees}, years until maturity: ${yearsUntilMaturity}, term in years: ${termInYears}, interest: ${interest}, funding expense: ${fundingExpense}, origination expense: ${originationExpense}, servicing expense: ${servicingExpense}, non interest income: ${nonInterestIncome}, probability of default: ${probabilityOfDefault}, pretax: ${window.libraries.organization.attributes.taxRate.value}, expected loss: ${expectedLossProvision}`);
                return (interest - fundingExpense - originationExpense - servicingExpense + nonInterestIncome) * (1 - window.libraries.organization.attributes.taxRate.value) - expectedLossProvision;
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