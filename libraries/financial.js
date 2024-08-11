const financial = {
    interestIncome: {
        description: "Calculates the interest income based on principal and annual rate",
        implementation: function(principal, rate) {
            console.log('interestIncome', principal, rate);
            return principal * rate;
        }
    },
    averageBalance: {
        description: "Calculates the average balance of a loan over its term",
        implementation: function(principal, payment, maturity = null, term = null) {
            console.log('principal, payment, maturity, term', principal, payment, maturity, term)
            // Determine months until maturity using either maturity date or term
            let monthsUntilMaturity;
            if (maturity) {
                const maturityDate = new Date(maturity);
                const currentDate = new Date();
                monthsUntilMaturity = (maturityDate.getFullYear() - currentDate.getFullYear()) * 12 + (maturityDate.getMonth() - currentDate.getMonth());
            } else if (term) {
                monthsUntilMaturity = term;
            } else {
                console.warn('Neither maturity date nor term provided, defaulting to 12 months');
                monthsUntilMaturity = 12; // Default to 12 months if neither is provided
            }

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
    }
};

window.financial = financial; // Make it globally accessible
