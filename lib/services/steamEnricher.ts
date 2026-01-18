import { UnifiedGame } from "@/lib/types";
import { gameMetadataAdapter } from "@/lib/adapters/InMemoryGameMetadataAdapter";

interface SteamGenre {
  id: string;
  description: string;
}

interface SteamAppDetails {
  [appId: string]: {
    success: boolean;
    data?: {
      genres?: SteamGenre[];
    };
  };
}

export async function enrichGames(games: UnifiedGame[]): Promise<UnifiedGame[]> {
  // Sort games by playTimeTotal (descending)
  // Assuming playtimeHours is the correct field for "playTimeTotal"
  const sortedGames = [...games].sort((a, b) => (b.playtimeHours || 0) - (a.playtimeHours || 0));

  // Take the top 20 games
  const top20 = sortedGames.slice(0, 20);
  const remainingGames = sortedGames.slice(20);

  // Check the Repository for existing tags
  const appIds = top20.map((game) => game.id);
  const existingTagsMap = await gameMetadataAdapter.getTags(appIds);

  const newTagsMap: Record<string, string[]> = {};
  const gamesToFetch: UnifiedGame[] = [];

  for (const game of top20) {
    if (existingTagsMap[game.id]) {
      // Tags found in cache
      game.tags = existingTagsMap[game.id];
    } else {
      // Identify "misses"
      gamesToFetch.push(game);
    }
  }

  // Fetch Details: For the misses, fetch game details from the Steam Store API
  // Using Promise.all with individual requests as requested
  if (gamesToFetch.length > 0) {
    const fetchPromises = gamesToFetch.map(async (game) => {
      try {
        const response = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${game.id}&filters=genres&l=en`
        );
        if (!response.ok) {
            console.error(`Failed to fetch details for app ${game.id}: ${response.status}`);
            return null;
        }
        const data: SteamAppDetails = await response.json();
        const appData = data[game.id];

        if (appData && appData.success && appData.data?.genres) {
          const tags = appData.data.genres.map((g) => g.description);
          return { id: game.id, tags };
        } else {
            // Success but no genres or failed success flag
            // We can cache an empty array to avoid re-fetching constantly?
            // The prompt says "If tags is undefined or empty, render placeholder".
            // Saving empty array allows us to know we tried.
            return { id: game.id, tags: [] };
        }
      } catch (error) {
        console.error(`Error fetching details for app ${game.id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);

    for (const result of results) {
      if (result) {
        newTagsMap[result.id] = result.tags;
        // Update the game object in the top20 list
        const game = top20.find((g) => g.id === result.id);
        if (game) {
          game.tags = result.tags;
        }
      }
    }

    // Save new tags to the Repository
    if (Object.keys(newTagsMap).length > 0) {
      await gameMetadataAdapter.saveTags(newTagsMap);
    }
  }

  // Return the original list (re-combined), but with the tags field populated for those top 20 games
  // Actually, we sorted them. Should we return them in the original order or sorted order?
  // The service function signature is just enrichGames(games). The prompt says:
  // "Return the original list, but with the tags field populated for those top 20 games."
  // If the prompt implies preserving the input order, we should re-map.
  // "Sort games by playTimeTotal... Take the top 20... Return the original list"
  // This implies the *output* should be the *original input list* (enriched), or maybe the *sorted* list?
  // "Return the original list" usually means "the list passed in, in its original state/order (except enriched)".
  // But usually when you enrich and sort, the UI might expect the sorted list if it requested it.
  // However, the Steam API route just fetches games. The UI sorts them? The UI code I saw earlier didn't seem to sort explicitly, it just displayed them.
  // "I'll leave them in fetch order (BGG then Steam) for now, as user didn't specify sort." - from my thoughts earlier.
  // But here the Service *Logic* explicitly says: "Sort games by playTimeTotal (descending). Take the top 20 games."
  // This sort seems to be for *prioritizing enrichment*.
  // If I return the sorted list, the UI will change to show most played first. That is likely a good side effect.
  // But if the requirement says "Return the original list", I should be careful.
  // "Return the original list, but with the tags field populated for those top 20 games."
  // I will assume this means "The list of all games, but the top 20 (by playtime) have tags".
  // If I return the *sorted* list, I am technically returning a *reordered* list, not the "original" list structure.
  // However, returning a map of ID -> Tags and merging it into the original array is safer if strict "original list" is needed.
  // But given "Sort games... Take top 20", I'll assume the *purpose* of sorting is just to select candidates.
  // I will construct a map of enriched data and merge it back into the *original* array to be perfectly safe with "Return the original list".

  const enrichedMap = new Map<string, string[]>();
  // top20 now has tags populated (either from cache or fetch)
  for (const game of top20) {
    if (game.tags) {
      enrichedMap.set(game.id, game.tags);
    }
  }

  // Iterate over the *original* input `games` array and apply tags
  const finalGames = games.map(game => {
    if (enrichedMap.has(game.id)) {
      return { ...game, tags: enrichedMap.get(game.id) };
    }
    return game;
  });

  return finalGames;
}
