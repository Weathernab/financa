const EUR = new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR" });
const NUMBER = new Intl.NumberFormat("sl-SI", { maximumFractionDigits: 1 });
const STORAGE_KEY = "osebni-financni-dashboard-v1";
const PROFILE_REGISTRY_KEY = "financa-profili-v1";
const PROFILE_SESSION_KEY = "financa-aktivni-profil-v1";
const PROFILE_CREDENTIAL_SESSION_KEY = "financa-prijava-hash-v1";
const PROFILE_DATA_PREFIX = `${STORAGE_KEY}:profil:`;
const BACKEND_CONFIG_KEY = "financa-google-backend-v1";
const DEFAULT_CLOUD_ENDPOINT = "";

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const pad = (value) => String(value).padStart(2, "0");
const iso = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

const incomeCategories = ["plača", "nadure", "študentsko delo", "povračilo stroškov", "prodaja stvari", "dividende", "obresti", "prihodki", "interni transfer", "za pregled", "drugo"];
const expenseCategories = ["stanovanje", "hrana", "gorivo", "avto", "zavarovanja", "telefon", "šport", "oblačila", "prosti čas", "naročnine", "restavracije/kava", "potovanja", "darila", "zdravje", "orodje/oprema", "davki", "gotovina", "investicije", "spletni nakupi", "bančni stroški", "interni transfer", "za pregled", "drugo"];
const importCategories = [...new Set([...expenseCategories, ...incomeCategories, "transfer"])];
const confidenceLevels = { high: "Visoko zaupanje", medium: "Srednje zaupanje", low: "Nizko zaupanje", manual: "Ročno potrjeno" };
const accountTypes = ["glavni bančni račun", "Revolut", "gotovina", "varčevalni račun", "IBKR", "crypto", "vozilo", "drugo"];
const investmentTypes = ["ETF", "delnice", "crypto", "obveznice", "cash", "drugo"];
const liabilityStatuses = ["odprto", "delno plačano", "plačano", "preklicano"];
const liabilityCategories = ["davki", "dolg", "nakup", "servis", "zavarovanje", "drugo"];
const taxTypes = ["dohodnina", "kapitalski dobički", "dividende", "obresti", "drugo"];
const taxStatuses = ["treba oddati", "oddano", "treba plačati", "plačano", "pozabljeno / za preveriti"];
const priorities = ["visoka", "srednja", "nizka"];
const setupAssets = [
  ["banka", "Banka / glavni račun", "glavni bančni račun"],
  ["revolut", "Revolut", "Revolut"],
  ["gotovina", "Gotovina", "gotovina"],
  ["varcevalni", "Varčevalni račun", "varčevalni račun"],
  ["ibkr", "IBKR", "IBKR"],
  ["crypto", "Crypto", "crypto"],
  ["nepremicnine", "Nepremičnine", "drugo"],
  ["drugo_premozenje", "Drugo premoženje", "drugo"],
];
const setupDebts = [
  ["davki", "Davki", "davki"],
  ["dolgovi", "Dolgovi", "dolg"],
  ["kredit", "Kredit", "dolg"],
  ["leasing", "Leasing", "dolg"],
  ["kreditne_kartice", "Kreditne kartice", "dolg"],
  ["vecja_placila", "Večja prihajajoča plačila", "nakup"],
  ["servisi", "Servisi", "servis"],
  ["zavarovanja", "Zavarovanja za plačilo", "zavarovanje"],
  ["drugo_obveznosti", "Druge obveznosti", "drugo"],
];

const fields = {
  incomes: [
    ["date", "date", "Datum"],
    ["name", "text", "Naziv"],
    ["amount", "number", "Znesek"],
    ["category", "select", "Kategorija", incomeCategories],
    ["source", "text", "Vir"],
    ["account", "account-select", "Račun"],
    ["note", "textarea", "Opomba"],
  ],
  expenses: [
    ["date", "date", "Datum"],
    ["name", "text", "Naziv"],
    ["amount", "number", "Znesek"],
    ["category", "select", "Kategorija", expenseCategories],
    ["subcategory", "text", "Podkategorija"],
    ["account", "account-select", "Račun"],
    ["kind", "select", "Vrsta", ["fiksen", "variabilen", "enkratni večji"]],
    ["note", "textarea", "Opomba"],
  ],
  transactions: [
    ["date", "date", "Datum"],
    ["description", "text", "Opis"],
    ["amount", "number", "Znesek"],
    ["currency", "text", "Valuta"],
    ["category", "select", "Kategorija", importCategories],
    ["subcategory", "text", "Podkategorija"],
    ["account", "account-select", "Račun"],
    ["type", "select", "Tip", ["prihodek", "strošek", "interni transfer", "za pregled"]],
    ["status", "select", "Status", ["pripravljeno", "za pregled", "interni transfer", "možen dvojnik", "nepopolno"]],
    ["note", "textarea", "Opomba"],
  ],
  accounts: [
    ["name", "text", "Naziv"],
    ["balance", "number", "Trenutno stanje"],
    ["type", "select", "Vrsta računa", accountTypes],
    ["note", "textarea", "Opomba"],
  ],
  investments: [
    ["date", "date", "Datum nakupa/vnosa"],
    ["name", "text", "Naziv"],
    ["ticker", "text", "Ticker ali oznaka"],
    ["type", "select", "Vrsta", investmentTypes],
    ["quantity", "number", "Količina"],
    ["averagePrice", "number", "Povprečna nakupna cena"],
    ["currentValue", "number", "Trenutna vrednost"],
    ["addedThisMonth", "number", "Dodano ta mesec"],
    ["note", "textarea", "Opomba"],
  ],
  liabilities: [
    ["name", "text", "Naziv"],
    ["amount", "number", "Znesek"],
    ["dueDate", "date", "Rok plačila"],
    ["status", "select", "Status", liabilityStatuses],
    ["category", "select", "Kategorija", liabilityCategories],
    ["note", "textarea", "Opomba"],
  ],
  taxes: [
    ["date", "date", "Datum"],
    ["name", "text", "Naziv"],
    ["type", "select", "Vrsta davka", taxTypes],
    ["amount", "number", "Znesek"],
    ["status", "select", "Status", taxStatuses],
    ["dueDate", "date", "Rok"],
    ["note", "textarea", "Opomba"],
  ],
  goals: [
    ["name", "text", "Naziv"],
    ["targetAmount", "number", "Ciljni znesek"],
    ["currentAmount", "number", "Trenutni znesek"],
    ["dueDate", "date", "Rok"],
    ["priority", "select", "Prioriteta", priorities],
    ["note", "textarea", "Opomba"],
  ],
  snapshots: [
    ["month", "number", "Mesec"],
    ["year", "number", "Leto"],
    ["assets", "number", "Skupna sredstva"],
    ["liabilities", "number", "Skupne obveznosti"],
    ["netWorth", "number", "Net worth"],
    ["note", "textarea", "Opomba"],
  ],
  monthlyNotes: [
    ["month", "number", "Mesec"],
    ["year", "number", "Leto"],
    ["good", "textarea", "Kaj je šlo dobro"],
    ["bad", "textarea", "Kaj je šlo slabo"],
    ["next", "textarea", "Kaj popraviti naslednji mesec"],
  ],
  categoryRules: [
    ["keyword", "text", "Ključna beseda"],
    ["category", "select", "Kategorija", importCategories],
    ["subcategory", "text", "Podkategorija"],
    ["appliesTo", "select", "Velja za", ["stroški", "prihodki", "oboje"]],
    ["createdAt", "date", "Datum nastanka"],
  ],
};

const seedData = {
  settings: {
    currency: "EUR",
    startMonth: `${currentYear}-${pad(currentMonth)}`,
    theme: "dark",
    designVersion: 2,
    roundUpBankExpenses: false,
    roundUpSavingsAccountId: "",
  },
  incomes: [
    { id: crypto.randomUUID(), date: iso(currentYear, currentMonth, 5), name: "Plača", amount: 2100, category: "plača", source: "Zaposlitev", note: "Začetni seed podatek" },
  ],
  expenses: [
    { id: crypto.randomUUID(), date: iso(currentYear, currentMonth, 8), name: "Gorivo", amount: 120, category: "gorivo", subcategory: "avto", account: "Glavni bančni račun", kind: "variabilen", note: "" },
    { id: crypto.randomUUID(), date: iso(currentYear, currentMonth, 12), name: "Zavarovanje avta", amount: 73.5, category: "zavarovanja", subcategory: "avto", account: "Glavni bančni račun", kind: "fiksen", note: "" },
  ],
  transactions: [],
  accounts: [
    { id: crypto.randomUUID(), name: "Banka", balance: 2700, type: "glavni bančni račun", note: "" },
    { id: crypto.randomUUID(), name: "Gotovina", balance: 500, type: "gotovina", note: "" },
    { id: crypto.randomUUID(), name: "IBKR", balance: 3236, type: "IBKR", note: "" },
    { id: crypto.randomUUID(), name: "Crypto", balance: 535, type: "crypto", note: "" },
  ],
  investments: [
    { id: crypto.randomUUID(), date: iso(currentYear, currentMonth, 3), name: "IBKR portfelj", ticker: "ETF mix", type: "ETF", quantity: 1, averagePrice: 3000, currentValue: 3236, addedThisMonth: 250, note: "" },
    { id: crypto.randomUUID(), date: iso(currentYear, currentMonth, 4), name: "Crypto portfelj", ticker: "BTC/ETH", type: "crypto", quantity: 1, averagePrice: 500, currentValue: 535, addedThisMonth: 0, note: "" },
  ],
  liabilities: [
    { id: crypto.randomUUID(), name: "Davki", amount: 4000, dueDate: iso(currentYear, currentMonth, 25), status: "odprto", category: "davki", note: "Večja obveznost" },
  ],
  taxes: [
    { id: crypto.randomUUID(), date: iso(currentYear, currentMonth, 1), name: "Letna davčna evidenca", type: "dohodnina", amount: 4000, status: "treba plačati", dueDate: iso(currentYear, currentMonth, 25), note: "" },
  ],
  goals: [
    { id: crypto.randomUUID(), name: "Emergency fund", targetAmount: 6000, currentAmount: 1700, dueDate: iso(currentYear, 12, 31), priority: "visoka", note: "" },
    { id: crypto.randomUUID(), name: "Investicijski cilj", targetAmount: 10000, currentAmount: 3236, dueDate: iso(currentYear + 1, 6, 30), priority: "srednja", note: "" },
  ],
  snapshots: [],
  monthlyNotes: [
    { id: crypto.randomUUID(), month: currentMonth, year: currentYear, good: "Začetni pregled je postavljen.", bad: "Podatki so še testni.", next: "Zamenjaj seed podatke z realnimi vnosi." },
  ],
  importHistory: [],
  categoryRules: [],
};

const navItems = [
  ["dashboard", "Dashboard", "Mesečni pregled glavnih številk"],
  ["transactions", "Transakcije", "Uvožene transakcije in pregled"],
  ["incomes", "Prihodki", "Vnos in filtriranje prihodkov"],
  ["expenses", "Stroški", "Fiksni, variabilni in večji stroški"],
  ["accounts", "Računi", "Denarnice in sredstva"],
  ["investments", "Investicije", "Ročna evidenca portfelja"],
  ["networth", "Net worth", "Sredstva minus obveznosti"],
  ["liabilities", "Obveznosti", "Roki in večja plačila"],
  ["taxes", "Davki", "Evidenca davčnih dogodkov"],
  ["goals", "Cilji", "Napredek finančnih ciljev"],
  ["monthly", "Mesečni pregled", "Kaj se je zgodilo ta mesec"],
  ["analytics", "Analitika", "Preprosti trendi in razdelitve"],
  ["imports", "Uvoz podatkov", "Revolut CSV uvoz transakcij"],
  ["setup", "Setup", "Vodeni popis premoženja in dolgov"],
  ["settings", "Nastavitve", "Uvoz, izvoz in tema"],
];

const navGroups = [
  { title: "Pregled", items: ["dashboard", "transactions", "monthly", "analytics"] },
  { title: "Evidence", items: ["incomes", "expenses", "accounts", "investments", "networth"] },
  { title: "Načrtovanje", items: ["liabilities", "taxes", "goals"] },
  { title: "Podatki", items: ["imports", "settings"] },
];

const navIcons = {
  dashboard: icon("grid"),
  transactions: icon("receipt"),
  incomes: icon("arrowUp"),
  expenses: icon("arrowDown"),
  accounts: icon("wallet"),
  investments: icon("trend"),
  networth: icon("chart"),
  liabilities: icon("calendar"),
  taxes: icon("file"),
  goals: icon("target"),
  monthly: icon("calendarCheck"),
  analytics: icon("bars"),
  imports: icon("upload"),
  setup: icon("sliders"),
  settings: icon("settings"),
};

const dashboardNavTargets = {
  "Prihodki": "incomes",
  "Stroški": "expenses",
  "Prihranek": "monthly",
  "Investirano": "investments",
  "Net worth": "networth",
  "Obveznosti": "liabilities",
};

