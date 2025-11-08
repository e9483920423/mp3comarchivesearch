-- Add columns to track metadata extraction source and confidence
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS metadata_source TEXT DEFAULT 'filename',
ADD COLUMN IF NOT EXISTS metadata_confidence DECIMAL(3,2) DEFAULT 0.7;

-- Add index for metadata tracking
CREATE INDEX IF NOT EXISTS idx_tracks_metadata_source ON public.tracks(metadata_source);
CREATE INDEX IF NOT EXISTS idx_tracks_metadata_confidence ON public.tracks(metadata_confidence);

-- Add comment documenting the new columns
COMMENT ON COLUMN public.tracks.metadata_source IS 'Source of metadata: id3 (from MP3 tags), filename (parsed), or fallback (default)';
COMMENT ON COLUMN public.tracks.metadata_confidence IS 'Confidence score of extracted metadata (0-1)';
