import imgDumplingFm from '../assets/images/work_dumpling_fm_1793248739868.jpg';
import imgOoono from '../assets/images/work_ooono_device_1793248741700.jpg';
import imgKrissAi from '../assets/images/work_kriss_ai_laptop_1793248742429.jpg';
import imgMadklubben from '../assets/images/work_madklubben_food_1793248744407.jpg';
import imgAaveGho from '../assets/images/work_aave_gho_garment_1793248747162.jpg';
import imgEspnOvechkin from '../assets/images/work_espn_ovechkin_1793248749004.jpg';
import imgEspnAlcaraz from '../assets/images/work_espn_alcaraz_1793248751195.jpg';
import imgOnEnergy from '../assets/images/work_on_energy_hardware_1793248752848.jpg';
import imgAugen from '../assets/images/work_augen_wearables_1793248754328.jpg';
import imgWrk from '../assets/images/work_wrk_timepieces_1793248756864.jpg';
import imgHut8 from '../assets/images/work_hut8_architecture_1793248756214.jpg';

export interface ProjectSlideSpec {
  id: string;
  layout: 'cover' | 'inset' | 'split' | 'typographic';
  image: string;
  secondaryImage?: string;
  bgColor: string;
  accentColor?: string;
  objectPosition?: string;
  scale?: number;
  filter?: string;
  caption?: string;
  badgeText?: string;
}

export interface ProjectData {
  slug: string;
  position: number;
  featured: boolean;
  title: string;
  subtitle: string;
  discipline: string;
  date: string;
  year: string;
  shortYear: string;
  backgroundColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  ctaColor: string;
  heroImage: string;
  liveUrl?: string;
  services: string[];
  challenge: string;
  solution: string;
  indexAssetCount: number;
  slides: ProjectSlideSpec[];
}

export interface IndexArchiveAsset {
  id: string;
  projectSlug: string;
  projectTitle: string;
  shortYear: string;
  indexNumber: string; // "1.0", "2.0", ...
  isFirstOfProject: boolean;
  image: string;
  variant: 'cover' | 'inset' | 'brand-tile';
  bgColor: string;
  accentColor: string;
  textColor: string;
  objectPosition: string;
  filter?: string;
  markText?: string;
  markSubtext?: string;
}

