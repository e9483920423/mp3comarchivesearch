CREATE TABLE IF NOT EXISTS public.tracks (
  id TEXT PRIMARY KEY,
  artist TEXT NOT NULL,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT NOT NULL,
  filesize TEXT,
  collection TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracks_artist ON public.tracks(artist);
CREATE INDEX IF NOT EXISTS idx_tracks_title ON public.tracks(title);
CREATE INDEX IF NOT EXISTS idx_tracks_collection ON public.tracks(collection);
CREATE TABLE IF NOT EXISTS public.scrape_metadata (
  id SERIAL PRIMARY KEY,
  total_tracks INTEGER NOT NULL,
  last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  urls_scraped INTEGER NOT NULL,
  status TEXT NOT NULL
);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to tracks" 
  ON public.tracks FOR SELECT 
  USING (true);
CREATE POLICY "Allow public read access to scrape_metadata" 
  ON public.scrape_metadata FOR SELECT 
  USING (true);

-- Only allow server (service role) to insert/update/delete
-- This will be done via the API routes using service role key
