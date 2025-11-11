# Migration Required: Recommendations Schema Enhancement

## ⚠️ Important: Database Migration Needed

Before the Recommendations feature will work fully, you need to apply migration `012_enhance_recommendations_schema.sql` to your Supabase database.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/bkzwaukiujlecuyabnny/sql/new

2. Copy and paste the contents of:
   `../galligo2.0/server/supabase/migrations/012_enhance_recommendations_schema.sql`

3. Click "Run" to execute

### Option 2: Quick Essential Changes Only

If you just want to get started quickly, run this minimal SQL:

```sql
-- Add recipient targeting to recommendation_requests
ALTER TABLE recommendation_requests
ADD COLUMN IF NOT EXISTS recipient_ids UUID[] DEFAULT '{}';

-- Add request linking to place_recommendations
ALTER TABLE place_recommendations
ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES recommendation_requests(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recommendation_requests_recipients
ON recommendation_requests USING GIN(recipient_ids);

CREATE INDEX IF NOT EXISTS idx_place_recommendations_request
ON place_recommendations(request_id);
```

## What This Migration Does

1. **`recipient_ids` column** in `recommendation_requests`
   - Allows targeting specific friends
   - Empty array = broadcast to all friends
   - Enables friend selector in "Create Request" modal

2. **`request_id` column** in `place_recommendations`
   - Links responses to originating requests
   - Shows "In response to request" context
   - Tracks response counts accurately

3. **Indexes** for efficient queries
4. **Updated RLS policies** for proper security
5. **Helper functions** for convenience

## Verification

After applying, verify with:

```sql
-- Check new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('recommendation_requests', 'place_recommendations')
AND column_name IN ('recipient_ids', 'request_id');
```

You should see:
- `recommendation_requests.recipient_ids` (ARRAY)
- `place_recommendations.request_id` (uuid)

## Status

- ✅ Migration SQL file created
- ⏳ **Needs manual application via Supabase Dashboard**
- ✅ Mobile app code updated to use new schema
- ✅ All modals and components ready

Once applied, the full Recommendations feature will work!
