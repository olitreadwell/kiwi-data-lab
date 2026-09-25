import type { MicrositeAccent } from '@/components/microsite-styles';
import type { MicrositeReference } from '@/components/MicrositeReferences';

import { withHiddenMicrositesRemoved } from './hidden-microsites';
import { PUBLISHED_MICROSITES } from './published-microsites';

/** Who publishes the underlying data for a microsite story. */
export type MicrositeDataSource =
  | 'Stats NZ'
  | 'GeoNet'
  | 'NZ Organisms Register (NZOR)'
  | 'data.govt.nz'
  | 'DigitalNZ (National Library)'
  | 'Trade Me'
  | 'iNaturalist'
  | 'GBIF'
  | 'Wikipedia & Wikidata'
  | 'United Nations'
  | 'Auckland Council'
  | 'OpenStreetMap'
  | 'Environment Canterbury'
  | 'Hamilton City Council'
  | 'NZ Transport Agency (NZTA)'
  | 'Landcare Research';

/** The main visualisation used by a microsite story. */
export type MicrositeChartType =
  | 'Line chart'
  | 'Bar chart'
  | 'Rank / slope'
  | 'Map'
  | 'Search & table'
  | 'Tree'
  | 'Pyramid'
  | 'Histogram'
  | 'Scatter'
  | 'Rose / polar'
  | 'Sunburst'
  | 'Streamgraph'
  | 'Cycle plot'
  | 'Dumbbell'
  | 'Ridgeline'
  | 'Waffle'
  | 'Parallel coordinates'
  | 'Tile grid'
  | 'Dot plot'
  | 'Choropleth'
  | 'Marimekko'
  | 'Pareto'
  | 'Heatmap'
  | 'Strip chart'
  | 'Bar-in-bar';

/** The subject area a microsite story belongs to. */
export type MicrositeCategory =
  | 'Agriculture & farming'
  | 'Earthquakes & geology'
  | 'Biodiversity & nature'
  | 'Environment & geography'
  | 'Census & population'
  | 'Economy & business'
  | 'Tourism & travel'
  | 'Transport'
  | 'Education'
  | 'Open data & digital'
  | 'Society & community'
  | 'Politics & government';

/** URL slug for each microsite category, used for /category-slug/ routes. */
export const CATEGORY_SLUGS: Record<MicrositeCategory, string> = {
  'Agriculture & farming': 'agriculture',
  'Earthquakes & geology': 'earthquakes',
  'Biodiversity & nature': 'biodiversity',
  'Environment & geography': 'environment',
  'Census & population': 'census',
  'Economy & business': 'economy',
  'Tourism & travel': 'tourism',
  Transport: 'transport',
  Education: 'education',
  'Open data & digital': 'open-data',
  'Society & community': 'society',
  'Politics & government': 'politics',
};

/** Category slug for a microsite config. */
export function categorySlugFor(microsite: Pick<MicrositeConfig, 'category'>): string {
  return CATEGORY_SLUGS[microsite.category];
}

/** Category label for a category slug, or undefined when unknown. */
export function categoryLabelForSlug(slug: string): MicrositeCategory | undefined {
  return (Object.entries(CATEGORY_SLUGS) as [MicrositeCategory, string][]).find(
    ([, candidate]) => candidate === slug,
  )?.[0];
}

/** Canonical story path for a microsite: /category-slug/slug/. */
export function micrositePathFor(microsite: Pick<MicrositeConfig, 'slug' | 'category'>): string {
  return `/${CATEGORY_SLUGS[microsite.category]}/${microsite.slug}/`;
}

/** Other microsites in the same category, same data source ranked first. */
export function relatedMicrositesFor(
  microsite: Pick<MicrositeConfig, 'slug' | 'category' | 'dataSource'>,
  limit = 4,
): MicrositeConfig[] {
  return [...MICROSITES]
    .filter(
      (candidate) => candidate.slug !== microsite.slug && candidate.category === microsite.category,
    )
    .sort((first, second) => {
      const firstSameSource = first.dataSource === microsite.dataSource ? 0 : 1;
      const secondSameSource = second.dataSource === microsite.dataSource ? 0 : 1;
      return firstSameSource - secondSameSource;
    })
    .slice(0, limit);
}

/** Human-readable freshness line for one microsite, from its data note. */
export function freshnessLabelFor(microsite: Pick<MicrositeConfig, 'dataNote'>): string {
  return microsite.dataNote.includes('live from the browser')
    ? 'Live data, loaded from your browser'
    : 'Data fetched at deploy time; the site redeploys daily';
}

export interface MicrositeConfig {
  slug: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  paragraphs: string[];
  /** Three to five headline facts, pulled from the story's own numbers. */
  keyFacts: string[];
  /** One-line reading guide for the page's main chart. */
  howToRead: string;
  /** Canonical data source URL, reused from the reference list. */
  sourceUrl: string;
  accent: MicrositeAccent;
  dataSource: MicrositeDataSource;
  chartType: MicrositeChartType;
  category: MicrositeCategory;
  dataNote: string;
  references: MicrositeReference[];
}

export const CATEGORY_DETAILS: Record<MicrositeCategory, string> = {
  'Agriculture & farming':
    'Stories about what the land produces, from the sheep flock to the deer herd, vines, forests, and the rabbits in between.',
  'Earthquakes & geology':
    'GeoNet locates around 20,000 earthquakes a year; these stories slice that catalog by magnitude, depth, month, and year.',
  'Biodiversity & nature':
    'The living catalogue of New Zealand species, from the national register to citizen-science observations.',
  'Environment & geography':
    'Rivers, peaks, parks, rain gauges, and the map of every school: the physical environment in data.',
  'Census & population':
    'The 2013, 2018, and 2023 censuses: who lives where, how old they are, and how the ranks shifted.',
  'Economy & business':
    'Business demography, trade, card spending, employment, and unemployment: the economy in official statistics.',
  'Tourism & travel':
    'Visitor arrivals by month, market, and rank, measured against the last full pre-pandemic year.',
  Transport:
    'The NZTA registers: electric vehicle (EV) charging, road crashes, and the whole motor vehicle fleet.',
  Education: 'Every school in New Zealand, mapped from OpenStreetMap.',
  'Open data & digital':
    'Live searches across New Zealand’s open-data catalogues, digitised collections, and marketplaces.',
  'Society & community': 'The parks and playgrounds that shape everyday neighbourhood life.',
  'Politics & government':
    'Elections, parties, and the shape of the House: who won what, and who ended up running the country.',
};

