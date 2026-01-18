export interface GameMetadataRepository {
  getTags(appIds: string[]): Promise<Record<string, string[]>>;
  saveTags(data: Record<string, string[]>): Promise<void>;
}
