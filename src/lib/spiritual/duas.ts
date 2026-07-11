import corpus from "../../../content/duas/shia-duas.json";

export type Dua = {
  id: string;
  source: string;
  title: string;
  ref: string;
  arabic?: string;
  translation: string;
  themes: string[];
};

export type DuaCorpus = {
  note?: string;
  fallbackId: string;
  duas: Dua[];
};

export const duaCorpus = corpus as DuaCorpus;

export function getAllDuas(): Dua[] {
  return duaCorpus.duas;
}

export function getDuaById(id: string): Dua | undefined {
  return duaCorpus.duas.find((d) => d.id === id);
}

export function getDuaIds(): string[] {
  return duaCorpus.duas.map((d) => d.id);
}

export function resolvePrescriptionDua(id: string | undefined | null): Dua {
  const found = id ? getDuaById(id) : undefined;
  if (found) return found;
  const fallback =
    getDuaById(duaCorpus.fallbackId) ?? duaCorpus.duas[0];
  if (!fallback) {
    throw new Error("Dua corpus is empty");
  }
  return fallback;
}

/** Compact catalog for LLM prompts (no full Arabic bodies). */
export function duaCatalogForPrompt(): {
  id: string;
  title: string;
  source: string;
  ref: string;
  themes: string[];
}[] {
  return duaCorpus.duas.map((d) => ({
    id: d.id,
    title: d.title,
    source: d.source,
    ref: d.ref,
    themes: d.themes,
  }));
}
