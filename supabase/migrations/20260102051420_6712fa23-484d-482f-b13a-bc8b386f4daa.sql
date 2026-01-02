-- Add cancellation reason column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Enable realtime for collections table
ALTER TABLE public.collections REPLICA IDENTITY FULL;

-- Add collections to realtime publication
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'collections'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;
  END IF;
END $$;