import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, ExternalLink, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface SmartVendorDrawerProps {
    category: string;
    maxPrice: number;
}

// Маппинг budget категорий на vendor категории
const budgetToVendorCategory: Record<string, string> = {
    venue: "venue",
    catering: "caterer",
    photography: "photographer",
    videography: "videographer",
    flowers: "florist",
    decoration: "decorator",
    music: "music",
    attire: "clothing",
    makeup: "makeup",
    transportation: "transport",
    other: "other",
};

const categoryLabels: Record<string, string> = {
    venue: "площадок",
    caterer: "кейтерингов",
    photographer: "фотографов",
    videographer: "видеографов",
    florist: "флористов",
    decorator: "декораторов",
    music: "музыкантов",
    clothing: "ателье",
    makeup: "визажистов",
    transport: "транспорта",
    other: "услуг",
};

export function SmartVendorDrawer({ category, maxPrice }: SmartVendorDrawerProps) {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const vendorCategory = budgetToVendorCategory[category];

    useEffect(() => {
        if (open && vendorCategory) {
            fetchVendors();
        }
    }, [open, vendorCategory, maxPrice]);

    const fetchVendors = async () => {
        if (!vendorCategory) return;
        
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vendor_profiles')
                .select('*')
                .eq('category', vendorCategory as any)
                .lte('starting_price', maxPrice * 1.5)
                .order('rating', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error fetching vendors:', error);
            }
            
            if (data) {
                setVendors(data);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Не показывать для категорий без вендоров
    if (!vendorCategory) {
        return null;
    }

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} млн`;
        }
        return `${(price / 1000).toFixed(0)} тыс`;
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
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
                        Рекомендации
                    </SheetTitle>
                    <SheetDescription>
                        Лучшие {categoryLabels[vendorCategory] || "исполнители"} в пределах бюджета {formatPrice(maxPrice)} UZS
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Sparkles className="w-8 h-8 animate-pulse mx-auto mb-2 text-primary" />
                                Ищем лучших исполнителей...
                            </div>
                        ) : vendors.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="mb-2">Нет подходящих исполнителей в этом ценовом диапазоне.</p>
                                <Button variant="link" onClick={() => navigate('/marketplace')}>
                                    Посмотреть всех исполнителей
                                </Button>
                            </div>
                        ) : (
                            vendors.map((vendor, index) => (
                                <div 
                                    key={vendor.id} 
                                    className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors relative"
                                >
                                    {index === 0 && (
                                        <Badge className="absolute -top-2 -right-2 bg-primary">
                                            Лучший выбор
                                        </Badge>
                                    )}
                                    
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{vendor.business_name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    {vendor.rating?.toFixed(1) || "Новый"}
                                                    {vendor.total_reviews > 0 && (
                                                        <span className="text-xs">({vendor.total_reviews})</span>
                                                    )}
                                                </span>
                                                {vendor.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {vendor.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {vendor.verified && (
                                            <Badge variant="secondary" className="text-xs">
                                                ✓ Проверен
                                            </Badge>
                                        )}
                                    </div>

                                    {vendor.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {vendor.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">от </span>
                                            <span className="font-semibold text-primary">
                                                {formatPrice(vendor.starting_price || vendor.price_range_min || 0)} UZS
                                            </span>
                                        </div>
                                        {vendor.styles && vendor.styles.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {vendor.styles.slice(0, 2).map((style: string) => (
                                                    <Badge key={style} variant="outline" className="text-xs">
                                                        {style}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            className="flex-1" 
                                            size="sm"
                                            onClick={() => navigate(`/vendor/${vendor.id}`)}
                                        >
                                            Подробнее
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            title="Открыть профиль"
                                            onClick={() => navigate(`/vendor/${vendor.id}`)}
                                        >
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