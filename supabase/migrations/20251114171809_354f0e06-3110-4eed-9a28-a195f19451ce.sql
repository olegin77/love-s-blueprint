-- Create guests table for wedding guest management
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  attendance_status TEXT DEFAULT 'pending' CHECK (attendance_status IN ('pending', 'confirmed', 'declined')),
  plus_one_allowed BOOLEAN DEFAULT false,
  plus_one_name TEXT,
  dietary_restrictions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Couples can manage guests for their wedding plans
CREATE POLICY "Couples can view their own guests"
ON public.guests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = guests.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

CREATE POLICY "Couples can insert guests"
ON public.guests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = guests.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

CREATE POLICY "Couples can update their guests"
ON public.guests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = guests.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

CREATE POLICY "Couples can delete their guests"
ON public.guests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = guests.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();