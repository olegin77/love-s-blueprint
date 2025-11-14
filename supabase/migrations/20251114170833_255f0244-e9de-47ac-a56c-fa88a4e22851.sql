-- WeddingTech UZ Database Schema - Phase 0
-- Core tables for MVP functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('couple', 'vendor', 'admin');
CREATE TYPE vendor_category AS ENUM ('venue', 'photographer', 'videographer', 'caterer', 'florist', 'decorator', 'music', 'makeup', 'clothing', 'transport', 'other');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

-- User Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'couple',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Vendor Profiles table
CREATE TABLE public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category vendor_category NOT NULL,
  description TEXT,
  location TEXT,
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  portfolio_images TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on vendor_profiles
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_profiles
CREATE POLICY "Anyone can view vendor profiles"
  ON public.vendor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Vendors can update their own profile"
  ON public.vendor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert their own profile"
  ON public.vendor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Wedding Plans table
CREATE TABLE public.wedding_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_date DATE,
  venue_location TEXT,
  estimated_guests INTEGER,
  budget_total DECIMAL(12,2),
  budget_spent DECIMAL(12,2) DEFAULT 0,
  theme TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on wedding_plans
ALTER TABLE public.wedding_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wedding_plans
CREATE POLICY "Couples can view their own wedding plans"
  ON public.wedding_plans FOR SELECT
  USING (auth.uid() = couple_user_id);

CREATE POLICY "Couples can create their own wedding plans"
  ON public.wedding_plans FOR INSERT
  WITH CHECK (auth.uid() = couple_user_id);

CREATE POLICY "Couples can update their own wedding plans"
  ON public.wedding_plans FOR UPDATE
  USING (auth.uid() = couple_user_id);

CREATE POLICY "Couples can delete their own wedding plans"
  ON public.wedding_plans FOR DELETE
  USING (auth.uid() = couple_user_id);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  couple_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Couples can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = couple_user_id);

CREATE POLICY "Vendors can view bookings for their services"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.vendor_profiles WHERE id = vendor_id
    )
  );

CREATE POLICY "Couples can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = couple_user_id);

CREATE POLICY "Couples can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = couple_user_id);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id, user_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for completed bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id
      AND couple_user_id = auth.uid()
      AND status = 'completed'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wedding_plans_updated_at
  BEFORE UPDATE ON public.wedding_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'couple')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update vendor rating after review
CREATE OR REPLACE FUNCTION public.update_vendor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.vendor_profiles
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.reviews
      WHERE vendor_id = NEW.vendor_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE vendor_id = NEW.vendor_id
    )
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$;

-- Trigger to update vendor rating on new review
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_vendor_rating();

-- Create indexes for better performance
CREATE INDEX idx_vendor_profiles_category ON public.vendor_profiles(category);
CREATE INDEX idx_vendor_profiles_rating ON public.vendor_profiles(rating DESC);
CREATE INDEX idx_bookings_couple_user_id ON public.bookings(couple_user_id);
CREATE INDEX idx_bookings_vendor_id ON public.bookings(vendor_id);
CREATE INDEX idx_reviews_vendor_id ON public.reviews(vendor_id);
CREATE INDEX idx_wedding_plans_couple_user_id ON public.wedding_plans(couple_user_id);