export const ALL_PROJECTS: ProjectData[] = [
  {
    slug: 'on-energy',
    position: -30,
    featured: true,
    title: 'ON.Energy',
    subtitle: 'Power Systems',
    discipline: 'ID & Website',
    date: '2026-02-10 00:00',
    year: '2026',
    shortYear: '26',
    backgroundColor: '#202020',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#999999',
    ctaColor: '#FFF414',
    heroImage: imgOnEnergy,
    liveUrl: 'https://on.energy',
    services: ['Strategy', 'Creative Direction', 'Art Direction', 'Design'],
    challenge:
      'ON.Energy builds the battery storage that keeps AI and critical infrastructure running. Surrounded by much bigger competitors, it needed to look like the category leader it was becoming.',
    solution:
      'We repositioned ON.Energy as a premium provider for large-scale energy projects. Custom 3D imagery and a sharp, confident website present heavy industrial hardware with the polish of a product launch.',
    indexAssetCount: 8,
    slides: [
      { id: 'on-1', layout: 'cover', image: imgOnEnergy, bgColor: '#202020', objectPosition: 'center center' },
      { id: 'on-2', layout: 'typographic', image: imgOnEnergy, bgColor: '#3B3912', accentColor: '#FFF414', badgeText: 'ON.energy™' },
      { id: 'on-3', layout: 'inset', image: imgOnEnergy, bgColor: '#161616', objectPosition: '25% 40%', scale: 0.78 },
      { id: 'on-4', layout: 'split', image: imgOnEnergy, secondaryImage: imgHut8, bgColor: '#202020' },
    ],
  },
  {
    slug: 'hut-8',
    position: 0,
    featured: true,
    title: 'Hut 8',
    subtitle: 'Energy Corp.',
    discipline: 'ID & Website',
    date: '2025-05-15 00:00',
    year: '2025',
    shortYear: '25',
    backgroundColor: '#181818',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#999999',
    ctaColor: '#B4FE00',
    heroImage: imgHut8,
    liveUrl: 'https://hut8.com',
    services: ['Concept', 'Art Direction', 'Design', '3D Design', 'Motion Design', 'Development'],
    challenge:
      "Hut 8 had grown from a Bitcoin miner into an energy infrastructure company, but its brand still looked like crypto. In the rooms where decisions are made and deals are closed, it wasn't taken as seriously as its business deserved.",
    solution:
      "We gave Hut 8 an institutional presence, led by a turbine mark whose circular rhythm feels in motion even when it's still. From data center facades and signage to uniforms and the website, the company now looks as solid as the infrastructure it runs.",
    indexAssetCount: 8,
    slides: [
      { id: 'h8-1', layout: 'cover', image: imgHut8, bgColor: '#181818', objectPosition: 'center center' },
      { id: 'h8-2', layout: 'typographic', image: imgHut8, bgColor: '#1F2808', accentColor: '#B4FE00', badgeText: 'HUT 8 // INFRASTRUCTURE' },
      { id: 'h8-3', layout: 'inset', image: imgHut8, bgColor: '#121212', objectPosition: '70% 35%', scale: 0.8 },
    ],
  },
  {
    slug: 'kriss-ai',
    position: -110,
    featured: true,
    title: 'Kriss.ai',
    subtitle: 'AI Sales Tool',
    discipline: 'Website',
    date: '2024-12-01 00:00',
    year: '2024',
    shortYear: '24',
    backgroundColor: '#DBBCB1',
    primaryTextColor: '#0D0B08',
    secondaryTextColor: '#665854',
    ctaColor: '#0D0B08',
    heroImage: imgKrissAi,
    liveUrl: 'https://kriss.ai',
    services: ['Concept', 'Art Direction', 'Design', '3D Design', 'Development'],
    challenge:
      'AI in healthcare can feel cold and intimidating. Kriss.ai needed to show dental clinics what its assistant does, in a way that felt warm and simple.',
    solution:
      "We designed a web experience around a 3D cutaway clinic floating in soft clouds. The assistant's skills, from booking appointments to patient communication, sit front and center, so every visit looks effortless.",
    indexAssetCount: 4,
    slides: [
      { id: 'kr-1', layout: 'cover', image: imgKrissAi, bgColor: '#DBBCB1', objectPosition: 'center center' },
      { id: 'kr-2', layout: 'inset', image: imgKrissAi, bgColor: '#CFA99C', objectPosition: '45% 50%', scale: 0.78 },
      { id: 'kr-3', layout: 'typographic', image: imgKrissAi, bgColor: '#251D1A', accentColor: '#DBBCB1', badgeText: 'Kriss.ai' },
    ],
  },
  {
    slug: 'dumpling-fm',
    position: -150,
    featured: true,
    title: 'Aave',
    subtitle: 'Dumpling.FM',
    discipline: 'Website',
    date: '2024-11-13 00:00',
    year: '2024',
    shortYear: '24',
    backgroundColor: '#EEEEEE',
    primaryTextColor: '#1F1F1F',
    secondaryTextColor: '#999999',
    ctaColor: '#333333',
    heroImage: imgDumplingFm,
    services: ['Creative Direction', 'Art Direction', 'Design', 'Motion Design', '3D Design'],
    challenge:
      'Aave wanted to show what a user-owned music platform on Lens could look and feel like, before a single line of code existed. We had four weeks, so we skipped the intro and went straight to the chorus.',
    solution:
      'We took our cue from dusty vinyl stores. A 3D album carousel makes browsing feel like flipping through records, with the best of Web3 music in every crate.',
    indexAssetCount: 4,
    slides: [
      { id: 'dfm-1', layout: 'cover', image: imgDumplingFm, bgColor: '#DCDCDC', objectPosition: 'center center' },
      { id: 'dfm-2', layout: 'inset', image: imgDumplingFm, bgColor: '#1B1B1B', objectPosition: '50% 35%', scale: 0.78 },
      { id: 'dfm-3', layout: 'typographic', image: imgDumplingFm, bgColor: '#222222', accentColor: '#FFFFFF', badgeText: 'D.FM // KHZ 100.0' },
    ],
  },
  {
    slug: 'ooono',
    position: -120,
    featured: true,
    title: 'OOONO',
    subtitle: '1.0',
    discipline: 'Branding',
    date: '2024-09-03 00:00',
    year: '2024',
    shortYear: '24',
    backgroundColor: '#D3CFC7',
    primaryTextColor: '#1F1F1F',
    secondaryTextColor: '#898681',
    ctaColor: '#F26B17',
    heroImage: imgOoono,
    liveUrl: 'https://ooono.com',
    services: ['Creative Direction', 'Art Direction', 'Design', '3D'],
    challenge:
      'OOONO makes gadgets that get your eyes off your phone and back on the road. Ahead of the Co-Driver 2 launch, the brand had to be as distraction-free as the products.',
    solution:
      'We built a brand as calm and clear as the device, then took it for a test drive across billboards, social, packaging, the website and a full set of brand guidelines. Nothing competes for your eyes.',
    indexAssetCount: 4,
    slides: [
      { id: 'oo1-1', layout: 'cover', image: imgOoono, bgColor: '#D3CFC7', objectPosition: 'center center' },
      { id: 'oo1-2', layout: 'typographic', image: imgOoono, bgColor: '#F26B17', accentColor: '#FFFFFF', badgeText: 'OOONO CO-DRIVER' },
      { id: 'oo1-3', layout: 'inset', image: imgOoono, bgColor: '#C5C0B7', objectPosition: '50% 50%', scale: 0.76 },
    ],
  },
  {
    slug: 'augen',
    position: -20,
    featured: true,
    title: 'Augen Pro',
    subtitle: 'AI Wearables',
    discipline: 'Website',
    date: '2024-08-23 00:00',
    year: '2024',
    shortYear: '24',
    backgroundColor: '#1F1F1F',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#999999',
    ctaColor: '#0171E4',
    heroImage: imgAugen,
    services: ['Design', 'Motion', 'Development'],
    challenge:
      'Augen Pro builds AI-driven wearables and neural technology, the kind most people have only seen in sci-fi. The website had to feel like a glimpse of what comes next: beyond humanness, as Augen puts it.',
    solution:
      'We designed a web experience that feels like a lab report from the future. Ghostlike portraits, clinical white space and a slow scroll from light into dark let each product surface from the fog, one at a time.',
    indexAssetCount: 4,
    slides: [
      { id: 'aug-1', layout: 'cover', image: imgAugen, bgColor: '#1F1F1F', objectPosition: 'center center' },
      { id: 'aug-2', layout: 'inset', image: imgAugen, bgColor: '#11161D', objectPosition: '50% 30%', scale: 0.8 },
      { id: 'aug-3', layout: 'typographic', image: imgAugen, bgColor: '#0A192F', accentColor: '#0171E4', badgeText: 'AUGEN // NEURAL OS' },
    ],
  },
  {
    slug: 'ooono-v2',
    position: -170,
    featured: false,
    title: 'OOONO',
    subtitle: '2.0',
    discipline: 'ID & Website',
    date: '2024-05-09 00:00',
    year: '2024',
    shortYear: '24',
    backgroundColor: '#EAE8E3',
    primaryTextColor: '#1F1F1F',
    secondaryTextColor: '#898681',
    ctaColor: '#FC5220',
    heroImage: imgOoono,
    services: ['Concept', 'Art Direction', 'Branding', 'Packaging', 'Web Design'],
    challenge:
      'OOONO makes small devices that alert drivers to hazards ahead, so their eyes stay on the road. As the company grew, it wanted its brand to evolve into something bolder and more confident, impossible to miss from retail shelves to trade show floors.',
    solution:
      'We turned up the volume with bright orange and new logo lockups, then rolled the identity out everywhere: app icons, packaging, ads, retail booths, showroom installations and even rainwear. Product pages and brand guidelines keep the in-house team on course.',
    indexAssetCount: 4,
    slides: [
      { id: 'oo2-1', layout: 'typographic', image: imgOoono, bgColor: '#FC5220', accentColor: '#FFFFFF', badgeText: 'OOONO 2.0' },
      { id: 'oo2-2', layout: 'cover', image: imgOoono, bgColor: '#EAE8E3', objectPosition: '60% 45%' },
    ],
  },
  {
    slug: 'wrk',
    position: -10,
    featured: true,
    title: 'WRK',
    subtitle: 'Timepieces',
    discipline: 'Website',
    date: '2024-04-06 00:00',
    year: '2024',
    shortYear: '24',
    backgroundColor: '#EEEEEE',
    primaryTextColor: '#1F1F1F',
    secondaryTextColor: '#999999',
    ctaColor: '#FF6C02',
    heroImage: imgWrk,
    services: ['Concept', 'Art Direction', 'Design', '3D Design', 'Development'],
    challenge:
      "WRK's watchmakers assemble and calibrate every part by hand, and the ACF-01 took five years to get right. The web experience had to show the same care for craft, down to the smallest detail.",
    solution:
      'We built the site like a movement: every part considered, nothing extra. Close 3D renders, precise typography and quiet layouts tell the story of each timepiece, from materials and R&D to the wrist, with a simple way for collectors to register their interest.',
    indexAssetCount: 4,
    slides: [
      { id: 'wrk-1', layout: 'cover', image: imgWrk, bgColor: '#EEEEEE', objectPosition: 'center center' },
      { id: 'wrk-2', layout: 'inset', image: imgWrk, bgColor: '#DEDEDE', objectPosition: '50% 50%', scale: 0.78 },
      { id: 'wrk-3', layout: 'typographic', image: imgWrk, bgColor: '#1B1B1B', accentColor: '#FF6C02', badgeText: 'WRK // ACF-01 CALIBRE' },
    ],
  },
  {
    slug: 'calcutta',
    position: -130,
    featured: false,
    title: 'Calcutta',
    subtitle: 'App',
    discipline: 'Product',
    date: '2023-09-05 00:00',
    year: '2023',
    shortYear: '23',
    backgroundColor: '#F0EFED',
    primaryTextColor: '#1F1F1F',
    secondaryTextColor: '#666666',
    ctaColor: '#F85502',
    heroImage: imgMadklubben,
    services: ['Concept', 'Art Direction', 'Design'],
    challenge:
      'Calcutta lets friends put money on their round of golf, because nothing sharpens a short game like a little pressure. Starting from scratch, the brand had to feel like the clubhouse, not the casino.',
    solution:
      'We built the brand around the feel of the clubhouse and mapped out the key moments of the app. A tall wordmark on deep forest green keeps it classic, with a nod to the 19th hole.',
    indexAssetCount: 4,
    slides: [
      { id: 'cal-1', layout: 'typographic', image: imgMadklubben, bgColor: '#143124', accentColor: '#F0EFED', badgeText: 'CALCUTTA CLUBHOUSE' },
      { id: 'cal-2', layout: 'inset', image: imgDumplingFm, bgColor: '#1D3E2E', objectPosition: 'center center', scale: 0.75 },
    ],
  },
  {
    slug: 'dumpling-tv',
    position: -160,
    featured: false,
    title: 'Aave',
    subtitle: 'Dumpling.TV',
    discipline: 'Website',
    date: '2023-02-02 00:00',
    year: '2023',
    shortYear: '23',
    backgroundColor: '#EEEEEE',
    primaryTextColor: '#1F1F1F',
    secondaryTextColor: '#999999',
    ctaColor: '#F2D3F2',
    heroImage: imgDumplingFm,
    services: ['Concept', 'Creative Direction', 'Art Direction', 'Design', 'Motion'],
    challenge:
      'Most video platforms look like they came out of the same remote control. Aave wanted a home for user-owned video on Lens that felt more pirate radio than polished streaming service.',
    solution:
      "We brought back the TV guide. Channels, a remote and glitchy retro sets give creator content a playful, slightly rebellious home. Nobody asks if you're still watching.",
    indexAssetCount: 4,
    slides: [
      { id: 'dtv-1', layout: 'typographic', image: imgDumplingFm, bgColor: '#2B212B', accentColor: '#F2D3F2', badgeText: 'DUMPLING.TV // CH 01' },
      { id: 'dtv-2', layout: 'cover', image: imgDumplingFm, bgColor: '#1E1A1E', objectPosition: '50% 45%', filter: 'hue-rotate(280deg) contrast(1.06)' },
    ],
  },
  {
    slug: 'madklubben',
    position: -100,
    featured: true,
    title: 'Madklubben',
    subtitle: 'Restaurant Portal',
    discipline: 'Website',
    date: '2022-10-11 00:00',
    year: '2022',
    shortYear: '22',
    backgroundColor: '#C3C7A0',
    primaryTextColor: '#1F1F1F',
    secondaryTextColor: '#626450',
    ctaColor: '#000000',
    heroImage: imgMadklubben,
    liveUrl: 'https://madklubben.dk',
    services: ['Concept', 'Art Direction', 'Design'],
    challenge:
      'Madklubben runs more than 40 restaurants, each with its own personality. The website had to match the buzz of the dining rooms and still make booking a table quick.',
    solution:
      'We designed a web platform that gives every restaurant its own stage, with table booking, takeaway, gift cards and a job portal in one place. Bon appétit.',
    indexAssetCount: 4,
    slides: [
      { id: 'mk-1', layout: 'cover', image: imgMadklubben, bgColor: '#C3C7A0', objectPosition: 'center center' },
      { id: 'mk-2', layout: 'inset', image: imgMadklubben, bgColor: '#B5BA90', objectPosition: '40% 55%', scale: 0.78 },
      { id: 'mk-3', layout: 'typographic', image: imgMadklubben, bgColor: '#222418', accentColor: '#C3C7A0', badgeText: 'MADKLUBBEN // 40+ DINING ROOMS' },
    ],
  },
  {
    slug: 'gho',
    position: -90,
    featured: true,
    title: 'Aave',
    subtitle: 'GHO',
    discipline: 'Branding',
    date: '2022-09-01 00:00',
    year: '2022',
    shortYear: '22',
    backgroundColor: '#B3BCBF',
    primaryTextColor: '#1F1F1F',
    secondaryTextColor: '#6B7173',
    ctaColor: '#703FFF',
    heroImage: imgAaveGho,
    services: ['Concept', 'Art Direction', 'Design'],
    challenge:
      "Crypto is a loud room full of hype. Aave's new stablecoin, GHO, needed to earn trust in a market that rarely gives it.",
    solution:
      'We built the identity on transparency, honesty and security. A friendly G mark and a calm design system carry it everywhere, down to a see-through hoodie that says exactly what it means: 100% transparent.',
    indexAssetCount: 4,
    slides: [
      { id: 'gho-1', layout: 'cover', image: imgAaveGho, bgColor: '#B3BCBF', objectPosition: 'center center' },
      { id: 'gho-2', layout: 'typographic', image: imgAaveGho, bgColor: '#251C42', accentColor: '#B9A6FF', badgeText: 'GHO // 100% TRANSPARENT' },
      { id: 'gho-3', layout: 'inset', image: imgAaveGho, bgColor: '#9EA8AC', objectPosition: '50% 35%', scale: 0.78 },
    ],
  },
  {
    slug: 'espn-alcaraz',
    position: -50,
    featured: true,
    title: 'ESPN',
    subtitle: 'Alcaraz',
    discipline: 'Website',
    date: '2022-07-11 00:00',
    year: '2022',
    shortYear: '22',
    backgroundColor: '#032029',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#818F94',
    ctaColor: '#4F87EE',
    heroImage: imgEspnAlcaraz,
    services: ['Concept', 'Art Direction', 'Design', '3D Design'],
    challenge:
      'At 20, Carlos Alcaraz was already being compared to Nadal, Djokovic and Federer. ESPN needed to show fans why, beyond the highlight reel.',
    solution:
      'We built a web experience that breaks down his arsenal shot by shot, with 3D assets, bold illustration and big editorial type. The technique and strategy behind the rise, served fast.',
    indexAssetCount: 4,
    slides: [
      { id: 'alc-1', layout: 'cover', image: imgEspnAlcaraz, bgColor: '#032029', objectPosition: 'center center' },
      { id: 'alc-2', layout: 'inset', image: imgEspnAlcaraz, bgColor: '#02171E', objectPosition: '55% 35%', scale: 0.8 },
      { id: 'alc-3', layout: 'typographic', image: imgEspnAlcaraz, bgColor: '#072B38', accentColor: '#4F87EE', badgeText: 'ALCARAZ // SHOT ARSENAL' },
    ],
  },
  {
    slug: 'espn-ovechkin-800',
    position: -60,
    featured: true,
    title: 'ESPN',
    subtitle: 'Ovechkin 800',
    discipline: 'Website',
    date: '2022-03-01 00:00',
    year: '2022',
    shortYear: '22',
    backgroundColor: '#1F2330',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#8F9197',
    ctaColor: '#E10523',
    heroImage: imgEspnOvechkin,
    services: ['Concept', 'Art Direction', 'Design'],
    challenge:
      "Only three players in NHL history have scored 800 goals. ESPN wanted fans to explore Alexander Ovechkin's career, not just scroll past it.",
    solution:
      'We built an interactive documentary with deep dives, live statistics and a custom timeline. Fans jump between chapters at their own pace, from his scoring techniques to the teammates and rivals along the way.',
    indexAssetCount: 4,
    slides: [
      { id: 'ovi-1', layout: 'cover', image: imgEspnOvechkin, bgColor: '#1F2330', objectPosition: 'center center' },
      { id: 'ovi-2', layout: 'typographic', image: imgEspnOvechkin, bgColor: '#2B0B11', accentColor: '#E10523', badgeText: 'OVECHKIN // 800 GOALS' },
      { id: 'ovi-3', layout: 'inset', image: imgEspnOvechkin, bgColor: '#161924', objectPosition: '50% 40%', scale: 0.78 },
    ],
  },
  {
    slug: 'espn-year-in-review-2022',
    position: -70,
    featured: false,
    title: 'ESPN',
    subtitle: 'Year In Review',
    discipline: 'Website',
    date: '2022-02-01 00:00',
    year: '2022',
    shortYear: '22',
    backgroundColor: '#FFFFFF',
    primaryTextColor: '#1F1F1F',
    secondaryTextColor: '#666666',
    ctaColor: '#EB3347',
    heroImage: imgEspnOvechkin,
    services: ['Concept', 'Art Direction', 'Design'],
    challenge:
      'A year of sports holds thousands of moments. ESPN needed a way to relive 2022 that felt like a story, not a list.',
    solution:
      'We designed a scrapbook of a web experience, from January to December. Photography, video, trivia and a few surprises bring back the highs and the heartbreaks of the year.',
    indexAssetCount: 4,
    slides: [
      { id: 'yir-1', layout: 'typographic', image: imgEspnOvechkin, bgColor: '#2A1216', accentColor: '#EB3347', badgeText: 'ESPN // 2022 IN REVIEW' },
      { id: 'yir-2', layout: 'split', image: imgEspnAlcaraz, secondaryImage: imgEspnOvechkin, bgColor: '#1A1E28' },
    ],
  },
  {
    slug: 'everbloom',
    position: -80,
    featured: false,
    title: 'Everbloom',
    subtitle: 'The Ever Grid',
    discipline: 'Branding',
    date: '2022-01-01 00:00',
    year: '2022',
    shortYear: '22',
    backgroundColor: '#1F1F1F',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#999999',
    ctaColor: '#03C967',
    heroImage: imgAaveGho,
    services: ['Concept', 'Art Direction', 'Design', 'Motion'],
    challenge:
      'Everbloom helps creators turn passion and self-expression into opportunity. Its brand had to keep growing with its community without losing its shape.',
    solution:
      'We created the EverGrid: an open-ended creative framework that gives the identity structure and room to evolve. Built to last forever, ever, ever.',
    indexAssetCount: 4,
    slides: [
      { id: 'ev-1', layout: 'typographic', image: imgAaveGho, bgColor: '#0F261B', accentColor: '#03C967', badgeText: 'EVERBLOOM // EVERGRID' },
      { id: 'ev-2', layout: 'inset', image: imgAugen, bgColor: '#181818', objectPosition: 'center center', scale: 0.76 },
    ],
  },
];