function icon(name) {
  const paths = {
    grid: `<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>`,
    receipt: `<path d="M6 3h12v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21V3z"/><path d="M9 8h6M9 12h6M9 16h4"/>`,
    arrowUp: `<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/><path d="M5 19h14"/>`,
    arrowDown: `<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/><path d="M5 5h14"/>`,
    wallet: `<path d="M4 7h16v12H4z"/><path d="M4 9l4-4h10v4"/><path d="M16 13h4"/>`,
    trend: `<path d="M4 17l5-5 4 3 7-8"/><path d="M16 7h4v4"/>`,
    chart: `<path d="M5 19V5"/><path d="M5 19h14"/><path d="M8 15l3-4 3 2 4-6"/>`,
    calendar: `<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>`,
    file: `<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>`,
    target: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>`,
    calendarCheck: `<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M8 15l2 2 5-5"/>`,
    bars: `<path d="M5 19V5"/><path d="M5 19h15"/><rect x="8" y="12" width="2.8" height="5"/><rect x="13" y="8" width="2.8" height="9"/><rect x="18" y="4" width="2.8" height="13"/>`,
    upload: `<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M5 16v4h14v-4"/>`,
    logout: `<path d="M10 5H5v14h5"/><path d="M14 8l4 4-4 4"/><path d="M8 12h10"/>`,
    sliders: `<path d="M5 7h14M5 17h14"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>`,
    settings: `<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.9-1.1L14.3 3h-4.6L9.4 5.9A7 7 0 0 0 7.5 7l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.1l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.9 1.1l.3 2.9h4.6l.3-2.9a7 7 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1.1z"/>`,
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

const metricIcons = {
  Prihodki: "PR",
  Stroški: "ST",
  Prihranek: "PI",
  Investirano: "IN",
  "Net worth": "NW",
  Obveznosti: "OB",
};

const profileSystem = await initializeProfileSystem();
let profiles = profileSystem.profiles;
let currentProfile = profileSystem.currentProfile;
let state = currentProfile ? loadState() : emptyState({ setupCompleted: false });
let backendConfig = loadBackendConfig();
let active = currentProfile ? (state.settings.setupCompleted ? "dashboard" : "setup") : "login";
let modal = null;
let authMessage = "";
let loginPending = false;
let sessionCredentialHash = sessionStorage.getItem(PROFILE_CREDENTIAL_SESSION_KEY) || "";
let importDraft = null;
let importFilter = "all";
let filters = { month: currentMonth, year: currentYear, category: "", source: "", account: "" };
let cloudReady = false;
let cloudSaveTimer = null;
let cloudSyncInFlight = false;
let cloudAutoSyncPaused = false;
let cloudPendingSave = false;
let cloudStatus = { state: "local", message: "Podatki so shranjeni lokalno." };
let lastCloudPayload = "";
let deferredInstallPrompt = null;

const requestedView = new URLSearchParams(location.search).get("view");
if (currentProfile && navItems.some(([id]) => id === requestedView)) {
  active = requestedView;
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (active === "settings") render();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (active === "settings") render();
});

window.addEventListener("offline", () => {
  if (!currentProfile) return;
  cloudStatus = { state: "local", message: "Brez povezave. Spremembe so varno shranjene na tej napravi." };
  render();
});

window.addEventListener("online", () => {
  if (!currentProfile) return;
  cloudAutoSyncPaused = false;
  cloudStatus = { state: "pending", message: "Povezava je obnovljena. Sinhroniziram spremembe ..." };
  render();
  queueCloudSave();
});

async function hashProfileKey(value) {
  const bytes = new TextEncoder().encode(`financa:v1:${String(value || "")}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function profileStorageKey(profileId = currentProfile?.id) {
  return `${PROFILE_DATA_PREFIX}${profileId}`;
}

function createProfileId(name = "") {
  const base = normalizeText(name)
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "user";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function cleanProfileId(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
}

function isValidProfileId(value) {
  const id = cleanProfileId(value);
  return Boolean(id && id.length <= 80);
}

function normalizeProfile(profile, fallbackHash = "") {
  if (!profile || typeof profile !== "object") return null;
  let id = cleanProfileId(profile.id || profile.profileId || "");
  if (!isValidProfileId(id)) id = createProfileId(profile.name || "uporabnik");
  return {
    ...profile,
    id,
    keyHash: profile.keyHash || fallbackHash,
    active: profile.active !== false,
  };
}

function normalizedProfilesForSync() {
  const seen = new Set();
  const cleaned = [];
  for (const profile of profiles || []) {
    let next = normalizeProfile(profile);
    if (!next) {
      const name = String(profile?.name || "Uporabnik").trim();
      next = normalizeProfile({ ...profile, id: createProfileId(name), name });
    }
    if (next && !isValidProfileId(next.id)) {
      next = { ...next, id: createProfileId(next.name || "uporabnik") };
    }
    if (!next || seen.has(next.id)) continue;
    seen.add(next.id);
    cleaned.push(next);
  }
  const adminSource = profiles.find((profile) => profile.role === "admin") || currentProfile;
  const adminHash = adminSource?.keyHash || profiles.find((profile) => profile.id === "admin")?.keyHash || "";
  const admin = {
    ...adminSource,
    id: "admin",
    name: adminSource?.name || "Skrbnik",
    role: "admin",
    keyHash: adminHash,
    active: true,
  };
  const withoutDuplicateAdmin = cleaned.filter((profile) => profile.id !== "admin" && profile.role !== "admin");
  return [admin, ...withoutDuplicateAdmin];
}

function currentCloudProfile() {
  if (currentProfile?.role === "admin") {
    return { ...currentProfile, id: "admin", role: "admin", name: currentProfile.name || "Skrbnik" };
  }
  const normalized = normalizeProfile(currentProfile);
  if (normalized) return normalized;
  return null;
}

function saveProfiles() {
  localStorage.setItem(PROFILE_REGISTRY_KEY, JSON.stringify(profiles));
}

function loadBackendConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(BACKEND_CONFIG_KEY) || "{}");
    const legacy = state?.settings?.googleSheets || {};
    return {
      enabled: Boolean(DEFAULT_CLOUD_ENDPOINT),
      endpoint: DEFAULT_CLOUD_ENDPOINT,
      syncKey: "",
      lastSyncByProfile: {},
      ...legacy,
      ...stored,
    };
  } catch {
    return { enabled: Boolean(DEFAULT_CLOUD_ENDPOINT), endpoint: DEFAULT_CLOUD_ENDPOINT, syncKey: "", lastSyncByProfile: {} };
  }
}

function saveBackendConfig() {
  localStorage.setItem(BACKEND_CONFIG_KEY, JSON.stringify(backendConfig));
}

function normalizeSecret(value) {
  return String(value || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .trim();
}

async function initializeProfileSystem() {
  let storedProfiles = [];
  try {
    storedProfiles = JSON.parse(localStorage.getItem(PROFILE_REGISTRY_KEY) || "[]");
  } catch {
    storedProfiles = [];
  }
  if (!Array.isArray(storedProfiles) || !storedProfiles.length) {
    storedProfiles = [{
      id: "admin",
      name: "Skrbnik",
      role: "admin",
      keyHash: await hashProfileKey("admin"),
      createdAt: new Date().toISOString(),
      active: true,
      mustChangeKey: true,
    }];
    localStorage.setItem(PROFILE_REGISTRY_KEY, JSON.stringify(storedProfiles));
  } else {
    const defaultAdminHash = await hashProfileKey("admin");
    storedProfiles = storedProfiles.map((profile) =>
      profile.role === "admin" && profile.mustChangeKey === undefined
        ? { ...profile, mustChangeKey: profile.keyHash === defaultAdminHash }
        : profile
    );
    localStorage.setItem(PROFILE_REGISTRY_KEY, JSON.stringify(storedProfiles));
  }
  const legacyData = localStorage.getItem(STORAGE_KEY);
  const adminKey = `${PROFILE_DATA_PREFIX}admin`;
  if (legacyData && !localStorage.getItem(adminKey)) {
    localStorage.setItem(adminKey, legacyData);
  }
  const sessionProfileId = sessionStorage.getItem(PROFILE_SESSION_KEY);
  const activeProfile = storedProfiles.find((profile) => profile.id === sessionProfileId && profile.active !== false) || null;
  return { profiles: storedProfiles, currentProfile: activeProfile };
}

async function loginWithKey(key) {
  if (loginPending) return;
  const enteredKey = normalizeSecret(key);
  let localAdmin = profiles.find((item) => item.role === "admin" && item.active !== false);
  if (enteredKey === "admin" && !canUseCloudEndpoint()) {
    const keyHash = await hashProfileKey(enteredKey);
    if (!localAdmin) {
      localAdmin = {
        id: "admin",
        name: "Skrbnik",
        role: "admin",
        keyHash,
        createdAt: new Date().toISOString(),
        active: true,
        mustChangeKey: true,
      };
      profiles = [...profiles.filter((item) => item.id !== "admin"), localAdmin];
      saveProfiles();
    }
    sessionCredentialHash = keyHash;
    currentProfile = localAdmin;
    sessionStorage.setItem(PROFILE_SESSION_KEY, localAdmin.id);
    sessionStorage.setItem(PROFILE_CREDENTIAL_SESSION_KEY, keyHash);
    state = loadState();
    active = state.settings.setupCompleted ? "dashboard" : "setup";
    authMessage = "";
    cloudReady = false;
    render();
    initializeGoogleSheetsSync();
    return;
  }
  const cloudConfig = googleSheetsConfig();
  if (canUseCloudEndpoint(cloudConfig) && hasValidSyncKey(cloudConfig) && enteredKey === cloudConfig.syncKey) {
    const keyHash = await hashProfileKey(enteredKey);
    const adminProfile = {
      ...(localAdmin || {}),
      id: "admin",
      name: localAdmin?.name || "Skrbnik",
      role: "admin",
      keyHash,
      active: true,
      mustChangeKey: false,
      createdAt: localAdmin?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    profiles = [...profiles.filter((item) => item.id !== "admin"), adminProfile];
    saveProfiles();
    sessionCredentialHash = keyHash;
    currentProfile = adminProfile;
    sessionStorage.setItem(PROFILE_SESSION_KEY, adminProfile.id);
    sessionStorage.setItem(PROFILE_CREDENTIAL_SESSION_KEY, keyHash);
    state = loadState();
    active = state.settings.setupCompleted ? "dashboard" : "setup";
    authMessage = "";
    cloudReady = false;
    render();
    initializeGoogleSheetsSync();
    return;
  }
  loginPending = true;
  authMessage = "";
  render();
  try {
    const keyHash = await hashProfileKey(enteredKey);
    let profile = normalizeProfile(profiles.find((item) => item.active !== false && item.keyHash === keyHash) || null, keyHash);
    if (!profile) {
      const result = await Promise.race([
        remoteProfileLogin(keyHash, enteredKey),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Prijava se ni odzvala v 20 sekundah. Preveri povezavo in poskusi znova.")), 20000)),
      ]);
      profile = normalizeProfile(result.profile, keyHash);
      if (!profile) throw new Error("Profil nima veljavnega ID-ja.");
      profiles = [...profiles.filter((item) => item.id !== profile.id), { ...profile, keyHash }];
      saveProfiles();
    }
    if (!profile) throw new Error("Ključ ni pravilen.");
    sessionCredentialHash = keyHash;
    currentProfile = profile;
    sessionStorage.setItem(PROFILE_SESSION_KEY, profile.id);
    sessionStorage.setItem(PROFILE_CREDENTIAL_SESSION_KEY, keyHash);
    state = loadState();
    active = state.settings.setupCompleted ? "dashboard" : "setup";
    authMessage = "";
    cloudReady = false;
    loginPending = false;
    render();
    initializeGoogleSheetsSync();
  } catch (error) {
    authMessage = String(error?.message || "Ključ ni pravilen.")
      .replace(/^Error invoking remote method '[^']+': Error:\s*/i, "");
  } finally {
    if (loginPending) {
      loginPending = false;
      render();
    }
  }
}

function logout() {
  clearTimeout(cloudSaveTimer);
  cloudPendingSave = false;
  sessionStorage.removeItem(PROFILE_SESSION_KEY);
  sessionStorage.removeItem(PROFILE_CREDENTIAL_SESSION_KEY);
  currentProfile = null;
  sessionCredentialHash = "";
  state = emptyState({ setupCompleted: false });
  active = "login";
  cloudReady = false;
  cloudStatus = { state: "local", message: "Podatki so shranjeni lokalno." };
  render();
}

function loadState() {
  if (!currentProfile) return emptyState({ setupCompleted: false });
  const raw = localStorage.getItem(profileStorageKey());
  if (!raw) return emptyState({ setupCompleted: false });
  try {
    const loaded = { ...emptyState(), ...JSON.parse(raw) };
    loaded.settings = { ...seedData.settings, ...(loaded.settings || {}) };
    cleanupLegacySeedData(loaded);
    cleanupInvalidEmptyEntries(loaded);
    ensureUniqueRecordIds(loaded);
    loaded.accounts = dedupeFinancialItems(loaded.accounts || [], canonicalAssetKey);
    loaded.liabilities = dedupeFinancialItems(loaded.liabilities || [], canonicalDebtKey);
    loaded.transactions = Array.isArray(loaded.transactions) ? loaded.transactions : [];
    loaded.transactions = migrateTransactions(loaded);
    reconcileLedgerLinks(loaded);
    if (loaded.settings.designVersion !== 2) {
      loaded.settings.theme = "dark";
      loaded.settings.designVersion = 2;
    }
    if (loaded.settings.setupCompleted === undefined) {
      loaded.settings.setupCompleted = Boolean(loaded.accounts.length || loaded.liabilities.length || loaded.snapshots.length);
    }
    return loaded;
  } catch {
    return emptyState({ setupCompleted: false });
  }
}

function cleanupInvalidEmptyEntries(data) {
  data.expenses = (data.expenses || []).filter((item) =>
    String(item.name || "").trim() || Number(item.amount || 0) !== 0
  );
  data.transactions = (data.transactions || []).filter((item) =>
    String(item.description || "").trim() || Number(item.amount || 0) !== 0
  );
}

function ensureUniqueRecordIds(data) {
  const collections = ["incomes", "expenses", "transactions", "accounts", "investments", "liabilities", "taxes", "goals", "snapshots", "monthlyNotes", "importHistory", "categoryRules"];
  for (const collection of collections) {
    const seen = new Set();
    data[collection] = (data[collection] || []).map((item) => {
      const originalId = String(item.id || "");
      if (originalId && !seen.has(originalId)) {
        seen.add(originalId);
        return item;
      }
      const id = crypto.randomUUID();
      seen.add(id);
      const repaired = { ...item, id };
      if (collection === "incomes" || collection === "expenses") {
        repaired.linkedTransactionId = "";
      }
      if (collection === "transactions") {
        repaired.linkedIncomeId = "";
        repaired.linkedExpenseId = "";
      }
      return repaired;
    });
  }
}

function cleanupLegacySeedData(data) {
  const hasSetupData = [...(data.accounts || []), ...(data.liabilities || [])].some((item) => item.setupKey);
  if (!hasSetupData) return;
  const legacyAccounts = new Map([
    ["banka", 2700],
    ["gotovina", 500],
    ["ibkr", 3236],
    ["crypto", 535],
    ["avto", 5000],
    ["vespa", 3300],
  ]);
  data.accounts = (data.accounts || []).filter((item) => {
    if (item.setupKey) return true;
    const expected = legacyAccounts.get(normalizeText(item.name));
    return expected === undefined || Math.abs(Number(item.balance || 0) - expected) > 0.02;
  }).map((item) =>
    item.setupKey === "avto" && normalizeText(item.name) === "avto"
      ? { ...item, name: "BMW" }
      : item
  );
  data.liabilities = (data.liabilities || []).filter((item) => {
    if (item.setupKey) return true;
    const name = normalizeText(item.name);
    if (name === "jadrnica" && Math.abs(Number(item.amount || 0) - 1200) < 0.02) return false;
    if (name === "davki" && Math.abs(Number(item.amount || 0) - 4000) < 0.02) return false;
    return true;
  });
  data.snapshots = (data.snapshots || []).filter((item) => {
    const blankNote = !String(item.note || "").trim();
    const legacyFirst = Number(item.assets) === 12800 && Number(item.liabilities) === 5200 && Number(item.netWorth) === 7600;
    const legacySecond = Number(item.assets) === 14700 && Number(item.liabilities) === 5000 && Number(item.netWorth) === 9700;
    return !(blankNote && (legacyFirst || legacySecond));
  });
  data.investments = (data.investments || []).filter((item) => {
    const name = normalizeText(item.name);
    const legacyIbkr = name === "ibkr portfelj" && Number(item.currentValue) === 3236;
    const legacyCrypto = name === "crypto portfelj" && Number(item.currentValue) === 535;
    return !(legacyIbkr || legacyCrypto);
  });
  data.monthlyNotes = (data.monthlyNotes || []).filter((item) =>
    !(item.good === "Začetni pregled je postavljen."
      && item.bad === "Podatki so še testni."
      && item.next === "Zamenjaj seed podatke z realnimi vnosi.")
  );
}

function canonicalAssetKey(item) {
  if (item.setupKey) return item.setupKey;
  const name = normalizeText(item.name);
  const type = normalizeText(item.type);
  if (name === "banka" || name.includes("glavni racun") || type.includes("glavni bancni racun")) return "banka";
  if (name.includes("revolut") || type === "revolut") return "revolut";
  if (name.includes("gotovina") || type === "gotovina") return "gotovina";
  if (name.includes("varceval") || type.includes("varcevalni")) return "varcevalni";
  if (name.includes("ibkr") || type === "ibkr") return "ibkr";
  if (name.includes("crypto") || type === "crypto") return "crypto";
  if (name === "avto") return "avto";
  if (name === "vespa") return "vespa";
  if (name.includes("jadrnica")) return "jadrnica";
  if (name.includes("nepremic")) return "nepremicnine";
  return "";
}

function canonicalDebtKey(item) {
  if (item.setupKey) return item.setupKey;
  const name = normalizeText(item.name);
  if (name === "davki" || name.includes("davcna obveznost")) return "davki";
  if (name === "dolg" || name === "dolgovi") return "dolgovi";
  if (name.includes("kreditna kartic")) return "kreditne_kartice";
  if (name === "kredit" || name.includes("stanovanjski kredit")) return "kredit";
  if (name.includes("leasing")) return "leasing";
  if (name.includes("vecja") && name.includes("placil")) return "vecja_placila";
  if (name === "servisi" || name === "servis") return "servisi";
  if (name.includes("zavarovanja za placilo")) return "zavarovanja";
  return "";
}

function dedupeFinancialItems(items, keyFn) {
  const known = new Map();
  const unknown = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key) {
      unknown.push(item);
      continue;
    }
    const previous = known.get(key);
    if (!previous || financialItemPriority(item) >= financialItemPriority(previous)) known.set(key, item);
  }
  return [...known.values(), ...unknown];
}

function financialItemPriority(item) {
  return (item.setupKey ? 100 : 0) + (item.updatedAt ? new Date(item.updatedAt).getTime() / 1e13 : 0);
}

function migrateTransactions(data) {
  const existing = data.transactions || [];
  if (existing.length) return existing;
  const incomeTransactions = (data.incomes || []).map((item) => ({
    id: crypto.randomUUID(),
    date: item.date,
    description: item.name,
    amount: Number(item.amount || 0),
    currency: item.currency || "EUR",
    category: item.category,
    subcategory: item.subcategory || "",
    account: item.account || item.source || "",
    type: "prihodek",
    status: "pripravljeno",
    source: item.importSource || "ročno",
    confidence: item.importConfidence || "manual",
    linkedIncomeId: item.id,
    note: item.note || "",
  }));
  const expenseTransactions = (data.expenses || []).map((item) => ({
    id: crypto.randomUUID(),
    date: item.date,
    description: item.name,
    amount: -Math.abs(Number(item.amount || 0)),
    currency: item.currency || "EUR",
    category: item.category,
    subcategory: item.subcategory || "",
    account: item.account || "",
    type: "strošek",
    status: "pripravljeno",
    source: item.importSource || "ročno",
    confidence: item.importConfidence || "manual",
    linkedExpenseId: item.id,
    note: item.note || "",
  }));
  return [...incomeTransactions, ...expenseTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function reconcileLedgerLinks(data) {
  const expenses = new Map((data.expenses || []).map((item) => [item.id, item]));
  const incomes = new Map((data.incomes || []).map((item) => [item.id, item]));
  for (const tx of data.transactions || []) {
    if (tx.status !== "pripravljeno") continue;
    if (Number(tx.amount) < 0 && tx.linkedExpenseId && !expenses.has(tx.linkedExpenseId)) {
      const expense = {
        id: tx.linkedExpenseId,
        linkedTransactionId: tx.id,
        date: tx.date,
        name: tx.description || "Strošek",
        amount: Math.abs(Number(tx.amount || 0)),
        category: tx.category || "drugo",
        subcategory: tx.subcategory || "",
        account: tx.account || "",
        kind: "variabilen",
        note: tx.note || "Obnovljeno iz povezane transakcije",
        currency: tx.currency || "EUR",
        importSource: tx.source,
        importConfidence: tx.confidence,
        balanceAccountId: "",
        balanceImpact: 0,
      };
      data.expenses = [expense, ...(data.expenses || [])];
      expenses.set(expense.id, expense);
    }
    if (Number(tx.amount) > 0 && tx.linkedIncomeId && !incomes.has(tx.linkedIncomeId)) {
      const income = {
        id: tx.linkedIncomeId,
        date: tx.date,
        name: tx.description || "Prihodek",
        amount: Number(tx.amount || 0),
        category: tx.category || "drugo",
        source: tx.account || tx.source || "",
        note: tx.note || "Obnovljeno iz povezane transakcije",
      };
      data.incomes = [income, ...(data.incomes || [])];
      incomes.set(income.id, income);
    }
  }
}

function save() {
  if (!currentProfile) return;
  localStorage.setItem(profileStorageKey(), JSON.stringify(state));
  document.documentElement.dataset.theme = state.settings.theme || "dark";
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.content = state.settings.theme === "light" ? "#eef3f8" : "#07101c";
  queueCloudSave();
}

function googleSheetsConfig() {
  const serverManaged = hasServerManagedCloudEndpoint();
  const config = {
    enabled: false,
    endpoint: "",
    syncKey: "",
    lastSyncAt: "",
    ...backendConfig,
    lastSyncAt: backendConfig.lastSyncByProfile?.[currentProfile?.id] || "",
  };
  return {
    ...config,
    enabled: serverManaged ? true : config.enabled,
  };
}

function hasServerManagedCloudEndpoint() {
  return !window.financaCloud?.request && location.protocol === "https:";
}

function canUseCloudEndpoint(config = googleSheetsConfig()) {
  return Boolean(config.enabled && (config.endpoint || hasServerManagedCloudEndpoint()));
}

function cloudPayload() {
  const data = structuredClone(state);
  if (data.settings?.googleSheets) delete data.settings.googleSheets;
  return JSON.stringify(data);
}

function hasMeaningfulFinancialData(data = state) {
  const collections = ["incomes", "expenses", "transactions", "accounts", "investments", "liabilities", "taxes", "goals", "snapshots", "monthlyNotes", "importHistory", "categoryRules"];
  return collections.some((key) => Array.isArray(data?.[key]) && data[key].length > 0);
}

function syncDataSummary(data = state) {
  return [
    `${(data.accounts || []).length} računov`,
    `${(data.expenses || []).length} stroškov`,
    `${(data.incomes || []).length} prihodkov`,
    `${(data.investments || []).length} investicij`,
    `${(data.liabilities || []).length} obveznosti`,
  ].join(", ");
}

function hasValidSyncKey(config = googleSheetsConfig()) {
  return Boolean(config.syncKey)
    && !String(config.syncKey).includes("TUKAJ_VNESI")
    && String(config.syncKey).length >= 12;
}

function hasServerManagedCloudAuth() {
  return hasServerManagedCloudEndpoint();
}

function canAuthenticateCloud(config = googleSheetsConfig()) {
  return Boolean(sessionCredentialHash || hasValidSyncKey(config) || hasServerManagedCloudAuth());
}

function googleSheetsEndpointError(endpoint) {
  if (!String(endpoint || "").trim()) {
    return hasServerManagedCloudEndpoint()
      ? ""
      : "Vnesi Apps Script Web app URL ali uporabi HTTPS objavo z okoljsko spremenljivko GOOGLE_APPS_SCRIPT_URL.";
  }
  try {
    const url = new URL(String(endpoint || "").trim());
    if (url.hostname.endsWith(".googleusercontent.com")) {
      return "Uporabljen je začasni preusmeritveni URL. V Apps Script odpri Deploy → Manage deployments in kopiraj Web app URL, ki se konča z /exec.";
    }
    if (url.protocol !== "https:" || url.hostname !== "script.google.com" || !url.pathname.endsWith("/exec")) {
      return "Vnesi Apps Script Web app URL oblike https://script.google.com/macros/s/.../exec.";
    }
    return "";
  } catch {
    return "URL spletne aplikacije ni veljaven.";
  }
}

function queueCloudSave() {
  const config = googleSheetsConfig();
  if (!cloudReady || cloudAutoSyncPaused || !canUseCloudEndpoint(config)) return;
  if (!canAuthenticateCloud(config)) {
    cloudStatus = { state: "error", message: "Vnesi dejanski sinhronizacijski ključ, ne besedila TUKAJ_VNESI ..." };
    return;
  }
  const payload = cloudPayload();
  if (payload === lastCloudPayload) return;
  cloudPendingSave = true;
  if (cloudSyncInFlight) {
    cloudStatus = { state: "pending", message: "Spremembe čakajo na konec trenutne sinhronizacije." };
    return;
  }
  clearTimeout(cloudSaveTimer);
  cloudStatus = { state: "pending", message: "Shranjujem spremembe v Google Sheets ..." };
  cloudSaveTimer = setTimeout(() => pushGoogleSheets({ quiet: true }), 150);
}

async function sendCloudRequest(request) {
  const config = googleSheetsConfig();
  const endpointError = googleSheetsEndpointError(config.endpoint);
  if (endpointError) throw new Error(endpointError);
  const operation = window.financaCloud?.request
    ? window.financaCloud.request({ endpoint: config.endpoint, request })
    : fetch("/api/google-sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: config.endpoint, request }),
    });
  let response;
  try {
    response = await Promise.race([
      operation,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Google Sheets se ni odzval v 15 sekundah.")), 15000)),
    ]);
  } catch (error) {
    const message = String(error?.message || error || "Povezava z Google Sheets ni uspela.")
      .replace(/^Error invoking remote method '[^']+': Error:\s*/i, "");
    throw new Error(message);
  }
  if (window.financaCloud?.request) return response;
  const text = await response.text().catch(() => "");
  let result = {};
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    const excerpt = text ? ` Odgovor: ${text.slice(0, 140)}` : "";
    throw new Error(`Vercel /api/google-sheets ni vrnil JSON odgovora (HTTP ${response.status}).${excerpt}`);
  }
  if (!response.ok || !result.ok) {
    throw new Error(result.error || `Povezava z Google Sheets ni uspela (HTTP ${response.status}).`);
  }
  return result;
}

async function remoteProfileLogin(credentialHash, enteredKey = "") {
  return sendCloudRequest({ action: "login", credentialHash, key: normalizeSecret(enteredKey) });
}

async function cloudRequest(action, data = null) {
  const config = googleSheetsConfig();
  if (!canAuthenticateCloud(config)) {
    throw new Error("Prijava za Google Sheets ni nastavljena.");
  }
  const cloudProfile = currentCloudProfile();
  if (!cloudProfile?.id) throw new Error("Trenutni profil nima veljavnega ID-ja za Google Sheets.");
  return sendCloudRequest({
    action,
    key: config.syncKey,
    credentialHash: sessionCredentialHash,
    profileId: cloudProfile.id,
    profile: { id: cloudProfile.id, name: cloudProfile.name, role: cloudProfile.role },
    data,
  });
}

async function syncProfileRegistry() {
  const config = googleSheetsConfig();
  if (!canAuthenticateCloud(config)) throw new Error("Prijava skrbnika ni veljavna.");
  profiles = normalizedProfilesForSync();
  saveProfiles();
  const cloudProfile = currentCloudProfile();
  if (!cloudProfile?.id) throw new Error("Trenutni profil nima veljavnega ID-ja za Google Sheets.");
  const cloudProfiles = profiles.map((profile) => ({
    ...profile,
    profileId: profile.id,
    ime: profile.name,
    vloga: profile.role,
  }));
  return sendCloudRequest({
    action: "profiles-save",
    key: config.syncKey,
    credentialHash: sessionCredentialHash,
    profileId: cloudProfile.id,
    profile: { id: cloudProfile.id, profileId: cloudProfile.id, name: cloudProfile.name, role: cloudProfile.role },
    profiles: cloudProfiles,
  });
}

async function testGoogleSheetsConnection() {
  cloudStatus = { state: "pending", message: "Preverjam povezavo ..." };
  render();
  try {
    const result = await cloudRequest("health");
    cloudStatus = { state: "success", message: `Povezano: ${result.spreadsheetName || "Google Sheets"}` };
    return result;
  } catch (error) {
    cloudAutoSyncPaused = true;
    const message = String(error.message || "Povezava ni uspela.");
    cloudStatus = {
      state: "error",
      message: message.includes("Ključ ni pravilen") || message.includes("Kljuc ni pravilen")
        ? "Sinhronizacijski ključ se ne ujema z Apps Script CONFIG.SYNC_KEY ali pa uporabljaš star Web App deployment."
        : message,
    };
    throw error;
  } finally {
    render();
  }
}

async function pullGoogleSheets({ confirmOverwrite = false, quiet = false } = {}) {
  if (confirmOverwrite && !confirm("Lokalne podatke zamenjam s podatki iz Google Sheets?")) return false;
  cloudSyncInFlight = true;
  if (!quiet) {
    cloudStatus = { state: "pending", message: "Prenašam podatke iz Google Sheets ..." };
    render();
  }
  try {
    const result = await cloudRequest("load");
    if (!result.data) {
      cloudStatus = { state: "error", message: `Google Sheet je povezan, vendar nima podatkov za profil "${currentProfile?.id || "neznan"}".` };
      return false;
    }
    const imported = importedState(result.data);
    state = imported;
    backendConfig.lastSyncByProfile = {
      ...(backendConfig.lastSyncByProfile || {}),
      [currentProfile.id]: result.updatedAt || new Date().toISOString(),
    };
    saveBackendConfig();
    lastCloudPayload = cloudPayload();
    localStorage.setItem(profileStorageKey(), JSON.stringify(state));
    cloudStatus = { state: "success", message: `Preneseno za profil "${currentProfile.id}": ${syncDataSummary(imported)}.` };
    return true;
  } catch (error) {
    cloudAutoSyncPaused = true;
    cloudStatus = { state: "error", message: error.message || "Prenos ni uspel." };
    if (!quiet) throw error;
    return null;
  } finally {
    cloudSyncInFlight = false;
    render();
  }
}

async function pushGoogleSheets({ confirmOverwrite = false, quiet = false } = {}) {
  if (confirmOverwrite && !confirm("Podatke iz te naprave pošljem v Google Sheets in prepišem tamkajšnje stanje?")) return false;
  if (!confirmOverwrite && !hasMeaningfulFinancialData(state)) {
    cloudAutoSyncPaused = true;
    cloudStatus = { state: "error", message: "Varnostno ustavljeno: praznega profila ne pošiljam v Google Sheets. Najprej prenesi podatke iz Sheets ali uporabi ročni izvoz." };
    render();
    return false;
  }
  if (!quiet) cloudAutoSyncPaused = false;
  cloudSyncInFlight = true;
  cloudPendingSave = false;
  clearTimeout(cloudSaveTimer);
  if (!quiet) {
    cloudStatus = { state: "pending", message: "Shranjujem v Google Sheets ..." };
    render();
  }
  try {
    if (currentProfile?.role === "admin") {
      await syncProfileRegistry();
    }
    const freshness = await remoteFreshness();
    if (freshness.isNewer) {
      if (!confirmOverwrite) {
        cloudAutoSyncPaused = true;
        cloudStatus = { state: "error", message: `Google Sheets je novejši od te naprave (${formatSyncTime(freshness.updatedAt)}). Najprej klikni "Prenesi iz Sheets".` };
        return false;
      }
      const overwrite = confirm(`Google Sheets je novejši od te naprave (${formatSyncTime(freshness.updatedAt)}). Vseeno prepišem Sheets s podatki iz te naprave?`);
      if (!overwrite) return false;
    }
    const payload = cloudPayload();
    const result = await cloudRequest("save", JSON.parse(payload));
    lastCloudPayload = payload;
    backendConfig.lastSyncByProfile = {
      ...(backendConfig.lastSyncByProfile || {}),
      [currentProfile.id]: result.updatedAt || new Date().toISOString(),
    };
    saveBackendConfig();
    localStorage.setItem(profileStorageKey(), JSON.stringify(state));
    cloudStatus = { state: "success", message: `Sinhronizirano ${formatSyncTime(backendConfig.lastSyncByProfile[currentProfile.id])}.` };
    return true;
  } catch (error) {
    cloudAutoSyncPaused = true;
    cloudStatus = { state: "error", message: error.message || "Shranjevanje ni uspelo." };
    return false;
  } finally {
    cloudSyncInFlight = false;
    if (cloudPendingSave && !cloudAutoSyncPaused) {
      setTimeout(() => queueCloudSave(), 0);
    }
    render();
  }
}

function formatSyncTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("sl-SI", { dateStyle: "short", timeStyle: "short" });
}

function timestampValue(value) {
  const time = new Date(value || "").getTime();
  return Number.isNaN(time) ? 0 : time;
}

function currentProfileLastSync() {
  return backendConfig.lastSyncByProfile?.[currentProfile?.id] || "";
}

async function remoteFreshness() {
  const result = await cloudRequest("health");
  const remoteTime = timestampValue(result.updatedAt);
  const localTime = timestampValue(currentProfileLastSync());
  return {
    updatedAt: result.updatedAt || "",
    isNewer: Boolean(remoteTime && (!localTime || remoteTime > localTime + 1000)),
  };
}

async function initializeGoogleSheetsSync() {
  const config = googleSheetsConfig();
  if (!canUseCloudEndpoint(config) || !canAuthenticateCloud(config)) {
    cloudReady = true;
    cloudStatus = canUseCloudEndpoint(config)
      ? { state: "error", message: "Google Sheets je na voljo, vendar prijava še ni veljavna." }
      : { state: "local", message: "Google Sheets povezava ni nastavljena na tej napravi." };
    return;
  }
  cloudStatus = { state: "pending", message: "Povezujem Google Sheets ..." };
  render();
  try {
    if (currentProfile?.role === "admin" && canAuthenticateCloud(config)) {
      await syncProfileRegistry();
    }
    const loaded = await pullGoogleSheets({ quiet: true });
    cloudReady = true;
    if (loaded === false) {
      cloudAutoSyncPaused = false;
      cloudStatus = { state: "local", message: "Google Sheets je povezan. Ta profil še nima podatkov v backendu; prvi vnos jih bo ustvaril samodejno." };
      render();
    }
  } catch (error) {
    cloudStatus = { state: "error", message: error.message || "Začetna sinhronizacija z Google Sheets ni uspela." };
    cloudReady = true;
    render();
  }
}

function money(value) {
  return EUR.format(Number(value || 0));
}

function sum(items, key = "amount") {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function sameMonth(item, dateKey = "date", month = filters.month, year = filters.year) {
  const [itemYear, itemMonth] = String(item?.[dateKey] || "").split("-").map(Number);
  return itemMonth === Number(month) && itemYear === Number(year);
}

function monthLabel(month, year) {
  return new Date(year, month - 1, 1).toLocaleDateString("sl-SI", { month: "long", year: "numeric" });
}

function monthlyData(month = filters.month, year = filters.year) {
  const incomes = state.incomes.filter((item) => sameMonth(item, "date", month, year));
  const expenses = state.expenses.filter((item) => sameMonth(item, "date", month, year));
  const investments = state.investments.filter((item) => sameMonth(item, "date", month, year));
  const breakdown = netWorthBreakdown();
  const openLiabilities = breakdown.liabilityTotal;
  const assets = breakdown.assetTotal;
  const netWorth = assets - openLiabilities;
  const selectedSnapshot = snapshotForMonth(month, year);
  const isCurrent = Number(month) === currentMonth && Number(year) === currentYear;
  const comparisonValue = isCurrent ? netWorth : selectedSnapshot ? Number(selectedSnapshot.netWorth || 0) : null;
  const previous = comparisonValue !== null ? latestSnapshotBefore(month, year) : null;
  const incomeTotal = sum(incomes);
  const expenseTotal = sum(expenses);
  const saved = incomeTotal - expenseTotal;
  return {
    incomes,
    expenses,
    investments,
    incomeTotal,
    expenseTotal,
    saved,
    invested: sum(investments, "addedThisMonth"),
    savingsRate: incomeTotal ? (saved / incomeTotal) * 100 : 0,
    assets,
    liabilities: openLiabilities,
    accountAssets: breakdown.accountTotal,
    investmentAssets: breakdown.investmentTotal,
    countedAccounts: breakdown.accounts,
    countedInvestments: breakdown.investments,
    countedLiabilities: breakdown.liabilities,
    netWorth,
    netWorthChange: previous ? comparisonValue - Number(previous.netWorth || 0) : null,
  };
}

function netWorthBreakdown() {
  const accounts = dedupeFinancialItems(state.accounts || [], canonicalAssetKey);
  const liabilities = dedupeFinancialItems(
    (state.liabilities || []).filter((item) => item.status !== "plačano" && item.status !== "preklicano"),
    canonicalDebtKey,
  );
  const hasSetupIbkr = accounts.some((item) => item.setupKey === "ibkr");
  const hasSetupCrypto = accounts.some((item) => item.setupKey === "crypto");
  const securities = (state.investments || []).filter((item) => normalizeText(item.type) !== "crypto");
  const crypto = (state.investments || []).filter((item) => normalizeText(item.type) === "crypto");
  const securitiesTotal = sum(securities, "currentValue");
  const cryptoTotal = sum(crypto, "currentValue");
  const countedInvestments = (state.investments || []).filter((item) => {
    if (hasSetupCrypto && normalizeText(item.type) === "crypto") return false;
    if (hasSetupIbkr && normalizeText(item.type) !== "crypto") return false;
    return true;
  });
  const countedAccounts = accounts.filter((item) => {
    const key = canonicalAssetKey(item);
    if (item.setupKey) return true;
    if (key === "ibkr" && securitiesTotal > 0 && Math.abs(Number(item.balance || 0) - securitiesTotal) < 0.02) return false;
    if (key === "crypto" && cryptoTotal > 0 && Math.abs(Number(item.balance || 0) - cryptoTotal) < 0.02) return false;
    return true;
  });
  return {
    accounts: countedAccounts,
    investments: countedInvestments,
    liabilities,
    accountTotal: sum(countedAccounts, "balance"),
    investmentTotal: sum(countedInvestments, "currentValue"),
    liabilityTotal: sum(liabilities),
    assetTotal: sum(countedAccounts, "balance") + sum(countedInvestments, "currentValue"),
  };
}

function latestSnapshotBefore(month, year) {
  const target = year * 12 + month;
  return [...state.snapshots]
    .filter((item) => Number(item.year) * 12 + Number(item.month) < target)
    .sort((a, b) => Number(b.year) * 12 + Number(b.month) - (Number(a.year) * 12 + Number(a.month)))[0];
}

function snapshotForMonth(month, year) {
  return (state.snapshots || []).find((item) =>
    Number(item.month) === Number(month) && Number(item.year) === Number(year)
  ) || null;
}

function emptyState(settings = {}) {
  return {
    settings: { ...seedData.settings, setupCompleted: false, ...settings },
    incomes: [],
    expenses: [],
    transactions: [],
    accounts: [],
    investments: [],
    liabilities: [],
    taxes: [],
    goals: [],
    snapshots: [],
    monthlyNotes: [],
    importHistory: [],
    categoryRules: [],
  };
}

function importedState(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Neveljaven JSON");
  const next = { ...emptyState(), ...data };
  const collections = ["incomes", "expenses", "transactions", "accounts", "investments", "liabilities", "taxes", "goals", "snapshots", "monthlyNotes", "importHistory", "categoryRules"];
  for (const key of collections) {
    if (!Array.isArray(next[key])) next[key] = [];
  }
  next.settings = { ...seedData.settings, ...(data.settings || {}) };
  cleanupInvalidEmptyEntries(next);
  cleanupLegacySeedData(next);
  ensureUniqueRecordIds(next);
  next.accounts = dedupeFinancialItems(next.accounts, canonicalAssetKey);
  next.liabilities = dedupeFinancialItems(next.liabilities, canonicalDebtKey);
  next.transactions = migrateTransactions(next);
  reconcileLedgerLinks(next);
  if (next.settings.setupCompleted === undefined) {
    next.settings.setupCompleted = Boolean(next.accounts.length || next.liabilities.length || next.snapshots.length);
  }
  return next;
}

function upcomingLiabilities() {
  const today = new Date();
  const limit = new Date();
  limit.setDate(today.getDate() + 30);
  return state.liabilities
    .filter((item) => item.status !== "plačano" && item.status !== "preklicano")
    .filter((item) => new Date(item.dueDate) >= today && new Date(item.dueDate) <= limit)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function setActive(id) {
  active = id;
  render();
}

function openModal(collection, title, item = null) {
  modal = { collection, title, item: item ? { ...item } : null };
  render();
}

function openDeleteProfileModal(profileId) {
  if (currentProfile?.role !== "admin" || profileId === currentProfile.id) return;
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) return;
  modal = { collection: "deleteProfile", title: "Izbris profila", item: { profileId, profileName: profile.name } };
  render();
}

function closeModal() {
  modal = null;
  render();
}

function upsert(collection, values) {
  const clean = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, numericField(key) ? Number(value || 0) : value]));
  const editingId = modal?.collection === collection ? modal.item?.id : "";
  if (editingId) clean.id = editingId;
  if (collection === "transactions") {
    upsertTransaction(clean);
    save();
    closeModal();
    return;
  }
  if (collection === "expenses") {
    const savedExpense = upsertExpense(clean, true);
    replaceOrInsertRecord("expenses", savedExpense);
    focusFiltersOnExpense(savedExpense);
    save();
    closeModal();
    return;
  }
  if (collection === "incomes") {
    upsertIncome(clean, true);
    save();
    closeModal();
    return;
  }
  if (clean.id) {
    replaceRecordById(collection, clean.id, clean);
  } else {
    state[collection] = [{ id: crypto.randomUUID(), ...clean }, ...state[collection]];
  }
  save();
  closeModal();
}

function replaceRecordById(collection, id, replacement) {
  const index = (state[collection] || []).findIndex((item) => item.id === id);
  if (index < 0) return false;
  state[collection] = [...state[collection]];
  state[collection][index] = replacement;
  return true;
}

function replaceOrInsertRecord(collection, record) {
  if (!replaceRecordById(collection, record.id, record)) {
    state[collection] = [record, ...(state[collection] || [])];
  }
  return record;
}

function removeRecordById(collection, id) {
  const index = (state[collection] || []).findIndex((item) => item.id === id);
  if (index < 0) return null;
  const rows = [...state[collection]];
  const [removed] = rows.splice(index, 1);
  state[collection] = rows;
  return removed;
}

function accountKeyFromReference(reference) {
  const value = normalizeText(reference);
  if (!value) return "";
  if (value.includes("revolut")) return "revolut";
  if (value === "banka" || value.includes("glavni") || value.includes("bancni")) return "banka";
  if (value.includes("gotovina")) return "gotovina";
  if (value.includes("varceval")) return "varcevalni";
  if (value.includes("ibkr")) return "ibkr";
  if (value.includes("crypto") || value.includes("kripto")) return "crypto";
  return "";
}

function isSpendableAccount(account) {
  const key = canonicalAssetKey(account);
  const type = normalizeText(account.type);
  return !["avto", "vespa", "jadrnica", "nepremicnine"].includes(key)
    && !type.includes("vozilo")
    && !type.includes("nepremic");
}

function findExpenseAccount(reference) {
  const normalized = normalizeText(reference);
  if (!normalized) return null;
  const exact = (state.accounts || []).find((item) =>
    normalizeText(item.name) === normalized || normalizeText(item.type) === normalized
  );
  if (exact) return exact;
  const key = accountKeyFromReference(reference);
  return key ? (state.accounts || []).find((item) => canonicalAssetKey(item) === key) || null : null;
}

function restoreExpenseBalance(expense) {
  const impact = Number(expense?.balanceImpact || 0);
  const savingsImpact = Number(expense?.roundUpSavingsImpact || 0);
  state.accounts = (state.accounts || []).map((account) => {
    if (expense?.balanceAccountId && impact > 0 && account.id === expense.balanceAccountId) {
      return { ...account, balance: Number(account.balance || 0) + impact };
    }
    if (expense?.roundUpSavingsAccountId && savingsImpact > 0 && account.id === expense.roundUpSavingsAccountId) {
      return { ...account, balance: Number(account.balance || 0) - savingsImpact };
    }
    return account;
  });
}

function applyExpenseBalance(expense) {
  const account = findExpenseAccount(expense.account);
  const amount = Math.abs(Number(expense.amount || 0));
  const roundUp = bankExpenseRoundUp(amount, account);
  const impact = roundUp.roundedAmount || amount;
  if (!account || impact <= 0) {
    return clearExpenseBalanceMeta(expense);
  }
  state.accounts = state.accounts.map((item) =>
    item.id === account.id
      ? { ...item, balance: Number(item.balance || 0) - impact }
      : roundUp.savingsAccount && item.id === roundUp.savingsAccount.id
        ? { ...item, balance: Number(item.balance || 0) + roundUp.savingsImpact }
      : item
  );
  return {
    ...expense,
    balanceAccountId: account.id,
    balanceImpact: impact,
    roundUpSavingsAccountId: roundUp.savingsAccount?.id || "",
    roundUpSavingsImpact: roundUp.savingsImpact,
    roundUpBaseAmount: amount,
    roundUpRoundedAmount: roundUp.roundedAmount || amount,
  };
}

function clearExpenseBalanceMeta(expense) {
  return {
    ...expense,
    balanceAccountId: "",
    balanceImpact: 0,
    roundUpSavingsAccountId: "",
    roundUpSavingsImpact: 0,
    roundUpBaseAmount: 0,
    roundUpRoundedAmount: 0,
  };
}

function bankExpenseRoundUp(amount, account) {
  if (!state.settings.roundUpBankExpenses || !account || canonicalAssetKey(account) !== "banka") {
    return { roundedAmount: amount, savingsImpact: 0, savingsAccount: null };
  }
  const savingsAccount = roundUpSavingsAccount();
  if (!savingsAccount || savingsAccount.id === account.id) {
    return { roundedAmount: amount, savingsImpact: 0, savingsAccount: null };
  }
  const cents = Math.round(amount * 100);
  const roundedCents = Math.ceil(cents / 100) * 100;
  const savingsImpact = Math.max(0, (roundedCents - cents) / 100);
  return {
    roundedAmount: roundedCents / 100,
    savingsImpact,
    savingsAccount: savingsImpact > 0 ? savingsAccount : null,
  };
}

function roundUpSavingsAccount() {
  const configuredId = state.settings.roundUpSavingsAccountId;
  return (state.accounts || []).find((account) => account.id === configuredId)
    || (state.accounts || []).find((account) => canonicalAssetKey(account) === "varcevalni")
    || null;
}

function restoreIncomeBalance(income) {
  const impact = Number(income?.balanceImpact || 0);
  if (!income?.balanceAccountId || impact <= 0) return;
  state.accounts = (state.accounts || []).map((account) =>
    account.id === income.balanceAccountId
      ? { ...account, balance: Number(account.balance || 0) - impact }
      : account
  );
}

function applyIncomeBalance(income) {
  const account = findExpenseAccount(income.account);
  const impact = Math.abs(Number(income.amount || 0));
  if (!account || impact <= 0) {
    return { ...income, balanceAccountId: "", balanceImpact: 0 };
  }
  state.accounts = state.accounts.map((item) =>
    item.id === account.id
      ? { ...item, balance: Number(item.balance || 0) + impact }
      : item
  );
  return { ...income, balanceAccountId: account.id, balanceImpact: impact };
}

function syncExpenseTransaction(expense) {
  const existing = (state.transactions || []).find((item) =>
    item.id === expense.linkedTransactionId || item.linkedExpenseId === expense.id
  );
  const transaction = {
    ...(existing || {}),
    id: existing?.id || crypto.randomUUID(),
    date: expense.date,
    description: expense.name,
    amount: -Math.abs(Number(expense.amount || 0)),
    currency: expense.currency || "EUR",
    category: expense.category,
    subcategory: expense.subcategory || "",
    account: expense.account || "",
    type: "strošek",
    status: "pripravljeno",
    source: expense.importSource || "ročno",
    confidence: expense.importConfidence || "manual",
    linkedExpenseId: expense.id,
    note: expense.note || "",
  };
  if (existing) {
    replaceRecordById("transactions", transaction.id, transaction);
  } else {
    state.transactions = [transaction, ...(state.transactions || [])];
  }
  return { ...expense, linkedTransactionId: transaction.id };
}

function syncIncomeTransaction(income) {
  const existing = (state.transactions || []).find((item) =>
    item.id === income.linkedTransactionId || item.linkedIncomeId === income.id
  );
  const transaction = {
    ...(existing || {}),
    id: existing?.id || crypto.randomUUID(),
    date: income.date,
    description: income.name,
    amount: Math.abs(Number(income.amount || 0)),
    currency: income.currency || "EUR",
    category: income.category,
    subcategory: income.subcategory || "",
    account: income.account || income.source || "",
    type: "prihodek",
    status: "pripravljeno",
    source: income.importSource || existing?.source || "ročno",
    confidence: income.importConfidence || "manual",
    linkedIncomeId: income.id,
    note: income.note || "",
  };
  replaceOrInsertRecord("transactions", transaction);
  const linkedIncome = { ...income, linkedTransactionId: transaction.id };
  replaceRecordById("incomes", linkedIncome.id, linkedIncome);
  return linkedIncome;
}

function focusFiltersOnExpense(expense) {
  const [year, month] = String(expense.date || "").split("-").map(Number);
  if (year && month) {
    filters.year = year;
    filters.month = month;
  }
  filters.category = "";
  filters.account = "";
}

function upsertExpense(clean, syncTransaction = false) {
  const existing = (state.expenses || []).find((item) => item.id === clean.id);
  if (existing) restoreExpenseBalance(existing);
  let row = {
    ...(existing || {}),
    ...clean,
    id: clean.id || crypto.randomUUID(),
    date: clean.date || existing?.date || iso(currentYear, currentMonth, now.getDate()),
    amount: Math.abs(Number(clean.amount || 0)),
    balanceAccountId: "",
    balanceImpact: 0,
  };

  // Commit the ledger row first so a later balance or transaction update
  // can never leave the account reduced without a recorded expense.
  if (existing) {
    replaceRecordById("expenses", row.id, row);
  } else {
    state.expenses = [row, ...state.expenses];
  }

  row = applyExpenseBalance(row);
  replaceRecordById("expenses", row.id, row);

  if (syncTransaction) {
    row = syncExpenseTransaction(row);
    replaceRecordById("expenses", row.id, row);
  }
  return row;
}

function upsertIncome(clean, syncTransaction = false) {
  const existing = (state.incomes || []).find((item) => item.id === clean.id);
  if (existing) restoreIncomeBalance(existing);
  let row = {
    ...(existing || {}),
    ...clean,
    id: clean.id || crypto.randomUUID(),
    date: clean.date || existing?.date || iso(currentYear, currentMonth, now.getDate()),
    amount: Math.abs(Number(clean.amount || 0)),
    balanceAccountId: "",
    balanceImpact: 0,
  };
  replaceOrInsertRecord("incomes", row);
  row = applyIncomeBalance(row);
  replaceRecordById("incomes", row.id, row);
  if (syncTransaction) {
    row = syncIncomeTransaction(row);
    replaceRecordById("incomes", row.id, row);
  }
  return row;
}

function deleteExpenseRecord(id, removeTransaction = false) {
  const expense = (state.expenses || []).find((item) => item.id === id);
  if (!expense) return;
  restoreExpenseBalance(expense);
  removeRecordById("expenses", id);
  if (removeTransaction) {
    const linked = (state.transactions || []).find((item) =>
      item.id === expense.linkedTransactionId || item.linkedExpenseId === id
    );
    if (linked) removeRecordById("transactions", linked.id);
  }
}

function deleteIncomeRecord(id, removeTransaction = false) {
  const income = (state.incomes || []).find((item) => item.id === id);
  if (!income) return;
  restoreIncomeBalance(income);
  removeRecordById("incomes", id);
  if (removeTransaction) {
    const linked = (state.transactions || []).find((item) =>
      item.id === income.linkedTransactionId || item.linkedIncomeId === id
    );
    if (linked) removeRecordById("transactions", linked.id);
  }
}

function upsertTransaction(clean) {
  const existing = (state.transactions || []).find((item) => item.id === clean.id);
  const tx = {
    ...(existing || {}),
    ...clean,
    amount: Number(clean.amount || 0),
    confidence: clean.category && clean.category !== "za pregled" ? "manual" : existing?.confidence || "low",
    source: existing?.source || "ročno",
  };
  tx.status = tx.category === "za pregled" || tx.type === "za pregled" ? "za pregled" : tx.type === "interni transfer" ? "interni transfer" : "pripravljeno";
  if (!existing && !tx.id) tx.id = crypto.randomUUID();
  if (existing) {
    replaceRecordById("transactions", tx.id, tx);
  } else {
    state.transactions = [tx, ...(state.transactions || [])];
  }
  syncTransactionToLedger(tx);
}

function syncTransactionToLedger(tx) {
  if (tx.status !== "pripravljeno") {
    removeLinkedLedger(tx);
    return;
  }
  if (Number(tx.amount) < 0) {
    const row = {
      id: tx.linkedExpenseId || crypto.randomUUID(),
      date: tx.date,
      name: tx.description,
      amount: Math.abs(Number(tx.amount || 0)),
      category: tx.category,
      subcategory: tx.subcategory || "",
      account: tx.account || "",
      kind: "variabilen",
      note: tx.note || "Sinhronizirano iz transakcije",
      currency: tx.currency || "EUR",
      originalAmount: tx.amount,
      originalDescription: tx.description,
      importId: tx.importId,
      importSource: tx.source,
      importConfidence: tx.confidence,
    };
    const savedExpense = upsertExpense(row);
    tx.linkedExpenseId = savedExpense.id;
    if (tx.linkedIncomeId) deleteIncomeRecord(tx.linkedIncomeId);
    tx.linkedIncomeId = "";
  } else if (Number(tx.amount) > 0) {
    const row = {
      id: tx.linkedIncomeId || crypto.randomUUID(),
      date: tx.date,
      name: tx.description,
      amount: Number(tx.amount || 0),
      category: tx.category,
      source: tx.account || "",
      note: tx.note || "Sinhronizirano iz transakcije",
      currency: tx.currency || "EUR",
      account: tx.account || "",
      originalAmount: tx.amount,
      originalDescription: tx.description,
      importId: tx.importId,
      importSource: tx.source,
      importConfidence: tx.confidence,
    };
    const savedIncome = upsertIncome(row);
    tx.linkedIncomeId = savedIncome.id;
    if (tx.linkedExpenseId) deleteExpenseRecord(tx.linkedExpenseId);
    tx.linkedExpenseId = "";
  }
  replaceRecordById("transactions", tx.id, tx);
}

function removeLinkedLedger(tx) {
  if (tx.linkedIncomeId) deleteIncomeRecord(tx.linkedIncomeId);
  if (tx.linkedExpenseId) deleteExpenseRecord(tx.linkedExpenseId);
  tx.linkedIncomeId = "";
  tx.linkedExpenseId = "";
  replaceRecordById("transactions", tx.id, tx);
}

function removeItem(collection, id) {
  if (!confirm("Izbrišem ta vnos?")) return;
  if (collection === "transactions") {
    const tx = (state.transactions || []).find((item) => item.id === id);
    if (tx) removeLinkedLedger(tx);
  }
  if (collection === "expenses") {
    deleteExpenseRecord(id, true);
  } else if (collection === "incomes") {
    deleteIncomeRecord(id, true);
  } else {
    removeRecordById(collection, id);
  }
  save();
  render();
}

function numericField(key) {
  return ["amount", "balance", "quantity", "averagePrice", "currentValue", "addedThisMonth", "targetAmount", "currentAmount", "month", "year", "assets", "liabilities", "netWorth"].includes(key);
}

function render() {
  if (!currentProfile) {
    document.getElementById("app").innerHTML = loginView();
    bind();
    return;
  }
  if (!navItems.some(([id]) => id === active)) {
    active = state.settings.setupCompleted ? "dashboard" : "setup";
  }
  save();
  const item = navItems.find(([id]) => id === active) || navItems[0];
  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark"><span></span><span></span><span></span><span></span></div>
          <div>
            <h1>Financa <em>Pro</em></h1>
          </div>
        </div>
        <nav class="nav">
          ${navGroups.map((group) => `<div class="nav-group"><span class="nav-label">${group.title}</span>${group.items.map((id) => {
            const nav = navItems.find(([itemId]) => itemId === id);
            if (!nav) return "";
            const [, label] = nav;
            return `<button class="${active === id ? "active" : ""}" data-nav="${id}"><span class="nav-icon">${navIcons[id]}</span><span>${label}</span></button>`;
          }).join("")}</div>`).join("")}
        </nav>
        <div class="sidebar-card">
          <span class="premium-mark">PRO</span>
          <strong>Pametnejši pregled</strong>
          <p>${reviewTransactions().length} transakcij čaka pregled. Pravila uvoza se učijo iz tvojih popravkov.</p>
          <button class="button sidebar-cta" data-nav="transactions">Uredi zdaj</button>
        </div>
        <div class="user-card">
          <div class="avatar">${profileInitials(currentProfile.name)}</div>
          <div><strong>${escapeHtml(currentProfile.name)}</strong><span>${currentProfile.role === "admin" ? "Skrbnik" : "Uporabnik"} · ${googleSheetsConfig().enabled ? "Sheets" : "lokalno"}</span></div>
          <button class="icon-btn logout-btn" title="Odjava" data-action="logout">${icon("logout")}</button>
        </div>
      </aside>
      <main class="main">
        <div class="topbar">
          <div>
            <h2>${item[1]}</h2>
            <p>${item[2]}</p>
          </div>
          <div class="actions">
            <span class="date-pill">${monthLabel(filters.month, filters.year)}</span>
            ${quickAction()}
            <button class="icon-btn top-icon" title="Obvestila">!</button>
            <button class="icon-btn top-icon" title="Nastavitve" data-nav="settings">NA</button>
            <button class="button secondary theme-toggle" data-action="theme">${state.settings.theme === "dark" ? "Svetel način" : "Temen način"}</button>
          </div>
        </div>
        ${view()}
      </main>
    </div>
    ${modal ? modalHtml() : ""}
  `;
  bind();
}

function loginView() {
  return `<main class="login-screen">
    <section class="login-panel">
      <div class="login-brand">
        <div class="brand-mark"><span></span><span></span><span></span><span></span></div>
        <h1>Financa <em>Pro</em></h1>
      </div>
      <div>
        <span class="login-eyebrow">Zasebni dostop</span>
        <h2>Prijava</h2>
        <p>Vnesi svoj osebni ključ. Profil se prepozna samodejno.</p>
      </div>
      <form class="login-form" data-login-form>
        <label>Osebni ključ
          <input type="password" name="key" autocomplete="current-password" autofocus required>
        </label>
        ${authMessage ? `<div class="auth-error">${escapeHtml(authMessage)}</div>` : ""}
        <button class="button" type="submit" ${loginPending ? "disabled" : ""}>${loginPending ? "Preverjam ..." : "Vstopi v aplikacijo"}</button>
      </form>
      <small>Uporabi osebni ključ, ki ti ga je določil skrbnik.</small>
    </section>
  </main>`;
}

function profileInitials(name) {
  return String(name || "UP").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function quickAction() {
  const map = {
    incomes: ["Dodaj prihodek", "incomes"],
    expenses: ["Dodaj strošek", "expenses"],
    transactions: ["Dodaj transakcijo", "transactions"],
    accounts: ["Dodaj račun", "accounts"],
    investments: ["Dodaj investicijo", "investments"],
    liabilities: ["Dodaj obveznost", "liabilities"],
    taxes: ["Dodaj davek", "taxes"],
    goals: ["Dodaj cilj", "goals"],
    networth: ["Dodaj snapshot", "snapshots"],
    monthly: ["Dodaj komentar", "monthlyNotes"],
    setup: ["Shrani setup", "setupSave"],
  };
  const cfg = map[active];
  if (cfg?.[1] === "setupSave") return `<button class="button" data-action="save-setup">Shrani setup</button>`;
  return cfg ? `<button class="button" data-add="${cfg[1]}">${cfg[0]}</button>` : "";
}

function view() {
  const views = {
    dashboard: dashboardView,
    incomes: () => collectionView("incomes", "Prihodki", incomeColumns(), filterHtml("incomes")),
    expenses: () => collectionView("expenses", "Stroški", expenseColumns(), filterHtml("expenses")),
    transactions: transactionsView,
    accounts: accountsView,
    investments: investmentsView,
    networth: netWorthView,
    liabilities: () => collectionView("liabilities", "Obveznosti", liabilityColumns()),
    taxes: () => collectionView("taxes", "Davčni dogodki", taxColumns()),
    goals: goalsView,
    monthly: monthlyView,
    analytics: analyticsView,
    imports: importsView,
    setup: setupView,
    settings: settingsView,
  };
  return (views[active] || dashboardView)();
}

function dashboardView() {
  const data = monthlyData();
  const reviewCount = reviewTransactions().length;
  const liquidAccounts = data.countedAccounts.filter(isSpendableAccount);
  const netWorthHint = data.netWorthChange === null
    ? "primerjava bo na voljo po naslednjem snapshotu"
    : `${signed(data.netWorthChange)} od prejšnjega meseca`;
  const metrics = [
    ["Prihodki", data.incomeTotal, "tekoči mesec", "positive"],
    ["Stroški", data.expenseTotal, "tekoči mesec", "negative"],
    ["Prihranek", data.saved, `${NUMBER.format(data.savingsRate)} % plače`, data.saved >= 0 ? "positive" : "negative"],
    ["Investirano", data.invested, "dodano ta mesec", "positive"],
    ["Net worth", data.netWorth, netWorthHint, data.netWorthChange === null || data.netWorthChange >= 0 ? "positive" : "negative"],
    ["Obveznosti", data.liabilities, `${reviewCount} transakcij za pregled`, "warning"],
  ];
  return `
    <section class="grid metrics">${metrics.map(metricCard).join("")}</section>
    <section class="dashboard-charts" style="margin-top:14px">
      <div class="card dashboard-link" data-nav="networth">
        <div class="card-header"><h3>Net worth trend</h3><span class="pill">mesečni snapshoti</span></div>
        <div class="card-body">${trendChart(netWorthSeries())}</div>
      </div>
      <div class="card dashboard-link" data-nav="expenses">
        <div class="card-header"><h3>Mesečni stroški</h3><span class="pill">${monthLabel(filters.month, filters.year)}</span></div>
        <div class="card-body">${weeklyColumnChart(data.expenses)}</div>
      </div>
      <div class="card dashboard-link" data-nav="expenses">
        <div class="card-header"><h3>Stroški po kategorijah</h3></div>
        <div class="card-body">${donutChart(groupBy(data.expenses, "category"))}</div>
      </div>
    </section>
    <section class="dashboard-widgets" style="margin-top:14px">
      <div class="card dashboard-link" data-nav="accounts"><div class="card-header"><h3>Računi</h3></div><div class="card-body">${bars(liquidAccounts.map((a) => [a.name, a.balance]))}</div></div>
      <div class="card dashboard-link" data-nav="liabilities"><div class="card-header"><h3>Obveznosti v 30 dneh</h3></div><div class="card-body">${upcomingHtml()}</div></div>
      <div class="card dashboard-link" data-nav="goals"><div class="card-header"><h3>Cilji</h3></div><div class="card-body">${goalSummary()}</div></div>
    </section>
    <section class="card" style="margin-top:18px"><div class="card-header"><h3>Nedavne transakcije</h3><button class="button secondary" data-nav="transactions">Prikaži vse</button></div><div class="card-body table-wrap">${modernTransactionsTable(recentTransactions(6))}</div></section>
  `;
}

function metricCard([label, value, hint, tone]) {
  const target = dashboardNavTargets[label] || "";
  return `<article class="card metric ${target ? "dashboard-link" : ""}" ${target ? `data-nav="${target}"` : ""}><div class="metric-top"><span>${label}</span><i class="metric-icon ${tone}">${metricIcons[label] || "€"}</i></div><strong class="${tone}">${money(value)}</strong><small>${hint}</small></article>`;
}

function unavailableMetric(label, hint) {
  return `<article class="card metric"><div class="metric-top"><span>${label}</span><i class="metric-icon">-</i></div><strong>Ni podatka</strong><small>${hint}</small></article>`;
}

function signed(value) {
  return `${value >= 0 ? "+" : ""}${money(value)}`;
}

function upcomingHtml() {
  const items = upcomingLiabilities();
  if (!items.length) return `<div class="empty">Ni odprtih obveznosti v naslednjih 30 dneh.</div>`;
  return `<div class="notice">${items.map((item) => `<div class="notice-item"><strong>${item.name}</strong><br><span>${money(item.amount)} do ${item.dueDate}</span><br><span class="pill">${item.category}</span></div>`).join("")}</div>`;
}

function filterHtml(collection) {
  const extra = collection === "incomes"
    ? `<label>Kategorija<select data-filter="category"><option value="">Vse</option>${incomeCategories.map((c) => option(c, filters.category)).join("")}</select></label><label>Vir<input data-filter="source" value="${escapeAttr(filters.source)}"></label>`
    : `<label>Kategorija<select data-filter="category"><option value="">Vse</option>${expenseCategories.map((c) => option(c, filters.category)).join("")}</select></label><label>Račun<input data-filter="account" value="${escapeAttr(filters.account)}"></label>`;
  return `<div class="card"><div class="card-body filters">
    <label>Mesec<input type="number" min="1" max="12" data-filter="month" value="${filters.month}"></label>
    <label>Leto<input type="number" data-filter="year" value="${filters.year}"></label>
    ${extra}
  </div></div>`;
}

function collectionView(collection, title, columns, filtersHtml = "") {
  let rows = [...state[collection]];
  if (collection === "incomes") {
    rows = rows.filter((item) => sameMonth(item)).filter((item) => !filters.category || item.category === filters.category).filter((item) => !filters.source || String(item.source || "").toLowerCase().includes(filters.source.toLowerCase()));
  }
  if (collection === "expenses") {
    rows = rows.filter((item) => sameMonth(item)).filter((item) => !filters.category || item.category === filters.category).filter((item) => !filters.account || String(item.account || "").toLowerCase().includes(filters.account.toLowerCase()));
  }
  return `${filtersHtml}<div class="card" data-collection="${collection}" data-total-rows="${state[collection].length}" data-visible-rows="${rows.length}" style="margin-top:14px"><div class="card-header"><h3>${title}</h3><span class="pill">${rows.length} vnosov</span></div><div class="card-body table-wrap">${table(collection, rows, columns)}</div></div>`;
}

function table(collection, rows, columns) {
  if (!rows.length) return `<div class="empty">Ni vnosov.</div>`;
  return `<table><thead><tr>${columns.map((c) => `<th>${c[0]}</th>`).join("")}<th></th></tr></thead><tbody>${rows.map((row) => `<tr>${columns.map(([, renderCell]) => `<td>${renderCell(row)}</td>`).join("")}<td><div class="row-actions"><button class="icon-btn" title="Uredi" data-edit="${collection}:${row.id}">U</button><button class="icon-btn" title="Izbriši" data-delete="${collection}:${row.id}">X</button></div></td></tr>`).join("")}</tbody></table>`;
}

function incomeColumns() {
  return [["Datum", (r) => r.date], ["Naziv", (r) => r.name], ["Znesek", (r) => `<strong class="positive">${money(r.amount)}</strong>`], ["Kategorija", (r) => r.category], ["Vir", (r) => r.source], ["Račun", (r) => r.account || "Ni določen"], ["Opomba", (r) => r.note || ""]];
}

function expenseColumns() {
  return [["Datum", (r) => r.date], ["Naziv", (r) => r.name], ["Znesek", (r) => `<strong class="negative">${money(r.amount)}</strong>`], ["Kategorija", (r) => r.category], ["Vrsta", (r) => `<span class="pill">${r.kind}</span>`], ["Račun", (r) => r.account], ["Opomba", (r) => r.note || ""]];
}

function transactionsView() {
  const review = reviewTransactions();
  const ready = recentTransactions(200);
  return `<section class="grid metrics">
    ${countCard("Za pregled", review.length, "potrebuje ročno odločitev", "warning")}
    ${countCard("Uvoženo", state.transactions.length, "vse transakcije", "positive")}
    ${countCard("Transferji", state.transactions.filter((t) => t.status === "interni transfer").length, "ne vplivajo na porabo", "warning")}
  </section>
  <section class="grid two-col" style="margin-top:18px">
    <div class="card"><div class="card-header"><h3>Za pregled</h3><span class="pill">${review.length} odprtih</span></div><div class="card-body table-wrap">${modernTransactionsTable(review)}</div></div>
    <div class="card"><div class="card-header"><h3>Vse transakcije</h3></div><div class="card-body table-wrap">${modernTransactionsTable(ready)}</div></div>
  </section>`;
}

function countCard(label, value, hint, tone) {
  return `<article class="card metric"><div class="metric-top"><span>${label}</span><i class="metric-icon ${tone}">${metricIcons[label] || "TR"}</i></div><strong class="${tone}">${NUMBER.format(value)}</strong><small>${hint}</small></article>`;
}

function reviewTransactions() {
  return (state.transactions || []).filter((tx) => tx.status === "za pregled" || tx.confidence === "low").sort((a, b) => new Date(b.date) - new Date(a.date));
}

function recentTransactions(limit = 10) {
  return [...(state.transactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

function modernTransactionsTable(rows) {
  if (!rows.length) return `<div class="empty">Ni transakcij.</div>`;
  return `<table><thead><tr><th>Ime</th><th>Znesek</th><th>Datum</th><th>Kategorija</th><th>Račun</th><th>Status</th><th></th></tr></thead><tbody>
    ${rows.map((tx) => `<tr class="${tx.status === "za pregled" ? "review-row" : ""}">
      <td>${escapeHtml(tx.description || "")}<br><small class="muted">${escapeHtml(tx.source || "")} ${tx.confidence ? "· " + (confidenceLevels[tx.confidence] || tx.confidence) : ""}</small></td>
      <td><strong class="${Number(tx.amount) < 0 ? "negative" : "positive"}">${money(Number(tx.amount || 0))}</strong></td>
      <td>${escapeHtml(tx.date || "")}</td>
      <td><span class="pill">${escapeHtml(tx.category || "za pregled")}</span>${tx.subcategory ? `<br><small class="muted">${escapeHtml(tx.subcategory)}</small>` : ""}</td>
      <td>${escapeHtml(tx.account || "")}</td>
      <td>${escapeHtml(tx.status || "")}</td>
      <td><div class="row-actions"><button class="icon-btn" title="Uredi" data-edit="transactions:${tx.id}">U</button><button class="icon-btn" title="Zapomni pravilo" data-rule-from-transaction="${tx.id}">Z</button></div></td>
    </tr>`).join("")}
  </tbody></table>`;
}

function transactionsTable(rows) {
  if (!rows.length) return `<div class="empty">Ni transakcij.</div>`;
  return `<table><thead><tr><th>Datum</th><th>Opis</th><th>Kategorija</th><th>Račun</th><th>Status</th><th>Znesek</th><th></th></tr></thead><tbody>
    ${rows.map((tx) => `<tr class="${tx.status === "za pregled" ? "review-row" : ""}">
      <td>${escapeHtml(tx.date || "")}</td>
      <td>${escapeHtml(tx.description || "")}<br><small class="muted">${escapeHtml(tx.source || "")} ${tx.confidence ? "· " + (confidenceLevels[tx.confidence] || tx.confidence) : ""}</small></td>
      <td><span class="pill">${escapeHtml(tx.category || "za pregled")}</span>${tx.subcategory ? `<br><small class="muted">${escapeHtml(tx.subcategory)}</small>` : ""}</td>
      <td>${escapeHtml(tx.account || "")}</td>
      <td>${escapeHtml(tx.status || "")}</td>
      <td><strong class="${Number(tx.amount) < 0 ? "negative" : "positive"}">${money(Math.abs(Number(tx.amount || 0)))}</strong></td>
      <td><div class="row-actions"><button class="icon-btn" title="Uredi" data-edit="transactions:${tx.id}">U</button><button class="icon-btn" title="Zapomni pravilo" data-rule-from-transaction="${tx.id}">Z</button></div></td>
    </tr>`).join("")}
  </tbody></table>`;
}

function liabilityColumns() {
  return [["Rok", (r) => r.dueDate], ["Naziv", (r) => r.name], ["Znesek", (r) => money(r.amount)], ["Status", (r) => `<span class="pill">${r.status}</span>`], ["Kategorija", (r) => r.category], ["Opomba", (r) => r.note || ""]];
}

function taxColumns() {
  return [["Datum", (r) => r.date], ["Naziv", (r) => r.name], ["Vrsta", (r) => r.type], ["Znesek", (r) => money(r.amount)], ["Status", (r) => `<span class="pill">${r.status}</span>`], ["Rok", (r) => r.dueDate], ["Opomba", (r) => r.note || ""]];
}

function accountsView() {
  const data = monthlyData();
  return `<section class="grid metrics">
    ${metricCard(["Sredstva na računih", data.accountAssets, "računi in premoženje", "positive"])}
    ${metricCard(["Investicije", data.investmentAssets, "ločeno prištete pozicije", "positive"])}
    ${metricCard(["Odprte obveznosti", data.liabilities, "brez dvojnikov", "warning"])}
  </section>
  <div class="card" style="margin-top:14px"><div class="card-header"><h3>Računi in premoženje</h3></div><div class="card-body table-wrap">${table("accounts", data.countedAccounts, [["Naziv", (r) => r.name], ["Stanje", (r) => `<strong>${money(r.balance)}</strong>`], ["Vrsta", (r) => r.type], ["Opomba", (r) => r.note || ""]])}</div></div>`;
}

function investmentsView() {
  const portfolioAccounts = investmentAccounts();
  const standalonePositions = netWorthBreakdown().investments;
  const accountValue = sum(portfolioAccounts, "balance");
  const positionValue = sum(standalonePositions, "currentValue");
  const current = accountValue + positionValue;
  const positionsWithCost = state.investments.filter((item) => Number(item.quantity || 0) > 0 && Number(item.averagePrice || 0) > 0);
  const invested = positionsWithCost.reduce((total, item) => total + Number(item.quantity) * Number(item.averagePrice), 0);
  const valuedPositions = sum(positionsWithCost, "currentValue");
  const returnMetric = positionsWithCost.length
    ? metricCard(["Donos pozicij", valuedPositions - invested, "samo pozicije z nakupno ceno", valuedPositions - invested >= 0 ? "positive" : "negative"])
    : unavailableMetric("Donos", "Dodaj prvo investicijsko pozicijo");
  const allocation = [
    ...portfolioAccounts.map((account) => [account.name, account.balance]),
    ...standalonePositions.map((position) => [position.type || position.name, position.currentValue]),
  ];
  return `<section class="grid metrics">
    ${metricCard(["Skupna vrednost", current, `${portfolioAccounts.length} investicijskih računov`, "positive"])}
    ${metricCard(["Dodano ta mesec", sum(state.investments.filter((i) => sameMonth(i)), "addedThisMonth"), monthLabel(filters.month, filters.year), "positive"])}
    ${returnMetric}
  </section>
  <section class="grid two-col" style="margin-top:14px">
    <div class="card"><div class="card-header"><h3>Investicijski računi</h3></div><div class="card-body">${portfolioAccounts.length ? netWorthItems(portfolioAccounts, "balance") : `<div class="empty">IBKR ali Crypto dodaj v začetnem setupu.</div>`}</div></div>
    <div class="card"><div class="card-header"><h3>Razdelitev portfelja</h3></div><div class="card-body">${bars(allocation)}</div></div>
  </section>
  <section class="card" style="margin-top:14px">
    <div class="card-header"><h3>Posamezne pozicije</h3><span class="pill">ročni vnosi</span></div>
    <div class="card-body table-wrap">${table("investments", state.investments, [["Datum", (r) => r.date], ["Naziv", (r) => r.name], ["Ticker", (r) => r.ticker], ["Vrsta", (r) => r.type], ["Količina", (r) => r.quantity], ["Trenutna vrednost", (r) => money(r.currentValue)], ["Donos", (r) => Number(r.quantity || 0) && Number(r.averagePrice || 0) ? money(Number(r.currentValue || 0) - Number(r.quantity) * Number(r.averagePrice)) : "-"]])}</div>
  </section>`;
}

function investmentAccounts() {
  return dedupeFinancialItems(state.accounts || [], canonicalAssetKey).filter((item) =>
    ["ibkr", "crypto"].includes(canonicalAssetKey(item))
  );
}

function netWorthView() {
  const data = monthlyData();
  const snapshotRows = netWorthHistory();
  return `<div class="actions" style="justify-content:flex-start;margin-bottom:14px"><button class="button" data-nav="setup">Posodobi najnovejše stanje</button><span class="pill">Izračun brez podvojenih zapisov</span></div>
  <section class="grid metrics">
    ${metricCard(["Sredstva", data.assets, `${money(data.accountAssets)} premoženje + ${money(data.investmentAssets)} investicije`, "positive"])}
    ${metricCard(["Obveznosti", data.liabilities, `${data.countedLiabilities.length} odprtih postavk`, "warning"])}
    ${metricCard(["Net worth", data.netWorth, "sredstva minus obveznosti", data.netWorth >= 0 ? "positive" : "negative"])}
  </section>
  <section class="grid three-col" style="margin-top:14px">
    <div class="card"><div class="card-header"><h3>Premoženje</h3><strong class="positive">${money(data.accountAssets)}</strong></div><div class="card-body">${netWorthItems(data.countedAccounts, "balance")}</div></div>
    <div class="card"><div class="card-header"><h3>Investicije</h3><strong class="positive">${money(data.investmentAssets)}</strong></div><div class="card-body">${netWorthItems(data.countedInvestments, "currentValue")}</div></div>
    <div class="card"><div class="card-header"><h3>Obveznosti</h3><strong class="negative">${money(data.liabilities)}</strong></div><div class="card-body">${netWorthItems(data.countedLiabilities, "amount")}</div></div>
  </section>
  <section class="grid two-col" style="margin-top:14px">
    <div class="card"><div class="card-header"><h3>Gibanje net worth</h3></div><div class="card-body">${trendChart(snapshotRows.map((s) => [monthLabel(s.month, s.year), s.netWorth]))}</div></div>
    <div class="card"><div class="card-header"><h3>Mesečni snapshoti</h3></div><div class="card-body table-wrap">${table("snapshots", state.snapshots, [["Mesec", (r) => `${r.month}/${r.year}`], ["Sredstva", (r) => money(r.assets)], ["Obveznosti", (r) => money(r.liabilities)], ["Net worth", (r) => money(r.netWorth)], ["Opomba", (r) => r.note || ""]])}</div></div>
  </section>`;
}

function netWorthItems(items, key) {
  if (!items.length) return `<div class="empty">Ni postavk.</div>`;
  return `<div class="nw-breakdown">${items.map((item) => `<div><span>${escapeHtml(item.name || item.ticker || "Postavka")}</span><strong>${money(item[key])}</strong></div>`).join("")}</div>`;
}

function goalsView() {
  return `<div class="grid three-col">${state.goals.map((goal) => {
    const pct = Math.min(100, Number(goal.currentAmount || 0) / Math.max(1, Number(goal.targetAmount || 0)) * 100);
    return `<article class="card metric"><span>${goal.priority} prioriteta</span><strong>${goal.name}</strong><small>${money(goal.currentAmount)} od ${money(goal.targetAmount)} do ${goal.dueDate}</small><div class="progress" style="--value:${pct}%"><span></span></div><small>${NUMBER.format(pct)} %</small><div class="row-actions"><button class="button secondary" data-edit="goals:${goal.id}">Uredi</button><button class="button danger" data-delete="goals:${goal.id}">Izbriši</button></div></article>`;
  }).join("")}</div>`;
}

function monthlyView() {
  const data = monthlyData();
  const note = state.monthlyNotes.find((n) => Number(n.month) === Number(filters.month) && Number(n.year) === Number(filters.year));
  const netWorthMetric = data.netWorthChange === null
    ? unavailableMetric("Sprememba NW", "Potrebna sta dva mesečna snapshota")
    : metricCard(["Sprememba NW", data.netWorthChange, "glede na prejšnji snapshot", data.netWorthChange >= 0 ? "positive" : "negative"]);
  return `${filterHtml("expenses")}
    <section class="grid metrics" style="margin-top:14px">
      ${metricCard(["Prihodki", data.incomeTotal, monthLabel(filters.month, filters.year), "positive"])}
      ${metricCard(["Stroški", data.expenseTotal, "skupaj", "negative"])}
      ${metricCard(["Prihranek", data.saved, `${NUMBER.format(data.savingsRate)} % savings rate`, data.saved >= 0 ? "positive" : "negative"])}
      ${metricCard(["Investirano", data.invested, "ta mesec", "positive"])}
      ${netWorthMetric}
    </section>
    <section class="grid two-col" style="margin-top:14px">
      <div class="card"><div class="card-header"><h3>Največje kategorije stroškov</h3></div><div class="card-body">${bars(groupBy(data.expenses, "category"))}</div></div>
      <div class="card"><div class="card-header"><h3>Komentar meseca</h3>${note ? `<button class="button secondary" data-edit="monthlyNotes:${note.id}">Uredi</button>` : `<button class="button" data-add="monthlyNotes">Dodaj komentar</button>`}</div><div class="card-body">${noteHtml(note)}</div></div>
    </section>`;
}

function noteHtml(note) {
  if (!note) return `<div class="empty">Za ta mesec še ni komentarja.</div>`;
  return `<p><strong>Kaj je šlo dobro</strong><br>${note.good || "-"}</p><p><strong>Kaj je šlo slabo</strong><br>${note.bad || "-"}</p><p><strong>Kaj popraviti</strong><br>${note.next || "-"}</p>`;
}

function analyticsView() {
  const months = recordedActivityMonths(6);
  const completedMonths = completedActivityMonths(6);
  const selectedExpenses = state.expenses.filter((item) => sameMonth(item));
  const monthData = months.map(([month, year]) => monthlyData(month, year));
  const incomeSeries = months.map(([m, y]) => [monthLabel(m, y), sum(state.incomes.filter((i) => sameMonth(i, "date", m, y)))]);
  const expenseSeries = months.map(([m, y]) => [monthLabel(m, y), sum(state.expenses.filter((i) => sameMonth(i, "date", m, y)))]);
  const savingsSeries = months.map(([m, y]) => {
    const d = monthlyData(m, y);
    return [monthLabel(m, y), d.savingsRate];
  }).filter(([, rate], index) => sum(state.incomes.filter((i) => sameMonth(i, "date", months[index][0], months[index][1]))) > 0);
  const nwSeries = netWorthHistory().map((s) => [monthLabel(s.month, s.year), s.netWorth]);
  const averageIncome = average(monthData.map((item) => item.incomeTotal));
  const averageExpenses = average(monthData.map((item) => item.expenseTotal));
  const averageSavings = average(monthData.map((item) => item.saved));
  const structure = groupBy(selectedExpenses, "kind");
  return `<section class="grid metrics">
    ${metricCard(["Povp. prihodki", averageIncome, trackedMonthsLabel(months.length), "positive"])}
    ${metricCard(["Povp. stroški", averageExpenses, trackedMonthsLabel(months.length), "negative"])}
    ${metricCard(["Povp. prihranek", averageSavings, "na evidentirani mesec", averageSavings >= 0 ? "positive" : "negative"])}
    ${countCard("Zaključeni meseci", completedMonths.length, completedMonths.length >= 3 ? "forecast je na voljo" : "za forecast so potrebni 3", completedMonths.length >= 3 ? "positive" : "warning")}
  </section>
  <section class="grid two-col" style="margin-top:14px">
    <div class="card"><div class="card-header"><h3>Prihodki po mesecih</h3></div><div class="card-body">${trendChart(incomeSeries)}</div></div>
    <div class="card"><div class="card-header"><h3>Stroški po mesecih</h3></div><div class="card-body">${trendChart(expenseSeries)}</div></div>
    <div class="card"><div class="card-header"><h3>Savings rate</h3></div><div class="card-body">${trendChart(savingsSeries, "%")}</div></div>
    <div class="card"><div class="card-header"><h3>Net worth</h3></div><div class="card-body">${trendChart(nwSeries)}</div></div>
    <div class="card"><div class="card-header"><h3>Stroški po kategorijah</h3><span class="pill">${monthLabel(filters.month, filters.year)}</span></div><div class="card-body">${bars(groupBy(selectedExpenses, "category"))}</div></div>
    <div class="card"><div class="card-header"><h3>Struktura stroškov</h3><span class="pill">${monthLabel(filters.month, filters.year)}</span></div><div class="card-body">${donutChart(structure)}</div></div>
  </section>
  <section class="analytics-deep" style="margin-top:14px">
    <div class="card"><div class="card-header"><h3>Forecast</h3><span class="pill">3 / 6 / 12 mesecev</span></div><div class="card-body">${forecastHtml(months)}</div></div>
    <div class="card"><div class="card-header"><h3>Priporočena razporeditev</h3><span class="pill">informativna smernica</span></div><div class="card-body">${allocationGuidanceHtml(months)}</div></div>
  </section>
  <section class="card" style="margin-top:14px">
    <div class="card-header"><h3>Priložnosti za zmanjšanje porabe</h3><span class="pill">${months.length >= 3 ? "na podlagi povprečja" : "preliminarno"}</span></div>
    <div class="card-body">${spendingRecommendationsHtml(months)}</div>
  </section>`;
}

function average(values) {
  return values.length ? values.reduce((total, value) => total + Number(value || 0), 0) / values.length : 0;
}

function completedActivityMonths(limit = 6) {
  return recordedActivityMonths(limit + 1).filter(([month, year]) =>
    year < currentYear || (year === currentYear && month < currentMonth)
  ).slice(-limit);
}

function forecastHtml() {
  const months = completedActivityMonths(6);
  if (months.length < 3) {
    return `<div class="empty">Forecast bo na voljo po treh zaključenih mesecih. Trenutno jih je ${months.length}.</div>`;
  }
  const recent = months.slice(-3).map(([month, year]) => monthlyData(month, year));
  const monthlyIncome = average(recent.map((item) => item.incomeTotal));
  const monthlyExpenses = average(recent.map((item) => item.expenseTotal));
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  return `<div class="forecast-grid">
    ${[3, 6, 12].map((period) => `<div><span>Čez ${period} mesecev</span><strong class="${monthlySurplus >= 0 ? "positive" : "negative"}">${money(monthlySurplus * period)}</strong><small>ocenjeni kumulativni presežek</small></div>`).join("")}
    <div><span>Pričakovani mesečni stroški</span><strong>${money(monthlyExpenses)}</strong><small>povprečje zadnjih 3 zaključenih mesecev</small></div>
  </div>`;
}

function trackedMonthsLabel(count) {
  if (count === 1) return "1 evidentirani mesec";
  if (count === 2) return "2 evidentirana meseca";
  return `${count} evidentiranih mesecev`;
}

function analyticsExpenseSample(months) {
  const selected = months.length ? months : recordedActivityMonths(1);
  return state.expenses.filter((item) => selected.some(([month, year]) => sameMonth(item, "date", month, year)));
}

function allocationGuidanceHtml(months) {
  if (!months.length) return `<div class="empty">Za priporočilo najprej dodaj prihodke in stroške.</div>`;
  const data = months.slice(-3).map(([month, year]) => monthlyData(month, year));
  const monthlyIncome = average(data.map((item) => item.incomeTotal));
  const monthlyExpenses = average(months.slice(-3).map(([month, year]) =>
    sum(state.expenses.filter((item) => sameMonth(item, "date", month, year) && item.kind !== "enkratni večji"))
  ));
  if (!monthlyIncome && !monthlyExpenses) return `<div class="empty">Za priporočilo ni dovolj podatkov.</div>`;
  const discretionary = new Set(["restavracije/kava", "prosti čas", "naročnine", "oblačila", "potovanja", "spletni nakupi"]);
  const discretionaryMonthly = average(months.slice(-3).map(([month, year]) =>
    sum(state.expenses.filter((item) =>
      sameMonth(item, "date", month, year) && item.kind !== "enkratni večji" && discretionary.has(item.category)
    ))
  ));
  const essentialMonthly = Math.max(0, monthlyExpenses - discretionaryMonthly);
  const revolutTarget = Math.min(monthlyIncome * 0.3, Math.max(discretionaryMonthly * 1.05, monthlyExpenses * 0.12));
  const cashTarget = Math.min(300, Math.max(100, essentialMonthly / 4));
  const bankTarget = monthlyExpenses * 1.5;
  const reserveTarget = essentialMonthly * 3;
  const investTarget = Math.max(0, (monthlyIncome - monthlyExpenses) * 0.6);
  const actual = accountAllocation();
  const rows = [
    ["Revolut mesečni budget", revolutTarget, actual.revolut],
    ["Fizična gotovina", cashTarget, actual.cash],
    ["Operativno na banki", bankTarget, actual.bank],
    ["Varnostna rezerva", reserveTarget, actual.savings],
    ["Mesečno za investiranje", investTarget, actual.investments],
  ];
  return `<div class="allocation-list">${rows.map(([label, target, current]) => `<div>
    <span>${label}</span>
    <strong>${money(target)}</strong>
    <small>${label.includes("meseč") || label.includes("Budget") ? "predlagano na mesec" : `trenutno ${money(current)}`}</small>
  </div>`).join("")}</div>
  <p class="analysis-note">Smernice temeljijo na trenutni porabi, niso individualno finančno svetovanje. Varnostna rezerva je ocenjena na tri mesece osnovnih stroškov.</p>`;
}

function accountAllocation() {
  const accounts = state.accounts || [];
  const byKey = (key) => sum(accounts.filter((item) => canonicalAssetKey(item) === key), "balance");
  return {
    bank: byKey("banka"),
    revolut: byKey("revolut"),
    cash: byKey("gotovina"),
    savings: byKey("varcevalni"),
    investments: sum(investmentAccounts(), "balance") + sum(netWorthBreakdown().investments, "currentValue"),
  };
}

function spendingRecommendationsHtml(months) {
  if (!months.length) return `<div class="empty">Za priporočila najprej evidentiraj vsaj en mesec stroškov.</div>`;
  const sampleMonths = months.slice(-3);
  const sample = analyticsExpenseSample(sampleMonths).filter((item) => item.kind !== "enkratni večji");
  const monthlyExpense = average(sampleMonths.map(([month, year]) =>
    sum(sample.filter((item) => sameMonth(item, "date", month, year)))
  ));
  if (!monthlyExpense) return `<div class="empty">V izbranem obdobju ni stroškov.</div>`;
  const thresholds = new Map([
    ["restavracije/kava", 0.08],
    ["prosti čas", 0.08],
    ["naročnine", 0.04],
    ["oblačila", 0.05],
    ["spletni nakupi", 0.06],
    ["potovanja", 0.15],
  ]);
  const categoryMonthly = groupBy(sample, "category").map(([category, total]) => [category, total / sampleMonths.length]);
  const suggestions = categoryMonthly
    .map(([category, value]) => {
      const targetShare = thresholds.get(category);
      if (!targetShare || value <= monthlyExpense * targetShare) return null;
      const saving = value - monthlyExpense * targetShare;
      return { category, value, saving, share: value / monthlyExpense * 100 };
    })
    .filter(Boolean)
    .sort((a, b) => b.saving - a.saving);
  if (!suggestions.length) {
    return `<div class="recommendation-list"><div class="recommendation good"><strong>Poraba je uravnotežena</strong><span>V pregledanih kategorijah ni izrazitega preseganja orientacijskih deležev.</span></div></div>`;
  }
  return `<div class="recommendation-list">${suggestions.map((item) => `<div class="recommendation">
    <div><strong>${escapeHtml(item.category)}</strong><span>${NUMBER.format(item.share)} % mesečne porabe · povprečno ${money(item.value)}</span></div>
    <b>Možen prihranek ${money(item.saving)} / mesec</b>
  </div>`).join("")}</div>`;
}

function importsView() {
  const history = state.importHistory || [];
  const rules = state.categoryRules || [];
  return `<section class="grid two-col">
    <div class="card">
      <div class="card-header"><h3>Uvoz transakcij</h3><span class="pill">Vir: Revolut · CSV</span></div>
      <div class="card-body">
        <div class="import-drop">
          <label>Naloži CSV datoteko iz Revoluta
            <input type="file" accept=".csv,text/csv" data-action="import-revolut-csv">
          </label>
          <p>Datoteka se obdela lokalno v brskalniku. Podatki se ne pošiljajo zunanjim servisom.</p>
        </div>
        ${importDraft ? importMappingHtml() : `<div class="empty">Izberi CSV datoteko za predogled transakcij pred uvozom.</div>`}
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <h3>Zgodovina uvozov</h3>
        ${history.length ? `<button class="button secondary" data-action="undo-last-import">Razveljavi zadnji uvoz</button>` : ""}
      </div>
      <div class="card-body table-wrap">${importHistoryTable(history)}</div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Naučena pravila</h3><button class="button secondary" data-add="categoryRules">Dodaj pravilo</button></div>
      <div class="card-body table-wrap">${categoryRulesTable(rules)}</div>
    </div>
  </section>
  ${importDraft ? `<section class="card" style="margin-top:14px"><div class="card-header"><h3>Predogled pred uvozom</h3>${importDraftActions()}</div><div class="card-body">${importPreviewFilters()}<div class="table-wrap">${importPreviewTable()}</div></div></section>` : ""}`;
}

function setupView() {
  const data = monthlyData();
  return `<form class="setup-mode" data-setup-form>
    <section class="setup-intro">
      <div>
        <span class="pill">${state.settings.setupCompleted ? "Posodobitev stanja" : "Prvi zagon"}</span>
        <h3>${state.settings.setupCompleted ? "Osveži finančno sliko" : "Nastavi začetno finančno sliko"}</h3>
        <p>Vnesi samo postavke, ki jih dejansko imaš. Prazna polja se ne bodo ustvarila.</p>
      </div>
    </section>
    <section class="grid metrics">
      ${metricCard(["Sredstva", data.assets, "trenutni izračun", "positive"])}
      ${metricCard(["Obveznosti", data.liabilities, "odprto", "warning"])}
      ${metricCard(["Net worth", data.netWorth, "po zadnjih podatkih", data.netWorth >= 0 ? "positive" : "negative"])}
    </section>
    <section class="grid two-col" style="margin-top:18px">
      <div class="card">
        <div class="card-header"><h3>Premoženje</h3><span class="pill">sredstva</span></div>
        <div class="card-body setup-grid">
          ${setupAssets.map(([key, label, type]) => setupMoneyField("asset", key, label, assetSetupValue(key, label, type))).join("")}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Dolgovi in obveznosti</h3><span class="pill">minus</span></div>
        <div class="card-body setup-grid">
          ${setupDebts.map(([key, label, category]) => setupMoneyField("debt", key, label, debtSetupValue(key, label, category))).join("")}
        </div>
      </div>
    </section>
    <section class="card" style="margin-top:18px">
      <div class="card-header"><h3>Vozila</h3><button class="button secondary" type="button" data-action="add-setup-vehicle">Dodaj vozilo</button></div>
      <div class="card-body">
        <div class="setup-vehicles" data-setup-vehicles>
          ${setupVehicleRows().map((vehicle) => setupVehicleField(vehicle)).join("")}
        </div>
        <p class="setup-hint">Primer: BMW · 12.000 € ali Vespa · 5.000 €. Vrednost naj bo trenutna ocenjena tržna vrednost.</p>
      </div>
    </section>
    <section class="card" style="margin-top:18px">
      <div class="card-header"><h3>Snapshot</h3><span class="pill">${monthLabel(currentMonth, currentYear)}</span></div>
      <div class="card-body form-grid">
        <label class="wide">Opomba snapshot-a<textarea name="setupNote">Najnovejši setup podatki</textarea></label>
        <label>Mesec<input type="number" min="1" max="12" name="setupMonth" value="${currentMonth}"></label>
        <label>Leto<input type="number" name="setupYear" value="${currentYear}"></label>
        <label class="remember-rule setup-checkbox"><input type="checkbox" name="replaceSetup" checked> Prepiši prejšnje setup zapise</label>
        <div class="full actions" style="justify-content:flex-start"><button class="button" type="submit">Shrani najnovejše stanje</button><button class="button secondary" type="button" data-action="fill-current-setup">Osveži iz obstoječih podatkov</button></div>
      </div>
    </section>
  </form>`;
}

function setupMoneyField(kind, key, label, value) {
  return `<label>${label}<input type="number" step="0.01" min="0" data-setup-${kind}="${key}" value="${Number(value || 0)}"></label>`;
}

function setupVehicleRows() {
  const vehicles = (state.accounts || []).filter((item) =>
    normalizeText(item.type) === "vozilo" || ["avto", "vespa"].includes(item.setupKey)
  );
  return vehicles.length ? vehicles : [{ id: "", name: "", balance: 0 }];
}

function setupVehicleField(vehicle = {}) {
  return `<div class="setup-vehicle-row" data-setup-vehicle data-existing-id="${escapeAttr(vehicle.id || "")}">
    <label>Naziv vozila<input type="text" data-vehicle-name value="${escapeAttr(vehicle.name || "")}" placeholder="npr. BMW"></label>
    <label>Ocenjena tržna vrednost<input type="number" step="0.01" min="0" data-vehicle-value value="${Number(vehicle.balance || 0)}"></label>
    <button class="icon-btn" type="button" title="Odstrani vozilo" data-action="remove-setup-vehicle">X</button>
  </div>`;
}

function assetSetupValue(key, label, type) {
  const byKey = state.accounts.find((item) => canonicalAssetKey(item) === key);
  if (byKey) return byKey.balance;
  const byName = state.accounts.find((item) => normalizeText(item.name) === normalizeText(label) || normalizeText(item.type) === normalizeText(type));
  return byName?.balance || 0;
}

function debtSetupValue(key, label, category) {
  const byKey = state.liabilities.find((item) => canonicalDebtKey(item) === key && item.status !== "plačano" && item.status !== "preklicano");
  if (byKey) return byKey.amount;
  const byName = state.liabilities.find((item) => normalizeText(item.name) === normalizeText(label) || item.category === category);
  return byName?.amount || 0;
}

function saveSetupMode(form) {
  const formData = new FormData(form);
  const firstSetup = !state.settings.setupCompleted;
  const replaceSetup = formData.get("replaceSetup") === "on";
  const note = String(formData.get("setupNote") || "Najnovejši setup podatki");
  const month = Number(formData.get("setupMonth") || currentMonth);
  const year = Number(formData.get("setupYear") || currentYear);
  const assetRows = setupAssets.map(([key, label, type]) => ({
    key,
    label,
    type,
    amount: Number(form.querySelector(`[data-setup-asset="${key}"]`)?.value || 0),
  }));
  const debtRows = setupDebts.map(([key, label, category]) => ({
    key,
    label,
    category,
    amount: Number(form.querySelector(`[data-setup-debt="${key}"]`)?.value || 0),
  }));
  const vehicleRows = [...form.querySelectorAll("[data-setup-vehicle]")].map((row) => ({
    id: row.dataset.existingId || "",
    name: String(row.querySelector("[data-vehicle-name]")?.value || "").trim(),
    amount: Number(row.querySelector("[data-vehicle-value]")?.value || 0),
  })).filter((row) => row.name && row.amount > 0);
  if (replaceSetup) {
    const assetKeys = new Set(setupAssets.map(([key]) => key));
    const debtKeys = new Set(setupDebts.map(([key]) => key));
    state.accounts = state.accounts.filter((item) =>
      !assetKeys.has(canonicalAssetKey(item)) && normalizeText(item.type) !== "vozilo"
    );
    state.liabilities = state.liabilities.filter((item) => !debtKeys.has(canonicalDebtKey(item)));
  }
  for (const asset of assetRows) {
    if (asset.amount <= 0) continue;
    const existing = state.accounts.find((item) => canonicalAssetKey(item) === asset.key);
    const row = {
      id: existing?.id || crypto.randomUUID(),
      name: asset.label,
      balance: asset.amount,
      type: asset.type,
      note,
      setupKey: asset.key,
      updatedAt: new Date().toISOString(),
    };
    state.accounts = existing ? state.accounts.map((item) => (item.id === existing.id ? row : item)) : [row, ...state.accounts];
  }
  for (const debt of debtRows) {
    if (debt.amount <= 0) continue;
    const existing = state.liabilities.find((item) => canonicalDebtKey(item) === debt.key);
    const row = {
      id: existing?.id || crypto.randomUUID(),
      name: debt.label,
      amount: debt.amount,
      dueDate: iso(currentYear, currentMonth, Math.min(now.getDate(), 28)),
      status: "odprto",
      category: debt.category,
      note,
      setupKey: debt.key,
      updatedAt: new Date().toISOString(),
    };
    state.liabilities = existing ? state.liabilities.map((item) => (item.id === existing.id ? row : item)) : [row, ...state.liabilities];
  }
  for (const vehicle of vehicleRows) {
    const existing = state.accounts.find((item) => item.id === vehicle.id);
    const vehicleId = existing?.id || vehicle.id || crypto.randomUUID();
    const row = {
      id: vehicleId,
      name: vehicle.name,
      balance: vehicle.amount,
      type: "vozilo",
      note,
      setupKey: `vehicle_${vehicleId}`,
      updatedAt: new Date().toISOString(),
    };
    state.accounts = existing ? state.accounts.map((item) => (item.id === existing.id ? row : item)) : [row, ...state.accounts];
  }
  state.accounts = dedupeFinancialItems(state.accounts, canonicalAssetKey);
  state.liabilities = dedupeFinancialItems(state.liabilities, canonicalDebtKey);
  const assets = assetRows.reduce((total, row) => total + Number(row.amount || 0), 0)
    + vehicleRows.reduce((total, row) => total + Number(row.amount || 0), 0);
  const liabilities = debtRows.reduce((total, row) => total + Number(row.amount || 0), 0);
  const snapshot = {
    id: crypto.randomUUID(),
    month,
    year,
    assets,
    liabilities,
    netWorth: assets - liabilities,
    note,
  };
  state.snapshots = [snapshot, ...state.snapshots.filter((item) => !(Number(item.month) === month && Number(item.year) === year && String(item.note || "").includes("setup")))];
  state.settings.setupCompleted = true;
  save();
  active = firstSetup ? "dashboard" : "networth";
  render();
}

function importMappingHtml() {
  const headers = importDraft.headers;
  const stats = importStats();
  const mappingFields = [
    ["date", "datum"],
    ["description", "opis"],
    ["amount", "znesek"],
    ["currency", "valuta"],
    ["balance", "stanje"],
    ["type", "tip"],
    ["reference", "reference / merchant"],
  ];
  return `<div class="import-summary">
    <div><span>Datoteka</span><strong>${escapeHtml(importDraft.fileName)}</strong></div>
    <div><span>Vse transakcije</span><strong>${stats.total}</strong></div>
    <div><span>Avtomatsko kategorizirane</span><strong>${stats.autoCategorized}</strong></div>
    <div><span>Za pregled</span><strong>${stats.review}</strong></div>
    <div><span>Možni dvojniki</span><strong>${stats.duplicates}</strong></div>
    <div><span>Stroški</span><strong class="negative">${money(stats.expenseTotal)}</strong></div>
    <div><span>Prihodki</span><strong class="positive">${money(stats.incomeTotal)}</strong></div>
    <div><span>Interni transferji</span><strong>${money(stats.transferTotal)}</strong></div>
  </div>
  <div class="mapping-grid">
    ${mappingFields.map(([key, label]) => `<label>${label}<select data-map="${key}"><option value="">Ni stolpca</option>${headers.map((h) => option(h, importDraft.mapping[key])).join("")}</select></label>`).join("")}
    <label>Račun<input data-import-account value="${escapeAttr(importDraft.account)}"></label>
  </div>`;
}

function importStats() {
  const rows = importDraft?.transactions || [];
  return {
    total: rows.length,
    autoCategorized: rows.filter((tx) => tx.status === "pripravljeno" && tx.confidence !== "low").length,
    review: rows.filter((tx) => tx.status === "za pregled" || tx.confidence === "low").length,
    duplicates: rows.filter((tx) => tx.status === "možen dvojnik").length,
    expenseTotal: rows.filter((tx) => tx.status === "pripravljeno" && tx.amount < 0).reduce((total, tx) => total + Math.abs(tx.amount), 0),
    incomeTotal: rows.filter((tx) => tx.status === "pripravljeno" && tx.amount > 0).reduce((total, tx) => total + tx.amount, 0),
    transferTotal: rows.filter((tx) => tx.status === "interni transfer").reduce((total, tx) => total + Math.abs(tx.amount), 0),
  };
}

function importDraftActions() {
  const ready = importDraft.transactions.filter((t) => t.status === "pripravljeno").length;
  return `<div class="actions">
    <button class="button secondary" data-action="reparse-import">Osveži predogled</button>
    <button class="button" data-action="confirm-import" ${ready ? "" : "disabled"}>Uvozi ${ready} transakcij</button>
  </div>`;
}

function importPreviewFilters() {
  const items = [
    ["all", "Vse transakcije"],
    ["unclear", "Samo nejasne"],
    ["duplicates", "Samo možni dvojniki"],
    ["transfers", "Samo interni transferji"],
  ];
  return `<div class="segmented">${items.map(([id, label]) => `<button class="${importFilter === id ? "active" : ""}" data-import-filter="${id}">${label}</button>`).join("")}</div>`;
}

function importPreviewTable() {
  const rows = filteredImportTransactions();
  if (!rows.length) return `<div class="empty">CSV nima zaznanih transakcij.</div>`;
  return `<table class="import-table"><thead><tr>
    <th>Datum</th><th>Opis</th><th>Znesek</th><th>Valuta</th><th>Tip</th><th>Kategorija</th><th>Zaupanje</th><th>Zapomni</th><th>Račun</th><th>Status</th>
  </tr></thead><tbody>${rows.map((tx) => `<tr class="${tx.status === "možen dvojnik" ? "duplicate-row" : tx.status === "za pregled" ? "review-row" : ""}">
    <td>${escapeHtml(tx.date)}</td>
    <td>${escapeHtml(tx.description)}</td>
    <td><strong class="${tx.amount < 0 ? "negative" : "positive"}">${money(Math.abs(tx.amount))}</strong></td>
    <td>${escapeHtml(tx.currency)}</td>
    <td>${escapeHtml(tx.kind)}</td>
    <td><select data-import-category="${tx.index}">${importCategories.map((c) => option(c, tx.category)).join("")}</select></td>
    <td><span class="pill confidence-${tx.confidence}">${confidenceLevels[tx.confidence] || tx.confidence}</span><br><small>${escapeHtml(tx.ruleSource || "")}</small></td>
    <td>${tx.manualChanged ? `<label class="remember-rule"><input type="checkbox" data-remember-rule="${tx.index}" ${tx.rememberRule ? "checked" : ""}> Zapomni</label>` : `<span class="muted">-</span>`}</td>
    <td>${escapeHtml(tx.account)}</td>
    <td><span class="pill ${tx.status === "možen dvojnik" ? "warning" : ""}">${escapeHtml(tx.status)}</span></td>
  </tr>`).join("")}</tbody></table>`;
}

function filteredImportTransactions() {
  if (!importDraft) return [];
  if (importFilter === "unclear") return importDraft.transactions.filter((tx) => tx.status === "za pregled" || tx.confidence === "low");
  if (importFilter === "duplicates") return importDraft.transactions.filter((tx) => tx.status === "možen dvojnik");
  if (importFilter === "transfers") return importDraft.transactions.filter((tx) => tx.status === "interni transfer");
  return importDraft.transactions;
}

function importHistoryTable(history) {
  if (!history.length) return `<div class="empty">Ni uvozov.</div>`;
  return `<table><thead><tr><th>Datum uvoza</th><th>Datoteka</th><th>Zaznano</th><th>Uvoženo</th><th>Preskočeno</th></tr></thead><tbody>
    ${history.map((item) => `<tr><td>${new Date(item.importedAt).toLocaleString("sl-SI")}</td><td>${escapeHtml(item.fileName)}</td><td>${item.detected}</td><td>${item.imported}</td><td>${item.skippedDuplicates}</td></tr>`).join("")}
  </tbody></table>`;
}

function categoryRulesTable(rules) {
  if (!rules.length) return `<div class="empty">Ni shranjenih pravil. Ob ročni spremembi kategorije lahko označiš “Zapomni”.</div>`;
  return `<table><thead><tr><th>Ključna beseda</th><th>Kategorija</th><th>Podkategorija</th><th>Velja za</th><th>Ustvarjeno</th><th></th></tr></thead><tbody>
    ${rules.map((rule) => `<tr><td>${escapeHtml(rule.keyword)}</td><td>${escapeHtml(rule.category)}</td><td>${escapeHtml(rule.subcategory || "")}</td><td>${escapeHtml(rule.appliesTo || "oboje")}</td><td>${escapeHtml(rule.createdAt || "")}</td><td><div class="row-actions"><button class="icon-btn" data-edit="categoryRules:${rule.id}">U</button><button class="icon-btn" data-delete="categoryRules:${rule.id}">X</button></div></td></tr>`).join("")}
  </tbody></table>`;
}

async function loadRevolutCsv(file) {
  const text = await file.text();
  const parsed = parseCsv(text);
  const headers = parsed.headers;
  importDraft = {
    fileName: file.name,
    headers,
    rows: parsed.rows,
    account: "Revolut",
    mapping: detectRevolutMapping(headers),
    transactions: [],
  };
  rebuildImportDraft();
  active = "imports";
  render();
}

function parseCsv(text) {
  const rows = [];
  let current = [];
  let value = "";
  let quoted = false;
  const normalizedText = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    const next = normalizedText[i + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      current.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      current.push(value);
      if (current.some((cell) => cell.trim() !== "")) rows.push(current);
      current = [];
      value = "";
    } else {
      value += char;
    }
  }
  current.push(value);
  if (current.some((cell) => cell.trim() !== "")) rows.push(current);
  const headers = rows.shift()?.map((h) => h.trim()) || [];
  return { headers, rows: rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, (row[index] || "").trim()]))) };
}

function detectRevolutMapping(headers) {
  const find = (...needles) => headers.find((header) => {
    const normalized = normalizeText(header);
    return needles.some((needle) => normalized.includes(needle));
  }) || "";
  return {
    date: find("completed", "started", "date", "datum"),
    description: find("description", "opis"),
    amount: find("amount", "znesek"),
    currency: find("currency", "valuta"),
    balance: find("balance", "stanje"),
    type: find("type", "tip"),
    reference: find("merchant", "reference", "counterparty"),
  };
}

function rebuildImportDraft() {
  if (!importDraft) return;
  importDraft.transactions = importDraft.rows.map((row, index) => {
    const description = readMapped(row, "description") || readMapped(row, "reference") || "Revolut transakcija";
    const amount = parseAmount(readMapped(row, "amount"));
    const type = readMapped(row, "type");
    const learned = importDraft.transactions?.[index];
    const classification = learned?.manualChanged
      ? { category: learned.category, subcategory: learned.subcategory || "", confidence: "manual", source: "ročno potrjeno" }
      : categorizeTransaction(description, type, amount);
    const tx = {
      index,
      date: normalizeDate(readMapped(row, "date")),
      description,
      amount,
      currency: readMapped(row, "currency") || "EUR",
      balance: parseAmount(readMapped(row, "balance")),
      kind: type || (amount < 0 ? "strošek" : "prihodek"),
      reference: readMapped(row, "reference"),
      category: classification.category,
      subcategory: classification.subcategory || "",
      confidence: classification.confidence,
      ruleSource: classification.source,
      account: importDraft.account || "Revolut",
      status: "pripravljeno",
      manualChanged: learned?.manualChanged || false,
      rememberRule: learned?.rememberRule || false,
    };
    if (!tx.date || !Number.isFinite(tx.amount) || tx.amount === 0) tx.status = "nepopolno";
    if (isInternalTransfer(tx)) tx.status = "interni transfer";
    if ((tx.confidence === "low" || tx.category === "za pregled" || tx.subcategory === "za pregled") && tx.status === "pripravljeno") tx.status = "za pregled";
    if (isDuplicateTransaction(tx)) tx.status = "možen dvojnik";
    return tx;
  });
}

function readMapped(row, key) {
  return row[importDraft.mapping[key]] || "";
}

function normalizeText(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseAmount(value) {
  const cleaned = String(value || "").replace(/\s/g, "").replace("€", "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function normalizeDate(value) {
  if (!value) return "";
  const raw = String(value).trim();
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const slMatch = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (slMatch) return `${slMatch[3]}-${pad(slMatch[2])}-${pad(slMatch[1])}`;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function categorizeTransaction(description, type, amount) {
  const text = normalizeText(`${description} ${type}`);
  const userRule = findUserCategoryRule(text, amount);
  if (userRule) {
    return { category: userRule.category, subcategory: userRule.subcategory || "", confidence: "high", source: `naučeno: ${userRule.keyword}` };
  }
  const transferRule = matchRule(text, [
    rule("interni transfer", "med računi", "low", "revolut transfer", "top up", "bank transfer", "transfer", "nakazilo", "sepa", "to own account", "from own account", "savings", "varčevalni račun"),
    rule("gotovina", "dvig gotovine", "high", "atm", "bankomat", "cash withdrawal", "dvig gotovine", "withdrawal"),
  ]);
  if (transferRule) return transferRule;
  const incomeRule = amount > 0 ? matchRule(text, [
    rule("povračilo stroškov", "zavarovalnina", "high", "škoda", "skoda", "odškodnina", "odskodnina", "claim payout"),
    rule("plača", "plača", "high", "plača", "salary", "izplačilo plače", "osebni dohodek", "nakazilo delodajalca"),
    rule("študentsko delo", "študentsko delo", "high", "študentski servis", "e-študentski servis", "mjob", "študentsko delo"),
    rule("povračilo stroškov", "povračilo", "high", "povračilo", "refund", "cashback", "vračilo", "reimbursement"),
    rule("dividende", "dividende", "high", "dividend", "dividenda"),
    rule("obresti", "obresti", "high", "obresti", "interest"),
    rule("prihodki", "drugo", "low", "payment", "nakazilo"),
  ]) : null;
  if (incomeRule) return incomeRule;
  const systemRules = [
    rule("investicije", "broker", "medium", "ibkr", "interactive brokers", "trading 212", "trade republic", "revolut trading", "broker", "investment"),
    rule("investicije", "crypto", "medium", "binance", "coinbase", "kraken", "crypto"),
    rule("investicije", "ETF", "medium", "etf", "vwce", "stock", "delnice", "dividend", "dividende"),
    rule("davki", "dohodnina", "high", "furs", "finančna uprava", "dohodnina", "davek", "davki", "edavki", "durs"),
    rule("davki", "kapitalski dobički", "high", "kapitalski dobiček"),
    rule("davki", "prispevki", "high", "prispevki"),
    rule("davki", "globe", "high", "globa", "kazen"),
    rule("davki", "upravne takse", "high", "upravna taksa"),
    rule("gorivo", "bencinski servis", "high", "petrol", "omv", "shell", "mol", "ina", "eni", "agip", "tifon", "q max", "bs", "bencinski servis", "gas station", "service station", "fuel", "diesel", "petrol station"),
    rule("hrana", "živila", "high", "spar", "interspar", "mercator", "lidl", "hofer", "eurospin", "tuš", "tus", "e.leclerc", "leclerc", "jager", "fama", "mlinotest", "pekarna", "bakery", "market", "supermarket", "grocery", "živila", "zivila", "mesnica", "ribarnica"),
    rule("restavracije/kava", "gostinstvo", "high", "mcdonald", "burger king", "kfc", "subway", "wolt", "glovo", "ehrana", "bolt food", "restaurant", "restavracija", "gostilna", "pizzeria", "pizzerija", "kebab", "sushi", "grill", "fast food", "slaščičarna", "okrepčevalnica"),
    rule("restavracije/kava", "gostinstvo", "medium", "bar", "cafe", "café", "coffee", "kavarna", "bistro", "pub"),
    rule("stanovanje", "najemnina", "high", "najemnina", "rent"),
    rule("stanovanje", "stroški", "high", "upravnik", "spl", "domplan", "komunala", "snaga", "voka"),
    rule("stanovanje", "elektrika", "high", "elektro", "ece", "gen-i", "petrol elektrika", "energetika"),
    rule("stanovanje", "voda", "high", "vodovod", "kanalizacija"),
    rule("stanovanje", "internet", "medium", "internet", "telemach", "telekom", "t-2", "a1"),
    rule("stanovanje", "oprema doma", "medium", "ikea", "jysk", "harvey norman", "lesnina", "home", "furniture", "pohištvo"),
    rule("stanovanje", "vzdrževanje", "medium", "merkur", "bauhaus", "obi"),
    rule("avto", "servis", "medium", "avtoservis", "servis", "vulkanizer", "gume", "pnevmatike", "tyre", "tires", "mehanik", "avtodeli", "autodoc", "bartog", "gmt", "euroton", "motoroil", "olje", "filter", "battery", "akumulator"),
    rule("avto", "parkiranje", "high", "parking", "parkirišče", "easypark", "parkme", "urbana", "parkomat", "garage"),
    rule("avto", "cestnina", "high", "dars", "vinjeta", "toll", "cestnina"),
    rule("avto", "pranje", "high", "avtopralnica", "car wash", "pranje vozila"),
    rule("zavarovanja", "zavarovanje", "high", "triglav", "generali", "sava", "vzajemna", "adriatic slovenica", "grawe", "allianz", "wiener", "zavarovalnica", "insurance", "premija"),
    rule("naročnine", "telefon", "high", "telekom", "a1", "telemach", "t-2", "bob", "hot", "mobilna naročnina", "phone bill"),
    rule("naročnine", "streaming", "high", "netflix", "spotify", "youtube", "disney", "hbo", "max", "amazon prime", "apple", "icloud", "google", "chatgpt", "openai"),
    rule("naročnine", "software", "high", "microsoft", "adobe", "canva", "notion", "dropbox", "google workspace", "github", "cursor", "figma", "clickup"),
    rule("šport", "golf", "high", "golf", "cubo", "arboretum golf"),
    rule("šport", "tenis", "high", "tenis", "tennis"),
    rule("šport", "fitnes", "high", "fitnes", "fitness", "gym", "vadba"),
    rule("šport", "oprema", "medium", "šport", "sport", "decathlon", "hervis", "intersport", "extreme vital", "elan", "ski", "smučanje", "smuči", "karta", "članarina", "klub"),
    rule("zdravje", "lekarna", "high", "lekarna", "pharmacy", "apoteka"),
    rule("zdravje", "zdravnik", "high", "zdravnik", "ambulanta", "zdravstveni dom", "specialist", "medical", "clinic"),
    rule("zdravje", "zobozdravnik", "high", "zobozdravnik", "dentist", "dental"),
    rule("zdravje", "pregledi", "medium", "optika", "okulist"),
    rule("oblačila", "oblačila", "high", "zara", "h&m", "reserved", "about you", "zalando", "bestsecret", "peek & cloppenburg", "primark", "mango", "bershka", "pull&bear", "stradivarius", "clothing", "fashion"),
    rule("oblačila", "obutev", "high", "mass", "humanic", "deichmann", "nike", "adidas", "foot locker", "shoes", "obutev"),
    rule("potovanja", "nastanitev", "high", "booking", "airbnb", "hotel", "hostel", "apartment", "apartma"),
    rule("potovanja", "letalske karte", "high", "ryanair", "wizz air", "easyjet", "lufthansa", "turkish airlines", "austrian"),
    rule("potovanja", "prevoz", "medium", "flixbus", "goopti", "uber", "bolt", "taxi", "airport", "letališče"),
    rule("potovanja", "agencija", "medium", "collegium", "kompas", "turistična agencija", "travel"),
    rule("orodje/oprema", "orodje", "medium", "hilti", "makita", "dewalt", "bosch", "milwaukee", "metabo", "unior", "stihl", "husqvarna", "tool", "tools", "orodje", "vijaki", "svedri", "brusilka", "bormašina", "vrtalnik"),
    rule("orodje/oprema", "gradbeni material", "medium", "topdom", "m tehnika", "gradbeni material", "beton", "cement", "siporeks", "ytong"),
    rule("orodje/oprema", "zaščitna oprema", "medium", "zaščitna oprema", "rokavice"),
    rule("spletni nakupi", "za pregled", "medium", "amazon", "aliexpress", "ebay", "temu", "shein", "mimovrste", "big bang", "shoppster", "mall", "online purchase", "web shop", "spletna trgovina"),
    rule("bančni stroški", "provizija", "high", "fee", "commission", "provizija", "exchange fee", "card fee", "revolut fee", "bank charge"),
    rule("bančni stroški", "menjava valute", "high", "currency exchange"),
    rule("bančni stroški", "naročnina", "medium", "subscription fee"),
    rule("darila", "darila drugim", "medium", "darilo", "gift", "cvetličarna", "flowers", "birthday", "rojstni dan", "bon", "voucher"),
    rule("prosti čas", "kino", "high", "kino", "cinema", "cineplexx", "kolosej"),
    rule("prosti čas", "dogodki", "medium", "eventim", "mojekarte", "koncert", "festival"),
    rule("prosti čas", "igre", "medium", "steam", "playstation", "xbox", "nintendo", "game", "gaming"),
    rule("prosti čas", "zabava", "low", "klub", "party", "bowling", "escape room"),
  ];
  const matched = matchRule(text, systemRules);
  if (matched) return { category: matched.category, subcategory: matched.subcategory || "", confidence: matched.confidence, source: matched.source };
  const similar = findSimilarCategorizedTransaction(description, amount);
  if (similar) return similar;
  if (/(card payment|pos|payment|unknown|neznan)/.test(text) || normalizeText(description).length < 6) {
    return { category: "za pregled", subcategory: "", confidence: "low", source: "premalo informacij" };
  }
  return { category: "za pregled", subcategory: "", confidence: "low", source: "ni pravila" };
}

function rule(category, subcategory, confidence, ...keywords) {
  return { category, subcategory, confidence, keywords, source: "sistemsko pravilo" };
}

function matchRule(text, rules) {
  const normalized = normalizeText(text);
  const matched = rules.find((item) => item.keywords.some((keyword) => normalized.includes(normalizeText(keyword))));
  return matched ? { category: matched.category, subcategory: matched.subcategory, confidence: matched.confidence, source: matched.source } : null;
}

function findSimilarCategorizedTransaction(description, amount) {
  const token = suggestRuleKeyword(description);
  if (!token || token.length < 4) return null;
  const sourceItems = amount < 0 ? state.expenses : state.incomes;
  const found = sourceItems.find((item) => normalizeText(item.originalDescription || item.name || "").includes(normalizeText(token)) && item.category && item.category !== "za pregled");
  if (!found) return null;
  return { category: found.category, subcategory: found.subcategory || "", confidence: "medium", source: `podobno prejšnji: ${token}` };
}

function findUserCategoryRule(text, amount) {
  const direction = amount < 0 ? "stroški" : "prihodki";
  return (state.categoryRules || []).find((rule) => {
    const applies = !rule.appliesTo || rule.appliesTo === "oboje" || rule.appliesTo === direction;
    return applies && rule.keyword && text.includes(normalizeText(rule.keyword));
  });
}

function isInternalTransfer(tx) {
  const text = normalizeText(`${tx.description} ${tx.reference}`);
  return tx.category === "interni transfer" || tx.category === "gotovina" || /(top-up|top up|own account|lastni racun|to self|from self|between accounts|savings vault)/.test(text);
}

function transactionKey(tx) {
  return [tx.date, Math.abs(Number(tx.amount || 0)).toFixed(2), normalizeText(tx.description), tx.currency || "EUR", normalizeText(tx.account || "Revolut")].join("|");
}

function isDuplicateTransaction(tx) {
  const targetKey = transactionKey(tx);
  if ((state.transactions || []).some((item) => transactionKey({
    date: item.date,
    amount: item.amount,
    description: item.originalDescription || item.description,
    currency: item.currency || "EUR",
    account: item.account || "Revolut",
  }) === targetKey)) return true;
  const importedItems = [...state.incomes, ...state.expenses].filter((item) => item.importSource === "Revolut CSV");
  return importedItems.some((item) => transactionKey({
    date: item.date,
    amount: item.originalAmount ?? item.amount,
    description: item.originalDescription || item.name,
    currency: item.currency || "EUR",
    account: item.account || item.source || "Revolut",
  }) === targetKey);
}

function confirmImportDraft() {
  if (!importDraft) return;
  rebuildImportDraft();
  const importId = crypto.randomUUID();
  const transactionRows = [];
  const incomeRows = [];
  const expenseRows = [];
  let skippedDuplicates = 0;
  let skippedTransfers = 0;
  for (const tx of importDraft.transactions) {
    if (tx.status === "možen dvojnik") {
      skippedDuplicates++;
      continue;
    }
    const transactionRow = {
      id: crypto.randomUUID(),
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      currency: tx.currency,
      category: tx.category,
      subcategory: tx.subcategory || tx.reference || "",
      account: tx.account,
      type: tx.status === "interni transfer" ? "interni transfer" : tx.status === "za pregled" ? "za pregled" : tx.amount < 0 ? "strošek" : "prihodek",
      status: tx.status,
      source: "Revolut CSV",
      confidence: tx.confidence,
      importId,
      fileName: importDraft.fileName,
      originalDescription: tx.description,
      note: "",
    };
    transactionRows.push(transactionRow);
    if (tx.status !== "pripravljeno") {
      if (tx.status === "interni transfer") skippedTransfers++;
      continue;
    }
    if (tx.amount < 0) {
      expenseRows.push({
        id: crypto.randomUUID(),
        date: tx.date,
        name: tx.description,
        amount: Math.abs(tx.amount),
        category: tx.category,
        subcategory: tx.subcategory || tx.reference || "",
        account: tx.account,
        kind: "variabilen",
        note: `Uvoženo iz Revolut CSV (${importDraft.fileName})`,
        currency: tx.currency,
        originalAmount: tx.amount,
        originalDescription: tx.description,
        importId,
        importSource: "Revolut CSV",
        importConfidence: tx.confidence,
      });
      transactionRow.linkedExpenseId = expenseRows[expenseRows.length - 1].id;
    } else if (tx.amount > 0) {
      incomeRows.push({
        id: crypto.randomUUID(),
        date: tx.date,
        name: tx.description,
        amount: tx.amount,
        category: tx.category === "drugo" ? "drugo" : tx.category,
        source: tx.account,
        note: `Uvoženo iz Revolut CSV (${importDraft.fileName})`,
        currency: tx.currency,
        account: tx.account,
        originalAmount: tx.amount,
        originalDescription: tx.description,
        importId,
        importSource: "Revolut CSV",
        importConfidence: tx.confidence,
      });
      transactionRow.linkedIncomeId = incomeRows[incomeRows.length - 1].id;
    }
  }
  rememberSelectedRules(importDraft.transactions);
  state.transactions = [...transactionRows, ...(state.transactions || [])];
  state.incomes = [...incomeRows, ...state.incomes];
  expenseRows.slice().reverse().forEach((row) => upsertExpense(row));
  state.importHistory = [{
    id: importId,
    importedAt: new Date().toISOString(),
    fileName: importDraft.fileName,
    detected: importDraft.transactions.length,
    imported: incomeRows.length + expenseRows.length,
    skippedDuplicates,
    skippedTransfers,
    transactionIds: transactionRows.map((row) => row.id),
    incomeIds: incomeRows.map((row) => row.id),
    expenseIds: expenseRows.map((row) => row.id),
  }, ...(state.importHistory || [])];
  importDraft = null;
  save();
  render();
}

function rememberSelectedRules(transactions) {
  const existing = new Set((state.categoryRules || []).map((rule) => normalizeText(rule.keyword)));
  const additions = transactions
    .filter((tx) => tx.rememberRule && tx.manualChanged && tx.category && tx.category !== "za pregled")
    .map((tx) => ({
      id: crypto.randomUUID(),
      keyword: suggestRuleKeyword(tx.description),
      category: tx.category,
      subcategory: tx.subcategory || "",
      appliesTo: tx.amount < 0 ? "stroški" : "prihodki",
      createdAt: new Date().toISOString().slice(0, 10),
    }))
    .filter((rule) => rule.keyword && !existing.has(normalizeText(rule.keyword)));
  state.categoryRules = [...additions, ...(state.categoryRules || [])];
}

function rememberRuleFromTransaction(id) {
  const tx = (state.transactions || []).find((item) => item.id === id);
  if (!tx || !tx.category || tx.category === "za pregled") return;
  const keyword = suggestRuleKeyword(tx.description);
  if (!keyword) return;
  const exists = (state.categoryRules || []).some((rule) => normalizeText(rule.keyword) === normalizeText(keyword));
  if (exists || !confirm(`Shranim pravilo "${keyword}" → "${tx.category}"?`)) return;
  state.categoryRules = [{
    id: crypto.randomUUID(),
    keyword,
    category: tx.category,
    subcategory: tx.subcategory || "",
    appliesTo: Number(tx.amount) < 0 ? "stroški" : "prihodki",
    createdAt: new Date().toISOString().slice(0, 10),
  }, ...(state.categoryRules || [])];
  save();
  render();
}

function suggestRuleKeyword(description) {
  const words = normalizeText(description).split(/[^a-z0-9čšžćđ]+/i).filter(Boolean);
  const ignored = new Set(["card", "payment", "pos", "revolut", "transaction", "trgovina", "placilo", "plačilo"]);
  return (words.find((word) => word.length >= 4 && !ignored.has(word)) || words[0] || "").toUpperCase();
}

function undoLastImport() {
  const [last, ...rest] = state.importHistory || [];
  if (!last) return;
  if (!confirm(`Razveljavim uvoz "${last.fileName}"?`)) return;
  const incomeIds = new Set(last.incomeIds || []);
  const expenseIds = new Set(last.expenseIds || []);
  const transactionIds = new Set(last.transactionIds || []);
  state.transactions = (state.transactions || []).filter((item) => !transactionIds.has(item.id));
  state.incomes = state.incomes.filter((item) => !incomeIds.has(item.id));
  expenseIds.forEach((id) => deleteExpenseRecord(id));
  state.importHistory = rest;
  save();
  render();
}

function settingsView() {
  const sheets = googleSheetsConfig();
  const serverManagedAuth = hasServerManagedCloudAuth();
  const localBackupButton = currentProfile.role === "admin" && location.protocol.startsWith("http")
    ? `<button class="button secondary" data-action="local-backup">Shrani kopijo za namizno aplikacijo</button>`
    : "";
  return `<div class="settings-panel">
    ${pwaInstallView()}
    <div class="card profile-settings">
      <div class="card-header">
        <div><h3>Moj profil</h3><p>Prijavljen kot ${escapeHtml(currentProfile.name)}.</p></div>
        <span class="pill">${currentProfile.role === "admin" ? "Skrbnik" : "Uporabnik"}</span>
      </div>
      <div class="card-body">
        <form class="form-grid" data-change-profile-key>
          <label>Trenutni ključ<input type="password" name="currentKey" autocomplete="current-password" required></label>
          <label>Novi ključ<input type="password" name="newKey" autocomplete="new-password" minlength="4" required></label>
          <label>Ponovi novi ključ<input type="password" name="confirmKey" autocomplete="new-password" minlength="4" required></label>
          <div class="profile-form-action"><button class="button" type="submit">Spremeni ključ</button></div>
        </form>
      </div>
    </div>
    ${currentProfile.role === "admin" ? adminProfilesView() : ""}
    ${currentProfile.role === "admin" ? roundUpSavingsSettingsView() : ""}
    <div class="card"><div class="card-header"><h3>Osnovne nastavitve</h3></div><div class="card-body form-grid">
      <label>Začetni mesec<input type="month" data-setting="startMonth" value="${state.settings.startMonth}"></label>
      <label>Privzeta valuta<select data-setting="currency"><option value="EUR" selected>EUR</option></select></label>
      <label>Način<select data-setting="theme">${option("light", state.settings.theme)}${option("dark", state.settings.theme)}</select></label>
      <div class="full"><button class="button secondary" data-nav="setup">Odpri začetni setup</button></div>
    </div></div>
    ${currentProfile.role === "admin" ? `<div class="card cloud-settings">
      <div class="card-header">
        <div><h3>Google Sheets backend</h3><p>Sinhronizacija med napravami z lokalno varnostno kopijo.</p></div>
        <span class="sync-badge ${cloudStatus.state}">${
          cloudStatus.state === "success" ? "Povezano"
            : cloudStatus.state === "pending" ? "Povezujem"
              : sheets.enabled ? "Potrebno preverjanje" : "Ni povezano"
        }</span>
      </div>
      <div class="card-body">
        <form class="form-grid" data-google-sheets-form>
          <label class="full">URL spletne aplikacije
            <input type="url" name="endpoint" value="${escapeAttr(sheets.endpoint)}" placeholder="https://script.google.com/macros/s/.../exec ali prazno, če je nastavljen Vercel env">
          </label>
          <label class="full">Sinhronizacijski ključ
            <input type="password" name="syncKey" value="${escapeAttr(sheets.syncKey)}" autocomplete="off" placeholder="${serverManagedAuth ? "V PWA ga lahko nastavi Vercel env" : "Enak ključ kot v Apps Script kodi"}" ${serverManagedAuth ? "" : "required"}>
          </label>
          <p class="settings-note full">Pri mobilni PWA lahko URL ostane prazen, če je v Vercelu nastavljen GOOGLE_APPS_SCRIPT_URL. Sinhronizacijski ključ lahko ostane prazen, če je v Vercelu nastavljen GOOGLE_APPS_SCRIPT_SYNC_KEY.</p>
          <div class="full cloud-actions">
            <button class="button" type="submit">${sheets.enabled ? "Preveri povezavo" : "Poveži Google Sheets"}</button>
            ${sheets.enabled ? `
              <button class="button secondary" type="button" data-action="cloud-pull">Prenesi iz Sheets</button>
              <button class="button secondary" type="button" data-action="cloud-push">Pošlji v Sheets</button>
              <button class="button danger ghost" type="button" data-action="cloud-disconnect">Odklopi</button>
            ` : ""}
          </div>
        </form>
        <div class="sync-status ${cloudStatus.state}">
          <span class="sync-dot"></span>
          <div><strong>${escapeHtml(cloudStatus.message)}</strong>${sheets.lastSyncAt ? `<small>Zadnja uspešna sinhronizacija: ${formatSyncTime(sheets.lastSyncAt)}</small>` : ""}</div>
        </div>
        <p class="settings-note">Finančni podatki se pošiljajo samo v tvoj Apps Script in Google Sheet. URL ter ključ ostaneta shranjena lokalno na tej napravi.</p>
      </div>
    </div>` : userCloudSettingsView(sheets)}
    <div class="card"><div class="card-header"><h3>Podatki</h3></div><div class="card-body">
      <div class="actions" style="justify-content:flex-start">
        <button class="button" data-action="export-json">Izvozi JSON</button>
        <button class="button secondary" data-action="export-csv">Izvozi CSV</button>
        ${localBackupButton}
        <label class="button secondary">Uvozi JSON<input type="file" accept="application/json" data-action="import-json" hidden></label>
        <button class="button danger" data-action="clear">Izbriši vse podatke</button>
      </div>
    </div></div>
  </div>`;
}

function userCloudSettingsView(sheets) {
  const usable = canUseCloudEndpoint(sheets);
  return `<div class="card cloud-settings">
    <div class="card-header">
      <div><h3>Google Sheets backend</h3><p>Sinhronizacija podatkov tega profila.</p></div>
      <span class="sync-badge ${cloudStatus.state}">${
        cloudStatus.state === "success" ? "Povezano"
          : cloudStatus.state === "pending" ? "Povezujem"
            : usable ? "Na voljo" : "Ni povezan"
      }</span>
    </div>
    <div class="card-body">
      <div class="sync-status ${cloudStatus.state}">
        <span class="sync-dot"></span>
        <div><strong>${escapeHtml(cloudStatus.message)}</strong>${sheets.lastSyncAt ? `<small>Zadnja uspešna sinhronizacija: ${formatSyncTime(sheets.lastSyncAt)}</small>` : ""}</div>
      </div>
      <div class="cloud-actions">
        <button class="button secondary" type="button" data-action="cloud-pull" ${usable ? "" : "disabled"}>Prenesi iz Sheets</button>
        <button class="button secondary" type="button" data-action="cloud-push" ${usable ? "" : "disabled"}>Pošlji v Sheets</button>
      </div>
      <p class="settings-note">Tvoji podatki so ločeni od drugih profilov in se sinhronizirajo pod internim ID-jem profila.</p>
    </div>
  </div>`;
}

function roundUpSavingsSettingsView() {
  const bank = (state.accounts || []).find((account) => canonicalAssetKey(account) === "banka");
  const savings = roundUpSavingsAccount();
  const savingsOptions = (state.accounts || [])
    .filter((account) => canonicalAssetKey(account) === "varcevalni")
    .map((account) => `<option value="${escapeAttr(account.id)}" ${account.id === (state.settings.roundUpSavingsAccountId || savings?.id) ? "selected" : ""}>${escapeHtml(account.name)} · ${money(account.balance)}</option>`)
    .join("");
  const status = state.settings.roundUpBankExpenses
    ? bank && savings
      ? `Aktivno: stroški iz računa ${escapeHtml(bank.name)} se zaokrožijo navzgor, razlika gre na ${escapeHtml(savings.name)}.`
      : "Aktivirano, vendar manjka bančni ali varčevalni račun."
    : "Izklopljeno. Stanja računov se spreminjajo samo za realni znesek stroška.";
  return `<div class="card savings-rule-card">
    <div class="card-header">
      <div><h3>Zaokroževanje bančnih stroškov</h3><p>${status}</p></div>
      <span class="sync-badge ${state.settings.roundUpBankExpenses ? "success" : "local"}">${state.settings.roundUpBankExpenses ? "Aktivno" : "Izklopljeno"}</span>
    </div>
    <div class="card-body form-grid">
      <label class="toggle-row full">
        <input type="checkbox" data-setting="roundUpBankExpenses" ${state.settings.roundUpBankExpenses ? "checked" : ""}>
        <span>Za stroške na bančnem računu zaokroži dvig na poln evro</span>
      </label>
      <label class="full">Varčevalni račun
        <select data-setting="roundUpSavingsAccountId" ${savingsOptions ? "" : "disabled"}>
          ${savingsOptions || `<option value="">Najprej dodaj varčevalni račun</option>`}
        </select>
      </label>
      <p class="settings-note full">Primer: strošek 3,75 € ostane zabeležen kot 3,75 €, bančni račun se zmanjša za 4,00 €, 0,25 € pa se prišteje varčevalnemu računu.</p>
    </div>
  </div>`;
}

function isStandalonePwa() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function pwaInstallView() {
  const installed = isStandalonePwa();
  const status = installed
    ? "Aplikacija je nameščena in se odpira samostojno."
    : isIosDevice()
      ? "V Safariju tapni Deli in nato Dodaj na začetni zaslon."
      : "Namesti Financo na napravo za hitrejši dostop in celozaslonski prikaz.";
  return `<div class="card install-card">
    <div class="card-header">
      <div><h3>Financa na tej napravi</h3><p>${status}</p></div>
      <span class="sync-badge ${installed ? "success" : "local"}">${installed ? "Nameščeno" : "PWA"}</span>
    </div>
    <div class="card-body install-card-body">
      <div class="install-icon"><img src="./icons/icon-192.png" alt=""></div>
      <div>
        <strong>${installed ? "Pripravljeno za uporabo" : "Namesti aplikacijo"}</strong>
        <p>Podatki ostanejo ločeni po profilu. Osnovni vmesnik deluje tudi brez povezave, sinhronizacija pa se nadaljuje, ko je internet znova na voljo.</p>
      </div>
      ${installed ? "" : `<button class="button" type="button" data-action="install-pwa">Namesti</button>`}
    </div>
  </div>`;
}

async function installPwa() {
  if (isStandalonePwa()) return;
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    render();
    return;
  }
  if (isIosDevice()) {
    alert("V Safariju tapni gumb Deli, nato izberi »Dodaj na začetni zaslon«.");
    return;
  }
  alert("V meniju brskalnika izberi »Namesti aplikacijo« ali »Dodaj na začetni zaslon«.");
}

function adminProfilesView() {
  return `<div class="card profile-admin">
    <div class="card-header">
      <div><h3>Uporabniški profili</h3><p>Vsak profil ima svoj ključ in popolnoma ločene finančne podatke.</p></div>
      <div class="actions"><button class="button secondary" type="button" data-action="sync-profiles">Sinhroniziraj profile v Sheets</button><span class="pill">${profiles.filter((profile) => profile.active !== false).length} aktivnih</span></div>
    </div>
    <div class="card-body">
      <form class="profile-create" data-create-profile>
        <label>Ime profila<input name="name" type="text" placeholder="npr. Ana" required></label>
        <label>Začetni ključ<input name="key" type="password" minlength="4" autocomplete="new-password" required></label>
        <button class="button" type="submit">Dodaj profil</button>
      </form>
      <div class="profile-list">
        ${profiles.map((profile) => `<article class="profile-row ${profile.active === false ? "inactive" : ""}">
          <div class="avatar">${profileInitials(profile.name)}</div>
          <div class="profile-row-main">
            <strong>${escapeHtml(profile.name)}</strong>
            <span>${profile.role === "admin" ? "Skrbnik" : "Uporabnik"} · ${profile.active === false ? "neaktiven" : "aktiven"}</span>
          </div>
          ${profile.id !== currentProfile.id ? `
            <button class="button secondary" data-reset-profile-key="${profile.id}">Ponastavi ključ</button>
            <button class="button ${profile.active === false ? "secondary" : "danger ghost"}" data-toggle-profile="${profile.id}">
              ${profile.active === false ? "Aktiviraj" : "Deaktiviraj"}
            </button>
            <button class="button danger" data-delete-profile="${profile.id}">Izbriši</button>
          ` : `<span class="pill">Trenutni profil</span>`}
        </article>`).join("")}
      </div>
    </div>
  </div>`;
}

function bars(entries) {
  const rows = Array.isArray(entries[0]) ? entries : [];
  if (!rows.length) return `<div class="empty">Ni podatkov za prikaz.</div>`;
  const max = Math.max(...rows.map(([, value]) => Number(value || 0)), 1);
  return `<div class="bars">${rows.filter(([, value]) => Number(value) > 0).sort((a, b) => b[1] - a[1]).map(([label, value]) => `<div class="bar-row"><span>${label}</span><div class="bar" style="--value:${Math.max(2, value / max * 100)}%"><span></span></div><strong>${money(value)}</strong></div>`).join("")}</div>`;
}

function groupBy(items, key, valueKey = "amount") {
  const map = new Map();
  for (const item of items) map.set(item[key] || "drugo", (map.get(item[key] || "drugo") || 0) + Number(item[valueKey] || 0));
  return [...map.entries()];
}

function lineChart(points, suffix = "") {
  if (!points.length) return `<div class="empty">Ni podatkov za graf.</div>`;
  const values = points.map(([, value]) => Number(value || 0));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const w = 720;
  const h = 220;
  const coords = points.map(([, value], index) => {
    const x = points.length === 1 ? w / 2 : (index / (points.length - 1)) * w;
    const y = h - ((Number(value || 0) - min) / Math.max(1, max - min)) * (h - 30) - 10;
    return [x, y];
  });
  return `<div class="chart"><svg viewBox="0 0 ${w} ${h + 36}" role="img" aria-label="Graf">
    <polyline fill="none" stroke="var(--accent)" stroke-width="4" points="${coords.map((p) => p.join(",")).join(" ")}" />
    ${coords.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" fill="var(--accent)" /><text x="${x}" y="${h + 24}" text-anchor="middle" fill="var(--muted)" font-size="11">${i === 0 || i === coords.length - 1 ? points[i][0].slice(0, 3) : ""}</text><text x="${x}" y="${Math.max(14, y - 10)}" text-anchor="middle" fill="var(--text)" font-size="12">${suffix ? NUMBER.format(points[i][1]) + suffix : money(points[i][1])}</text>`).join("")}
  </svg></div>`;
}

function trendChart(points, suffix = "") {
  return points.length >= 2
    ? lineChart(points, suffix)
    : `<div class="empty">Za trend sta potrebna vsaj dva meseca podatkov.</div>`;
}

function netWorthHistory() {
  const byMonth = new Map();
  for (const snapshot of [...(state.snapshots || [])].reverse()) {
    byMonth.set(`${snapshot.year}-${snapshot.month}`, { ...snapshot });
  }
  const current = monthlyData();
  byMonth.set(`${currentYear}-${currentMonth}`, {
    id: "current",
    month: currentMonth,
    year: currentYear,
    assets: current.assets,
    liabilities: current.liabilities,
    netWorth: current.netWorth,
    note: "Trenutni izračun",
  });
  return [...byMonth.values()]
    .sort((a, b) => Number(a.year) * 12 + Number(a.month) - (Number(b.year) * 12 + Number(b.month)));
}

function netWorthSeries() {
  return netWorthHistory().slice(-6).map((s) => [monthLabel(s.month, s.year), s.netWorth]);
}

function weeklyExpenseBars(expenses) {
  const weeks = [1, 2, 3, 4, 5].map((week) => [`${week}. teden`, 0]);
  for (const expense of expenses) {
    const parsedDay = Number(String(expense.date || "").split("-")[2]);
    const day = Number.isFinite(parsedDay) && parsedDay >= 1 ? parsedDay : 1;
    const week = Math.max(0, Math.min(4, Math.floor((day - 1) / 7)));
    weeks[week][1] += Number(expense.amount || 0);
  }
  return weeks;
}

function weeklyColumnChart(expenses) {
  const weeks = weeklyExpenseBars(expenses);
  const max = Math.max(...weeks.map(([, value]) => value), 1);
  const axisMax = Math.ceil(max / 100) * 100;
  return `<div class="column-chart">
    <div class="column-axis">${[1, 0.75, 0.5, 0.25, 0].map((ratio) => `<span>${money(axisMax * ratio).replace(",00", "")}</span>`).join("")}</div>
    <div class="columns">${weeks.map(([label, value]) => `<div class="column-item"><strong>${money(value)}</strong><div class="column-track"><span style="height:${Math.max(3, value / max * 100)}%"></span></div><small>${label}</small></div>`).join("")}</div>
  </div>`;
}

function donutChart(entries) {
  const rows = (Array.isArray(entries[0]) ? entries : []).filter(([, value]) => Number(value) > 0).sort((a, b) => b[1] - a[1]);
  if (!rows.length) return `<div class="empty">Ni podatkov za prikaz.</div>`;
  const total = rows.reduce((sum, [, value]) => sum + Number(value || 0), 0);
  let offset = 25;
  const colors = ["#2f8cff", "#24d6b0", "#ffc857", "#9b7cff", "#ff765f", "#8fa8be"];
  const segments = rows.map(([label, value], index) => {
    const pct = Number(value || 0) / total * 100;
    const segment = `<circle r="38" cx="50" cy="50" fill="none" stroke="${colors[index % colors.length]}" stroke-width="15" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${offset}" pathLength="100" />`;
    offset -= pct;
    return segment;
  }).join("");
  return `<div class="donut-wrap"><div class="donut"><svg viewBox="0 0 100 100">${segments}<circle r="28" cx="50" cy="50" fill="var(--surface)" /></svg><div><strong>${money(total)}</strong><span>Skupaj</span></div></div><div class="donut-legend">${rows.map(([label, value], index) => `<div><i style="background:${colors[index % colors.length]}"></i><span>${escapeHtml(label)}</span><strong>${money(value)}</strong><small>${NUMBER.format(value / total * 100)} %</small></div>`).join("")}</div></div>`;
}

