import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Star, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SmartVendorDrawerProps {
    category: string;
    maxPrice: number;
}

export function SmartVendorDrawer({ category, maxPrice }: SmartVendorDrawerProps) {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            fetchVendors();
        }
    }, [category, maxPrice]);

    const fetchVendors = async () => {
        setLoading(true);
        // Fetch vendors that match category and are within budget (approx)
        // In a real app we'd have more complex filtering
        const { data } = await supabase
            .from('vendor_profiles')
            .select('*')
            .eq('category', category as any)
            .lte('price_range_min', maxPrice * 1.2) // Allow slightly higher
            .limit(5);

        if (data) setVendors(data);
        setLoading(false);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
                    <Sparkles className="w-4 h-4" />
                    Smart Choice
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Smart Recommendations
                    </SheetTitle>
                    <SheetDescription>
                        Top rated {category} vendors within your budget of ${(maxPrice / 1000).toFixed(1)}k
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-100px)] mt-6 pr-4">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Finding best matches...</div>
                        ) : vendors.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No specific recommendations found for this budget.</div>
                        ) : (
                            vendors.map((vendor) => (
                                <div key={vendor.id} className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{vendor.business_name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span>{vendor.rating || "New"}</span>
                                                <span>•</span>
                                                <span>{vendor.location || "Tashkent"}</span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">
                                            ${vendor.price_range_min?.toLocaleString()} - ${vendor.price_range_max?.toLocaleString()}
                                        </Badge>
                                    </div>

                                    {vendor.search_tags && (
                                        <div className="flex flex-wrap gap-1">
                                            {vendor.search_tags.slice(0, 3).map((tag: string) => (
                                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <Button className="flex-1" size="sm">Check Availability</Button>
                                        <Button variant="outline" size="icon" title="View Profile">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
