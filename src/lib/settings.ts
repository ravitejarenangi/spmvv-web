import { prisma } from "./db";

let settingsCache: Map<string, unknown> | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 60_000;

export async function loadSettings(): Promise<Map<string, unknown>> {
  const now = Date.now();
  if (settingsCache && now - cacheLoadedAt < CACHE_TTL_MS) {
    return settingsCache;
  }
  const rows = await prisma.setting.findMany();
  const map = new Map<string, unknown>();
  for (const row of rows) {
    map.set(row.key, row.value);
  }
  settingsCache = map;
  cacheLoadedAt = now;
  return map;
}

export async function getSetting<T = unknown>(key: string): Promise<T> {
  const map = await loadSettings();
  return map.get(key) as T;
}

export async function getSettingsByCategory(
  category: string
): Promise<{ key: string; value: unknown; description: string | null }[]> {
  return prisma.setting.findMany({
    where: { category },
    select: { key: true, value: true, description: true },
  });
}

export async function updateSetting(key: string, value: unknown): Promise<void> {
  await prisma.setting.update({
    where: { key },
    data: { value: value as any },
  });
  invalidateCache();
}

export async function updateSettings(updates: { key: string; value: unknown }[]): Promise<void> {
  await prisma.$transaction(
    updates.map(({ key, value }) =>
      prisma.setting.update({
        where: { key },
        data: { value: value as any },
      })
    )
  );
  invalidateCache();
}

export function invalidateCache(): void {
  settingsCache = null;
  cacheLoadedAt = 0;
}
