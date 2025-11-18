import { SurveyForm } from "@/components/SurveyForm";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="absolute top-4 right-4">
        <Button onClick={() => navigate("/auth")} variant="outline">
          Admin Login
        </Button>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top duration-700">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-primary/10 p-4">
                <ClipboardList className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Consumer Demand Survey
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help us understand your needs better. Share your preferences and let us know what products and services you'd like to see on our platform.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl shadow-card p-8 md:p-12 backdrop-blur-sm border border-border/50 animate-in fade-in slide-in-from-bottom duration-700 delay-150">
            <SurveyForm />
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8 text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
            <p>Your feedback is valuable to us and helps improve our services.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
