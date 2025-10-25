# MP3.com Internet Archive MP3.com Rescue Barge collection search
[mp3.drumkits4.me](https://mp3.drumkits4.me/)

## Overview

This project indexes the Internet Archive's MP3.com Rescue Barge collection, making it easilly searchable. 
All files are hosted externally by the Internet Archive, and songs belong to their respective owners.

Inspired by mp3.xo.tel, this site is built with:

- TypeScript
- Next.js
- Tailwind CSS

## How to fork & deploy:

Follow these steps to fork the repository and deploy your own instance. I assume you have a GitHub account and familiar with Vercel and Supabase.

Fork Repo or [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fe9483920423%2Fmp3comarchivesearch&env=SUPABASE_POSTGRES_PRISMA_URL%2CSUPABASE_URL%2CNEXT_PUBLIC_SUPABASE_URL%2CSUPABASE_POSTGRES_URL_NON_POOLING%2CSUPABASE_JWT_SECRET%2CSUPABASE_POSTGRES_USER%2CNEXT_PUBLIC_SUPABASE_ANON_KEY%2CSUPABASE_POSTGRES_PASSWORD%2CSUPABASE_POSTGRES_DATABASE%2CSUPABASE_SERVICE_ROLE_KEY%2CSUPABASE_POSTGRES_HOST%2CSUPABASE_ANON_KEY%2CSUPABASE_POSTGRES_URL)

Vercel:
1: Create & connect a Supabase account to your project.

2. **Set Up Supabase**  
   - Connent Supabase as an integration with your vercel deployment (Vercel will prompt for environment variables this is fine).  
   - In the Supabase dashboard, go to the SQL Editor and run the following query to disable Row Level Security (RLS) for scraping:  
     ```sql
     ALTER TABLE public.tracks DISABLE ROW LEVEL SECURITY;
     ALTER TABLE public.scrape_metadata DISABLE ROW LEVEL SECURITY;
     ```  
     Expected output: *Success. No rows returned*.

3. 1. **Clone or Fork the Repository**
Download [scrapeddata.zip](https://github.com/e9483920423/mp3comarchivesearch/tree/main/public/data) 

4. 4. **Upload Data to Supabase**  
   - Unzip `scrapeddata.zip` to access `scrape_metadata_rows.csv` and `tracks_rows.csv`.  
   - In the Supabase dashboard, open the Table Editor.  
   - Upload `scrape_metadata_rows.csv` to the `scrape_metadata` table.  
   - Upload `tracks_rows.csv` to the `tracks` table.  
   - Wait for the uploads to complete.

Your instance should be live. 
If you encounter issues, check the Vercel and Supabase logs for errors.
