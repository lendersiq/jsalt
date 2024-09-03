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
        daysSinceOpen: {
            description: "Calculates the number of days from the open date of a financial instrument",
            implementation: function(open = null) {
                if (open) {
                    const openDate = new Date(open);
                    const currentDate = new Date();
        
                    // Calculate the number of days from openDate to currentDate
                    const timeDifference = currentDate.getTime() - openDate.getTime(); // Difference in milliseconds
                    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
                    return daysDifference;
                } else {
                    console.warn('Open date not provided to daysSinceOpen');
                    return null;
                }
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
        ddaProfit: {
            description: "Calculates the profit of deposit accounts",
            implementation: function(portfolio, balance, interest, charges, waived, deposits) {
                //chargesIncome - interestExpense - deposits * depositUnitCost) * 12 +  * marginTarget - fraudLoss - ddaExpense) * (1-taxRate)
                // can this be adapted for savings and CDs or create separate functions
                let ddaType = "Consumer";
                if (deposits > 6 && balance > financial.attributes.consumerDdaMaximum.value) { //ai  -- can consider standard deviation of checking balances
                    ddaType = "Commercial";
                } 
                const creditRate = window.libraries.api.trates.values[12] * .50; // 50% of current funding curve
                const creditForFunding = creditRate * balance * (1 - financial.attributes.ddaReserveRequired.value);  
                const interestExpense = interest * window.analytics.checking[aiTranslater(Object.keys(window.analytics.checking), 'interest')].YTDfactor;
                const feeIncome = (charges - waived) * window.analytics.checking[aiTranslater(Object.keys(window.analytics.checking), 'charges')].YTDfactor;
                const depositsExpense = deposits * financial.attributes.depositUnitCost.value * window.analytics.checking[aiTranslater(Object.keys(window.analytics.checking), 'deposits')].YTDfactor;
                
                const annualExpense = financial.dictionaries.ddaAnnualExpense.values[ddaType];  
                const fraudLoss = organization.attributes.capitalTarget.value * financial.attributes.fraudLossFactor.value * balance;
                const profit = (feeIncome + creditForFunding - interestExpense - depositsExpense - annualExpense - fraudLoss) * (1 - window.libraries.organization.attributes.taxRate.value);
                console.log(`portfolio: ${portfolio}, balance: ${balance}, creditRate: ${creditRate}, creditForFunding: ${creditForFunding}, interestExpense: ${interest}, charges: ${charges}, waived: ${waived}, depositsExpense: ${depositsExpense}, annualExpense: ${annualExpense}, fraudLoss: ${fraudLoss}, depositProfit: ${profit}`);
                return profit;
            }
        },
        profit: {
            description: "Calculates the profit of a loan",
            implementation: function(portfolio, principal, rate, risk, open, payment, fees = null, maturity = null, term = null) {
                const interest = principal * rate;
                const {monthsUntilMaturity, yearsUntilMaturity} = financial.functions.untilMaturity.implementation(maturity);
                const {termInMonths, termInYears} = financial.functions.getTerm.implementation(term, open, maturity);
                const fundingRate = window.libraries.api.trates.values[monthsUntilMaturity] * .75 // 75% of current funding curve
                const fundingExpense = principal * fundingRate;
				let originationFactor = financial.attributes.loanOriginationFactor.value;
				let smallLoanMaximum = financial.attributes.smallLoanMaximum.value;  //default
				const principalObject = window.analytics.loan[aiTranslater(Object.keys(window.analytics.loan), 'principal')];
				if (principalObject && Object.hasOwn(principalObject, "stdDeviation")) {
					smallLoanMaximum = principalObject.stdDeviation;
				}
				const isConsumerSmallBusiness = termInYears <= 5 && principal < smallLoanMaximum; 
				if (isConsumerSmallBusiness) {
					originationFactor = originationFactor / 2;
				}
                const originationExpense = Math.min(principal, financial.attributes.principalCostMaximum.value) * originationFactor / (Math.min(termInYears, 10));
                const servicingExpense = principal * financial.attributes.loanServicingFactor.value / yearsUntilMaturity;

                //console.log('risk key:', aiTranslater(Object.keys(window.analytics.loan), 'risk'));
                const riskObject = window.analytics.loan[aiTranslater(Object.keys(window.analytics.loan), 'risk')];
                //console.log('risk data:', riskObject, Object.hasOwn(riskObject, "convexProbability"), riskObject.convexProbability);
                let probabilityOfDefault = 0;
                if (riskObject && Object.hasOwn(riskObject, "convexProbability")) { // risk data reached statistical signifigance
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
                } else if (risk && risk !== 'NULL') {
                    probabilityOfDefault = .02;
                }

                let exposureAtDefault = principal;
                let lossProvision = 0;
                let month = 0; 
                while (month < monthsUntilMaturity && exposureAtDefault > 0) {
                    lossGivenDefault = (exposureAtDefault / financial.attributes.minimumLoanToValue.value * (1 - financial.attributes.expectedRecoveryRate.value))
                    if (lossGivenDefault > 0) {
                        lossProvision += probabilityOfDefault * lossGivenDefault; // Math.max(probabilityOfDefault * lossGivenDefault, financial.attributes.minimumOperatingRisk.value * probabilityOfDefault);
                    }
                    exposureAtDefault -= payment - exposureAtDefault * (rate/12);
                    month++;
                }
                const expectedLossProvision = lossProvision / monthsUntilMaturity / yearsUntilMaturity;  // spread lossProvision cost over yearsUntilMaturity
                nonInterestIncome = fees !== null ? fees / termInYears : 0;
            
                //const expectedLossProvision = probabilityOfDefault * (principal - (principal / financial.attributes.minimumLoanToValue.value * (1 - financial.attributes.expectedRecoveryRate.value))) / yearsUntilMaturity; 
                const pretax = (interest - fundingExpense - originationExpense - servicingExpense + nonInterestIncome) * (1 - window.libraries.organization.attributes.taxRate.value); 
                const profit = pretax - expectedLossProvision;
                console.log(`portfolio: ${portfolio}, principal: ${principal}, risk: ${risk}, fees: ${fees}, years until maturity: ${yearsUntilMaturity}, term in years: ${termInYears}, rate: ${rate}, interest: ${interest}, funding rate: ${fundingRate}, funding expense: ${fundingExpense}, origination expense: ${originationExpense}, servicing expense: ${servicingExpense}, non interest income: ${nonInterestIncome}, probability of default: ${probabilityOfDefault}, pretax: ${pretax}, expected loss: ${expectedLossProvision}, profit: ${profit.toFixed(2)}`);
                return profit;
            }
        }
    },
    attributes: {
        smallLoanMaximum: {
            description: "The dollar threshold that can distinguish a small business micrcoloan or a personal loan from other loan types",
            value: 100000    
        },
        consumerDdaMaximum: {
            description: "The dollar threshold that can distinguish a consumer from a commercial checking account",
            value: 250000    
        },
        loanServicingFactor: {
            description: "The factor used to calculate loan servicing expenses",
            value: 0.0025
        },
        loanOriginationFactor: {
            description: "The factor used to calculate loan origination expenses",
            value: 0.01
        },
        principalCostMaximum: {
            description: "Maximum principal loan origination costs scale with loan size",
            value: 2000000
        },
        minimumLoanToValue: {
            description: "Typical Loan-to-Value (LTV) Ratio minimum. LTV expresses the loan amount as a percentage of the loan collateral's current value.",
            value: 0.80
        },
        expectedRecoveryRate: {
            description: " This represents the percentage of the exposure that a lender expects to recover if the borrower defaults expressed as a percentage (.01 to 1)",
            value: 0.60
        },
        minimumOperatingRisk: {
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
        },
        fraudLossFactor: {
            description: "ratio of fraud losses to institution total deposits",
            value: 0.005,
        }
    },
    dictionaries: {
        ddaAnnualExpense: {
            description: "The checking account annual operating costs",
            values: {
                "Consumer": 112,
                "Commercial": 145
            }
        }
    }
};
window.financial = financial; // Make it globally accessible