/**
 * Exact 11 Featured Projects in Latest showcase order (sorted ascending by Storyblok position).
 */
export const FEATURED_PROJECTS: ProjectData[] = [...ALL_PROJECTS]
  .filter((p) => p.featured)
  .sort((a, b) => a.position - b.position);

/**
 * Exact 16 Projects in Index archive order (sorted descending by date: '26 -> '25 -> '24 -> '23 -> '22).
 */
export const ARCHIVE_PROJECTS: ProjectData[] = [...ALL_PROJECTS].sort((a, b) =>
  b.date.localeCompare(a.date)
);

/**
 * Builds the authentic multi-card Index archive series (1.0, 2.0, 3.0...) for every project
 * in chronological archive order. Mixes crisp photographic crops, inset frames, and
 * brand-system specimen tiles matching 28k.studio/work?view=index.
 */
export const INDEX_ARCHIVE_ASSETS: IndexArchiveAsset[] = ARCHIVE_PROJECTS.flatMap(
  (project) => {
    const count = project.indexAssetCount;
    const positions = [
      '50% 50%',
      '30% 35%',
      '72% 40%',
      '50% 70%',
      '20% 60%',
      '80% 55%',
      '45% 25%',
      '60% 65%',
    ];

    return Array.from({ length: count }, (_, idx): IndexArchiveAsset => {
      const indexNumber = `${idx + 1}.0`;
      const isBrandTile = idx === 1 || idx === 5;
      const isInset = idx === 2 || idx === 6;

      let tileBg = project.backgroundColor;
      let tileText = project.primaryTextColor;
      if (project.slug === 'on-energy' && idx === 1) {
        tileBg = '#444112';
        tileText = '#111111';
      } else if (project.slug === 'hut-8' && idx === 1) {
        tileBg = '#283609';
        tileText = '#B4FE00';
      } else if (isBrandTile) {
        tileBg = project.ctaColor === '#000000' ? '#24251D' : project.backgroundColor;
      }

      return {
        id: `${project.slug}-${idx + 1}`,
        projectSlug: project.slug,
        projectTitle: project.title,
        shortYear: project.shortYear,
        indexNumber,
        isFirstOfProject: idx === 0,
        image: project.heroImage,
        variant: isBrandTile ? 'brand-tile' : isInset ? 'inset' : 'cover',
        bgColor: tileBg,
        accentColor: project.ctaColor,
        textColor: tileText,
        objectPosition: positions[idx % positions.length],
        filter:
          idx === 3
            ? 'contrast(1.08) brightness(0.92)'
            : idx === 4
              ? 'saturate(0.85) contrast(1.05)'
              : undefined,
        markText: project.title,
        markSubtext: project.subtitle,
      };
    });
  }
);

