CREATE POLICY "Allow service role to insert tracks" 
  ON public.tracks FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow service role to update tracks" 
  ON public.tracks FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to delete tracks" 
  ON public.tracks FOR DELETE 
  USING (true);

CREATE POLICY "Allow service role to insert scrape_metadata" 
  ON public.scrape_metadata FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow service role to update scrape_metadata" 
  ON public.scrape_metadata FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to delete scrape_metadata" 
  ON public.scrape_metadata FOR DELETE 
  USING (true);
