-- Add RLS policies to allow service role to write data
-- This allows the scraper API to insert/update tracks

-- Policy to allow service role to insert tracks
CREATE POLICY "Allow service role to insert tracks" 
  ON public.tracks FOR INSERT 
  WITH CHECK (true);

-- Policy to allow service role to update tracks
CREATE POLICY "Allow service role to update tracks" 
  ON public.tracks FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Policy to allow service role to delete tracks (for maintenance)
CREATE POLICY "Allow service role to delete tracks" 
  ON public.tracks FOR DELETE 
  USING (true);

-- Policy to allow service role to insert scrape metadata
CREATE POLICY "Allow service role to insert scrape_metadata" 
  ON public.scrape_metadata FOR INSERT 
  WITH CHECK (true);

-- Policy to allow service role to update scrape metadata
CREATE POLICY "Allow service role to update scrape_metadata" 
  ON public.scrape_metadata FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Policy to allow service role to delete scrape metadata
CREATE POLICY "Allow service role to delete scrape_metadata" 
  ON public.scrape_metadata FOR DELETE 
  USING (true);
