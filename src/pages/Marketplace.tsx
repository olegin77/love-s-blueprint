import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, MapPin, DollarSign, CheckCircle } from "lucide-react";

interface VendorProfile {
  id: string;
  business_name: string;
  category: string;
  description: string;
  location: string;
  price_range_min: number;
  price_range_max: number;
  rating: number;
  total_reviews: number;
  verified: boolean;
  portfolio_images: string[];
}

const categoryLabels: Record<string, string> = {
  venue: "Площадка",
  photographer: "Фотограф",
  videographer: "Видеограф",
  caterer: "Кейтеринг",
  florist: "Флорист",
  decorator: "Декоратор",
  music: "Музыка",
  makeup: "Визаж",
  clothing: "Одежда",
  transport: "Транспорт",
  other: "Другое",
};

const Marketplace = () => {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");

  useEffect(() => {
    fetchVendors();
  }, [selectedCategory]);

  const fetchVendors = async () => {
    setLoading(true);
    let query = supabase
      .from("vendor_profiles")
      .select("*")
      .order("rating", { ascending: false });

    if (selectedCategory !== "all") {
      query = query.eq("category", selectedCategory as any);
    }

    const { data, error } = await query;

    if (!error && data) {
      setVendors(data as VendorProfile[]);
    }
    setLoading(false);
  };

  const filteredVendors = vendors.filter((vendor) =>
    vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Маркетплейс поставщиков</h1>
          <p className="text-muted-foreground mt-1">
            Найдите идеальных профессионалов для вашей свадьбы
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск поставщиков..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Найдено поставщиков: <span className="font-semibold">{filteredVendors.length}</span>
          </p>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Загрузка...</div>
          </div>
        ) : filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground mb-4">Поставщики не найдены</p>
              <p className="text-sm text-muted-foreground">
                Попробуйте изменить фильтры или поисковый запрос
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-elegant transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  {vendor.portfolio_images && vendor.portfolio_images.length > 0 ? (
                    <img
                      src={vendor.portfolio_images[0]}
                      alt={vendor.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {vendor.verified && (
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{vendor.business_name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {categoryLabels[vendor.category]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {vendor.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({vendor.total_reviews})</span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{vendor.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {vendor.price_range_min.toLocaleString()} - {vendor.price_range_max.toLocaleString()} UZS
                    </span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full">
                    Посмотреть профиль
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;