function goalSummary() {
  if (!state.goals.length) return `<div class="empty">Ni ciljev.</div>`;
  return state.goals.map((goal) => {
    const pct = Math.min(100, Number(goal.currentAmount || 0) / Math.max(1, Number(goal.targetAmount || 0)) * 100);
    return `<div style="margin-bottom:14px"><strong>${goal.name}</strong><div class="progress" style="--value:${pct}%"><span></span></div><small>${NUMBER.format(pct)} %</small></div>`;
  }).join("");
}

function recordedActivityMonths(limit = 6) {
  const periods = new Set();
  for (const item of [...(state.incomes || []), ...(state.expenses || [])]) {
    const [year, month] = String(item.date || "").split("-").map(Number);
    if (year && month) periods.add(`${year}-${pad(month)}`);
  }
  return [...periods]
    .sort()
    .slice(-limit)
    .map((period) => {
      const [year, month] = period.split("-").map(Number);
      return [month, year];
    });
}

function modalHtml() {
  if (modal.collection === "deleteProfile") return deleteProfileModalHtml();
  const current = modal.item || defaults(modal.collection);
  return `<div class="modal-backdrop">
    <form class="modal" data-form="${modal.collection}">
      <div class="modal-head"><h3>${modal.item ? "Uredi" : "Dodaj"}: ${modal.title}</h3><button type="button" class="icon-btn" data-action="close">X</button></div>
      <div class="modal-body form-grid">
        <input type="hidden" name="id" value="${current.id || ""}">
        ${fields[modal.collection].map(([name, type, label, options]) => fieldHtml(name, type, label, current[name], options)).join("")}
      </div>
      <div class="modal-foot"><button type="button" class="button secondary" data-action="close">Prekliči</button><button class="button" type="submit">Shrani</button></div>
    </form>
  </div>`;
}

