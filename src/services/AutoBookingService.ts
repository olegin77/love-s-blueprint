import { supabase } from "@/integrations/supabase/client";

export const createEnquiryChain = async (
    weddingPlanId: string,
    date: string,
    budgetBreakdown: { category: string; amount: number }[]
) => {
    const results = [];

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    for (const item of budgetBreakdown) {
        // 1. Find suitable vendors
        const { data: vendors } = await supabase
            .from('vendor_profiles')
            .select('id, business_name')
            .eq('category', item.category as any)
            .lte('price_range_min', item.amount)
            .limit(3); // Get top 3 matches

        if (vendors && vendors.length > 0) {
            // 2. Create enquiries as bookings with status 'pending'
            for (const vendor of vendors) {
                const { data, error } = await supabase
                    .from('bookings')
                    .insert({
                        wedding_plan_id: weddingPlanId,
                        vendor_id: vendor.id,
                        couple_user_id: user.id,
                        booking_date: date,
                        status: 'pending',
                        price: item.amount,
                        notes: `Auto-enquiry: Couple looking for ${item.category} around $${item.amount}. Are you available?`
                    })
                    .select()
                    .single();

                if (data) results.push(data);
            }
        }
    }

    return results;
};
