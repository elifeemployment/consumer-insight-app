import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Wrench, TrendingUp } from "lucide-react";

interface ItemCount {
  item_name: string;
  item_type: string;
  count: number;
}

const MostDemanded = () => {
  const [items, setItems] = useState<ItemCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMostDemanded();
  }, []);

  const fetchMostDemanded = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_items")
        .select("item_name, item_type");

      if (error) throw error;

      // Count occurrences
      const counts: Record<string, ItemCount> = {};
      data?.forEach((item) => {
        const key = `${item.item_name}-${item.item_type}`;
        if (counts[key]) {
          counts[key].count++;
        } else {
          counts[key] = {
            item_name: item.item_name,
            item_type: item.item_type,
            count: 1,
          };
        }
      });

      // Sort by count
      const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
      setItems(sorted);
    } catch (error: any) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const products = items.filter((item) => item.item_type === "product");
  const services = items.filter((item) => item.item_type === "service");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Most Demanded Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No products yet</p>
            ) : (
              products.map((item, index) => (
                <div
                  key={item.item_name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.item_name}</span>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {item.count}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Most Demanded Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No services yet</p>
            ) : (
              services.map((item, index) => (
                <div
                  key={item.item_name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.item_name}</span>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {item.count}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MostDemanded;