function deleteProfileModalHtml() {
  const profileName = modal.item?.profileName || "";
  return `<div class="modal-backdrop">
    <form class="modal" data-delete-profile-form="${escapeAttr(modal.item?.profileId || "")}">
      <div class="modal-head"><h3>Izbris profila</h3><button type="button" class="icon-btn" data-action="close">X</button></div>
      <div class="modal-body form-grid">
        <div class="full">
          <p class="settings-note">Profil "${escapeHtml(profileName)}" bo odstranjen iz seznama profilov. Uporabnik se po tem ne bo več mogel prijaviti. Lokalni podatki tega profila na tej napravi bodo izbrisani.</p>
        </div>
        <label class="toggle-row full">
          <input type="checkbox" name="confirmed" required>
          <span>Razumem, da želim izbrisati ta profil.</span>
        </label>
        <label class="full">Admin ključ
          <input type="password" name="adminKey" autocomplete="current-password" required autofocus>
        </label>
      </div>
      <div class="modal-actions">
        <button type="button" class="button secondary" data-action="close">Prekliči</button>
        <button class="button danger" type="submit">Izbriši profil</button>
      </div>
    </form>
  </div>`;
}

function defaults(collection) {
  const base = { date: iso(currentYear, currentMonth, now.getDate()), dueDate: iso(currentYear, currentMonth, now.getDate()), month: filters.month, year: filters.year };
  const bankAccount = (state.accounts || []).find((account) => canonicalAssetKey(account) === "banka")?.name || "Banka";
  const revolutAccount = (state.accounts || []).find((account) => canonicalAssetKey(account) === "revolut")?.name || "Revolut";
  const defaultsByCollection = {
    incomes: { ...base, amount: 0, category: "plača", source: "", account: bankAccount, note: "" },
    expenses: { ...base, amount: 0, category: "hrana", subcategory: "", account: bankAccount, kind: "variabilen", note: "" },
    transactions: { ...base, description: "", amount: 0, currency: "EUR", category: "za pregled", subcategory: "", account: revolutAccount, type: "za pregled", status: "za pregled", note: "" },
    accounts: { name: "", balance: 0, type: "glavni bančni račun", note: "" },
    investments: { ...base, type: "ETF", quantity: 0, averagePrice: 0, currentValue: 0, addedThisMonth: 0, note: "" },
    liabilities: { ...base, amount: 0, status: "odprto", category: "davki", note: "" },
    taxes: { ...base, amount: 0, type: "dohodnina", status: "treba oddati", note: "" },
    goals: { name: "", targetAmount: 0, currentAmount: 0, dueDate: base.dueDate, priority: "srednja", note: "" },
    snapshots: { month: filters.month, year: filters.year, assets: monthlyData().assets, liabilities: monthlyData().liabilities, netWorth: monthlyData().netWorth, note: "" },
    monthlyNotes: { month: filters.month, year: filters.year, good: "", bad: "", next: "" },
    categoryRules: { keyword: "", category: "za pregled", subcategory: "", appliesTo: "oboje", createdAt: new Date().toISOString().slice(0, 10) },
  };
  return defaultsByCollection[collection];
}

