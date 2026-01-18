import { GameMetadataRepository } from "@/lib/ports/GameMetadataRepository";

export class InMemoryGameMetadataAdapter implements GameMetadataRepository {
  private cache: Map<string, string[]>;

  constructor() {
    this.cache = new Map();
  }

  async getTags(appIds: string[]): Promise<Record<string, string[]>> {
    const result: Record<string, string[]> = {};
    for (const appId of appIds) {
      if (this.cache.has(appId)) {
        result[appId] = this.cache.get(appId)!;
      }
    }
    return result;
  }

  async saveTags(data: Record<string, string[]>): Promise<void> {
    for (const [appId, tags] of Object.entries(data)) {
      this.cache.set(appId, tags);
    }
  }
}

// Singleton pattern for Next.js HMR
const globalForAdapter = global as unknown as { gameMetadataAdapter: InMemoryGameMetadataAdapter };

export const gameMetadataAdapter =
  globalForAdapter.gameMetadataAdapter || new InMemoryGameMetadataAdapter();

if (process.env.NODE_ENV !== "production") {
  globalForAdapter.gameMetadataAdapter = gameMetadataAdapter;
}