export const CONTACT_CONTENT = {
  title: 'Contact',
  copy: 'Got a project, a question or just want to say hi? Pick an inbox below and we’ll get back to you.',
  inboxes: [
    {
      id: 'general',
      title: 'Reach out',
      label: 'GENERAL',
      email: 'hi@28K.studio',
    },
    {
      id: 'projects',
      title: 'Work with us',
      label: 'PROJECTS',
      email: 'biz@28K.studio',
    },
    {
      id: 'press',
      title: 'Get the scoop',
      label: 'PRESS',
      email: 'hi@28K.studio',
    },
  ],
  socials: [
    { label: 'Linkedin', url: 'https://www.linkedin.com/company/studio28k/' },
    { label: 'Instagram', url: 'https://www.instagram.com/28kstudio/' },
    { label: 'Medium', url: 'https://medium.com/@28Kstudio' },
    { label: 'Behance', url: 'https://www.behance.net/28k-studio' },
  ],
  address: [
    '28K APS',
    'ESROMGADE 15, 2.2210',
    '2200 COPENHAGEN N',
    'DENMARK',
  ],
};

export const STUDIO_CONTENT = {
  title: 'Studio',
  lead: 'Driven by the idea that life is only about 28,000 days long, we work with teams and talent across the globe to make memorable brands, products and experiences that push the possibilities of design, technology and storytelling.',
  heroImage: imgWrk,
  stats: [
    { label: 'FOUNDED', value: '2022' },
    { label: 'AVG. HUMAN LIFESPAN', value: '28K' },
    { label: 'OFFICES', value: '02' },
    { label: 'GLOBAL AWARDS', value: '34+' },
  ],
  capabilities: [
    {
      category: 'BRAND',
      items: [
        'BRAND STRATEGY',
        'VISUAL IDENTITY',
        'VERBAL IDENTITY',
        'ART DIRECTION',
        '3D & MOTION SYSTEMS',
        'BRAND GUIDELINES',
      ],
    },
    {
      category: 'DIGITAL',
      items: [
        'WEBSITES & PLATFORMS',
        'DIGITAL PRODUCTS',
        'DESIGN SYSTEMS',
        'CREATIVE DEVELOPMENT',
        'WEBGL & INTERACTIVE 3D',
        'PROTOTYPING',
      ],
    },
  ],
  recognitions: [
    { date: '2025', platform: 'AWWWARDS', title: 'SITE OF THE DAY — HUT 8 INFRASTRUCTURE' },
    { date: '2024', platform: 'FWA', title: 'FWA OF THE DAY — AAVE DUMPLING.FM' },
    { date: '2024', platform: 'AWWWARDS', title: 'SITE OF THE DAY — WRK TIMEPIECES' },
    { date: '2023', platform: 'WEBBY AWARDS', title: 'BEST EDITORIAL EXPERIENCE — ESPN OVECHKIN 800' },
    { date: '2022', platform: 'RED DOT', title: 'BRAND & COMMUNICATION DESIGN — OOONO' },
  ],
};

