import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Sparkles, AlertCircle, Check } from "lucide-react";
import { useSmartBudget } from "@/hooks/useSmartBudget";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const BudgetCalculator = () => {
  const [formData, setFormData] = useState({
    totalBudget: "",
    guestCount: "",
  });

  const [calculated, setCalculated] = useState(false);

  // We only pass values to the hook when "Calculate" is clicked to avoid constant re-calc
  const [budgetParams, setBudgetParams] = useState({ totalBudget: 0, guestCount: 0 });

  const { result, loading, recommendations } = useSmartBudget(budgetParams.totalBudget, budgetParams.guestCount);

  const handleCalculate = () => {
    const budget = parseFloat(formData.totalBudget);
    const guests = parseInt(formData.guestCount);

    if (budget && guests) {
      setBudgetParams({ totalBudget: budget, guestCount: guests });
      setCalculated(true);
    }
  };

  const isFormValid = formData.totalBudget && formData.guestCount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Smart Budget Calculator
              </CardTitle>
              <CardDescription>
                Enter your details to get a unit-economics based budget plan.
              </CardDescription>
            </div>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="20000"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Guest Count</Label>
              <Input
                id="guests"
                type="number"
                placeholder="150"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
              />
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!isFormValid || loading}
            onClick={handleCalculate}
          >
            {loading ? "Calculating..." : "Calculate Smart Budget"}
          </Button>
        </CardContent>
      </Card>

      {calculated && result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Suggestions & Warnings */}
          {result.suggestions.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Smart Suggestions</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {result.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Breakdown */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.breakdown.map((item) => (
              <Card key={item.category} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="capitalize text-lg">{item.category}</CardTitle>
                    <Badge variant="secondary">{Math.round(item.percentage)}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    ${Math.round(item.minPrice).toLocaleString()} - ${Math.round(item.maxPrice).toLocaleString()}
                  </div>
                  {item.warning && (
                    <p className="text-xs text-destructive mb-2 font-medium">
                      {item.warning}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1">
                    {item.reasoning.map((r, i) => (
                      <p key={i}>• {r}</p>
                    ))}
                  </div>

                  {/* Vendor Recommendations Preview */}
                  {recommendations[item.category] && recommendations[item.category].length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold mb-2 text-primary">Recommended Vendors:</p>
                      <ul className="text-xs space-y-1">
                        {recommendations[item.category].map((v: any) => (
                          <li key={v.id} className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            {v.business_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};