function fieldHtml(name, type, label, value = "", options = []) {
  const cls = type === "textarea" ? "full" : "";
  const required = ["date", "name", "description", "amount", "account"].includes(name) ? "required" : "";
  if (type === "select") return `<label class="${cls}">${label}<select name="${name}" ${required}>${options.map((o) => option(o, value)).join("")}</select></label>`;
  if (type === "account-select") {
    const accounts = (state.accounts || []).filter(isSpendableAccount);
    const hasCurrent = accounts.some((account) => account.name === value);
    const legacyOption = value && !hasCurrent ? `<option value="${escapeAttr(value)}" selected>${escapeHtml(value)}</option>` : "";
    const accountOptions = accounts.map((account) =>
      `<option value="${escapeAttr(account.name)}" ${account.name === value ? "selected" : ""}>${escapeHtml(account.name)} · ${money(account.balance)}</option>`
    ).join("");
    return `<label class="${cls}">${label}<select name="${name}" ${required}><option value="">Izberi račun</option>${legacyOption}${accountOptions}</select></label>`;
  }
  if (type === "textarea") return `<label class="${cls}">${label}<textarea name="${name}">${escapeHtml(value || "")}</textarea></label>`;
  return `<label class="${cls}">${label}<input name="${name}" type="${type}" step="0.01" value="${escapeAttr(value || "")}" ${required}></label>`;
}

