import { useNavigate } from "react-router-dom";
import { OnboardingQuiz } from "@/components/OnboardingQuiz";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user already has a wedding plan
    const checkExistingPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: plans } = await supabase
        .from("wedding_plans")
        .select("id")
        .eq("couple_user_id", user.id)
        .limit(1);

      if (plans && plans.length > 0) {
        // User already has a plan, redirect to planner
        navigate("/planner");
      }
    };

    checkExistingPlan();
  }, [navigate]);

  const handleComplete = (weddingPlanId: string) => {
    // Redirect to planner with the new wedding plan
    navigate("/planner");
  };

  return <OnboardingQuiz onComplete={handleComplete} />;
};

export default Onboarding;