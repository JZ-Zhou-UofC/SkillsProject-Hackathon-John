import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase environment variables are not set")

db = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---- REAL connection test ----
try:
    db.table("training_jobs").select("id").limit(1).execute()
    print("✅ Supabase connection verified (query succeeded)")
except Exception as e:
    raise RuntimeError(f"❌ Supabase connection failed: {e}")
