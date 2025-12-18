import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Check, Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const vibes = [
  { id: "classic", label: "Classic & Elegant", description: "Timeless beauty, roses, black tie" },
  { id: "rustic", label: "Rustic & Cozy", description: "Barns, wood, wildflowers, warm lights" },
  { id: "modern", label: "Modern & Chic", description: "Minimalist, clean lines, urban venues" },
  { id: "party", label: "Party & Fun", description: "DJ, cocktails, dancing all night" },
];

export default function WeddingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: undefined as Date | undefined,
    city: "",
    guests: [100],
    vibe: "",
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFinish = async () => {
    if (step === 3) {
      setIsSubmitting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please log in to continue");
          navigate("/auth");
          return;
        }

        const { error } = await supabase.from("wedding_plans").insert({
          couple_user_id: user.id,
          wedding_date: formData.date ? format(formData.date, "yyyy-MM-dd") : null,
          venue_location: formData.city,
          estimated_guests: formData.guests[0],
          style_preferences: [formData.vibe],
          theme: formData.vibe,
        });

        if (error) throw error;

        toast.success("Your wedding plan has been created!");
        setStep(4);
      } catch (error: any) {
        console.error("Error creating wedding plan:", error);
        toast.error(error.message || "Failed to create wedding plan");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      handleNext();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <Label>When is the big day?</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(date) => setFormData({ ...formData, date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Where is it happening?</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="City (e.g. Tashkent)"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>Guest Count</Label>
          <span className="font-bold text-primary">{formData.guests[0]} guests</span>
        </div>
        <Slider
          value={formData.guests}
          onValueChange={(val) => setFormData({ ...formData, guests: val })}
          max={500}
          step={10}
          className="py-4"
        />
        <p className="text-sm text-muted-foreground text-center">
          {formData.guests[0] < 50 ? "Intimate gathering" :
            formData.guests[0] < 150 ? "Standard wedding size" :
              "Big celebration!"}
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-right-4">
      {vibes.map((vibe) => (
        <div
          key={vibe.id}
          className={cn(
            "border rounded-lg p-4 cursor-pointer transition-all hover:border-primary",
            formData.vibe === vibe.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
          )}
          onClick={() => setFormData({ ...formData, vibe: vibe.id })}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{vibe.label}</h3>
              <p className="text-sm text-muted-foreground">{vibe.description}</p>
            </div>
            {formData.vibe === vibe.id && <Check className="h-5 w-5 text-primary" />}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Heart className="w-8 h-8 text-primary fill-primary" />
      </div>
      <h2 className="text-2xl font-bold">Your Wedding Plan v1 is Ready!</h2>
      <p className="text-muted-foreground">
        Based on your {formData.vibe} style for {formData.guests[0]} guests in {formData.city}.
      </p>

      <div className="grid gap-4 text-left mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommended Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>Garden Villa (Fits {formData.guests[0]} guests)</li>
              <li>Grand Ballroom (Perfect for {formData.vibe})</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>Book a venue tour</li>
              <li>Set up your budget calculator</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full mt-4" size="lg" onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </Button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      {step < 4 ? (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <Badge variant="secondary" className="text-xs">Step {step} of 3</Badge>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/dashboard")}>Skip</Button>
            </div>
            <CardTitle>
              {step === 1 && "Let's start with the basics"}
              {step === 2 && "How big is the party?"}
              {step === 3 && "What's your vibe?"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "We need a date and location to find available vendors."}
              {step === 2 && "This helps us estimate your budget accurately."}
              {step === 3 && "We'll match you with vendors who fit your style."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1}>Back</Button>
            <Button 
              onClick={handleFinish} 
              disabled={
                (step === 1 && (!formData.date || !formData.city)) ||
                (step === 3 && !formData.vibe) ||
                isSubmitting
              }
            >
              {isSubmitting ? "Saving..." : step === 3 ? "Finish" : "Next"} 
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        renderSummary()
      )}
    </div>
  );
}