function option(value, selected) {
  return `<option value="${escapeAttr(value)}" ${value === selected ? "selected" : ""}>${value}</option>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function download(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function csvExport() {
  const sections = ["transactions", "incomes", "expenses", "accounts", "investments", "liabilities", "taxes", "goals", "snapshots", "importHistory", "categoryRules"];
  return sections.map((section) => {
    const rows = state[section];
    if (!rows.length) return `${section}\n`;
    const keys = Object.keys(rows[0]);
    return `${section}\n${keys.join(",")}\n${rows.map((row) => keys.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(",")).join("\n")}`;
  }).join("\n\n");
}

async function changeCurrentProfileKey(values) {
  const currentHash = await hashProfileKey(values.currentKey);
  if (currentHash !== currentProfile.keyHash) {
    alert("Trenutni ključ ni pravilen.");
    return;
  }
  if (values.newKey !== values.confirmKey) {
    alert("Nova ključa se ne ujemata.");
    return;
  }
  if (String(values.newKey || "").length < 4) {
    alert("Novi ključ naj vsebuje vsaj 4 znake.");
    return;
  }
  const keyHash = await hashProfileKey(values.newKey);
  if (profiles.some((profile) => profile.id !== currentProfile.id && profile.keyHash === keyHash)) {
    alert("Ta ključ že uporablja drug profil.");
    return;
  }
  profiles = profiles.map((profile) =>
    profile.id === currentProfile.id ? { ...profile, keyHash, mustChangeKey: false, updatedAt: new Date().toISOString() } : profile
  );
  currentProfile = profiles.find((profile) => profile.id === currentProfile.id);
  saveProfiles();
  try {
    await syncProfileRegistry();
    sessionCredentialHash = keyHash;
    sessionStorage.setItem(PROFILE_CREDENTIAL_SESSION_KEY, keyHash);
  } catch (error) {
    alert(error.message || "Ključa ni bilo mogoče shraniti v Google Sheets.");
    return;
  }
  alert("Ključ je spremenjen.");
  render();
}

async function createUserProfile(values) {
  if (currentProfile?.role !== "admin") return;
  const name = String(values.name || "").trim();
  const key = String(values.key || "");
  if (!name || key.length < 4) {
    alert("Vnesi ime in ključ z vsaj 4 znaki.");
    return;
  }
  const keyHash = await hashProfileKey(key);
  if (profiles.some((profile) => profile.keyHash === keyHash)) {
    alert("Ta ključ že uporablja drug profil.");
    return;
  }
  const profile = {
    id: createProfileId(name),
    name,
    role: "user",
    keyHash,
    createdAt: new Date().toISOString(),
    active: true,
  };
  profiles = [...profiles, profile];
  saveProfiles();
  localStorage.setItem(profileStorageKey(profile.id), JSON.stringify(emptyState({ setupCompleted: false })));
  try {
    await syncProfileRegistry();
  } catch (error) {
    alert(error.message || "Profila ni bilo mogoče shraniti v Google Sheets.");
  }
  render();
}

async function resetProfileKey(profileId) {
  if (currentProfile?.role !== "admin") return;
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) return;
  const key = prompt(`Vnesi novi začasni ključ za profil "${profile.name}":`);
  if (key === null) return;
  if (key.length < 4) {
    alert("Ključ naj vsebuje vsaj 4 znake.");
    return;
  }
  const keyHash = await hashProfileKey(key);
  if (profiles.some((item) => item.id !== profileId && item.keyHash === keyHash)) {
    alert("Ta ključ že uporablja drug profil.");
    return;
  }
  profiles = profiles.map((item) =>
    item.id === profileId ? { ...item, keyHash, updatedAt: new Date().toISOString() } : item
  );
  saveProfiles();
  try {
    await syncProfileRegistry();
  } catch (error) {
    alert(error.message || "Ključa ni bilo mogoče shraniti v Google Sheets.");
    return;
  }
  alert("Začasni ključ je nastavljen.");
  render();
}

async function toggleProfile(profileId) {
  if (currentProfile?.role !== "admin" || profileId === currentProfile.id) return;
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) return;
  const nextActive = profile.active === false;
  if (!nextActive && !confirm(`Deaktiviram profil "${profile.name}"? Njegovi podatki bodo ostali shranjeni.`)) return;
  profiles = profiles.map((item) => item.id === profileId ? { ...item, active: nextActive } : item);
  saveProfiles();
  try {
    await syncProfileRegistry();
  } catch (error) {
    alert(error.message || "Spremembe profila ni bilo mogoče shraniti v Google Sheets.");
  }
  render();
}

async function deleteUserProfile(profileId, values = {}) {
  if (currentProfile?.role !== "admin" || profileId === currentProfile.id) return;
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) return;
  if (!values.confirmed) {
    alert("Za brisanje moraš potrditi, da razumeš posledice.");
    return;
  }
  const adminKey = values.adminKey || "";
  const adminHash = await hashProfileKey(normalizeSecret(adminKey));
  if (adminHash !== currentProfile.keyHash) {
    alert("Admin ključ ni pravilen. Profil ni bil izbrisan.");
    return;
  }
  profiles = profiles.filter((item) => item.id !== profileId);
  saveProfiles();
  localStorage.removeItem(profileStorageKey(profileId));
  try {
    await syncProfileRegistry();
    cloudStatus = { state: "success", message: `Profil "${profile.name}" je izbrisan in seznam profilov je sinhroniziran.` };
  } catch (error) {
    cloudStatus = { state: "error", message: error.message || "Profil je izbrisan lokalno, vendar sinhronizacija v Sheets ni uspela." };
  }
  closeModal();
  render();
}

async function forceSyncProfiles() {
  if (currentProfile?.role !== "admin") return;
  try {
    await syncProfileRegistry();
    cloudStatus = { state: "success", message: "Profili so sinhronizirani v Google Sheets." };
  } catch (error) {
    const message = error.message || "Profilov ni bilo mogoce sinhronizirati.";
    cloudStatus = {
      state: "error",
      message: message.includes("Samo skrbnik")
        ? "Profilov ni bilo mogoce sinhronizirati: sinhronizacijski kljuc v aplikaciji se ne ujema z Apps Script CONFIG.SYNC_KEY ali Web App ni posodobljen na zadnjo verzijo."
        : message,
    };
  }
  render();
}

function bind() {
  document.querySelectorAll("[data-login-form]").forEach((form) => form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loginWithKey(new FormData(form).get("key"));
  }));
  document.querySelectorAll("[data-action='logout']").forEach((btn) => btn.addEventListener("click", logout));
  document.querySelectorAll("[data-nav]").forEach((btn) => btn.addEventListener("click", () => setActive(btn.dataset.nav)));
  document.querySelectorAll("[data-add]").forEach((btn) => btn.addEventListener("click", () => openModal(btn.dataset.add, btn.textContent.replace("Dodaj ", ""))));
  document.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => {
    const [collection, id] = btn.dataset.edit.split(":");
    openModal(collection, collection, state[collection].find((item) => item.id === id));
  }));
  document.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => {
    const [collection, id] = btn.dataset.delete.split(":");
    removeItem(collection, id);
  }));
  document.querySelectorAll("[data-filter]").forEach((input) => input.addEventListener("input", () => {
    filters[input.dataset.filter] = input.type === "number" ? Number(input.value) : input.value;
    render();
  }));
  document.querySelectorAll("[data-setting]").forEach((input) => input.addEventListener("input", () => {
    state.settings[input.dataset.setting] = input.type === "checkbox" ? input.checked : input.value;
    save();
    render();
  }));
  document.querySelectorAll("[data-action='close']").forEach((btn) => btn.addEventListener("click", closeModal));
  document.querySelectorAll("[data-action='theme']").forEach((btn) => btn.addEventListener("click", () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    save();
    render();
  }));
  document.querySelectorAll("[data-action='install-pwa']").forEach((btn) => btn.addEventListener("click", installPwa));
  document.querySelectorAll("form[data-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    upsert(form.dataset.form, Object.fromEntries(new FormData(form).entries()));
  }));
  document.querySelectorAll("[data-google-sheets-form]").forEach((form) => form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    cloudReady = false;
    if (currentProfile?.role !== "admin") return;
    backendConfig = {
      ...backendConfig,
      enabled: true,
      endpoint: String(values.endpoint || "").trim(),
      syncKey: normalizeSecret(values.syncKey),
    };
    cloudAutoSyncPaused = false;
    if (!hasValidSyncKey(backendConfig) && !hasServerManagedCloudAuth()) {
      cloudStatus = { state: "error", message: "Izberi dolg zasebni ključ in istega vpiši tudi v Code.gs." };
      saveBackendConfig();
      render();
      return;
    }
    const endpointError = googleSheetsEndpointError(backendConfig.endpoint);
    if (endpointError) {
      cloudStatus = { state: "error", message: endpointError };
      cloudAutoSyncPaused = true;
      saveBackendConfig();
      render();
      return;
    }
    saveBackendConfig();
    try {
      cloudAutoSyncPaused = true;
      await testGoogleSheetsConnection();
      cloudReady = true;
      cloudAutoSyncPaused = false;
      lastCloudPayload = cloudPayload();
      cloudStatus = { state: "success", message: "Povezava je preverjena. Profile sinhroniziraj loceno; podatke prenesi ali poslji rocno." };
      render();
      return;
      const loaded = await pullGoogleSheets({ quiet: true });
      if (loaded === false) {
        cloudAutoSyncPaused = true;
        cloudStatus = { state: "error", message: "V Google Sheets ni podatkov za ta profil. Samodejno pošiljanje je varnostno ustavljeno." };
        render();
      }
    } catch {
      cloudReady = true;
      render();
    }
  }));
  document.querySelectorAll("[data-change-profile-key]").forEach((form) => form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await changeCurrentProfileKey(Object.fromEntries(new FormData(form).entries()));
  }));
  document.querySelectorAll("[data-create-profile]").forEach((form) => form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await createUserProfile(Object.fromEntries(new FormData(form).entries()));
  }));
  document.querySelectorAll("[data-reset-profile-key]").forEach((btn) => btn.addEventListener("click", () => resetProfileKey(btn.dataset.resetProfileKey)));
  document.querySelectorAll("[data-toggle-profile]").forEach((btn) => btn.addEventListener("click", () => toggleProfile(btn.dataset.toggleProfile)));
  document.querySelectorAll("[data-delete-profile]").forEach((btn) => btn.addEventListener("click", () => openDeleteProfileModal(btn.dataset.deleteProfile)));
  document.querySelectorAll("[data-delete-profile-form]").forEach((form) => form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await deleteUserProfile(form.dataset.deleteProfileForm, Object.fromEntries(new FormData(form).entries()));
  }));
  document.querySelectorAll("[data-action='sync-profiles']").forEach((btn) => btn.addEventListener("click", forceSyncProfiles));
  document.querySelectorAll("[data-setup-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveSetupMode(form);
  }));
  document.querySelectorAll("[data-action='save-setup']").forEach((btn) => btn.addEventListener("click", () => {
    const form = document.querySelector("[data-setup-form]");
    if (form) saveSetupMode(form);
  }));
  document.querySelectorAll("[data-action='fill-current-setup']").forEach((btn) => btn.addEventListener("click", () => render()));
  document.querySelectorAll("[data-action='add-setup-vehicle']").forEach((btn) => btn.addEventListener("click", () => {
    const list = document.querySelector("[data-setup-vehicles]");
    if (list) list.insertAdjacentHTML("beforeend", setupVehicleField());
    bindSetupVehicleRemove();
  }));
  bindSetupVehicleRemove();
  const importInput = document.querySelector("[data-action='import-json']");
  if (importInput) importInput.addEventListener("change", async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      state = importedState(JSON.parse(await file.text()));
      save();
      render();
    } catch {
      alert("Datoteke ni bilo mogoče uvoziti. Preveri, ali vsebuje veljaven izvoz aplikacije.");
      importInput.value = "";
    }
  });
  const revolutInput = document.querySelector("[data-action='import-revolut-csv']");
  if (revolutInput) revolutInput.addEventListener("change", async () => {
    const file = revolutInput.files[0];
    if (!file) return;
    await loadRevolutCsv(file);
  });
  document.querySelectorAll("[data-map]").forEach((select) => select.addEventListener("change", () => {
    importDraft.mapping[select.dataset.map] = select.value;
    rebuildImportDraft();
    render();
  }));
  document.querySelectorAll("[data-import-account]").forEach((input) => input.addEventListener("change", () => {
    importDraft.account = input.value || "Revolut";
    rebuildImportDraft();
    render();
  }));
  document.querySelectorAll("[data-import-category]").forEach((select) => select.addEventListener("change", () => {
    const tx = importDraft.transactions[Number(select.dataset.importCategory)];
    tx.category = select.value;
    tx.confidence = "manual";
    tx.ruleSource = "ročno potrjeno";
    tx.manualChanged = true;
    tx.status = tx.category === "za pregled" ? "za pregled" : isDuplicateTransaction(tx) ? "možen dvojnik" : isInternalTransfer(tx) ? "interni transfer" : "pripravljeno";
    render();
  }));
  document.querySelectorAll("[data-remember-rule]").forEach((checkbox) => checkbox.addEventListener("change", () => {
    const tx = importDraft.transactions[Number(checkbox.dataset.rememberRule)];
    tx.rememberRule = checkbox.checked;
    render();
  }));
  document.querySelectorAll("[data-import-filter]").forEach((btn) => btn.addEventListener("click", () => {
    importFilter = btn.dataset.importFilter;
    render();
  }));
  document.querySelectorAll("[data-rule-from-transaction]").forEach((btn) => btn.addEventListener("click", () => rememberRuleFromTransaction(btn.dataset.ruleFromTransaction)));
  document.querySelectorAll("[data-action='reparse-import']").forEach((btn) => btn.addEventListener("click", () => {
    rebuildImportDraft();
    render();
  }));
  document.querySelectorAll("[data-action='confirm-import']").forEach((btn) => btn.addEventListener("click", confirmImportDraft));
  document.querySelectorAll("[data-action='undo-last-import']").forEach((btn) => btn.addEventListener("click", undoLastImport));
  document.querySelectorAll("[data-action='export-json']").forEach((btn) => btn.addEventListener("click", () => download("finance-dashboard.json", JSON.stringify(state, null, 2), "application/json")));
  document.querySelectorAll("[data-action='export-csv']").forEach((btn) => btn.addEventListener("click", () => download("finance-dashboard.csv", csvExport(), "text/csv")));
  document.querySelectorAll("[data-action='cloud-pull']").forEach((btn) => btn.addEventListener("click", () => pullGoogleSheets({ confirmOverwrite: true })));
  document.querySelectorAll("[data-action='cloud-push']").forEach((btn) => btn.addEventListener("click", () => pushGoogleSheets({ confirmOverwrite: true })));
  document.querySelectorAll("[data-action='cloud-disconnect']").forEach((btn) => btn.addEventListener("click", () => {
    if (currentProfile?.role !== "admin") return;
    if (!confirm("Odklopim Google Sheets? Lokalni podatki bodo ostali nespremenjeni.")) return;
    clearTimeout(cloudSaveTimer);
    cloudPendingSave = false;
    backendConfig = { ...backendConfig, enabled: false };
    cloudAutoSyncPaused = false;
    saveBackendConfig();
    cloudStatus = { state: "local", message: "Google Sheets je odklopljen. Podatki ostajajo lokalno." };
    save();
    render();
  }));
  document.querySelectorAll("[data-action='local-backup']").forEach((btn) => btn.addEventListener("click", async () => {
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Shranjujem...";
    try {
      const response = await fetch("/api/local-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state, null, 2),
      });
      if (!response.ok) throw new Error("Backup failed");
      btn.textContent = "Kopija shranjena";
    } catch {
      btn.textContent = "Shranjevanje ni uspelo";
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = original;
      }, 1800);
    }
  }));
  document.querySelectorAll("[data-action='clear']").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirm("Res trajno izbrišem vse finančne podatke? Nastavitve videza bodo ostale.")) return;
    state = emptyState({
      theme: state.settings.theme,
      currency: state.settings.currency,
      setupCompleted: false,
    });
    active = "setup";
    save();
    render();
  }));
}

function bindSetupVehicleRemove() {
  document.querySelectorAll("[data-action='remove-setup-vehicle']").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      const row = btn.closest("[data-setup-vehicle]");
      if (!row) return;
      const list = row.parentElement;
      row.remove();
      if (list && !list.querySelector("[data-setup-vehicle]")) {
        list.insertAdjacentHTML("beforeend", setupVehicleField());
        bindSetupVehicleRemove();
      }
    });
  });
}

render();
if (currentProfile) initializeGoogleSheetsSync();
