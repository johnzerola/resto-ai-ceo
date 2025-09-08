-- Fix existing users with incomplete onboarding
UPDATE public.profiles 
SET 
  onboarding_complete = true,
  onboarding_step = 4,
  updated_at = NOW()
WHERE onboarding_complete = false OR onboarding_complete IS NULL;

-- Ensure all existing users have trial configured
UPDATE public.subscribers 
SET 
  trial_start = COALESCE(trial_start, created_at),
  trial_end = COALESCE(trial_end, created_at + INTERVAL '7 days'),
  plan_status = CASE 
    WHEN plan_status IS NULL OR plan_status = '' THEN 'trial'
    ELSE plan_status
  END,
  updated_at = NOW()
WHERE trial_start IS NULL OR trial_end IS NULL OR plan_status IS NULL;