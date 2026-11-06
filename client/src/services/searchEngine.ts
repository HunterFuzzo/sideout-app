import MiniSearch from 'minisearch';
import { Competition } from '../types';

export interface IndexedCompetition extends Competition {
  id: string;
  tagsStr: string;
  teamsStr: string;
}

export class CompetitionSearchEngine {
  private miniSearch: MiniSearch<IndexedCompetition>;
  private rawItems: Competition[] = [];

  constructor() {
    this.miniSearch = new MiniSearch<IndexedCompetition>({
      fields: ['name', 'poule', 'division', 'genre', 'pouleLabel', 'tagsStr', 'teamsStr'],
      storeFields: ['poule', 'name', 'saison'],
      searchOptions: {
        boost: { poule: 4, tagsStr: 3, teamsStr: 2.5, name: 2 },
        prefix: true,
        fuzzy: 0.2,
      },
    });
  }

  public setCompetitions(items: Competition[]): void {
    this.rawItems = items;
    this.miniSearch.removeAll();

    const indexed: IndexedCompetition[] = items.map((comp) => ({
      ...comp,
      id: comp.poule,
      tagsStr: (comp.tags || []).join(' '),
      teamsStr: (comp.teams || []).join(' '),
    }));

    this.miniSearch.addAll(indexed);
  }

  public search(query: string, selectedTags: string[] = []): Competition[] {
    const q = query.trim().toLowerCase();

    // If both query and tags are empty, return all raw items
    if (!q && selectedTags.length === 0) {
      return this.rawItems;
    }

    let candidateList = this.rawItems;

    // Filter by selected tags if any
    if (selectedTags.length > 0) {
      candidateList = candidateList.filter((comp) => {
        const compTags = (comp.tags || []).map((t) => t.toLowerCase());
        const compTeams = (comp.teams || []).map((t) => t.toLowerCase());
        const normName = comp.name.toLowerCase();
        const normPoule = comp.poule.toLowerCase();

        const is4x4 = normName.includes('4x4') || normName.includes('4 x 4') || normPoule.startsWith('4') || compTags.includes('4x4');
        const is2x2 = normName.includes('2x2') || normName.includes('2 x 2') || normPoule.startsWith('2') || compTags.includes('2x2');

        return selectedTags.every((st) => {
          const norm = st.toLowerCase().replace(/^#/, '');

          // Strict format exclusivity
          if (norm === '6x6') {
            return !is4x4 && !is2x2;
          }
          if (norm === '4x4') {
            return is4x4;
          }
          if (norm === '2x2') {
            return is2x2;
          }

          return (
            compTags.some((t) => t === norm || t.includes(norm)) ||
            compTeams.some((team) => team.includes(norm)) ||
            normName.includes(norm) ||
            normPoule.includes(norm)
          );
        });
      });
    }

    if (!q) {
      return candidateList;
    }

    // MiniSearch full text match
    const searchResults = this.miniSearch.search(q);
    const scoreMap = new Map<string, number>();
    searchResults.forEach((res) => {
      scoreMap.set(res.id, res.score);
    });

    // Match either via MiniSearch score OR direct substring on teams/tags/name
    return candidateList
      .filter((comp) => {
        if (scoreMap.has(comp.poule)) return true;
        const normQ = q.replace(/^#/, '');
        const inName = comp.name.toLowerCase().includes(normQ);
        const inPoule = comp.poule.toLowerCase().includes(normQ);
        const inTags = (comp.tags || []).some((t) => t.toLowerCase().includes(normQ));
        const inTeams = (comp.teams || []).some((t) => t.toLowerCase().includes(normQ));
        return inName || inPoule || inTags || inTeams;
      })
      .sort((a, b) => {
        const scoreA = scoreMap.get(a.poule) || 0;
        const scoreB = scoreMap.get(b.poule) || 0;
        return scoreB - scoreA;
      });
  }
}

export const searchEngine = new CompetitionSearchEngine();
