import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Package, Wrench, FileText, ShoppingBag } from "lucide-react";

interface Survey {
  id: string;
  name: string;
  mobile: string;
  panchayath: string;
  ward: string;
  user_type: string;
  created_at: string;
}

interface SurveyItem {
  id: string;
  item_name: string;
  item_type: string;
}

const SurveyDetails = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyItems, setSurveyItems] = useState<Record<string, SurveyItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [uniqueItems, setUniqueItems] = useState(0);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const { data: surveysData, error: surveysError } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (surveysError) throw surveysError;
      setSurveys(surveysData || []);
      setTotalSurveys(surveysData?.length || 0);

      // Fetch all items
      const { data: allItems } = await supabase
        .from("survey_items")
        .select("item_name");

      // Calculate unique items
      const uniqueItemNames = new Set(allItems?.map(item => item.item_name.toLowerCase()) || []);
      setUniqueItems(uniqueItemNames.size);

      // Fetch items for each survey
      const itemsMap: Record<string, SurveyItem[]> = {};
      for (const survey of surveysData || []) {
        const { data: itemsData } = await supabase
          .from("survey_items")
          .select("*")
          .eq("survey_id", survey.id);

        itemsMap[survey.id] = itemsData || [];
      }
      setSurveyItems(itemsMap);
    } catch (error: any) {
      toast.error("Failed to fetch surveys");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this survey?")) return;

    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Survey deleted successfully");
      fetchSurveys();
    } catch (error: any) {
      toast.error("Failed to delete survey");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Surveys</p>
                <h3 className="text-3xl font-bold text-foreground">{totalSurveys}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Products/Services</p>
                <h3 className="text-3xl font-bold text-foreground">{uniqueItems}</h3>
              </div>
              <div className="rounded-full bg-secondary/10 p-3">
                <ShoppingBag className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Survey Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Responses</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-4">
          {surveys.map((survey) => (
            <Card key={survey.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{survey.name}</h3>
                      <Badge variant="secondary">{survey.user_type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Mobile: {survey.mobile}</p>
                      <p>Panchayath: {survey.panchayath} | Ward: {survey.ward}</p>
                      <p>Submitted: {new Date(survey.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(survey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Requested Items:</h4>
                  <div className="flex flex-wrap gap-2">
                    {surveyItems[survey.id]?.map((item) => (
                      <Badge
                        key={item.id}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {item.item_type === "product" ? (
                          <Package className="h-3 w-3" />
                        ) : (
                          <Wrench className="h-3 w-3" />
                        )}
                        {item.item_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default SurveyDetails;
