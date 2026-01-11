# Supabase Migrations

Run these migrations in order in the Supabase SQL Editor.

## Migration Order

1. **001_create_tasks_table.sql** - Creates the main tasks table
2. **002_enable_rls.sql** - Enables Row Level Security
3. **003_create_policies.sql** - Creates access policies (users can only see their own tasks)
4. **004_create_indexes.sql** - Creates indexes for better query performance
5. **005_create_user_settings.sql** - Creates user settings table (optional)

## How to Run

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of each file and paste into the editor
4. Click **Run** for each migration in order

## Environment Variables

After running migrations, make sure your `.env` file has:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: **Supabase Dashboard → Settings → API**
