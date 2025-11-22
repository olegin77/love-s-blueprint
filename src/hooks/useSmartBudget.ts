import { useState, useEffect } from 'react';
import { SmartBudgetService, SmartBudgetResult } from '../services/SmartBudgetService';
import { supabase } from '@/integrations/supabase/client';

export const useSmartBudget = (totalBudget: number, guestCount: number) => {
    const [budgetResult, setBudgetResult] = useState<SmartBudgetResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Record<string, any[]>>({});

    useEffect(() => {
        if (totalBudget > 0 && guestCount > 0) {
            calculate();
        }
    }, [totalBudget, guestCount]);

    const calculate = async () => {
        setLoading(true);

        // 1. Calculate Math
        const result = SmartBudgetService.calculate(totalBudget, guestCount);
        setBudgetResult(result);

        // 2. Fetch Vendors for each category based on calculated budget
        // This is a simplified version. In reality we would query Supabase for each category.
        // For now, we will just simulate fetching or fetch a few if possible.

        // Example: Fetch Venues that fit the budget
        const venueBudget = result.breakdown.find(b => b.category === 'venue');
        if (venueBudget) {
            const { data: venues } = await supabase
                .from('vendor_profiles')
                .select('*')
                .eq('category', 'venue')
                .lte('price_range_min', venueBudget.maxPrice) // Very rough filter
                .limit(3);

            if (venues) {
                setRecommendations(prev => ({ ...prev, venue: venues }));
            }
        }

        setLoading(false);
    };

    return { result: budgetResult, loading, recommendations };
};
