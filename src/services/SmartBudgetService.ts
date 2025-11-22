import { Database } from "@/integrations/supabase/types";

type VendorCategory = Database["public"]["Enums"]["vendor_category"];


export interface BudgetBreakdown {
    category: string;
    minPrice: number;
    maxPrice: number;
    percentage: number;
    reasoning: string[]; // Why this amount?
    warning?: string; // e.g. "Low budget for this guest count"
}

export interface SmartBudgetResult {
    totalBudget: number;
    guestCount: number;
    breakdown: BudgetBreakdown[];
    suggestions: string[];
}

export class SmartBudgetService {
    private static readonly VENUE_PERCENTAGE = 0.45;
    private static readonly MIN_PLATE_PRICE_USD = 15; // Approx 180,000 UZS

    static calculate(totalBudget: number, guestCount: number): SmartBudgetResult {
        const breakdown: BudgetBreakdown[] = [];
        const suggestions: string[] = [];

        // 1. Venue & Catering (The biggest chunk)
        const venueBudget = totalBudget * this.VENUE_PERCENTAGE;
        const maxPlatePrice = venueBudget / guestCount;

        let venueWarning: string | undefined;
        if (maxPlatePrice < this.MIN_PLATE_PRICE_USD) {
            venueWarning = `Budget allows only $${maxPlatePrice.toFixed(2)} per person. Recommended minimum is $${this.MIN_PLATE_PRICE_USD}. Consider reducing guest count or increasing budget.`;
            suggestions.push("Consider cutting 'Decor' and 'Show' budgets to support better catering.");
        }

        breakdown.push({
            category: "venue",
            minPrice: venueBudget * 0.8,
            maxPrice: venueBudget,
            percentage: this.VENUE_PERCENTAGE * 100,
            reasoning: [
                `Allocated 45% for Venue & Catering`,
                `Max plate price: $${maxPlatePrice.toFixed(2)} per person`
            ],
            warning: venueWarning
        });

        // 2. Dynamic Categories based on Budget Size
        const remainingBudget = totalBudget - venueBudget;

        // Helper to add category
        const addCategory = (name: string, percent: number, minFixed?: number) => {
            let amount = totalBudget * percent;
            if (minFixed && amount < minFixed) {
                // If calculated amount is too low, try to use minFixed if we have budget
                // But for now simple percentage
            }

            // Adjust for "Unit Economics" - e.g. Photo doesn't scale linearly with guests, but somewhat with budget
            // For this MVP we stick to the prompt's logic:
            // "If guests > 200, add Coordinator"
            // "If budget > 20k, add Live Band"

            breakdown.push({
                category: name,
                minPrice: amount * 0.8,
                maxPrice: amount * 1.1,
                percentage: percent * 100,
                reasoning: [`Estimated based on ${percent * 100}% of total budget`]
            });
        };

        // Standard allocations (simplified for now, can be tuned)
        addCategory("photographer", 0.10); // 10%
        addCategory("videographer", 0.08); // 8%
        addCategory("attire", 0.10); // 10%
        addCategory("decor", 0.10); // 10%
        addCategory("music", 0.05); // 5%
        addCategory("other", 0.12); // 12%

        // 3. Contextual Suggestions
        if (guestCount > 200) {
            suggestions.push("Guest count > 200: A Wedding Coordinator is HIGHLY recommended.");
            // In a real app we might insert a specific category for Coordinator here
        }

        if (totalBudget > 20000) {
            suggestions.push("Budget > $20k: You can afford a Live Band instead of just a DJ.");
        } else {
            suggestions.push("Budget < $20k: A DJ is a cost-effective choice for music.");
        }

        return {
            totalBudget,
            guestCount,
            breakdown,
            suggestions
        };
    }
}