export const MICROSITES: MicrositeConfig[] = withHiddenMicrositesRemoved<MicrositeConfig>([
  {
    slug: 'sheep-index',
    keyFacts: [
      'Flock fell from 49.5 million (1994) to 23.3 million (2025), nearly halving.',
      '1982 peak: 70 million sheep, more than 20 for every person.',
      'About four sheep per person by 2024, down from six in 2016.',
    ],
    howToRead: 'The line shows the national flock each year; hover a point for the exact count.',
    sourceUrl: 'https://www.stats.govt.nz/news/sheep-number-falls-to-six-for-each-person/',
    label: 'Sheep index',
    eyebrow: 'the sheep index',
    title: "New Zealand's national animal is in freefall.",
    description:
      'The national sheep flock has nearly halved since 1994, dropping from 49.5 million to 23.3 million by 2025. The series starts in 1994, the year the flock peaked, and comes straight from the Stats NZ Aotearoa Data Explorer at deploy time.',
    paragraphs: [
      'The real peak came earlier. In 1982 New Zealand counted 70 million sheep, more than 20 for every person. The flock has shrunk in almost every year since.',
      'In 2016 there were still six sheep for every person. By 2024 that was down to about four.',
    ],
    accent: 'amber',
    dataSource: 'Stats NZ',
    chartType: 'Line chart',
    category: 'Agriculture & farming',
    dataNote:
      'Data: Stats NZ Aotearoa Data Explorer, table AGR_AGR_003 (Livestock Numbers by Regional Council), national sheep total, fetched at deploy time via @kiwilab/stats-nz, falling back to a committed snapshot when the API blocks the build runner; the site redeploys daily.',
    references: [
      {
        label: 'Sheep number falls to six for each person (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/sheep-number-falls-to-six-for-each-person/',
        kind: 'data',
      },
      {
        label: 'Fewer sheep and dairy cattle in 2022 (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/fewer-sheep-and-dairy-cattle-in-2022/',
        kind: 'data',
      },
      {
        label: 'Sheep farming (Te Ara)',
        url: 'https://teara.govt.nz/en/sheep-farming',
        kind: 'history',
      },
      {
        label: 'The 1980s (NZ History)',
        url: 'https://nzhistory.govt.nz/culture/the-1980s',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'dairy-takeover',
    keyFacts: [
      'The sheep flock nearly halved while dairy cattle nearly doubled.',
      'Farming subsidies ended in 1984; dairy then paid better.',
      'Canterbury’s lamb flock gave way to dairy cows.',
    ],
    howToRead:
      'Four lines track sheep, dairy cattle, beef cattle, and deer across the same paddocks.',
    sourceUrl: 'https://www.stats.govt.nz/news/canterbury-lamb-gives-way-to-dairy/',
    label: 'Dairy takeover',
    eyebrow: 'the dairy takeover',
    title: 'The paddocks flipped from wool to milk.',
    description:
      'The sheep flock nearly halved while dairy cattle nearly doubled. The same paddocks that once grew wool now grow milk. The beef herd and deer herd shrank too.',
    paragraphs: [
      'The flip started in 1984, when the government stopped subsidising farming. Sheep farming lost its safety net. Dairy paid better, so paddocks switched.',
      "Canterbury led the way. The region's lamb flock gave way to dairy cows, and the same story played out across the country.",
    ],
    accent: 'sky',
    dataSource: 'Stats NZ',
    chartType: 'Line chart',
    category: 'Agriculture & farming',
    dataNote:
      'Data: Stats NZ Aotearoa Data Explorer, table AGR_AGR_003 (Livestock Numbers by Regional Council), national totals for sheep, dairy cattle, beef cattle, and deer.',
    references: [
      {
        label: 'Canterbury lamb gives way to dairy (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/canterbury-lamb-gives-way-to-dairy/',
        kind: 'news',
      },
      {
        label: 'Dairy cattle numbers dip again (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/dairy-cattle-numbers-dip-again/',
        kind: 'data',
      },
      {
        label: 'Dairying and dairy products (Te Ara)',
        url: 'https://teara.govt.nz/en/dairying-and-dairy-products',
        kind: 'history',
      },
      {
        label: 'Government and agriculture (Te Ara)',
        url: 'https://teara.govt.nz/en/government-and-agriculture',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'vineyard-boom',
    keyFacts: [
      'Wine grapes grew from 71.6 km² (1994) to 376.3 km² (2024), a five-fold boom.',
      'Wine grapes now cover more land than apples, kiwifruit, and avocados combined.',
      'Sauvignon Blanc put New Zealand wine in the international spotlight in the 1980s.',
    ],
    howToRead: 'Each line tracks the planted area of one crop in square kilometres.',
    sourceUrl:
      'https://www.stats.govt.nz/news/livestock-numbers-fall-over-the-last-10-years-while-area-planted-in-fruit-increases/',
    label: 'Vineyard boom',
    eyebrow: 'the vineyard boom',
    title: 'Wine grapes took over the orchard.',
    description:
      'In 1994 wine grapes covered 71.6 km². By 2024 that was 376.3 km², a five-fold boom. Wine grapes now cover more land than apples, kiwifruit, and avocados combined.',
    paragraphs: [
      'Sauvignon Blanc, with its grassy smell, put New Zealand wine in the international spotlight in the 1980s. Wine exports have boomed since.',
      'For decades, tough licensing laws and a taste for fortified wine kept the industry small. Sauvignon Blanc changed that.',
    ],
    accent: 'purple',
    dataSource: 'Stats NZ',
    chartType: 'Line chart',
    category: 'Agriculture & farming',
    dataNote:
      'Data: Stats NZ Aotearoa Data Explorer, table AGR_AGR_002 (Horticulture by Regional Council), national area in square kilometres for wine grapes, kiwifruit, apples, and avocados.',
    references: [
      {
        label: 'Volume of wine on the rise (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/volume-of-wine-on-the-rise/',
        kind: 'news',
      },
      {
        label: 'Livestock numbers fall while fruit area increases (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/livestock-numbers-fall-over-the-last-10-years-while-area-planted-in-fruit-increases/',
        kind: 'data',
      },
      {
        label: 'Wine (Te Ara)',
        url: 'https://teara.govt.nz/en/wine',
        kind: 'history',
      },
      {
        label: 'Farming in the economy (Te Ara)',
        url: 'https://teara.govt.nz/en/farming-in-the-economy',
        kind: 'culture',
      },
    ],
  },
  {
    slug: 'planting-bust',
    keyFacts: [
      'New planting fell from 336.7 km² (2002) to 82.9 km² (2018), down 75%.',
      'Harvested area kept climbing, to 621 km².',
      'Most trees are radiata pine, planted in vast forests since the 1920s.',
    ],
    howToRead: 'Two lines: new planting versus harvested area, both in square kilometres.',
    sourceUrl:
      'https://www.stats.govt.nz/news/more-land-on-maori-farms-used-for-forest-plantation/',
    label: 'Planting bust',
    eyebrow: 'the planting bust',
    title: 'We stopped planting trees, but kept chopping them down.',
    description:
      'New planting fell from 336.7 km² in 2002 to 82.9 by 2018, down 75%. The harvested area kept climbing to 621 km². The forest is being eaten faster than it is being grown.',
    paragraphs: [
      'The trees that feed the mills are radiata pine, planted in vast forests from the 1920s. The government sold most of its forests in 1990.',
      'Some forest land is now being converted back to farms. The One Billion Trees programme is trying to reverse the trend.',
    ],
    accent: 'emerald',
    dataSource: 'Stats NZ',
    chartType: 'Line chart',
    category: 'Agriculture & farming',
    dataNote:
      'Data: Stats NZ Aotearoa Data Explorer, table AGR_AGR_001 (Forestry by Regional Council), national new planting and exotic timber harvested area in square kilometres.',
    references: [
      {
        label: 'More land on Māori farms used for forest plantation (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/more-land-on-maori-farms-used-for-forest-plantation/',
        kind: 'data',
      },
      {
        label: 'One Billion Trees Programme (MPI)',
        url: 'https://www.mpi.govt.nz/forestry/funding-and-programmes/one-billion-trees-programme/',
        kind: 'news',
      },
      {
        label: 'Exotic forestry (Te Ara)',
        url: 'https://teara.govt.nz/en/exotic-forestry',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'kiwifruit-overtake',
    keyFacts: [
      'Kiwifruit grew from 121.7 to 145.1 km² while apples fell from 152.6 to 95.2 km² (1994–2024).',
      'Isabel Fraser brought kiwifruit seeds back from China in 1904.',
      'PSA hit green vines in 2010 and pushed growers into the gold variety.',
    ],
    howToRead: 'Two lines, kiwifruit and apples, show the orchard flip.',
    sourceUrl:
      'https://www.stats.govt.nz/news/livestock-numbers-fall-over-the-last-10-years-while-area-planted-in-fruit-increases/',
    label: 'Kiwifruit overtake',
    eyebrow: 'the kiwifruit overtake',
    title: 'Kiwifruit overtook the apple.',
    description:
      'In 1994 apples covered 152.6 km² and kiwifruit 121.7. By 2024 kiwifruit covered 145.1 km² while apples had fallen to 95.2. The orchard flipped.',
    paragraphs: [
      'Kiwifruit vines came to New Zealand in 1904, when Isabel Fraser brought seeds back from China. The first commercial orchards appeared in the 1930s, and the green-fleshed Hayward variety became the export standard.',
      'The apple orchard shrank as land moved to kiwifruit and other crops. The kiwifruit boom survived a bacterial disease, PSA, that hit green vines in 2010 and pushed growers into the gold variety.',
    ],
    accent: 'lime',
    dataSource: 'Stats NZ',
    chartType: 'Line chart',
    category: 'Agriculture & farming',
    dataNote:
      'Data: Stats NZ Aotearoa Data Explorer, table AGR_AGR_002 (Horticulture by Regional Council), national area in square kilometres for kiwifruit, apples, and avocados.',
    references: [
      {
        label: 'Kiwifruit (Te Ara)',
        url: 'https://teara.govt.nz/en/kiwifruit',
        kind: 'history',
      },
      {
        label: 'Livestock numbers fall while fruit area increases (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/livestock-numbers-fall-over-the-last-10-years-while-area-planted-in-fruit-increases/',
        kind: 'data',
      },
      {
        label: 'Horticulture (Te Ara)',
        url: 'https://teara.govt.nz/en/horticulture',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'deer-boom-bust',
    keyFacts: [
      'Farmed deer: 1.23 million (1994) to a peak of 1.76 million (2004), then 712,000 (2025).',
      'The herd has more than halved from its peak.',
      'Venison went to Europe and velvet to Asia.',
    ],
    howToRead: 'One line: the national farmed deer herd each year.',
    sourceUrl: 'https://teara.govt.nz/en/deer-farming',
    label: 'Deer boom and bust',
    eyebrow: 'the deer boom and bust',
    title: 'The deer herd boomed, then bust.',
    description:
      'Farmed deer went from 1.23 million in 1994 to a peak of 1.76 million in 2004, then fell to 712,000 by 2025. The herd has more than halved from its peak.',
    paragraphs: [
      'Deer farming began in the 1970s, when farmers rounded up wild deer for velvet and venison. The industry grew fast through the 1990s as venison exports to Europe and velvet exports to Asia took off.',
      'The bust came as returns fell and paddocks switched to dairy. The deer herd has now shrunk for two decades straight.',
    ],
    accent: 'violet',
    dataSource: 'Stats NZ',
    chartType: 'Line chart',
    category: 'Agriculture & farming',
    dataNote:
      'Data: Stats NZ Aotearoa Data Explorer, table AGR_AGR_003 (Livestock Numbers by Regional Council), national farmed deer total.',
    references: [
      {
        label: 'Deer farming (Te Ara)',
        url: 'https://teara.govt.nz/en/deer-farming',
        kind: 'history',
      },
      {
        label: 'Sheep number falls to six for each person (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/sheep-number-falls-to-six-for-each-person/',
        kind: 'data',
      },
      {
        label: 'Farming in the economy (Te Ara)',
        url: 'https://teara.govt.nz/en/farming-in-the-economy',
        kind: 'culture',
      },
    ],
  },
  {
    slug: 'shake-index',
    keyFacts: [
      'GeoNet locates about 20,000 earthquakes a year.',
      'Around 250 a year are big enough to be felt.',
      'The 1855 Wairarapa earthquake, magnitude 8.2, shifted about 5,000 km² of land.',
    ],
    howToRead:
      'Each bubble is one recent felt quake; colour shows how strongly it was felt, and the sliders set magnitude and depth.',
    sourceUrl: 'https://www.geonet.org.nz/earthquake/faq',
    label: 'Shake index',
    eyebrow: 'the shake index',
    title: 'New Zealand shakes 20,000 times a year.',
    description:
      'GeoNet locates around 20,000 earthquakes in and around New Zealand each year. Most are too small to feel. The recent felt quakes come from the GeoNet API, fetched at deploy time.',
    paragraphs: [
      'Around 250 quakes a year are big enough to be felt. The biggest known quake in New Zealand was the 1855 Wairarapa earthquake, magnitude 8.2, which shifted around 5,000 square kilometres of land.',
      'Each bubble on the map is one recent quake. Drag the sliders to set the smallest magnitude and the deepest quake you want to see. Colour shows how strongly the quake was felt.',
    ],
    accent: 'rose',
    dataSource: 'GeoNet',
    chartType: 'Map',
    category: 'Earthquakes & geology',
    dataNote:
      'Data: GeoNet API (api.geonet.org.nz/quake?MMI=3), recent felt quakes, fetched at deploy time via @kiwilab/nz-sources, falling back to a committed snapshot when the API blocks the build runner. The site redeploys daily.',
    references: [
      {
        label: 'Earthquake FAQ (GeoNet)',
        url: 'https://www.geonet.org.nz/earthquake/faq',
        kind: 'data',
      },
      {
        label: 'Quakes (GeoNet)',
        url: 'https://www.geonet.org.nz/earthquake',
        kind: 'data',
      },
      {
        label: 'Earthquakes (Te Ara)',
        url: 'https://teara.govt.nz/en/earthquakes',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'species-register',
    keyFacts: [
      'The register holds 170,151 scientific names.',
      'One national list for every known species, from kiwi to kauri.',
      'Searched live from your browser.',
    ],
    howToRead: 'Type a name and the register returns the matches, grouped by class.',
    sourceUrl: 'https://www.nzor.org.nz/',
    label: 'Species register',
    eyebrow: 'the species register',
    title: "New Zealand's species register holds 170,151 names.",
    description:
      'The NZ Organisms Register is the national list of scientific names for every known species in New Zealand. Search it live: the register answers from the browser.',
    paragraphs: [
      'Every species has a scientific name, and New Zealand keeps them all in one register. The register holds 170,151 names, from kiwi to kauri.',
      'Type a name and the register returns the matches, grouped by class. The donut shows which groups they belong to.',
    ],
    accent: 'teal',
    dataSource: 'NZ Organisms Register (NZOR)',
    chartType: 'Search & table',
    category: 'Biodiversity & nature',
    dataNote:
      'Data: NZ Organisms Register (data.nzor.org.nz), searched live from the browser. The register holds 170,151 names.',
    references: [
      {
        label: 'NZ Organisms Register (NZOR)',
        url: 'https://www.nzor.org.nz/',
        kind: 'data',
      },
      {
        label: 'Native animals (DOC)',
        url: 'https://www.doc.govt.nz/nature/native-animals/',
        kind: 'data',
      },
      {
        label: 'Native plants and animals (Te Ara)',
        url: 'https://teara.govt.nz/en/native-plants-and-animals',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'open-data-catalogue',
    keyFacts: [
      'The catalogue holds 31,915 datasets.',
      'Agencies publish water quality, weather, and health data.',
      'Searched live from your browser.',
    ],
    howToRead: 'Type a topic and the catalogue returns matching datasets, grouped by agency.',
    sourceUrl: 'https://catalogue.data.govt.nz/',
    label: 'Open data catalogue',
    eyebrow: 'the open data catalogue',
    title: "The government's open data catalogue holds 31,915 datasets.",
    description:
      'data.govt.nz is the national catalogue of open government data. Search it live: the catalogue answers from the browser.',
    paragraphs: [
      'Agencies publish thousands of datasets, from water quality to weather to health. The catalogue holds 31,915 of them.',
      'Type a topic and the catalogue returns matching datasets. The treemap shows which agencies publish them.',
    ],
    accent: 'indigo',
    dataSource: 'data.govt.nz',
    chartType: 'Search & table',
    category: 'Open data & digital',
    dataNote:
      'Data: data.govt.nz CKAN API (catalogue.data.govt.nz), searched live from the browser. The catalogue holds 31,915 datasets.',
    references: [
      {
        label: 'data.govt.nz',
        url: 'https://data.govt.nz/',
        kind: 'data',
      },
      {
        label: 'data.govt.nz catalogue',
        url: 'https://catalogue.data.govt.nz/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'digitised-memory',
    keyFacts: [
      '‘Gold’ matches 1,977,021 records.',
      'The 1890s hold 427,164 of them.',
      'Papers Past alone holds millions of pages of old newspapers.',
    ],
    howToRead: 'Bars show matching records per decade; drag the sliders to narrow the range.',
    sourceUrl: 'https://www.digitalnz.org/',
    label: 'Digitised memory',
    eyebrow: 'the digitised memory',
    title: "Search 'gold' and the 1890s light up.",
    description:
      "DigitalNZ is the search engine for New Zealand's digitised collections. It searches records from libraries, museums, and archives. The bars show which decades the matches fall into.",
    paragraphs: [
      'The collection is built from newspapers, photos, audio, and maps. Papers Past alone holds millions of pages of old newspapers, which is why the 1860s to 1920s dominate so many searches.',
      "Search 'gold' and the histogram peaks in the 1890s, with 427,164 matching records. The 1860s, 1870s, and 1880s each hold more than 100,000 matching records too.",
    ],
    accent: 'cyan',
    dataSource: 'DigitalNZ (National Library)',
    chartType: 'Search & table',
    category: 'Open data & digital',
    dataNote:
      "Data: DigitalNZ (National Library) v3 API, searched live from the browser. 'gold' matches 1,977,021 records; the 1890s hold 427,164 of them. Drag the sliders to narrow the decades.",
    references: [
      {
        label: 'DigitalNZ',
        url: 'https://www.digitalnz.org/',
        kind: 'data',
      },
      {
        label: 'National Library of New Zealand',
        url: 'https://natlib.govt.nz/',
        kind: 'data',
      },
      {
        label: 'Papers Past',
        url: 'https://paperspast.natlib.govt.nz/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'online-garage-sale',
    keyFacts: [
      'The Trade Me category tree has 5,589 leaf categories.',
      'Home & living is the biggest branch with 581 leaves; Motors has 560 and Sports 535.',
      'The tree is fetched live from the Trade Me API.',
    ],
    howToRead:
      'The radial chart shows top-level branches by leaf count; click a branch to expand it.',
    sourceUrl: 'https://www.trademe.co.nz/',
    label: 'Online garage sale',
    eyebrow: 'the online garage sale',
    title: "Trade Me's category tree has 5,589 leaf categories.",
    description:
      "Trade Me is New Zealand's online marketplace. Its category tree organises every listing, from cars to collectables. The tree is fetched live from the Trade Me API.",
    paragraphs: [
      'Home & living is the biggest branch with 581 leaf categories. Motors is close behind with 560, and Sports has 535.',
      'Type to filter the tree, or click a branch to expand it. The radial chart shows the top-level branches by leaf count.',
    ],
    accent: 'fuchsia',
    dataSource: 'Trade Me',
    chartType: 'Tree',
    category: 'Open data & digital',
    dataNote:
      'Data: Trade Me public category tree (api.trademe.co.nz/v1/Categories.json), fetched live from the browser. The tree holds 5,589 leaf categories.',
    references: [
      {
        label: 'Trade Me',
        url: 'https://www.trademe.co.nz/',
        kind: 'data',
      },
      {
        label: 'About Trade Me',
        url: 'https://www.trademe.co.nz/about',
        kind: 'history',
      },
      {
        label: 'Trade Me Motors',
        url: 'https://www.trademe.co.nz/motors',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'backyard-species-census',
    keyFacts: [
      '4,342,223 observations of 23,828 species.',
      'Plants lead with 9,840 species and 2,025,138 observations.',
      'Birds drew the most observations per species: 544,818 across 657 species.',
    ],
    howToRead:
      'Bars show live counts by group; bubble size shows how many observers logged each group.',
    sourceUrl: 'https://api.inaturalist.org/v1/places/6803',
    label: 'Backyard species census',
    eyebrow: 'the backyard census',
    title: 'New Zealanders have logged 4.3 million observations of 23,828 species.',
    description:
      'iNaturalist is a citizen science network. In New Zealand, people have logged 4,342,223 observations of 23,828 species, from kākā to kauri. The bars show the live counts by group.',
    paragraphs: [
      'Plants lead the census with 9,840 species and 2,025,138 observations. Insects are second with 5,605 species and 800,635 observations.',
      'Birds punch above their weight: 657 species drew 544,818 observations, the most per species of any group.',
    ],
    accent: 'emerald',
    dataSource: 'iNaturalist',
    chartType: 'Bar chart',
    category: 'Biodiversity & nature',
    dataNote:
      'Data: iNaturalist API, New Zealand place (id 6803), fetched live from the browser. Bubble size shows how many observers logged each group.',
    references: [
      {
        label: 'iNaturalist API docs',
        url: 'https://api.inaturalist.org/v1/docs/',
        kind: 'data',
      },
      {
        label: 'iNaturalist New Zealand place',
        url: 'https://api.inaturalist.org/v1/places/6803',
        kind: 'data',
      },
      {
        label: 'Native animals (DOC)',
        url: 'https://www.doc.govt.nz/nature/native-animals/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'species-record-ledger',
    keyFacts: [
      'New Zealand contributed 748,744 records in 2014 and 1,920,171 in 2024.',
      'Fungi fell from 61% of records to 5%, while animals rose to 78%.',
      'Animal records grew 7.2-fold as collections were digitised.',
    ],
    howToRead: 'Bars compare records by kingdom between 2014 and 2024.',
    sourceUrl: 'https://techdocs.gbif.org/en/openapi/v1/occurrence',
    label: 'Species record ledger',
    eyebrow: 'the species record ledger',
    title: 'The record ledger flipped from fungi to animals.',
    description:
      'GBIF is the global species record database. New Zealand contributed 748,744 records in 2014 and 1,920,171 in 2024. The mix flipped: fungi fell from 61% of records to 5%, while animals rose to 78%.',
    paragraphs: [
      'Fungi dominated the 2014 ledger with 458,989 records, 61% of the total. By 2024 that had fallen to 98,269 records, 5%.',
      'Animal records grew from 208,004 to 1,496,447, a 7.2-fold rise, as museums and citizen science projects digitised their collections.',
    ],
    accent: 'indigo',
    dataSource: 'GBIF',
    chartType: 'Bar chart',
    category: 'Biodiversity & nature',
    dataNote:
      'Data: GBIF occurrence search API, country NZ, records by kingdom for 2014 and 2024, fetched live from the browser.',
    references: [
      {
        label: 'GBIF occurrence API',
        url: 'https://techdocs.gbif.org/en/openapi/v1/occurrence',
        kind: 'data',
      },
      {
        label: 'GBIF New Zealand occurrence search',
        url: 'https://api.gbif.org/v1/occurrence/search?country=NZ',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'what-the-world-reads',
    keyFacts: [
      'The English Wikipedia page for New Zealand gets up to 21,562 views a day.',
      'The Lord of the Rings (film series) is second, with up to 10,438 daily views.',
      'Jacinda Ardern peaked at 8,429.',
    ],
    howToRead:
      'Each line spans the lowest to highest daily views in the window; the dot marks the latest day.',
    sourceUrl: 'https://en.wikipedia.org/wiki/New_Zealand',
    label: 'What the world reads',
    eyebrow: 'what the world reads',
    title: 'The world reads about New Zealand up to 21,562 times a day.',
    description:
      'The English Wikipedia page for New Zealand gets up to 21,562 views in a day. The bars show the daily view ranges for 12 New Zealand topics, fetched live from Wikipedia.',
    paragraphs: [
      'The Lord of the Rings (film series) is the second most-read topic, with up to 10,438 daily views. Jacinda Ardern peaked at 8,429.',
      'Drag the slider to widen or narrow the window. The dot marks the latest day.',
    ],
    accent: 'sky',
    dataSource: 'Wikipedia & Wikidata',
    chartType: 'Bar chart',
    category: 'Open data & digital',
    dataNote:
      'Data: English Wikipedia pageviews API, last 60 days, fetched live from the browser. Each line spans the lowest to highest daily views in the window.',
    references: [
      {
        label: 'New Zealand (Wikipedia)',
        url: 'https://en.wikipedia.org/wiki/New_Zealand',
        kind: 'data',
      },
      {
        label: 'Wikipedia pageviews',
        url: 'https://en.wikipedia.org/wiki/Wikipedia:Pageviews',
        kind: 'data',
      },
    ],
  },

  {
    slug: 'river-lengths',
    keyFacts: [
      'The Waikato is the longest river at 425 km.',
      'The Clutha is second at 338 km and the Whanganui third at 290 km.',
      'The ten longest rivers stretch 2,603 km end to end.',
    ],
    howToRead:
      'The waterfall chart adds each river to the running total; toggle the top-N buttons to widen the list.',
    sourceUrl:
      'https://query.wikidata.org/sparql?query=SELECT%20%3Friver%20%3FriverLabel%20%3Flength%20WHERE%20%7B%20%3Friver%20wdt%3AP31%20wd%3AQ4022%3B%20wdt%3AP17%20wd%3AQ664%3B%20wdt%3AP2043%20%3Flength.%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%20%7D%20ORDER%20BY%20DESC(%3Flength)%20LIMIT%2020',
    label: 'River lengths',
    eyebrow: 'the river lengths',
    title: "The Waikato is New Zealand's longest river at 425 km.",
    description:
      'Wikidata lists the length of every named New Zealand river. The Waikato tops the list at 425 km, and the ten longest rivers stretch 2,603 km end to end.',
    paragraphs: [
      'The Clutha is second at 338 km, and the Whanganui third at 290 km. Six of the top ten rivers are in the South Island.',
      'The waterfall chart adds each river to the running total. Toggle the top-N buttons to widen or narrow the list.',
    ],
    accent: 'cyan',
    dataSource: 'Wikipedia & Wikidata',
    chartType: 'Bar chart',
    category: 'Environment & geography',
    dataNote:
      'Data: Wikidata SPARQL query for New Zealand rivers (P31 river, P17 New Zealand, P2043 length), fetched live from the browser. Values outside 50-500 km are dropped as bad entries. The top-10 total is 2,603 km.',
    references: [
      {
        label: 'Wikidata river length query',
        url: 'https://query.wikidata.org/sparql?query=SELECT%20%3Friver%20%3FriverLabel%20%3Flength%20WHERE%20%7B%20%3Friver%20wdt%3AP31%20wd%3AQ4022%3B%20wdt%3AP17%20wd%3AQ664%3B%20wdt%3AP2043%20%3Flength.%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%20%7D%20ORDER%20BY%20DESC(%3Flength)%20LIMIT%2020',
        kind: 'data',
      },
      {
        label: 'Freshwater and estuaries (NIWA)',
        url: 'https://niwa.co.nz/freshwater-and-estuaries',
        kind: 'data',
      },
      {
        label: 'Rivers (Te Ara)',
        url: 'https://teara.govt.nz/en/rivers',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'peak-heights',
    keyFacts: [
      'Aoraki / Mount Cook is the highest peak at 3,724 m.',
      'Mount Tasman is second at 3,497 m and Mount Dampier third at 3,440 m.',
      'Six peaks rise above 3,200 m.',
    ],
    howToRead:
      'The funnel narrows from the highest peak down; the top-N buttons widen or narrow the list.',
    sourceUrl:
      'https://query.wikidata.org/sparql?query=SELECT%20%3Fpeak%20%3FpeakLabel%20%3Felevation%20WHERE%20%7B%20%3Fpeak%20wdt%3AP31%20wd%3AQ8502%3B%20wdt%3AP17%20wd%3AQ664%3B%20wdt%3AP2044%20%3Felevation.%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%20%7D%20ORDER%20BY%20DESC(%3Felevation)%20LIMIT%2020',
    label: 'Peak heights',
    eyebrow: 'the peak heights',
    title: "Aoraki is New Zealand's highest peak at 3,724 m.",
    description:
      "Wikidata lists the elevation of New Zealand's named peaks. Aoraki / Mount Cook tops the list at 3,724 m, and the ten highest peaks are all in the Southern Alps.",
    paragraphs: [
      'Mount Tasman is second at 3,497 m, and Mount Dampier third at 3,440 m. Six peaks rise above 3,200 m.',
      'The funnel narrows from the highest peak down. Toggle the top-N buttons to widen or narrow the list.',
    ],
    accent: 'violet',
    dataSource: 'Wikipedia & Wikidata',
    chartType: 'Bar chart',
    category: 'Environment & geography',
    dataNote:
      'Data: Wikidata SPARQL query for New Zealand peaks (P31 mountain, P17 New Zealand, P2044 elevation), fetched live from the browser. Values outside 1,000-4,000 m are dropped as bad entries. The top-10 total is 33,278 m.',
    references: [
      {
        label: 'Wikidata peak elevation query',
        url: 'https://query.wikidata.org/sparql?query=SELECT%20%3Fpeak%20%3FpeakLabel%20%3Felevation%20WHERE%20%7B%20%3Fpeak%20wdt%3AP31%20wd%3AQ8502%3B%20wdt%3AP17%20wd%3AQ664%3B%20wdt%3AP2044%20%3Felevation.%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%20%7D%20ORDER%20BY%20DESC(%3Felevation)%20LIMIT%2020',
        kind: 'data',
      },
      {
        label: 'Places to go (DOC)',
        url: 'https://www.doc.govt.nz/parks-and-recreation/places-to-go/',
        kind: 'data',
      },
      {
        label: 'Mountains (Te Ara)',
        url: 'https://teara.govt.nz/en/mountains',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'auckland-parks',
    keyFacts: [
      '3,953 parks covering 536.8 square kilometres.',
      'Franklin holds 200.6 km² and Waitākere Ranges 183.4 km², together 72% of the total.',
      'Park land is the maintained extent, not the legal reserve boundary.',
    ],
    howToRead:
      'The pie shows each local board’s share; toggle the top-N buttons or type to filter boards.',
    sourceUrl:
      'https://data-aucklandcouncil.opendata.arcgis.com/datasets/3135043373ba48b7a9b5240370cb53ac',
    label: 'Auckland parks',
    eyebrow: 'the auckland parks',
    title: 'Auckland has 3,953 parks covering 536.8 square kilometres.',
    description:
      'Auckland Council maps every park it owns or maintains. The 3,953 parks cover 536.8 square kilometres, and two local boards hold most of the land.',
    paragraphs: [
      'Franklin holds 200.6 square kilometres of park land and Waitākere Ranges 183.4. Together they cover 72% of the total.',
      "The pie shows each local board's share. Toggle the top-N buttons to widen the view, or type to filter boards by name.",
    ],
    accent: 'emerald',
    dataSource: 'Auckland Council',
    chartType: 'Bar chart',
    category: 'Environment & geography',
    dataNote:
      'Data: Auckland Council Park Extents dataset (ArcGIS REST service), grouped by local board, fetched live from the browser. Park land is the maintained extent, not the legal reserve boundary.',
    references: [
      {
        label: 'Park Extents dataset (Auckland Council)',
        url: 'https://data-aucklandcouncil.opendata.arcgis.com/datasets/3135043373ba48b7a9b5240370cb53ac',
        kind: 'data',
      },
      {
        label: 'Auckland Council open data',
        url: 'https://data-aucklandcouncil.opendata.arcgis.com/',
        kind: 'data',
      },
      {
        label: 'Population (Stats NZ)',
        url: 'https://www.stats.govt.nz/topics/population/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'open-school-map',
    keyFacts: [
      '2,604 schools mapped on OpenStreetMap.',
      'Primary schools lead with 1,713; secondary schools number 323.',
      '2,309 carry Ministry of Education year tags (MOE:years).',
    ],
    howToRead: 'Type a name to filter the map, or toggle an authority to hide it.',
    sourceUrl: 'https://www.openstreetmap.org/',
    label: 'Open school map',
    eyebrow: 'the open school map',
    title: 'New Zealand has 2,604 schools mapped on OpenStreetMap.',
    description:
      'OpenStreetMap maps 2,604 schools in New Zealand, from kura to universities. Most carry Ministry of Education tags, so the map reads like a school directory.',
    paragraphs: [
      'Primary schools lead with 1,713. Secondary schools number 323, and 131 composite schools span both primary and secondary years.',
      'State schools dominate with 2,075. Another 324 are state-integrated and 96 are private. Type a name to filter the map, or toggle an authority to hide it.',
    ],
    accent: 'amber',
    dataSource: 'OpenStreetMap',
    chartType: 'Bar chart',
    category: 'Education',
    dataNote:
      'Data: OpenStreetMap via the Overpass API, amenity=school in New Zealand, fetched at build time and falling back to a committed snapshot. 2,309 of the 2,604 schools carry Ministry of Education year tags (MOE:years).',
    references: [
      {
        label: 'OpenStreetMap',
        url: 'https://www.openstreetmap.org/',
        kind: 'data',
      },
      {
        label: 'Overpass API',
        url: 'https://overpass-api.de/',
        kind: 'data',
      },
      {
        label: 'School tag (OpenStreetMap wiki)',
        url: 'https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dschool',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'canterbury-rain',
    keyFacts: [
      'Environment Canterbury runs 109 rain gauges.',
      'The wettest gauge, Mount Byrne, recorded 40.5 mm in the last day.',
      'Rain came two and three days ago, when the median gauge caught 1.6 mm and 2.5 mm.',
    ],
    howToRead:
      'The box plot shows the spread across gauges for each day: the box is the middle half, the line the median.',
    sourceUrl: 'https://www.ecan.govt.nz/data/rainfall-data/',
    label: 'Canterbury rain',
    eyebrow: 'the canterbury rain',
    title: "Canterbury's rain gauges caught up to 40.5 mm in a day.",
    description:
      'Environment Canterbury runs 109 rain gauges across the region. The wettest gauge, Mount Byrne, recorded 40.5 mm in the last day and 86 mm in total.',
    paragraphs: [
      'The box plot shows the spread across all gauges for each of the last eight days. The box holds the middle half of gauges, the line is the median, and the whiskers reach the wettest and driest.',
      'Most of the region stayed dry today. The rain came two and three days ago, when the median gauge caught 1.6 mm and 2.5 mm.',
    ],
    accent: 'sky',
    dataSource: 'Environment Canterbury',
    chartType: 'Bar chart',
    category: 'Environment & geography',
    dataNote:
      'Data: Environment Canterbury open data (Canterbury - Rain last hour), fetched live from the browser. Values are millimetres of rain in the last day.',
    references: [
      {
        label: 'Environment Canterbury open data',
        url: 'https://opendata.canterburymaps.govt.nz/',
        kind: 'data',
      },
      {
        label: 'Rainfall data (Environment Canterbury)',
        url: 'https://www.ecan.govt.nz/data/rainfall-data/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'hamilton-playgrounds',
    keyFacts: [
      'Hamilton has 85 playgrounds.',
      'The 2000s were the busiest decade, with 35 playgrounds built.',
      'Destination playgrounds only appeared in the 2000s.',
    ],
    howToRead: 'The heatmap shows playground type by installation decade.',
    sourceUrl: 'https://data-hcc.opendata.arcgis.com/datasets/f518a92384b1438eb848f839ca4262bd',
    label: 'Hamilton playgrounds',
    eyebrow: 'the hamilton playgrounds',
    title: 'Hamilton has 85 playgrounds.',
    description:
      'Hamilton City Council maps every playground it owns. The 85 playgrounds range from basic neighbourhood swings to destination playgrounds.',
    paragraphs: [
      'Most are neighbourhood playgrounds: 33 old, 23 basic, and 21 recent. The 2000s were the busiest decade, with 35 playgrounds built.',
      'Destination playgrounds only appeared in the 2000s. Toggle a type to hide it, and the heatmap recalculates.',
    ],
    accent: 'emerald',
    dataSource: 'Hamilton City Council',
    chartType: 'Heatmap',
    category: 'Society & community',
    dataNote:
      'Data: Hamilton City Council open data (Playgrounds), fetched live from the browser. The heatmap shows playground type by installation decade.',
    references: [
      {
        label: 'Playgrounds dataset (Hamilton City Council)',
        url: 'https://data-hcc.opendata.arcgis.com/datasets/f518a92384b1438eb848f839ca4262bd',
        kind: 'data',
      },
      {
        label: 'Hamilton City Council open data',
        url: 'https://data-hcc.opendata.arcgis.com/',
        kind: 'data',
      },
      {
        label: 'Hamilton City Council',
        url: 'https://www.hamilton.govt.nz/',
        kind: 'history',
      },
    ],
  },

  {
    slug: 'census-rank-shift',
    keyFacts: [
      'Selwyn jumped 10 places to 13th-biggest; Queenstown-Lakes jumped 9 to 27th.',
      'Selwyn grew from 44,595 to 78,144 residents, up 75%.',
      'Invercargill fell 6 places and Wellington held 3rd.',
    ],
    howToRead:
      'The slope lines trace each territory’s rank across the 2013, 2018, and 2023 censuses.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
    label: 'Census rank shift',
    eyebrow: 'the census rank shift',
    title: 'Selwyn and Queenstown raced up the census ranks.',
    description:
      'Between the 2013 and 2023 censuses, Selwyn district jumped 10 places to become the 13th-biggest territorial authority. Queenstown-Lakes jumped 9 places to 27th.',
    paragraphs: [
      "Selwyn's usual residents grew from 44,595 in 2013 to 78,144 in 2023, up 75%. Queenstown-Lakes grew from 28,224 to 47,808, up 69%.",
      'At the other end, Invercargill fell 6 places to 23rd and Timaru fell 5 places to 29th. Wellington held 3rd place, but its count dipped from 202,737 in 2018 to 202,689 in 2023.',
    ],
    accent: 'amber',
    dataSource: 'Stats NZ',
    chartType: 'Rank / slope',
    category: 'Census & population',
    dataNote:
      'Data: Stats NZ, "2023 Census population counts (by ethnic group, age, and Maori descent) and dwelling counts", Table 2, census usually resident population count by territorial authority, 2013, 2018, and 2023 Censuses. Counts have fixed random rounding to base 3 applied, so they may not sum to stated totals. The series is final, so this snapshot does not go stale.',
    references: [
      {
        label: '2023 Census population counts (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
        kind: 'data',
      },
      {
        label: '2023 Census (Stats NZ)',
        url: 'https://www.stats.govt.nz/2023-census/',
        kind: 'data',
      },
      {
        label: '2023 New Zealand census (Wikipedia)',
        url: 'https://en.wikipedia.org/wiki/2023_New_Zealand_census',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'age-pyramid',
    keyFacts: [
      '5,122,600 people estimated on 1 July 2021.',
      'The biggest five-year band is 30-34, with 384,110 people.',
      'Women outnumber men in every band from age 30 up.',
    ],
    howToRead: 'The pyramid shows men on the left and women on the right, by five-year band.',
    sourceUrl: 'https://unstats.un.org/unsd/demographic-social/products/dyb/#statistics',
    label: 'Age pyramid',
    eyebrow: 'the age pyramid',
    title: 'Women outnumber men from age 30 up.',
    description:
      "New Zealand's population estimates for 1 July 2021 put 5,122,600 people in the country. The biggest five-year band is 30-34 with 384,110 people, and women outnumber men in every band from 30 up.",
    paragraphs: [
      'The gap widens with age. In the 85-89 band there are 32,880 women to 23,540 men, and at 90+ it is 22,570 women to 12,010 men.',
      'Below 30 the numbers flip. The 25-29 band has 190,640 men against 181,390 women.',
    ],
    accent: 'cyan',
    dataSource: 'United Nations',
    chartType: 'Pyramid',
    category: 'Census & population',
    dataNote:
      'Data: UN Statistics Division Demographic and Social Statistics, population estimates by sex and age group for 1 July 2021 (provisional, rounded), as tabulated in the Wikipedia "Demographics of New Zealand" article. Because of rounding, the bands may not sum to the stated total.',
    references: [
      {
        label: 'UNSD Demographic and Social Statistics',
        url: 'https://unstats.un.org/unsd/demographic-social/products/dyb/#statistics',
        kind: 'data',
      },
      {
        label: 'Demographics of New Zealand (Wikipedia)',
        url: 'https://en.wikipedia.org/wiki/Demographics_of_New_Zealand',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'quake-magnitudes',
    keyFacts: [
      '5,148 quakes located in the three months to 18 August 2026.',
      '2,436 were under magnitude 2; 2,159 measured 2 to 3.',
      'Just 10 reached magnitude 5 or more.',
    ],
    howToRead: 'The histogram and cumulative frequency chart show the same fall-off in counts.',
    sourceUrl: 'https://service.geonet.org.nz/fdsnws/event/1/',
    label: 'Quake magnitudes',
    eyebrow: 'the quake magnitudes',
    title: 'Small quakes drown out the big ones.',
    description:
      'Each step up the magnitude scale holds far fewer quakes: of the 5,148 GeoNet located in the three months to 18 August 2026, 2,436 were under magnitude 2 and just 10 reached 5 or more. A histogram and a cumulative frequency chart show the same fall-off.',
    paragraphs: [
      'From magnitude 2 up, each step holds roughly a quarter of the quakes of the step below: 2,159 quakes measured 2 to 3, 452 measured 3 to 4, and 91 measured 4 to 5.',
      'The biggest was a 6.3 on 16 July 2026, 45 km north of Te Anau. GeoNet also located a 6.2 north of Te Araroa and a 5.9 near Taumarunui in the same three months.',
    ],
    accent: 'rose',
    dataSource: 'GeoNet',
    chartType: 'Histogram',
    category: 'Earthquakes & geology',
    dataNote:
      'Data: GeoNet FDSN event service (service.geonet.org.nz), earthquakes of magnitude 1 or stronger in the three months to 18 August 2026, fetched at build time and falling back to a committed snapshot of that catalog. The site redeploys daily.',
    references: [
      {
        label: 'GeoNet FDSN event service',
        url: 'https://service.geonet.org.nz/fdsnws/event/1/',
        kind: 'data',
      },
      {
        label: 'GeoNet FDSN usage',
        url: 'https://www.geonet.org.nz/data/tools/FDSN',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'quake-months',
    keyFacts: [
      '4,150 quakes of magnitude 3+ in the two years to 19 August 2026.',
      'April was the busiest month with 436, August the quietest with 272.',
      'April is again the busiest month at magnitude 4+ (108).',
    ],
    howToRead: 'The rose shows quake counts per month; each petal is one month.',
    sourceUrl: 'https://service.geonet.org.nz/fdsnws/event/1/',
    label: 'Quake months',
    eyebrow: 'the quake months',
    title: 'Quakes of magnitude 3+ cluster in autumn.',
    description:
      'In the two years to 19 August 2026, GeoNet located 4,150 earthquakes of magnitude 3 or stronger. April was the busiest month with 436, August the quietest with 272.',
    paragraphs: [
      'The seasonal swing is real but modest: the busiest month runs about 60% higher than the quietest. In the full year 2025, April had 188 quakes of magnitude 3 or stronger and September just 131.',
      'The autumn tilt holds at magnitude 4 and stronger, where April is again the busiest month (108) and November the quietest (44). At magnitude 5 and stronger the pattern shifts: October was the busiest month with 16, while November stayed the quietest with 2.',
    ],
    accent: 'rose',
    dataSource: 'GeoNet',
    chartType: 'Rose / polar',
    category: 'Earthquakes & geology',
    dataNote:
      'Data: GeoNet FDSN event service (service.geonet.org.nz), earthquakes of magnitude 3 or stronger in the two years to 19 August 2026, fetched at build time and falling back to a committed snapshot of that catalog. The site redeploys daily.',
    references: [
      {
        label: 'GeoNet FDSN event service',
        url: 'https://service.geonet.org.nz/fdsnws/event/1/',
        kind: 'data',
      },
      {
        label: 'GeoNet FDSN usage',
        url: 'https://www.geonet.org.nz/data/tools/FDSN',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'quake-depth-scatter',
    keyFacts: [
      '3,408 of 5,148 quakes, 66%, broke shallower than 40 km.',
      'The deepest reached 600 km.',
      '55 of the 101 quakes of magnitude 4+ were shallower than 40 km.',
    ],
    howToRead:
      'Depth runs down the chart, so shallow quakes sit at the top; hover a dot for magnitude and depth.',
    sourceUrl: 'https://service.geonet.org.nz/fdsnws/event/1/',
    label: 'Quake depth scatter',
    eyebrow: 'the quake depth scatter',
    title: 'Shallow quakes are the ones people feel.',
    description:
      'Most quakes rupture shallow: 3,408 of the 5,148 GeoNet located in the three months to 18 August 2026, 66%, broke shallower than 40 km, and the deepest reached 600 km. A scatter and a depth-band chart show where the shaking happens.',
    paragraphs: [
      'Shallow quakes release their energy close to the surface, which is why they are the ones people feel. Of the 101 quakes of magnitude 4 or stronger in the same three months, 55 were shallower than 40 km.',
      'Each dot is one quake. Depth runs down the chart, so the shallow quakes sit at the top. Use the day buttons to narrow the window, and hover a dot to read its magnitude and depth.',
    ],
    accent: 'rose',
    dataSource: 'GeoNet',
    chartType: 'Scatter',
    category: 'Earthquakes & geology',
    dataNote:
      'Data: GeoNet FDSN event service (service.geonet.org.nz), earthquakes of magnitude 1 or stronger in the three months to 18 August 2026, fetched at build time and falling back to a committed snapshot of that catalog. The site redeploys daily.',
    references: [
      {
        label: 'GeoNet FDSN event service',
        url: 'https://service.geonet.org.nz/fdsnws/event/1/',
        kind: 'data',
      },
      {
        label: 'GeoNet FDSN usage',
        url: 'https://www.geonet.org.nz/data/tools/FDSN',
        kind: 'data',
      },
      {
        label: 'Earthquake FAQ (GeoNet)',
        url: 'https://www.geonet.org.nz/earthquake/faq',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'ev-charging',
    keyFacts: [
      '639 public electric vehicle (EV) charging stations.',
      'ChargeNet runs 307, Meridian 104, and Z Energy 63.',
      '566 stations offer DC charging.',
    ],
    howToRead: 'The bars group stations by operator; toggle the view to see current types.',
    sourceUrl: 'https://www.nzta.govt.nz/vehicles/electric-vehicles/ev-roam/',
    label: 'EV charging',
    eyebrow: 'the ev charging map',
    title: 'New Zealand has 639 public electric vehicle (EV) charging stations.',
    description:
      'The NZTA EV Roam register lists every public electric vehicle (EV) charging station in New Zealand. ChargeNet runs 307 of them, more than any other operator.',
    paragraphs: [
      'The register counts 639 stations, from fast DC chargers on the main highways to slow AC chargers in town centres. 566 stations offer DC charging.',
      'ChargeNet runs 307 stations, Meridian 104, and Z Energy 63. Toggle the view to see the stations by current type, or type to filter operators by name.',
    ],
    accent: 'emerald',
    dataSource: 'NZ Transport Agency (NZTA)',
    chartType: 'Bar chart',
    category: 'Transport',
    dataNote:
      'Data: NZTA EV Roam charging stations (ArcGIS REST service), grouped by operator and current type, fetched live from the browser. The register holds 639 stations.',
    references: [
      {
        label: 'EV Roam charging stations (NZTA)',
        url: 'https://opendata-nzta.opendata.arcgis.com/datasets/NZTA::ev-roam-charging-stations',
        kind: 'data',
      },
      {
        label: 'EV Roam (NZTA)',
        url: 'https://www.nzta.govt.nz/vehicles/electric-vehicles/ev-roam/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'road-crash-trend',
    keyFacts: [
      'Crashes fell from 39,778 (2006) to 29,017 (2025), down 27%.',
      'Auckland leads every year with 235,352 crashes, more than the next three regions combined.',
      'Fatal crashes fell from 350 to 259.',
    ],
    howToRead:
      'The heatmap shows crashes by region and year; toggle all vs fatal, or drag the slider.',
    sourceUrl:
      'https://opendata-nzta.opendata.arcgis.com/datasets/NZTA::crash-analysis-system-cas-data-1',
    label: 'Road crash trend',
    eyebrow: 'the road crash trend',
    title: 'Road crashes fell 27% from 2006 to 2025.',
    description:
      'The NZTA Crash Analysis System records every reported crash on New Zealand roads. Crashes fell from 39,778 in 2006 to 29,017 in 2025, down 27%.',
    paragraphs: [
      'The heatmap shows crashes by region and year. Auckland leads every year, with 235,352 crashes across the series, more than the next three regions combined.',
      'Fatal crashes tell a similar story: 350 in 2006, 259 in 2025. Toggle between all crashes and fatal crashes, or drag the slider to narrow the year window.',
    ],
    accent: 'rose',
    dataSource: 'NZ Transport Agency (NZTA)',
    chartType: 'Heatmap',
    category: 'Transport',
    dataNote:
      'Data: NZTA Crash Analysis System (CAS) public dataset (ArcGIS REST service), crashes by region and year, fetched live from the browser. The series covers 2006 to 2026 and holds 705,609 crashes.',
    references: [
      {
        label: 'Crash Analysis System data (NZTA)',
        url: 'https://opendata-nzta.opendata.arcgis.com/datasets/NZTA::crash-analysis-system-cas-data-1',
        kind: 'data',
      },
      {
        label: 'Road safety data (NZTA)',
        url: 'https://www.nzta.govt.nz/safety/data/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'vehicle-fleet',
    keyFacts: [
      'The fleet holds 5.9 million vehicles; 107,525 are electric.',
      'Petrol still dominates at 3.18 million, and diesel adds 1.23 million.',
      '882,333 vehicles have no motive power recorded; most are trailers or caravans.',
    ],
    howToRead: 'The sunburst shows the fleet by fuel or by vehicle type.',
    sourceUrl: 'https://opendata-nzta.opendata.arcgis.com/datasets/NZTA::motor-vehicle-register',
    label: 'Vehicle fleet',
    eyebrow: 'the vehicle fleet',
    title: "New Zealand's fleet has 107,525 electric vehicles.",
    description:
      'The NZTA Motor Vehicle Register lists every vehicle in New Zealand. The fleet holds 5.9 million vehicles, and 107,525 of them are electric.',
    paragraphs: [
      'Petrol still dominates with 3.18 million vehicles, and diesel adds 1.23 million. Hybrids are the fast-growing middle: 420,013 petrol hybrids and 50,321 plug-in hybrids.',
      'The sunburst shows the fleet by fuel or by vehicle type. Passenger cars and vans make up 3.69 million of the 5.9 million vehicles.',
    ],
    accent: 'sky',
    dataSource: 'NZ Transport Agency (NZTA)',
    chartType: 'Sunburst',
    category: 'Transport',
    dataNote:
      'Data: NZTA Motor Vehicle Register (ArcGIS REST service), grouped by motive power and vehicle type, fetched live from the browser. 882,333 vehicles have no motive power recorded; 881,263 of them are trailers or caravans, grouped as Unknown.',
    references: [
      {
        label: 'Motor Vehicle Register (NZTA)',
        url: 'https://opendata-nzta.opendata.arcgis.com/datasets/NZTA::motor-vehicle-register',
        kind: 'data',
      },
      {
        label: 'New Zealand Motor Vehicle Register statistics (NZTA)',
        url: 'https://www.nzta.govt.nz/resources/new-zealand-motor-vehicle-register-statistics/',
        kind: 'data',
      },
    ],
  },

  {
    slug: 'rabbit-boom',
    keyFacts: [
      'Spotlight counts rose from 2.35 to 13.26 rabbits per kilometre between 2012 and 2021.',
      'A fivefold boom in a decade.',
      'Counts are an abundance index, not a total population.',
    ],
    howToRead:
      'The line tracks pooled rabbits per kilometre across the monitored farm sites each year.',
    sourceUrl: 'https://catalogue.data.govt.nz/dataset/hawkesbayrabbits',
    label: 'Rabbit boom',
    eyebrow: 'the rabbit boom',
    title: "The bunnies are winning in Hawke's Bay.",
    description:
      "Night spotlight counts of rabbits in Hawke's Bay rose from 2.35 to 13.26 rabbits per kilometre between 2012 and 2021, a fivefold boom in a decade. The counts are an index of abundance, not a total population.",
    paragraphs: [
      "Landcare Research has driven the same night transects across Hawke's Bay farm sites since 2012, counting rabbits seen per kilometre. The pooled rate across all monitored sites rose almost every year.",
      'Counts wobble with control operations and rabbit disease, but the decade trend is unambiguous: from 2.35 rabbits per kilometre in 2012 to a peak of 13.26 in 2021. The dataset backs a 2024 Wildlife Research study on whether rabbit abundance rises after predator control.',
    ],
    accent: 'emerald',
    dataSource: 'Landcare Research',
    chartType: 'Line chart',
    category: 'Agriculture & farming',
    dataNote:
      'Data: Manaaki Whenua Landcare Research HawkesBayRabbits dataset (data.govt.nz, CC-BY-4.0), spotlight counts by farm site and year, pooled into rabbits per kilometre, fetched at deploy time with a committed snapshot fallback.',
    references: [
      {
        label: 'HawkesBayRabbits spotlight counts (data.govt.nz)',
        url: 'https://catalogue.data.govt.nz/dataset/hawkesbayrabbits',
        kind: 'data',
      },
      {
        label: 'Rabbit abundance after predator control (Wildlife Research)',
        url: 'https://doi.org/10.1071/wr24043',
        kind: 'data',
      },
      {
        label: 'Rabbits (Te Ara)',
        url: 'https://teara.govt.nz/en/rabbits',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'regional-population-ranks',
    keyFacts: [
      'Not one of the 16 regions changed rank between 2013 and 2023.',
      'Auckland stayed first at 1,656,486; the West Coast stayed last at 33,390.',
      'Tasman grew fastest at 10.3 percent.',
    ],
    howToRead:
      'The rank slope follows each region across the censuses; the dumbbell shows absolute growth.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
    label: 'Regional population ranks',
    eyebrow: 'the regional population ranks',
    title: 'The regional pecking order is frozen.',
    description:
      'Between the 2013 and 2023 censuses, not one of the 16 regions changed rank. Auckland stayed first with 1,656,486 people, and the West Coast stayed last with 33,390. A rank slope and a growth dumbbell draw on the same census counts.',
    paragraphs: [
      'The ranks are stable because the regions grow at similar rates. The West Coast was the only region whose population shrank between 2013 and 2018, from 32,148 to 31,575, before growing again to 33,390 by 2023.',
      'Ranks hide absolute change, so the table keeps the counts. Every region grew between 2018 and 2023, and Tasman grew fastest at 10.3 percent.',
    ],
    accent: 'teal',
    dataSource: 'Stats NZ',
    chartType: 'Rank / slope',
    category: 'Census & population',
    dataNote:
      'Data: Stats NZ 2023 Census population counts release (Table 1, published 29 May 2024), usually resident population counts by regional council. Counts have fixed random rounding to base 3 applied. The series is final: censuses run every five years.',
    references: [
      {
        label: '2023 Census population counts release (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
        kind: 'data',
      },
      {
        label: 'First results from the 2023 Census (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/first-results-from-the-2023-census-older-more-diverse-population-and-an-extra-300000-people-between-censuses/',
        kind: 'news',
      },
    ],
  },
  {
    slug: 'export-destination-ranks',
    keyFacts: [
      'China overtook Australia as the top export market in 2016 and has held it since.',
      'In the year ended March 2026, China took $19.7 billion of goods exports to Australia’s $10.5 billion.',
      'China’s lead over Australia grew to $9.3 billion.',
    ],
    howToRead: 'The slope chart ranks the top ten destinations in 2015, 2020, and 2026.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/goods-and-services-trade-by-country-year-ended-march-2020/',
    label: 'Export destination ranks',
    eyebrow: 'the export destination ranks',
    title: 'China overtook Australia as the top export market.',
    description:
      "In the year ended March 2015, Australia was still New Zealand's biggest goods export market at $8.6 billion, just ahead of China's $8.6 billion. By 2026 China's lead was $9.3 billion. A slope chart and a bump chart trace the handover.",
    paragraphs: [
      'China took the top spot in 2016 and has held it since. In the year ended March 2026, goods exports to China reached $19.7 billion, more than Australia ($10.5 billion) and the United States ($9.3 billion) combined.',
      "The slope chart ranks the top ten destinations in 2015, 2020, and 2026. The order has barely moved since 2015; the story is the size of China's lead, not the ranking.",
    ],
    accent: 'indigo',
    dataSource: 'Stats NZ',
    chartType: 'Rank / slope',
    category: 'Economy & business',
    dataNote:
      'Data: Stats NZ goods and services trade by country releases. The 2015 and 2020 figures are from the year ended March 2020 release; the 2026 figures are aggregated from the monthly series in the International trade: December 2025 quarter release (April 2025 to March 2026). Goods exports, NZ$ millions.',
    references: [
      {
        label: 'Goods and services trade by country: Year ended March 2020 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/goods-and-services-trade-by-country-year-ended-march-2020/',
        kind: 'data',
      },
      {
        label: 'International trade: December 2025 quarter (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/international-trade-december-2025-quarter/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'city-population-ranks',
    keyFacts: [
      'Tauranga passed Dunedin for fifth, 152,844 to 128,901.',
      'Auckland stayed biggest at 1,656,486.',
      'Hamilton held fourth place at 174,741.',
    ],
    howToRead: 'The slope lines follow the ten biggest city councils across the three censuses.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
    label: 'City population ranks',
    eyebrow: 'the city population ranks',
    title: 'Tauranga passed Dunedin to become the fifth-biggest city.',
    description:
      'Between the 2013 and 2018 censuses, Tauranga overtook Dunedin. By 2023 Tauranga counted 152,844 people and Dunedin 128,901.',
    paragraphs: [
      'Auckland stayed the biggest city at 1,656,486, with Christchurch (391,383) and Wellington (202,689) next. Hamilton held fourth place at 174,741.',
      'The ranks below are among the ten biggest city councils, not all 67 territorial authorities. City boundaries changed little over the three censuses, so the comparison is consistent.',
    ],
    accent: 'cyan',
    dataSource: 'Stats NZ',
    chartType: 'Rank / slope',
    category: 'Census & population',
    dataNote:
      'Data: Stats NZ 2023 Census population counts release (Table 2, published 29 May 2024), usually resident population counts by territorial authority, ranked among the ten biggest city councils. Counts have fixed random rounding to base 3 applied.',
    references: [
      {
        label: '2023 Census population counts release (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
        kind: 'data',
      },
      {
        label: 'First results from the 2023 Census (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/first-results-from-the-2023-census-older-more-diverse-population-and-an-extra-300000-people-between-censuses/',
        kind: 'news',
      },
    ],
  },

  {
    slug: 'age-distribution',
    keyFacts: [
      'By 2023 the biggest ten-year band was 30-39, at 719,616.',
      'In 2013 the 50-59 band (560,178) beat the 20-29 band (548,826).',
      'Median age moved only slightly, from 38.0 to 38.1 years.',
    ],
    howToRead: 'The histogram and ridgeline both track the bands across 2013, 2018, and 2023.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
    label: 'Age distribution',
    eyebrow: 'the age distribution',
    title: 'The baby boom bulge moved up the age ladder.',
    description:
      'In the 2013 census the 50-59 band held 560,178 people, more than the 20-29 band (548,826). By 2023 the biggest ten-year band was 30-39 at 719,616, and the baby boomers sat in 60-69. A histogram and a ridgeline both follow the bands across the three censuses.',
    paragraphs: [
      'New Zealand counted 4,993,923 people in the 2023 census, up from 4,242,048 in 2013. The median age moved only slightly, from 38.0 to 38.1 years.',
      'The bulge aged in step with the census. The 60-69 band of 2023 held 548,910 people, nearly the same as the 50-59 band of 2013. The 20-29 band of 2013 (548,826) became the 30-39 band of 2023, the largest ten-year band of all.',
      'The 25-34 band was the hollow in 2013 at 514,689 people, the smallest ten-year band between 20 and 49. Drag the slider to follow the bands across the three censuses.',
    ],
    accent: 'teal',
    dataSource: 'Stats NZ',
    chartType: 'Histogram',
    category: 'Census & population',
    dataNote:
      'Data: Stats NZ "2023 Census population counts (by ethnic group, age, and Maori descent) and dwelling counts", Table 6, census usually resident population count by five-year age group, 2013, 2018, and 2023 Censuses. Counts have fixed random rounding to base 3 applied, so the bands may not sum to the stated total. The series is final, so this snapshot does not go stale.',
    references: [
      {
        label: '2023 Census population counts (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
        kind: 'data',
      },
      {
        label: '2023 Census (Stats NZ)',
        url: 'https://www.stats.govt.nz/2023-census/',
        kind: 'data',
      },
    ],
  },

  {
    slug: 'median-age-ranks',
    keyFacts: [
      'The West Coast was oldest at 48.1 years in 2023.',
      'Auckland stayed the youngest in all three censuses, at 35.9.',
      'The whole range is small: 35.9 to 48.1 years.',
    ],
    howToRead: 'The rank slope and tile grid both map median age across the three censuses.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
    label: 'Median age ranks',
    eyebrow: 'the median age ranks',
    title: 'The upper South Island is where New Zealand ages fastest.',
    description:
      'West Coast was the oldest region in the 2023 census, at a median age of 48.1 years. Tasman (46.8), Marlborough (46.1) and Nelson (44.0) followed. Auckland stayed the youngest in all three censuses, at 35.9. A rank slope and a tile grid both map median age across the 2013, 2018, and 2023 censuses.',
    paragraphs: [
      'West Coast climbed from 3rd-oldest in 2013 to oldest in 2023. Southland climbed 4 places to 6th-oldest, and Taranaki and Manawatu-Whanganui each climbed 2.',
      'Marlborough went the other way, from oldest in 2013 (45.0) to 3rd in 2023 (46.1). Canterbury and Bay of Plenty each fell 3 places. The whole range is small: 35.9 to 48.1 years.',
    ],
    accent: 'amber',
    dataSource: 'Stats NZ',
    chartType: 'Rank / slope',
    category: 'Census & population',
    dataNote:
      'Data: Stats NZ "2023 Census population counts (by ethnic group, age, and Maori descent) and dwelling counts", Table 7, median age by regional council area, 2013, 2018, and 2023 Censuses. Median age is calculated using single-year-of-age data. Ranks are computed among the 16 regions, with tied medians sharing a rank.',
    references: [
      {
        label: '2023 Census population counts (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
        kind: 'data',
      },
      {
        label: '2023 Census (Stats NZ)',
        url: 'https://www.stats.govt.nz/2023-census/',
        kind: 'data',
      },
    ],
  },

  {
    slug: 'visitor-arrival-ranks',
    keyFacts: [
      'Australia, China, the US, and the UK held the top four spots in 2015 and 2019.',
      'Indonesia rose from 24th to 19th and the Philippines from 25th to 20th.',
      'Total arrivals reached 3,888,473 in the December 2019 year.',
    ],
    howToRead: 'The slope ranks countries by arrivals; the dot plot shows the volumes.',
    sourceUrl: 'https://www.stats.govt.nz/information-releases/international-travel-december-2019/',
    label: 'Visitor arrival ranks',
    eyebrow: 'the visitor arrival ranks',
    title: 'Indonesia and the Philippines climbed the visitor ranks.',
    description:
      'Australia, China, the United States and the United Kingdom held the top four spots for visitor arrivals in 2015 and 2019. The churn happened below them: Indonesia rose from 24th to 19th and the Philippines from 25th to 20th. A rank slope and a dot plot show the same arrivals, with the 2015 to 2019 shift.',
    paragraphs: [
      'India overtook Singapore for 9th place, with 66,775 arrivals in the December 2019 year against 64,574. Germany and Japan swapped 5th and 6th.',
      'New Caledonia fell 5 places to 25th and Switzerland fell 4 to 23rd. Total visitor arrivals reached 3,888,473 in the December 2019 year, the last full year before the border closed.',
    ],
    accent: 'sky',
    dataSource: 'Stats NZ',
    chartType: 'Rank / slope',
    category: 'Tourism & travel',
    dataNote:
      'Data: Stats NZ, International travel: December 2019, Table 4, visitor arrivals by country of residence, years ended December 2015 and 2019. Ranks are computed among the top 30 countries of residence. The 2019 endpoint is the last full pre-pandemic year.',
    references: [
      {
        label: 'International travel: December 2019 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/international-travel-december-2019/',
        kind: 'data',
      },
      {
        label: 'Tourism (Stats NZ)',
        url: 'https://www.stats.govt.nz/topics/tourism/',
        kind: 'data',
      },
    ],
  },

  {
    slug: 'company-size-distribution',
    keyFacts: [
      '617,334 enterprises at February 2025.',
      '455,730, or 74%, had no paid employees.',
      '2,838 enterprises with 100+ staff employ half of the paid workforce.',
    ],
    howToRead: 'The pareto shows enterprises by size band, with the cumulative share on the line.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2025/',
    label: 'Company size distribution',
    eyebrow: 'the company size distribution',
    title: 'Most businesses have no staff at all.',
    description:
      "Of the 617,334 economically significant enterprises in New Zealand at February 2025, 455,730 had no paid employees. Just 2,838 enterprises employed 100 or more people, and those giants employed half of the country's paid workforce.",
    paragraphs: [
      'The business register is a power law. Enterprises with no employees make up 74% of the total, and the 1-5 band adds another 16%, so nine in ten enterprises employ five people or fewer.',
      'The shape flips for employment. The 2,838 enterprises with 100 or more employees employed 1,209,700 people, half of the 2,443,400 paid employees in the register.',
      'The register counts economically significant enterprises, mostly those with goods and services tax (GST) turnover over $30,000 a year, and it counts dormant companies too. Pick an industry to see the shape change: rental, hiring, and real estate is almost all no-employee firms, while education and health lean the other way.',
    ],
    accent: 'amber',
    dataSource: 'Stats NZ',
    chartType: 'Pareto',
    category: 'Economy & business',
    dataNote:
      'Data: Stats NZ "New Zealand business demography statistics: At February 2025", Table 1, enterprises and employee count by industry (ANZSIC06) and employee count size group. Counts are provisional and have noise added or subtracted to protect individual businesses, so bands may not sum to the stated totals.',
    references: [
      {
        label: 'New Zealand business demography statistics: At February 2025 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2025/',
        kind: 'data',
      },
      {
        label: 'Business demography statistics (DataInfo+)',
        url: 'https://datainfoplus.stats.govt.nz/Item/nz.govt.stats/bdb02aa2-866e-418f-83e8-342234867a0f',
        kind: 'data',
      },
      {
        label: 'Business (Stats NZ)',
        url: 'https://www.stats.govt.nz/topics/business/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'tourism-arrivals-by-month',
    keyFacts: [
      'December 2019 brought 528,219 visitors, the summer peak.',
      'June was the deepest month at 213,536.',
      'December 2024 brought 469,842, 11% below December 2019.',
    ],
    howToRead: 'The cycle plot wraps each year around the month ring; toggle years to compare.',
    sourceUrl: 'https://www.stats.govt.nz/information-releases/international-travel-june-2025/',
    label: 'Tourism arrivals by month',
    eyebrow: 'the tourism arrivals by month',
    title: 'Visitors flood in every summer.',
    description:
      'Overseas visitor arrivals peak every December and more than halve by the winter trough. In 2019, December brought 528,219 visitors against 213,536 in June, the deepest month of the year.',
    paragraphs: [
      'The summer peak is the same shape in every year on the chart: December is always the biggest month, and May or June is always the smallest.',
      'The 2020 to 2022 years are missing because border restrictions closed the country. The recovery is still incomplete: December 2024 brought 469,842 visitors, 11% below December 2019.',
      'Toggle the year buttons to compare the summer peak month by month. The 2017 and 2025 lines are partial years.',
    ],
    accent: 'sky',
    dataSource: 'Stats NZ',
    chartType: 'Cycle plot',
    category: 'Tourism & travel',
    dataNote:
      'Data: Stats NZ "International travel" releases, Table 2, estimated short-term travel, overseas visitor arrivals by month. The 2017-2019 months come from the December 2018 and December 2019 releases; the 2023-2025 months come from the June 2025 release. Arrivals are counted by month of arrival.',
    references: [
      {
        label: 'International travel: June 2025 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/international-travel-june-2025/',
        kind: 'data',
      },
      {
        label: 'International travel: December 2019 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/international-travel-december-2019/',
        kind: 'data',
      },
      {
        label: 'Tourism (Stats NZ)',
        url: 'https://www.stats.govt.nz/topics/tourism/',
        kind: 'data',
      },
    ],
  },
  {
    slug: 'retail-sales-by-month',
    keyFacts: [
      'December 2024 brought $11,392 million of card spending, the biggest month on record.',
      'That was up 12% from November.',
      'The durables layer surged to $2,448 million in December 2024.',
    ],
    howToRead:
      'The stream layers are industries; toggle them to watch the Christmas wave travel through the stream.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/electronic-card-transactions-june-2025/',
    label: 'Retail sales by month',
    eyebrow: 'the retail sales by month',
    title: 'Card spending peaks every December.',
    description:
      'Stats NZ does not publish monthly retail sales, so this page uses the closest monthly retail pulse: electronic card transactions. December 2024 brought $11,392 million of card spending, the biggest month on record, up 12% from November.',
    paragraphs: [
      'The December bump is a wave that repeats every year: December 2021, 2022, 2023, and 2024 were each the biggest month of their year, and every one beat the previous month by at least 9%. January then drops back as the wave passes.',
      'The durables layer, the durable-goods stores behind the December peak, is the one that surges hardest: $2,448 million in December 2024 against $1,522 million the following September.',
      'Toggle the industry layers to watch the Christmas wave travel through the stream. Values include GST (the 15 percent goods and services tax).',
    ],
    accent: 'rose',
    dataSource: 'Stats NZ',
    chartType: 'Streamgraph',
    category: 'Economy & business',
    dataNote:
      'Data: Stats NZ "Electronic card transactions" releases, Table 1, actual monthly values by industry (series ECTM). The June 2023 release covers June 2021 to June 2023 and the June 2025 release covers June 2023 to June 2025. The retail trade survey itself is quarterly, so the card series is used for the monthly pulse. Component series are rounded independently and may not sum to the stated total.',
    references: [
      {
        label: 'Electronic card transactions: June 2025 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/electronic-card-transactions-june-2025/',
        kind: 'data',
      },
      {
        label: 'Electronic card transactions: June 2023 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/electronic-card-transactions-june-2023/',
        kind: 'data',
      },
      {
        label: 'Business (Stats NZ)',
        url: 'https://www.stats.govt.nz/topics/business/',
        kind: 'data',
      },
    ],
  },

  {
    slug: 'ethnic-mix',
    keyFacts: [
      '67.8 percent of people who stated an ethnicity identified as European.',
      'The Asian share nearly doubled, from 11.8 percent in 2013 to 17.3 percent in 2023.',
      'Auckland is the only region under half, at 49.8 percent.',
    ],
    howToRead: 'Each row is 100 people; the filled cells show how many identified with each group.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
    label: 'Ethnic mix',
    eyebrow: 'the ethnic mix',
    title: 'European is still the biggest group, but the mix is changing fast.',
    description:
      'At the 2023 Census, 67.8 percent of people who stated an ethnicity identified as European. The Asian share has nearly doubled in a decade, from 11.8 percent in 2013 to 17.3 percent in 2023.',
    paragraphs: [
      'The chart rows add past 100 because people can identify with more than one ethnic group. The filled cells in each row add past 100: 111 cells for every 100 people who stated an ethnicity in 2013 and 115 in 2023, because people can identify with more than one group. That growing overlap is the multi-identity share.',
      'The diversity is concentrated. Auckland is the only region where fewer than half of people stated a European ethnicity: 49.8 percent in 2023, against 67.8 percent nationally. Gisborne is next lowest at 56.5 percent.',
    ],
    accent: 'fuchsia',
    dataSource: 'Stats NZ',
    chartType: 'Waffle',
    category: 'Census & population',
    dataNote:
      'Data: Stats NZ 2023 Census population counts (by ethnic group, age, and Maori descent) and dwelling counts, Table 4 (ethnic group grouped total responses by regional council area, 2013, 2018, and 2023 censuses). Each row of the chart is 100 people who stated an ethnicity, and the filled cells show how many identified with that group. Rows add past 100 because people can choose more than one ethnic group. In 2013, 5.4 percent of people did not state an ethnicity, so that year is measured against the 94.6 percent who did.',
    references: [
      {
        label: '2023 Census population counts release (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
        kind: 'data',
      },
      {
        label: 'Census results reflect Aotearoa New Zealands diversity (Stats NZ)',
        url: 'https://www.stats.govt.nz/news/census-results-reflect-aotearoa-new-zealands-diversity/',
        kind: 'news',
      },
      {
        label: 'Ethnicity (Stats NZ)',
        url: 'https://www.stats.govt.nz/topics/ethnicity',
        kind: 'history',
      },
    ],
  },

  {
    slug: 'enterprise-bar-in-bar',
    keyFacts: [
      '617,334 economically significant enterprises at February 2025.',
      'Rental, hiring, and real estate led with 129,120.',
      'The register grew 10.7 percent from February 2020.',
    ],
    howToRead: 'The bar-in-bar compares February 2020 with February 2025 for every industry.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2025/',
    label: 'Business register',
    eyebrow: 'the business register',
    title: 'Rental and real estate is the biggest block of the business register.',
    description:
      'At February 2025, New Zealand had 617,334 economically significant enterprises. Rental, hiring, and real estate services led with 129,120, construction was second with 81,249, and professional, scientific, and technical services third with 70,938.',
    paragraphs: [
      'The register grew 10.7 percent from February 2020, when it held 557,685 enterprises. Financial and insurance services grew fastest at 25.8 percent, health care and social assistance grew 22.1 percent, and construction grew 20.8 percent.',
      'Two industries shrank: agriculture, forestry, and fishing fell 3.9 percent and wholesale trade fell 3.2 percent. The register counts every economically significant business, so the biggest block mixes active traders with companies that still file but do little.',
    ],
    accent: 'indigo',
    dataSource: 'Stats NZ',
    chartType: 'Bar-in-bar',
    category: 'Economy & business',
    dataNote:
      'Data: Stats NZ "New Zealand business demography statistics" releases, Table 1, enterprises by industry (ANZSIC06) at February 2020 (published 29 October 2020) and February 2025 (published 30 October 2025). The 2025 counts are provisional and have noise added or subtracted to protect individual businesses. Hover a row, search for an industry, or toggle the sort order.',
    references: [
      {
        label: 'Business demography: At February 2025 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2025/',
        kind: 'data',
      },
      {
        label: 'Business demography: At February 2020 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2020/',
        kind: 'data',
      },
      {
        label: 'Business (Stats NZ)',
        url: 'https://www.stats.govt.nz/topics/business',
        kind: 'history',
      },
    ],
  },
  {
    slug: 'unemployment-ranks',
    keyFacts: [
      'The national rate rose from 4.0 percent to 5.3 percent between December 2023 and December 2025.',
      'Auckland went from 4.2 to 6.4 percent, and from fifth-highest to highest.',
      'Otago stayed the tightest labour market throughout.',
    ],
    howToRead: 'The parallel coordinates trace each region’s rank across the nine quarters.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/labour-market-statistics-december-2025-quarter/',
    label: 'Unemployment ranks',
    eyebrow: 'the unemployment shuffle',
    title: 'The unemployment pecking order reshuffles every year.',
    description:
      'Between December 2023 and December 2025, Auckland went from the fifth-highest regional unemployment rate to the highest, and Wellington from ninth to third. Otago stayed the tightest labour market in the country throughout.',
    paragraphs: [
      'The national unemployment rate rose from 4.0 percent in December 2023 to 5.3 percent in December 2025. Auckland moved most, from 4.2 to 6.4 percent, and its rank climbed from fifth to first. Wellington went from 3.3 to 5.8 percent.',
      'Northland, Waikato, and Manawat\u016b-Whanganui swapped the top spots early in the period. Taranaki drifted the other way, from the seventh-highest rate to the tenth, while its rate barely moved.',
      "The Household Labour Force Survey is a sample, so small regions carry wide margins of error. Northland's December 2025 rate of 5.2 percent has a sampling error of about 2.7 percentage points.",
    ],
    accent: 'rose',
    dataSource: 'Stats NZ',
    chartType: 'Parallel coordinates',
    category: 'Economy & business',
    dataNote:
      'Data: Stats NZ Household Labour Force Survey, December 2025 quarter (Table 6, people employed, unemployed, and not in the labour force, by regional council area), unadjusted quarterly unemployment rates for December 2023 to December 2025. Rank 1 is the highest unemployment rate that quarter; ties keep workbook order. Regional estimates carry wide sampling errors, especially for smaller regions.',
    references: [
      {
        label: 'Labour market statistics: December 2025 quarter (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/labour-market-statistics-december-2025-quarter/',
        kind: 'data',
      },
      {
        label: 'HLFS (Household Labour Force Survey) regional tables workbook (Stats NZ)',
        url: 'https://www.stats.govt.nz/assets/Uploads/Labour-market-statistics/Labour-market-statistics-December-2025-quarter/Download-data/household-labour-force-survey-december-2025-quarter.xlsx',
        kind: 'data',
      },
      {
        label: 'Unemployment (Stats NZ)',
        url: 'https://www.stats.govt.nz/topics/labour-market/',
        kind: 'history',
      },
    ],
  },

  {
    slug: 'quake-years',
    keyFacts: [
      'GeoNet located 7,265 quakes at magnitude 4.0 or stronger between 2001 and 2024.',
      '2016 was the busiest year, with 772 around the Kaikōura earthquake.',
      'The quietest year was 2018, with 118.',
    ],
    howToRead:
      'The strip chart shows one row per quake; drag the slider to raise the minimum magnitude.',
    sourceUrl: 'https://service.geonet.org.nz/fdsnws/event/1/',
    label: 'Quake years',
    eyebrow: 'the quake years',
    title: "2016 was New Zealand's busiest quake year since 2001.",
    description:
      'GeoNet located 7,265 earthquakes at magnitude 4.0 or stronger between 2001 and 2024. The busiest year was 2016, when the 7.8 Kaikoura earthquake and its aftershocks brought 772.',
    paragraphs: [
      'The quietest year was 2018 with 118. Most years land between 150 and 500, so the peak years stand out: 2003 (561) around the Fiordland 7.1, 2009 (487) around the Dusky Sound 7.8, and 2021 (483) around the Te Araroa 7.2.',
      'The 6.3 Christchurch earthquake of February 2011 made 2011 a busy year too, with 447 quakes at 4.0 or stronger. Drag the slider to 6.0 and only the biggest shakes remain.',
    ],
    accent: 'rose',
    dataSource: 'GeoNet',
    chartType: 'Strip chart',
    category: 'Earthquakes & geology',
    dataNote:
      'Data: GeoNet FDSN event service, earthquakes of magnitude 4.0 or stronger located in the New Zealand region (latitude -50 to -29, longitude 166 to 180, plus the Kermadec arc from -180 to -175), 1 January 2001 to 31 December 2024. The counts are a committed snapshot of the GeoNet catalog taken 19 August 2026.',
    references: [
      {
        label: 'GeoNet',
        url: 'https://www.geonet.org.nz/',
        kind: 'data',
      },
      {
        label: 'Earthquake FAQ (GeoNet)',
        url: 'https://www.geonet.org.nz/earthquake/faq',
        kind: 'data',
      },
      {
        label: 'Kaikōura earthquake, 13 November 2016 (GeoNet)',
        url: 'https://www.geonet.org.nz/earthquake/2016p858000',
        kind: 'news',
      },
    ],
  },

  {
    slug: 'region-density',
    keyFacts: [
      'Auckland holds 1,656,486 people on 4,941 square kilometres, a third of the country on under 2% of the land.',
      'The national density is about 18.9 people per square kilometre; Auckland runs at 335.3.',
      'The West Coast is the emptiest at 1.4 people per square kilometre.',
    ],
    howToRead: 'The choropleth shades each region by density; the waffle shows the same counts.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
    label: 'Region density',
    eyebrow: 'the region density',
    title: 'Auckland holds a third of the people on 2% of the land.',
    description:
      "New Zealand's 16 regional councils cover 264,091 square kilometres of land. At the 2023 census, Auckland held 1,656,486 people, a third of the country, on 4,941 square kilometres, under 2% of it. A choropleth map and a waffle grid show the same population with census-year controls.",
    paragraphs: [
      'The 2023 census counted 4,993,923 people by regional council, about 18.9 per square kilometre. Auckland runs at 335.3 per square kilometre, more than 17 times the national density.',
      'Nelson is the next busiest council at 124.6 per square kilometre, a pocket of 52,584 people on just 422 square kilometres. The West Coast is the emptiest at 1.4 people per square kilometre. Toggle the census year to watch the 2013 to 2023 shift.',
    ],
    accent: 'indigo',
    dataSource: 'Stats NZ',
    chartType: 'Choropleth',
    category: 'Census & population',
    dataNote:
      'Data: Stats NZ "2023 Census population counts (by ethnic group, age, and Maori descent) and dwelling counts", Table 1, usually resident population by regional council area, 2013, 2018, and 2023 Censuses. Land areas are Stats NZ regional council land areas as tabulated on Wikipedia\'s "Regions of New Zealand" page, which cites the Stats NZ "Regional Council 2020 Clipped (generalised)" boundary layer. Boundaries shown are the 2023 regional council areas. Counts have fixed random rounding to base 3 applied.',
    references: [
      {
        label: '2023 Census population counts (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/',
        kind: 'data',
      },
      {
        label: '2023 Census (Stats NZ)',
        url: 'https://www.stats.govt.nz/2023-census/',
        kind: 'data',
      },
      {
        label: 'Regions of New Zealand (Wikipedia)',
        url: 'https://en.wikipedia.org/wiki/Regions_of_New_Zealand',
        kind: 'data',
      },
      {
        label: 'Regional Council 2020 Clipped (generalised) (Stats NZ)',
        url: 'https://datafinder.stats.govt.nz/layer/104253-regional-council-2020-clipped-generalised/',
        kind: 'data',
      },
    ],
  },

  {
    slug: 'industry-employment',
    keyFacts: [
      'Health care and social assistance employed 293,600 people, 12% of the total.',
      'Manufacturing is second with 231,100, but its share slipped from 10.2% to 9.4%.',
      'Retail trade sits close behind at 227,900.',
    ],
    howToRead:
      'The marimekko scales each column to that year’s total; hover a block to read an industry.',
    sourceUrl:
      'https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2025/',
    label: 'Industry employment',
    eyebrow: 'the industry employment',
    title: "Health care is New Zealand's biggest employer.",
    description:
      "Stats NZ counted 293,600 employees in health care and social assistance at February 2025, 12% of the 2,450,600 employees covered by the business demography statistics. It is the country's biggest industry employer, ahead of manufacturing.",
    paragraphs: [
      'Manufacturing still employed 231,100 people, but its share slipped from 10.2% at February 2020 to 9.4% at February 2025. Retail trade sits close behind at 227,900.',
      "The marimekko scales each column to that year's employee total and each block's height to an industry's share. Hover a block to read an industry across both years, or switch to equal columns to compare shares directly.",
    ],
    accent: 'violet',
    dataSource: 'Stats NZ',
    chartType: 'Marimekko',
    category: 'Economy & business',
    dataNote:
      'Data: Stats NZ "New Zealand business demography statistics: At February 2020" and "...At February 2025", Table 1, enterprises, geographic units, and employee count by industry (ANZSIC06). The February 2025 counts are provisional and have noise added or subtracted to protect individual businesses, so industry counts can differ from the published total by a few employees.',
    references: [
      {
        label: 'New Zealand business demography statistics: At February 2025 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2025/',
        kind: 'data',
      },
      {
        label: 'New Zealand business demography statistics: At February 2020 (Stats NZ)',
        url: 'https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2020/',
        kind: 'data',
      },
    ],
  },

  {
    slug: 'parliament-party-seats',
    keyFacts: [
      'The House grew from 80 seats in 1935 to 99 by 1993, then jumped to 120 when MMP arrived in 1996. In 2023 it sat at 122.',
      'In 2020 Labour won 65 of 120 seats, the only single-party majority under MMP.',
      'In 2023 National took 48 seats and needed both ACT (11) and NZ First (8) to govern.',
      'Winning the most seats is not enough: National took 56 in 2017 and still went into opposition.',
    ],
    howToRead:
      'Each bar is one election year. The colours are the parties and taller means more seats. Hover a bar for the exact counts. The second chart rescales the same seats to a share of the House, with the prime minister of each era along the top.',
    sourceUrl: 'https://catalogue.data.govt.nz/dataset/members-of-parliament',
    label: 'Parliament party seats',
    eyebrow: 'the parliament seats',
    title: 'Which party held the most seats, election by election.',
    description:
      'Every election since 1935 in seats: who won the House, how big it was, and which party got to run the country. The counts come from the Parliament Member Terms list on the data.govt.nz datastore, fetched at build time.',
    paragraphs: [
      "A seat is counted once per member elected at that parliament's general election, so by-elections and mid-term replacements do not inflate the bars. Counting every row in the source table instead would put 143 members in the 1996 parliament, which had 120 seats.",
      'The flags mark the twelve elections where the government changed, curated from election results rather than read off the seat counts. In 2017 National won 56 seats and Labour 46, and Labour formed the government. The 2023 election was the first under MMP that needed three parties in coalition.',
    ],
    accent: 'teal',
    dataSource: 'data.govt.nz',
    chartType: 'Bar chart',
    category: 'Politics & government',
    dataNote:
      'Data: New Zealand Parliament, Members of Parliament - Member Terms, served through the data.govt.nz CKAN datastore (resource 9767376e-ead0-468d-8b55-a65dfb629b54) and fetched at build time, falling back to a committed snapshot of the same table when the datastore is unreachable. Parties are bucketed into Labour, National, Green, NZ First, ACT and Other, so the 2023 Other block holds the Māori Party’s six seats, and the 1935 coalition members sit under National, a party formed the following year.',
    references: [
      {
        label: 'Members of Parliament - Member Terms (data.govt.nz)',
        url: 'https://catalogue.data.govt.nz/dataset/members-of-parliament',
        kind: 'data',
      },
      {
        label: 'Members of Parliament (New Zealand Parliament)',
        url: 'https://www.parliament.nz/en/mps-and-electorates/members-of-parliament/',
        kind: 'data',
      },
      {
        label: 'Parliamentary parties (New Zealand Parliament)',
        url: 'https://www.parliament.nz/en/mps-and-electorates/political-parties/',
        kind: 'news',
      },
      {
        label: 'Parliament (Te Ara)',
        url: 'https://teara.govt.nz/en/parliament',
        kind: 'history',
      },
    ],
  },
]).filter((microsite) => PUBLISHED_MICROSITES.includes(microsite.slug));
