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
            implementation: function(principal, payment, rate, maturity) {
                // Determine months until maturity using either maturity date or term
                const {monthsUntilMaturity, yearsUntilMaturity} = financial.functions.untilMaturity.implementation(maturity);
                const monthlyRate = rate < 1 ? parseFloat(rate) / 12 : parseFloat(rate / 100) / 12;
                console.log('payment, monthly rate, monthsUntilMaturity', payment, monthlyRate, monthsUntilMaturity)
                // Calculate the total principal over the loan period
                let cummulativePrincipal = 0;
                let tempPrincipal = principal;
                var month = 0;
                while (month < monthsUntilMaturity && tempPrincipal > 0) {
                    cummulativePrincipal += tempPrincipal;
                    tempPrincipal -= payment - tempPrincipal * monthlyRate;
                    month++;
                }
                // Calculate average balance
                const averageBalance = cummulativePrincipal / monthsUntilMaturity;
                return averageBalance.toFixed(2);
            }
        },
        depositProfit: {
            description: "Calculates the profit of deposit accounts",
            implementation: function(portfolio, balance, interest, charges, waived, deposits, source=null) {
		console.log('source:', source);   
                //chargesIncome - interestExpense - deposits * depositUnitCost) * 12 +  * marginTarget - fraudLoss - ddaExpense) * (1-taxRate)
                // can this be adapted for savings and CDs or create separate functions
                let ddaType = "Consumer";
                if (deposits > 6 && balance > financial.attributes.consumerDdaMaximum.value) { //ai  -- can consider standard deviation of checking balances
                    ddaType = "Commercial";
                } 
                const creditRate = window.libraries.api.trates.values[12] * 0.627; // operational risk, regulatory risk, deposit acquisition factor, interest rate risk, and liquidity discount.
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
        calculateFundingRate: {
            description: "Calculates the adjusted funding rate of loan",
            implementation: function(months) {
                if (!financial.attributes || !window.libraries.api.trates.values[months]) {
                    throw new Error("Required api or library data is missing for funding rate calculation.");
                }
                const adjustmentCoefficient = financial.attributes.adjustmentCoefficient.value;
                if (adjustmentCoefficient < 0 || adjustmentCoefficient > 1) {
                    throw new Error("Adjustment Coefficient must be between 0 and 1.");
                }
                const XL = adjustmentCoefficient * financial.attributes.liquidityWeight.value; 
                const XC = adjustmentCoefficient * financial.attributes.convenienceWeight.value; 
                const XB = adjustmentCoefficient * financial.attributes.loyaltyWeight.value;
                const X = XL + XC + XB;
                const correspondingTreasuryRate = window.libraries.api.trates.values[months];
                return correspondingTreasuryRate * (1 - X);
            }
        },
        profit: {
            description: "Calculates the profit of a loan",
            implementation: function(portfolio, principal, rate, risk, open, payment = null, fees = null, maturity = null, term = null) {
                const {monthsUntilMaturity, yearsUntilMaturity} = financial.functions.untilMaturity.implementation(maturity);
                const monthlyRate = rate < 1 ? parseFloat(rate) / 12 : parseFloat(rate / 100) / 12;
                const monthlyPayment = (principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -monthsUntilMaturity)))).toFixed(2);
                const totalInterest = monthlyPayment * monthsUntilMaturity - principal;
                const AveragePrincipal = totalInterest / (monthlyRate * monthsUntilMaturity);
                const {termInMonths, termInYears} = financial.functions.getTerm.implementation(term, open, maturity);
                const interestIncome = AveragePrincipal * rate;
                const fundingRate = financial.functions.calculateFundingRate.implementation(monthsUntilMaturity); // adjust for liquidity, convenience, and loyalty premiums
                const fundingExpense = AveragePrincipal * fundingRate;

				let smallLoanMaximum = financial.attributes.smallLoanMaximum.value;  //default
				const principalObject = window.analytics.loan[aiTranslater(Object.keys(window.analytics.loan), 'principal')];
				if (principalObject && Object.hasOwn(principalObject, "median")) {
					smallLoanMaximum = principalObject.median > smallLoanMaximum ? principalObject.median : smallLoanMaximum;  // the median of each loan principal in the entire portfolio (50th percentile)
				}

                let isConsumerSmallBusiness = false;
                if (payment) { //if loan payment is a valid argument test original
                    const originalPrincipal = monthlyPayment * termInMonths - totalInterest;
                    isConsumerSmallBusiness = originalPrincipal < smallLoanMaximum; 
                } else{
				    isConsumerSmallBusiness = termInYears <= 5 && principal < smallLoanMaximum; 
                }
				let complexityFactor = 1;
                if (isConsumerSmallBusiness) {
                    complexityFactor = 0.5
				}
                const originationExpense = (financial.attributes.fixedOriginationExpense.value + Math.min(principal, financial.attributes.principalCostMaximum.value) * financial.attributes.variableOriginationFactor.value * complexityFactor) / Math.min(termInYears, 10);
                const servicingExpense = (financial.attributes.fixedServicingExpense.value + principal * financial.attributes.loanServicingFactor.value / yearsUntilMaturity) * complexityFactor;

                //console.log('risk key:', aiTranslater(Object.keys(window.analytics.loan), 'risk'));
                const riskObject = window.analytics.loan[aiTranslater(Object.keys(window.analytics.loan), 'risk')];
                console.log('risk data:', riskObject, Object.hasOwn(riskObject, "convexProbability"), riskObject.convexProbability);
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
                const lossProvision =  AveragePrincipal / financial.attributes.minimumLoanToValue.value * (1 - financial.attributes.expectedRecoveryRate.value) * probabilityOfDefault;                
                const expectedLossProvision = lossProvision / yearsUntilMaturity;  // spread lossProvision cost over yearsUntilMaturity
                
                const nonInterestIncome = fees !== null ? fees / termInYears : 0;
            
                //const expectedLossProvision = probabilityOfDefault * (principal - (principal / financial.attributes.minimumLoanToValue.value * (1 - financial.attributes.expectedRecoveryRate.value))) / yearsUntilMaturity; 
                const pretax = (interestIncome - fundingExpense - originationExpense - servicingExpense + nonInterestIncome) * (1 - window.libraries.organization.attributes.taxRate.value); 
                const profit = pretax - expectedLossProvision;
                console.log(`portfolio: ${portfolio}, principal: ${principal}, average: ${AveragePrincipal}, risk: ${risk}, fees: ${fees}, years until maturity: ${yearsUntilMaturity}, term in years: ${termInYears}, rate: ${rate}, interest: ${interestIncome}, funding rate: ${fundingRate}, funding expense: ${fundingExpense}, origination expense: ${originationExpense}, servicing expense: ${servicingExpense}, non interest income: ${nonInterestIncome}, probability of default: ${probabilityOfDefault}, pretax: ${pretax}, expected loss: ${expectedLossProvision}, profit: ${profit.toFixed(2)}`);
                return profit;
            }
        }
    },
    attributes: {
        adjustmentCoefficient: {
            description: "Represents the base percentage adjustment applied to the Treasury rate.",
            value: 0.05   
        },
        liquidityWeight: {
            description: "Represents an adjustment which refelects that banks offer higher liquidity than treasury securities.",
            value: 0.9   
        },
        convenienceWeight: {
            description: "Represents an adjustment which refelects that banks provide convenient methods to transact business",
            value: 0.85   
        },
        loyaltyWeight: {
            description: "Represents an adjustment which reflects that a long-term depositor relationships reduce the need for the highest rates",
            value: 0.8   
        },
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
        variableOriginationFactor: {
            description: "The factor used to calculate loan origination expenses",
            value: 0.01
        },
        principalCostMaximum: {
            description: "Maximum principal loan origination costs scale with loan size",
            value: 1500000
        },
        fixedOriginationExpense: {
            description: "Constant across all loans, covering administration, system, and processing costs.",
            value: 500
        },
        fixedServicingExpense: {
            description: "Constant administrative, payment processing, systems, and regulatory expenses that apply to all loans, regardless of size or complexity.",
            value: 500
        },
        minimumLoanToValue: {
            description: "Typical Loan-to-Value (LTV) Ratio minimum. LTV expresses the loan amount as a percentage of the loan collateral's current value.",
            value: 0.80
        },
        expectedRecoveryRate: {
            description: "This represents the percentage of the exposure that a lender expects to recover if the borrower defaults expressed as a percentage (.01 to 1)",
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
