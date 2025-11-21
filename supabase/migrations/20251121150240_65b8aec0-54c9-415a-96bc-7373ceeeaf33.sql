-- Add onboarding quiz fields to wedding_plans
ALTER TABLE wedding_plans 
ADD COLUMN IF NOT EXISTS priorities JSONB DEFAULT '{"photography": "medium", "catering": "medium", "entertainment": "medium", "decoration": "medium"}'::jsonb,
ADD COLUMN IF NOT EXISTS style_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS style_reference_images TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN wedding_plans.priorities IS 'Priority levels for different wedding aspects: photography, catering, entertainment, decoration (high/medium/low)';
COMMENT ON COLUMN wedding_plans.style_preferences IS 'Selected wedding style tags: rustic, modern, traditional, elegant, bohemian, etc.';
COMMENT ON COLUMN wedding_plans.style_reference_images IS 'URLs of reference images for wedding style inspiration';