export const METHODS_CONTENT = {
  title: 'Methods',
  lead: "Our methods matter as much as the result. Missed deadlines, surprise reveals and crowded meetings cost you time you don't get back, however good the final work is. So we've refined how we work: tailored plans, open communication, senior teams and founders close to the work.",
  heroImage: imgAugen,
  principles: [
    {
      number: '01',
      title: 'No Big Reveals',
      subtitle: 'Open workstreams from day one',
      copy: 'We share progress early and often in shared channels. Instead of vanishing for weeks and staging theatrical presentations, you see decisions take shape in real time.',
    },
    {
      number: '02',
      title: 'Senior Hands Only',
      subtitle: 'Small, sharp teams',
      copy: 'Every project is led and executed directly by senior designers, directors and engineers—never handed down a chain of account managers after the pitch.',
    },
    {
      number: '03',
      title: 'Tailored Cadence',
      subtitle: 'Built around your launch',
      copy: 'Whether sprinting in four weeks to prove a new product vision or building an institutional identity over six months, we structure milestones around real business moments.',
    },
    {
      number: '04',
      title: 'Craft Through Code',
      subtitle: 'Design & engineering under one roof',
      copy: 'Motion, typography and interaction are prototyped in the browser early, ensuring what ships feels every bit as considered as what was designed.',
    },
  ],
};
