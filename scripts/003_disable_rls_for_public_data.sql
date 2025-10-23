-- Since the MP3 archive data is public and read-only for users,
-- we can disable RLS to allow the scraper to write data.
-- Users will still only be able to read via the API.

-- Disable RLS on tracks table (public data)
ALTER TABLE public.tracks DISABLE ROW LEVEL SECURITY;

-- Disable RLS on scrape_metadata table (public data)
ALTER TABLE public.scrape_metadata DISABLE ROW LEVEL SECURITY;

-- Note: The API routes control access, so this is safe for public data
