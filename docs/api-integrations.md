# API Integrations

Project Pulse relies on external APIs to provide comprehensive fitness and nutrition data.

## ExerciseDB (RapidAPI)

We use the ExerciseDB API via RapidAPI to source a vast library of exercises, complete with target muscles, equipment required, instructions, and GIF demonstrations.

### Configuration

You must configure the following environment variables in your `.env.local` file:

```env
# ⚠️ WARNING: Your RAPIDAPI_KEY is completely private and MUST NEVER be committed to version control.
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=exercisedb.p.rapidapi.com
```

### Health Check & Testing

To verify that your API key is correct and that Project Pulse can successfully communicate with ExerciseDB, you can use the built-in health check endpoint:

**Endpoint:** `GET /api/health/exercise`

**Example Request (Local):**

```bash
curl http://localhost:3000/api/health/exercise
```

**Expected Success Response:**

```json
{
  "ok": true,
  "provider": "ExerciseDB"
}
```

If it fails, double check your `.env.local` file and ensure your RapidAPI subscription is active.

### Security Warning

- **NEVER** expose the `RAPIDAPI_KEY` to the client-side bundle (e.g., do not prefix it with `NEXT_PUBLIC_`).
- All requests to ExerciseDB MUST route through our Next.js API routes (Server Actions or `app/api/...`) so the key remains hidden on the server.
