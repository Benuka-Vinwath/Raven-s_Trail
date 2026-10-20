// Unsplash photo ids (free to hotlink). Trails without an entry fall back to the hero photo.
export const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

const HERO = "1476362555312-ab9e108a0b7e";

const BY_SLUG: Record<string, string> = {
  "ella-rock": "1580635849305-4399d586ac5c",
  "little-adams-peak": "1613693687360-8b0d54705746",
  "adams-peak": "1603731510149-3cdcd45927a5",
  "worlds-end": "1729196014295-fdc3d621f967",
  "knuckles-range": "1573912863588-57d033d1b4bb",
  "pidurangala-rock": "1760020052045-d1ab1631b3a1",
  "bambarakanda-falls": "1609681980718-340e7f4b11d7",
  "riverston-mini-worlds-end": "1585171095587-208afbf98724",
  "liptons-seat": "1641149750086-b11cd21d1f60",
  "moulawella-peak-sinharaja": "1710028267907-65696d606b18",
};

// Real photos of the specific place, from Wikimedia Commons (free licences that require crediting the photographer).
const COMMONS: Record<string, { file: string; credit: string }> = {
  "sigiriya-rock": { file: "Sigiriya_(141688197).jpeg", credit: "Wrobell, CC BY-SA 3.0" },
  mihintale: { file: "Mihintale_Rock.jpg", credit: "Dennis Sylvester Hurd, CC0" },
  "dunhinda-falls": { file: "Dunhinda.jpg", credit: "Srlnkn, public domain" },
  "namunukula-peak": { file: "Namunukula.jpg", credit: "Chamara Ratnaweera, public domain" },
  "narangala-mountain": { file: "Hikers_in_Narangala_Sri_Lanka.jpg", credit: "Ahamed rasheed, CC BY-SA 4.0" },
  "diyaluma-falls": { file: "Diyaluma_Falls_1.jpg", credit: "Travel Local, CC BY 2.0" },
  kirigalpotta: { file: "Kirigalpoththa-SriLanka-April2010.JPG", credit: "Rehman Abubakr, CC BY-SA 4.0" },
  "totapola-kanda": { file: "Thotupola_kanda_1.JPG", credit: "Buddhika Mawella, CC BY 3.0" },
  "bible-rock": { file: "Bathalegala.jpg", credit: "Ireshwikis, CC BY-SA 3.0" },
  "lakegala-meemure": { file: "Lakegala1.JPG", credit: "Astronomyinertia, CC BY-SA 3.0" },
  "ravana-ella-cave": { file: "SL_Ella_asv2020-01_img01_Ravana_Falls.jpg", credit: "A.Savin, Free Art License" },
  "nine-arch-bridge": { file: "The_Nine_Arches_Bridge.jpg", credit: "MichaelJames2468, CC BY-SA 4.0" },
  "ambuluwawa-tower": { file: "Ambuluwawa_Tower,_Sri_Lanka.jpg", credit: "Kaushiru90, CC BY-SA 4.0" },
  "lovers-leap-falls": { file: "Lover’s_leap.jpg", credit: "DaemonX, CC BY-SA 4.0" },
  "single-tree-hill": { file: "Single_tree_hill.jpg", credit: "Dulmini Balasooriya, CC BY-SA 4.0" },
  "hanthana-range": { file: "Hanthana_range.JPG", credit: "Astronomyinertia, CC BY-SA 3.0" },
  "pekoe-trail-stage-1": { file: "Hanthana_Mountain_1.jpg", credit: "Dihan.keeriyawatta, CC BY-SA 4.0" },
  "pekoe-trail-stage-13": { file: "Haputale,_Sri_Lanka,_Tea_plantations_and_tropical_trees.jpg", credit: "Vyacheslav Argenberg, CC BY 4.0" },
  hawagala: { file: "Hawagala.jpg", credit: "Dhanushkad, CC BY-SA 4.0" },
  kabaragala: { file: "Kabaragala_rock.jpg", credit: "KR Frontliner 654321, CC BY-SA 4.0" },
  rakshagala: { file: "Rakshagala_mountain,_Dolosbage,_Srilanka.jpg", credit: "Sanduni Dissanayake, CC BY-SA 4.0" },
  alagalla: { file: "A_view_from_Alagalla_Mountain_Range.jpg", credit: "Icaptures84, CC BY-SA 4.0" },
  "haritha-kanda": { file: "Haritha_kanda_at_Sri_lanka_IMG_0257.jpg", credit: "ChamiMonster, CC BY-SA 4.0" },
  uthuwankanda: { file: "Utuwankanda.jpg", credit: "Milan.Shashintha, CC BY-SA 4.0" },
  "yapahuwa-rock": { file: "Yapahuwa_Staricase_2_cdm.jpg", credit: "Chindemaya, public domain" },
  "adara-kanda": { file: "Adara_kanda_pic1.jpg", credit: "Sajithsameera, CC BY-SA 4.0" },
  "galboda-falls": { file: "Galboda_Waterfalls.jpg", credit: "Gajapera, CC BY-SA 4.0" },
  "dambulla-cave-temple": { file: "Dambulla-buddhastupa.jpg", credit: "Lankapic, CC BY 2.5" },
  "pekoe-trail-stage-9": { file: "Hill_camper.jpg", credit: "Dilankavs, CC BY-SA 4.0" },
  "pekoe-trail-stage-15": { file: "Ella_Gap_(Valley),_Sri_Lanka.jpg", credit: "Vyacheslav Argenberg, CC BY 4.0" },
};

const PAGE = {
  trails: "1573912863588-57d033d1b4bb",
  rentals: "1628087236671-6730a5b9d79a",
  parking: "1544039161-b0c20826c6f6",
  budget: "1641149750086-b11cd21d1f60",
  weather: "1603731510149-3cdcd45927a5",
  community: "1667617139130-1c161474b680",
  profile: "1705730631841-5c02db0885ed",
  notFound: HERO,
};
export const pagePhoto = (page: keyof typeof PAGE, w = 1800) => photo(PAGE[page], w);

export const heroPhoto = (w = 2000) => photo(HERO, w);
export const trailPhoto = (slug: string, w = 900) =>
  COMMONS[slug]
    ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(COMMONS[slug].file)}?width=${w}`
    : photo(BY_SLUG[slug] ?? HERO, w);

export const trailPhotoCredit = (slug: string) => COMMONS[slug]?.credit;

export const GALLERY = [
  { id: "1641149750086-b11cd21d1f60", caption: "Tea country at first light" },
  { id: "1573912863588-57d033d1b4bb", caption: "Cloud-draped ridgelines" },
  { id: "1705730631841-5c02db0885ed", caption: "Summit rock above the clouds" },
  { id: "1544039161-b0c20826c6f6", caption: "Fog on the forest path" },
  { id: "1609681980718-340e7f4b11d7", caption: "Waterfall valleys" },
  { id: "1628087236671-6730a5b9d79a", caption: "Camp beneath the peaks" },
  { id: "1667617139130-1c161474b680", caption: "Pack on, eyes up" },
];
