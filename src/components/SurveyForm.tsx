import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().trim().min(2, { message: "പേര് കുറഞ്ഞത് 2 അക്ഷരങ്ങളായിരിക്കണം" }).max(100, { message: "പേര് 100 അക്ഷരങ്ങളിൽ കുറവായിരിക്കണം" }),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, { message: "സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക" }),
  panchayath: z.string().trim().min(2, { message: "പഞ്ചായത്ത് ആവശ്യമാണ്" }).max(100, { message: "പഞ്ചായത്ത് 100 അക്ഷരങ്ങളിൽ കുറവായിരിക്കണം" }),
  ward: z.string().trim().min(1, { message: "വാർഡ് ആവശ്യമാണ്" }).max(50, { message: "വാർഡ് 50 അക്ഷരങ്ങളിൽ കുറവായിരിക്കണം" }),
  userType: z.enum(["customer", "agent"], { required_error: "ഉപയോക്താവിന്റെ തരം തിരഞ്ഞെടുക്കുക" }),
  products: z.array(z.string().trim().min(2, { message: "ഉൽപ്പന്നം/സേവനം കുറഞ്ഞത് 2 അക്ഷരങ്ങളായിരിക്കണം" }).max(200, { message: "ഉൽപ്പന്നം/സേവനം 200 അക്ഷരങ്ങളിൽ കുറവായിരിക്കണം" })).min(1, { message: "കുറഞ്ഞത് ഒരു ഉൽപ്പന്നം/സേവനം ചേർക്കുക" }),
});

type FormValues = z.infer<typeof formSchema>;

export function SurveyForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [products, setProducts] = useState<string[]>([""]);
  const [panchayaths, setPanchayaths] = useState<{ id: string; name: string; name_ml: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mobile: "",
      panchayath: "",
      ward: "",
      userType: undefined,
      products: [""],
    },
  });

  useEffect(() => {
    fetchPanchayaths();
  }, []);

  const fetchPanchayaths = async () => {
    try {
      const { data, error } = await supabase
        .from("panchayaths")
        .select("id, name, name_ml")
        .order("name");

      if (error) throw error;
      setPanchayaths(data || []);
    } catch (error) {
      console.error("Error fetching panchayaths:", error);
      toast.error("പഞ്ചായത്തുകൾ ലോഡ് ചെയ്യുന്നതിൽ പിശക്");
    } finally {
      setLoading(false);
    }
  };

  const addProductField = () => {
    setProducts([...products, ""]);
  };

  const removeProductField = (index: number) => {
    if (products.length > 1) {
      const newProducts = products.filter((_, i) => i !== index);
      setProducts(newProducts);
      form.setValue("products", newProducts.filter(p => p.trim() !== ""));
    }
  };

  const updateProductField = (index: number, value: string) => {
    const newProducts = [...products];
    newProducts[index] = value;
    setProducts(newProducts);
    form.setValue("products", newProducts.filter(p => p.trim() !== ""));
  };

  async function onSubmit(values: FormValues) {
    try {
      // Insert survey
      const { data: survey, error: surveyError } = await supabase
        .from("surveys")
        .insert({
          name: values.name,
          mobile: values.mobile,
          panchayath: values.panchayath,
          ward: values.ward,
          user_type: values.userType,
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      // Insert survey items
      const surveyItems = values.products.map((product) => ({
        survey_id: survey.id,
        item_name: product,
        item_type: values.userType === "customer" ? "product" : "service",
      }));

      const { error: itemsError } = await supabase
        .from("survey_items")
        .insert(surveyItems);

      if (itemsError) throw itemsError;

      setIsSubmitted(true);
      toast.success("സർവേ വിജയകരമായി സമർപ്പിച്ചു!");
      form.reset();
      setProducts([""]);

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("സർവേ സമർപ്പിക്കുന്നതിൽ പിശക്");
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">നന്ദി!</h2>
          <p className="text-muted-foreground text-lg">
            നിങ്ങളുടെ പ്രതികരണം വിജയകരമായി രേഖപ്പെടുത്തി. നിങ്ങളുടെ വിലപ്പെട്ട ഫീഡ്‌ബാക്കിന് ഞങ്ങൾ നന്ദിയുള്ളവരാണ്.
          </p>
        </div>
        <Button onClick={() => setIsSubmitted(false)} variant="outline" size="lg">
          മറ്റൊരു പ്രതികരണം സമർപ്പിക്കുക
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-500">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
          <FormItem>
            <FormLabel>പൂർണ്ണ നാമം</FormLabel>
            <FormControl>
              <Input placeholder="നിങ്ങളുടെ പൂർണ്ണ നാമം നൽകുക" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>മൊബൈൽ നമ്പർ</FormLabel>
              <FormControl>
                <Input placeholder="10 അക്ക മൊബൈൽ നമ്പർ നൽകുക" type="tel" maxLength={10} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="panchayath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>പഞ്ചായത്ത്</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger className="bg-card border-input">
                      <SelectValue placeholder={loading ? "ലോഡ് ചെയ്യുന്നു..." : "പഞ്ചായത്ത് തിരഞ്ഞെടുക്കുക"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover z-50">
                    {panchayaths.map((panchayath) => (
                      <SelectItem key={panchayath.id} value={panchayath.name}>
                        {panchayath.name_ml || panchayath.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>വാർഡ്</FormLabel>
                <FormControl>
                  <Input placeholder="നിങ്ങളുടെ വാർഡ് നൽകുക" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ഞാൻ ഒരു</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="customer" id="customer" />
                    <label htmlFor="customer" className="flex-1 cursor-pointer font-medium">
                      ഉപഭോക്താവ്
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="agent" id="agent" />
                    <label htmlFor="agent" className="flex-1 cursor-pointer font-medium">
                      ഏജന്റ്
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>ഞങ്ങളുടെ ആപ്പിൽ നിങ്ങൾ കാണാൻ ആഗ്രഹിക്കുന്ന ഉൽപ്പന്നങ്ങൾ/സേവനങ്ങൾ</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProductField}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              കൂടുതൽ ചേർക്കുക
            </Button>
          </div>
          
          <div className="space-y-3">
            {products.map((product, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder={`ഉൽപ്പന്നം/സേവനം ${index + 1}`}
                    value={product}
                    onChange={(e) => updateProductField(index, e.target.value)}
                  />
                </div>
                {products.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProductField(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {form.formState.errors.products && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.products.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full">
          സർവേ സമർപ്പിക്കുക
        </Button>
      </form>
    </Form>
  );
}
