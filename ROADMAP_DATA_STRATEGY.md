# Data Strategy Roadmap: From Prototype to Platform

## Phase 1: The "Lazy" Prototype (Current)
**Goal:** fast iterations, zero infrastructure cost, relying on external APIs.

### Architecture
* **Storage:** In-Memory Cache (Request-scoped or simple ephemeral server cache).
* **Fetching Strategy:** "Top-N Lazy Load".
    * Only fetch metadata (tags/categories) for the user's top 20 played Steam games.
    * BGG data is fully parsed from XML on every request (or cached in localStorage client-side).
* **Persistence:** None. Data is lost on server restart/redeployment.

### Limitations
* **Rate Limits:** High risk of hitting Steam API limits if a user refreshes frequently.
* **Latency:** First load is slow (~2-4s) due to waterfall API calls.
* **Searchability:** Cannot search "global" data, only what has been fetched for the current user.

---

## Phase 2: The "Cached" Pivot (Trigger: >100 Daily Active Users)
**Goal:** Reduce API dependency and improve Time-to-Interactive (TTI).

### Architecture Changes
* **Pattern:** Ports & Adapters (Hexagonal).
    * Swap `InMemoryTagAdapter` for `PostgresTagAdapter`.
* **Schema:**
    * `games_cache` table: `app_id` (PK), `source` (steam/bgg), `metadata_json` (tags, images), `last_updated`.
* **Logic:**
    * Before hitting Steam API, check `games_cache`.
    * If miss -> Fetch -> Write to DB -> Return.
    * If hit -> Return immediately.

### Benefits
* **Zero Redundancy:** We never fetch tags for *Elden Ring* twice.
* **Speed:** Cached lookups are <10ms.

---

## Phase 3: The "Platform" Scale (Trigger: "Vibe Search" Feature)
**Goal:** Enable global discovery and reverse-index searching.

### Architecture Changes
* **Ingestion:** "Seeding Scripts" to pre-populate the top 5,000 games from Steam/BGG.
* **Indexing:** Use Postgres Full Text Search or a dedicated vector store (e.g., pgvector) for "Vibe Matching".
* **Feature Enablement:**
    * "Show me games like X that I *don't* own."
    * "Find a game that matches these 3 tags."

## Migration Checklist
1.  [ ] Provision Railway Postgres instance.
2.  [ ] Run migration `001_create_game_cache`.
3.  [ ] Implement `PostgresTagAdapter`.
4.  [ ] Update `DependencyInjection` container to inject Postgres adapter.
