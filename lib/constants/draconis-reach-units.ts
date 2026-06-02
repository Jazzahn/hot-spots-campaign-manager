// BattleMech purchase options tables from Hot Spots: Draconis Reach (CAT35451)
// Organized by availability category — each table has different access requirements.

export type AvailabilityTable =
  | "SEA_FOX"
  | "SCRAPYARD"
  | "DRACONIS_COMBINE"
  | "FEDERATED_SUNS"
  | "RAVEN_ALLIANCE"
  | "VICTORY_INDUSTRIES"
  | "STARCORPS_INDUSTRIES"
  | "INDEPENDENCE_WEAPONRY";

export const TABLE_LABELS: Record<AvailabilityTable, string> = {
  SEA_FOX: "Clan Sea Fox",
  SCRAPYARD: "Scrapyard Sales",
  DRACONIS_COMBINE: "Draconis Combine",
  FEDERATED_SUNS: "Federated Suns",
  RAVEN_ALLIANCE: "Raven Alliance",
  VICTORY_INDUSTRIES: "Victory Industries",
  STARCORPS_INDUSTRIES: "StarCorps Industries",
  INDEPENDENCE_WEAPONRY: "Independence Weaponry",
};

export const TABLE_DESCRIPTIONS: Record<AvailabilityTable, string> = {
  SEA_FOX: "Roll 1D6 for subtable (1–2=A, 3–4=B, 5–6=C), then 1D6 on that subtable",
  SCRAPYARD: "Roll 2D6 for weight class (2–6=Light, 7–8=Medium, 9–10=Heavy, 11–12=Assault), then 2D6 — arrives damaged",
  DRACONIS_COMBINE: "Available on DCMS contracts; roll 1D6 for subtable (1–2=A, 3–4=B, 5–6=C)",
  FEDERATED_SUNS: "Available on AFFS contracts; roll 1D6 for subtable (1–2=A, 3–4=B, 5–6=C)",
  RAVEN_ALLIANCE: "Available on Raven Alliance contracts; roll 1D6 for subtable (1–2=A, 3–4=B, 5–6=C)",
  VICTORY_INDUSTRIES: "Exclusive sponsorship (DCMS territory) — 20% discount, sign deal on Proserpina or Marduk",
  STARCORPS_INDUSTRIES: "Exclusive sponsorship (FedSuns territory) — 20% discount, sign deal on Tybalt, Robinson, or Crofton",
  INDEPENDENCE_WEAPONRY: "Available to Crater Cobras — 20% discount on exclusive agreement",
};

export interface DraconisReachUnit {
  chassis: string;
  model: string;
  tonnage: number;
  battleValue: number;
  pointValue: number;
  techBase: "IS" | "CLAN" | "MIXED";
  isOmni: boolean;
  table: AvailabilityTable;
  subtable: string;
  weapons?: string;
}

export const DRACONIS_REACH_UNITS: DraconisReachUnit[] = [
  // ── CLAN SEA FOX ────────────────────────────────────────────────────────────
  // Subtable A
  { chassis: "Dasher II",       model: "Dasher II",           tonnage: 20, battleValue: 522,  pointValue: 22, techBase: "CLAN", isOmni: true,  table: "SEA_FOX", subtable: "A", weapons: "OmniMech — config varies" },
  { chassis: "Locust",          model: "LCT-7V",              tonnage: 20, battleValue: 585,  pointValue: 25, techBase: "IS",   isOmni: false, table: "SEA_FOX", subtable: "A", weapons: "ER Medium Laser · MASC" },
  { chassis: "Spider",          model: "SDR-8M",              tonnage: 30, battleValue: 621,  pointValue: 26, techBase: "IS",   isOmni: false, table: "SEA_FOX", subtable: "A", weapons: "2 ER Small Laser · TAG · jump jets" },
  { chassis: "Jenner IIC",      model: "Jenner IIC",          tonnage: 35, battleValue: 1047, pointValue: 29, techBase: "CLAN", isOmni: false, table: "SEA_FOX", subtable: "A", weapons: "2 ER Large Laser · 2 Streak SRM-4" },
  { chassis: "Piranha",         model: "Piranha 5",           tonnage: 20, battleValue: 1132, pointValue: 33, techBase: "CLAN", isOmni: false, table: "SEA_FOX", subtable: "A", weapons: "5 Machine Gun · 2 ER Micro Laser · 2 SRM-4" },
  { chassis: "Havoc",           model: "HVC-P6",              tonnage: 35, battleValue: 1255, pointValue: 36, techBase: "IS",   isOmni: false, table: "SEA_FOX", subtable: "A", weapons: "ER PPC · SRM-6 · ER Medium Laser" },
  // Subtable B
  { chassis: "Crab",            model: "CRB-27b",             tonnage: 50, battleValue: 1308, pointValue: 33, techBase: "IS",   isOmni: false, table: "SEA_FOX", subtable: "B", weapons: "2 ER Large Laser · 3 ER Medium Laser" },
  { chassis: "Shadow Hawk",     model: "SHD-7H",              tonnage: 55, battleValue: 1394, pointValue: 30, techBase: "IS",   isOmni: false, table: "SEA_FOX", subtable: "B", weapons: "RAC/5 · 2 ER Medium Laser · SRM-4" },
  { chassis: "Griffin IIC",     model: "Griffin IIC",         tonnage: 40, battleValue: 1608, pointValue: 31, techBase: "CLAN", isOmni: true,  table: "SEA_FOX", subtable: "B", weapons: "OmniMech — Prime: ER PPC · LRM-10 · 2 ER Medium Laser" },
  { chassis: "Gravedigger",     model: "GDR-1D",              tonnage: 65, battleValue: 1707, pointValue: 65, techBase: "IS",   isOmni: false, table: "SEA_FOX", subtable: "B", weapons: "Heavy PPC · 2 SRM-6 · 4 Medium Laser · ECM" },
  { chassis: "Coyotl",          model: "Coyotl Prime",        tonnage: 40, battleValue: 1974, pointValue: 48, techBase: "CLAN", isOmni: true,  table: "SEA_FOX", subtable: "B", weapons: "OmniMech — Prime: ER Large Laser · 2 SRM-4" },
  { chassis: "Lament",          model: "LMT-2R",              tonnage: 65, battleValue: 1999, pointValue: 43, techBase: "IS",   isOmni: false, table: "SEA_FOX", subtable: "B", weapons: "2 Heavy PPC · 2 ER Medium Laser · Angel ECM · DCC · Radical HSS" },
  // Subtable C
  { chassis: "Vulture Mk IV",   model: "Vulture Mk IV Prime", tonnage: 60, battleValue: 2110, pointValue: 46, techBase: "CLAN", isOmni: true,  table: "SEA_FOX", subtable: "C", weapons: "OmniMech — Prime: 2 LRM-20 · 2 ER Large Laser" },
  { chassis: "Cyclops",         model: "CP-11-B",             tonnage: 90, battleValue: 2145, pointValue: 50, techBase: "IS",   isOmni: false, table: "SEA_FOX", subtable: "C", weapons: "Targeting Computer · LRM-20 · AC/10 · 4 Medium Laser · SRM-4" },
  { chassis: "Jade Hawk",       model: "JHK-03",              tonnage: 55, battleValue: 2160, pointValue: 47, techBase: "CLAN", isOmni: true,  table: "SEA_FOX", subtable: "C", weapons: "OmniMech — ER Large Laser · 2 Heavy Medium Laser · MASC" },
  { chassis: "Ostsol C",        model: "Ostsol C",            tonnage: 60, battleValue: 2277, pointValue: 41, techBase: "CLAN", isOmni: false, table: "SEA_FOX", subtable: "C", weapons: "ER Large Laser · 4 ER Medium Laser" },
  { chassis: "Phoenix Hawk IIC",model: "Phoenix Hawk IIC 10", tonnage: 80, battleValue: 2762, pointValue: 46, techBase: "CLAN", isOmni: false, table: "SEA_FOX", subtable: "C", weapons: "ER PPC · Large Pulse Laser · 2 ER Medium Laser · jump jets" },
  { chassis: "Mad Cat Mk IV",   model: "Mad Cat Mk IV Prime", tonnage: 75, battleValue: 2781, pointValue: 52, techBase: "CLAN", isOmni: true,  table: "SEA_FOX", subtable: "C", weapons: "OmniMech — Prime: 2 ATM-9 · ER Large Laser · 2 ER Medium Laser" },

  // ── SCRAPYARD ───────────────────────────────────────────────────────────────
  // Light (2D6 2–6)
  { chassis: "Locust",        model: "LCT-3M",      tonnage: 20, battleValue: 522,  pointValue: 20, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "ER Medium Laser · Medium Laser" },
  { chassis: "Wasp",          model: "WSP-3S",       tonnage: 20, battleValue: 595,  pointValue: 15, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "ER Medium Laser · SRM-2" },
  { chassis: "Tarantula",     model: "ZPH-4A",       tonnage: 25, battleValue: 967,  pointValue: 26, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "ER Medium Laser · 3 Machine Gun · jump jets" },
  { chassis: "Hitman",        model: "HM-1",         tonnage: 30, battleValue: 925,  pointValue: 32, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "3 ER Medium Laser · MASC" },
  { chassis: "Osiris",        model: "OSR-3D",       tonnage: 30, battleValue: 1138, pointValue: 32, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "2 ER Medium Laser · SRM-4" },
  { chassis: "Spider",        model: "SDR-7K",       tonnage: 30, battleValue: 752,  pointValue: 27, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "2 ER Medium Laser · jump jets" },
  { chassis: "Valkyrie",      model: "VLK-QD1",      tonnage: 30, battleValue: 807,  pointValue: 25, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "LRM-10 · Medium Laser" },
  { chassis: "Garm",          model: "GRM-01A",      tonnage: 35, battleValue: 701,  pointValue: 17, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "2 ER Medium Laser · SRM-6" },
  { chassis: "Panther",       model: "PNT-10K2",     tonnage: 35, battleValue: 913,  pointValue: 22, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "ER PPC · SRM-4 w/ Artemis · AMS" },
  { chassis: "Wolfhound",     model: "WLF-2",        tonnage: 35, battleValue: 1061, pointValue: 28, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "ER Large Laser · 3 ER Medium Laser" },
  { chassis: "Venom",         model: "SDR-9K",       tonnage: 35, battleValue: 798,  pointValue: 25, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Light",  weapons: "2 ER Medium Laser · ER Flamer" },
  // Medium (2D6 7–8)
  { chassis: "Vindicator",    model: "VND-3L",       tonnage: 45, battleValue: 1105, pointValue: 27, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "PPC · 2 Medium Laser · LRM-5 · jump jets" },
  { chassis: "Assassin",      model: "ASN-30",       tonnage: 40, battleValue: 925,  pointValue: 23, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "LRM-5 · SRM-2 · 2 Medium Laser" },
  { chassis: "Hunchback",     model: "HBK-5N",       tonnage: 50, battleValue: 1041, pointValue: 28, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "Ultra AC/10 · Medium Pulse Laser" },
  { chassis: "Bushwacker",    model: "BSW-X1",       tonnage: 55, battleValue: 1223, pointValue: 33, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "LB 10-X AC · LRM-10 · 3 Medium Laser" },
  { chassis: "Blackjack",     model: "BJ-2",         tonnage: 45, battleValue: 1148, pointValue: 30, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "2 Large Laser · 2 Medium Laser" },
  { chassis: "Dervish",       model: "DV-9D",        tonnage: 55, battleValue: 1518, pointValue: 38, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "2 LRM-15 · 4 Medium Laser" },
  { chassis: "Phoenix Hawk",  model: "PXH-3K",       tonnage: 45, battleValue: 1359, pointValue: 32, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "2 ER Medium Laser · SRM-4 · jump jets" },
  { chassis: "Shadow Hawk",   model: "SHD-5D",       tonnage: 55, battleValue: 1684, pointValue: 39, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "AC/5 · LRM-5 · 2 Medium Laser · SRM-2" },
  { chassis: "Centurion",     model: "CN-9Da",       tonnage: 50, battleValue: 1035, pointValue: 28, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "LB 10-X AC · LRM-10 · 2 Medium Laser" },
  { chassis: "Stealth",       model: "STH-1D",       tonnage: 45, battleValue: 1231, pointValue: 43, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "2 ER Medium Laser · SRM-6 · Stealth Armor · jump jets" },
  { chassis: "Huron Warrior", model: "HUR-W0-R4L",  tonnage: 50, battleValue: 1530, pointValue: 31, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Medium", weapons: "PPC · 2 LRM-5" },
  // Heavy (2D6 9–10)
  { chassis: "Catapult",      model: "CPLT-C5",      tonnage: 65, battleValue: 1748, pointValue: 42, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "2 LRM-20 · 4 Medium Pulse Laser" },
  { chassis: "JagerMech",     model: "JM6-DDa",      tonnage: 65, battleValue: 911,  pointValue: 26, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "4 AC/2 · 2 ER Medium Laser" },
  { chassis: "Archer",        model: "ARC-5R",       tonnage: 70, battleValue: 1674, pointValue: 37, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "2 LRM-20 · 4 Medium Laser" },
  { chassis: "Gallowglas",    model: "GAL-1GLS",     tonnage: 70, battleValue: 1695, pointValue: 36, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "ER Large Laser · PPC · 4 Medium Laser · SRM-4" },
  { chassis: "Rifleman",      model: "RFL-5D",       tonnage: 60, battleValue: 1395, pointValue: 32, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "2 ER Large Laser · 2 ER Medium Laser · 2 Ultra AC/2" },
  { chassis: "Grand Dragon",  model: "DRG-5K",       tonnage: 60, battleValue: 1358, pointValue: 33, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "PPC · LRM-15 · 2 Medium Laser" },
  { chassis: "Marauder",      model: "MAD-5D",       tonnage: 75, battleValue: 1787, pointValue: 37, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "2 ER PPC · ER Large Laser · 2 ER Medium Laser" },
  { chassis: "Falconer",      model: "FLC-8R",       tonnage: 75, battleValue: 2231, pointValue: 40, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "ER PPC · 2 ER Large Laser · 2 ER Medium Laser" },
  { chassis: "War Dog",       model: "WR-DG-02FC",   tonnage: 75, battleValue: 1814, pointValue: 38, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "ER PPC · 2 LRM-10 · 2 SRM-6" },
  { chassis: "Rakshasa",      model: "MDG-1A",       tonnage: 75, battleValue: 1795, pointValue: 45, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "AC/10 · 2 LRM-5 · 4 Medium Laser" },
  { chassis: "Maelstrom",     model: "MTR-5K",       tonnage: 75, battleValue: 1694, pointValue: 44, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Heavy",  weapons: "2 PPC · 2 LRM-10 · 2 Medium Laser" },
  // Assault (2D6 11–12)
  { chassis: "Charger",       model: "CGR-3Kr",      tonnage: 80, battleValue: 2092, pointValue: 41, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "ER Large Laser · LRM-15 · SRM-6 · 5 Medium Laser" },
  { chassis: "Goliath",       model: "GOL-3M2",      tonnage: 80, battleValue: 1631, pointValue: 38, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "2 PPC · 2 LRM-10 · 2 SRM-6 · 2 Medium Laser" },
  { chassis: "Awesome",       model: "AWS-9M",       tonnage: 80, battleValue: 1812, pointValue: 41, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "2 PPC · ER PPC · 2 ER Medium Laser" },
  { chassis: "Victor",        model: "VTR-9K/D",     tonnage: 80, battleValue: 1717, pointValue: 40, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "Gauss Rifle · LRM-20 · 2 Medium Laser · SRM-4" },
  { chassis: "BattleMaster",  model: "BLR-3M",       tonnage: 85, battleValue: 1679, pointValue: 42, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "PPC · 4 Medium Laser · 2 LRM-10 · 2 SRM-6" },
  { chassis: "Atlas",         model: "AS7-K",        tonnage: 100,battleValue: 2175, pointValue: 48, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "Gauss Rifle · 2 LRM-10 · 4 Medium Laser · 2 SRM-6" },
  { chassis: "Stalker",       model: "STK-5M",       tonnage: 85, battleValue: 1655, pointValue: 49, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "2 LRM-15 · 2 ER Medium Laser · 4 Medium Pulse Laser" },
  { chassis: "Gunslinger",    model: "GUN-1ERD",     tonnage: 85, battleValue: 2286, pointValue: 48, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "2 ER Large Laser · 2 ER PPC · 2 ER Medium Laser" },
  { chassis: "Longbow",       model: "LGB-7V",       tonnage: 85, battleValue: 1816, pointValue: 49, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "2 LRM-20 · 2 SRM-6 · 4 Medium Laser" },
  { chassis: "Cyclops",       model: "CP-11-B",      tonnage: 90, battleValue: 2145, pointValue: 50, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "Targeting Computer · LRM-20 · AC/10 · 4 Medium Laser · SRM-4" },
  { chassis: "Cerberus",      model: "MR-V2",        tonnage: 95, battleValue: 2001, pointValue: 45, techBase: "IS", isOmni: false, table: "SCRAPYARD", subtable: "Assault", weapons: "4 ER Medium Laser · 2 LRM-15" },

  // ── DRACONIS COMBINE ────────────────────────────────────────────────────────
  // Subtable A
  { chassis: "Venom",         model: "SDR-9KA",       tonnage: 35,  battleValue: 865,  pointValue: 27, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "A", weapons: "ER Medium Laser · ER Flamer · C3 Slave" },
  { chassis: "Panther",       model: "PNT-12A",       tonnage: 35,  battleValue: 982,  pointValue: 24, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "A", weapons: "ER PPC · SRM-4 w/ Artemis · AMS · C3 Slave" },
  { chassis: "Jenner",        model: "JR7-C3",        tonnage: 35,  battleValue: 1069, pointValue: 31, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "A", weapons: "4 Medium Laser · SRM-4 · C3 Slave" },
  { chassis: "Cricket",       model: "RWN-01",        tonnage: 30,  battleValue: 1169, pointValue: 31, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "A", weapons: "2 Medium Laser · SRM-4 · ECM · jump jets" },
  { chassis: "Chimera",       model: "CMA-1S",        tonnage: 40,  battleValue: 1173, pointValue: 26, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "A", weapons: "RAC/5 · 2 ER Medium Laser · SRM-4" },
  { chassis: "Avatar",        model: "AV-1O",         tonnage: 70,  battleValue: 1395, pointValue: 37, techBase: "IS",   isOmni: true,  table: "DRACONIS_COMBINE", subtable: "A", weapons: "OmniMech — Prime: LRM-15 · 2 ER Medium Laser · SRM-4" },
  // Subtable B
  { chassis: "Jenner IIC",    model: "Jenner IIC 5",  tonnage: 35,  battleValue: 1440, pointValue: 38, techBase: "CLAN", isOmni: false, table: "DRACONIS_COMBINE", subtable: "B", weapons: "2 Heavy Large Laser · Streak SRM-6" },
  { chassis: "Griffin IIC",   model: "Griffin IIC",   tonnage: 40,  battleValue: 1608, pointValue: 31, techBase: "CLAN", isOmni: true,  table: "DRACONIS_COMBINE", subtable: "B", weapons: "OmniMech — Prime: ER PPC · LRM-10 · 2 ER Medium Laser" },
  { chassis: "Mauler",        model: "MAL-1K",        tonnage: 90,  battleValue: 1622, pointValue: 40, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "B", weapons: "4 LB 2-X AC · 2 LRM-5 · 4 ER Small Laser" },
  { chassis: "Black Hawk-KU", model: "BHKU-O",        tonnage: 60,  battleValue: 1731, pointValue: 46, techBase: "CLAN", isOmni: true,  table: "DRACONIS_COMBINE", subtable: "B", weapons: "OmniMech — config varies" },
  { chassis: "Archer",        model: "ARC-9M",        tonnage: 70,  battleValue: 1811, pointValue: 42, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "B", weapons: "2 LRM-20 · ER PPC · Medium Pulse Laser" },
  { chassis: "Shadow Cat III",model: "Shadow Cat III Prime", tonnage: 45, battleValue: 2021, pointValue: 45, techBase: "CLAN", isOmni: true, table: "DRACONIS_COMBINE", subtable: "B", weapons: "OmniMech — Prime: ER PPC · ER Large Laser · Targeting Computer" },
  // Subtable C
  { chassis: "Warhammer",     model: "WHM-10K",       tonnage: 70,  battleValue: 2033, pointValue: 39, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "C", weapons: "2 Heavy PPC · 2 ER Medium Laser" },
  { chassis: "Lancelot",      model: "LNC25-09",      tonnage: 60,  battleValue: 2099, pointValue: 42, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "C", weapons: "3 ER Large Laser · 2 ER Medium Laser" },
  { chassis: "Marauder II",   model: "MAD-6C",        tonnage: 100, battleValue: 2346, pointValue: 50, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "C", weapons: "Gauss Rifle · 2 ER PPC · 4 Medium Laser" },
  { chassis: "Katana",        model: "CRK-5006-1",    tonnage: 85,  battleValue: 2363, pointValue: 48, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "C", weapons: "Ultra AC/20 · 2 ER Medium Laser · 2 ER Small Laser" },
  { chassis: "Atlas",         model: "AS8-KE",        tonnage: 100, battleValue: 2658, pointValue: 53, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "C", weapons: "2 ER PPC · Large Pulse Laser · 2 LRM-10 · 4 Medium Laser" },
  { chassis: "Gunslinger",    model: "GUN-3ERD",      tonnage: 85,  battleValue: 2844, pointValue: 49, techBase: "IS",   isOmni: false, table: "DRACONIS_COMBINE", subtable: "C", weapons: "2 ER Large Laser · 4 ER Medium Laser" },

  // ── FEDERATED SUNS ──────────────────────────────────────────────────────────
  // Subtable A
  { chassis: "Javelin",       model: "JVN-12N",       tonnage: 30,  battleValue: 795,  pointValue: 26, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "A", weapons: "2 SRM-6 w/ Artemis · 2 ER Medium Laser" },
  { chassis: "Hatchetman",    model: "HCT-6D",        tonnage: 45,  battleValue: 585,  pointValue: 25, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "A", weapons: "Hatchet · ER Large Laser · 2 Medium Pulse Laser" },
  { chassis: "Ostscout",      model: "OTT-8J",        tonnage: 35,  battleValue: 894,  pointValue: 33, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "A", weapons: "TAG · ECM · Small Laser · jump jets (scout)" },
  { chassis: "Legionnaire",   model: "LGN-2D",        tonnage: 50,  battleValue: 1386, pointValue: 39, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "A", weapons: "ER Large Laser · 2 ER Medium Laser · SRM-4" },
  { chassis: "Enforcer",      model: "ENF-5R",        tonnage: 50,  battleValue: 1192, pointValue: 24, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "A", weapons: "LB 10-X AC · Re-engineered ER Large Laser · MASC" },
  { chassis: "Watchman",      model: "WTC-4DM",       tonnage: 40,  battleValue: 1225, pointValue: 31, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "A", weapons: "LRM-10 · SRM-4 w/ Artemis" },
  // Subtable B
  { chassis: "Gunsmith",      model: "CH11-NG",       tonnage: 25,  battleValue: 1465, pointValue: 36, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "B", weapons: "4 ER Small Laser · TAG · C3 Slave" },
  { chassis: "Ostsol",        model: "OTL-8E3",       tonnage: 60,  battleValue: 1671, pointValue: 37, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "B", weapons: "2 ER Large Laser · 4 ER Medium Laser" },
  { chassis: "Argus",         model: "AGS-4D",        tonnage: 60,  battleValue: 1638, pointValue: 42, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "B", weapons: "Heavy PPC · 2 Streak SRM-6 · C3 Slave" },
  { chassis: "Thanatos",      model: "TNS-4T",        tonnage: 75,  battleValue: 1760, pointValue: 43, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "B", weapons: "PPC · LRM-15 · 2 SRM-4 · 2 ER Medium Laser" },
  { chassis: "Victor",        model: "VTR-12D",       tonnage: 80,  battleValue: 1935, pointValue: 38, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "B", weapons: "Gauss Rifle · 2 SRM-4 · 2 Medium Laser" },
  { chassis: "Caesar",        model: "CES-5R",        tonnage: 70,  battleValue: 2192, pointValue: 51, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "B", weapons: "LB 10-X AC · 2 LRM-5 · 2 ER Medium Laser" },
  // Subtable C
  { chassis: "Falconer",      model: "FLC-8R",        tonnage: 75,  battleValue: 2231, pointValue: 40, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "C", weapons: "ER PPC · 2 ER Large Laser · 2 ER Medium Laser" },
  { chassis: "Marauder",      model: "MAD-11D",       tonnage: 75,  battleValue: 2263, pointValue: 41, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "C", weapons: "2 Heavy PPC · 2 ER Medium Laser" },
  { chassis: "Black Knight",  model: "BLK-NT-5H",     tonnage: 75,  battleValue: 2423, pointValue: 43, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "C", weapons: "2 ER Large Laser · 3 ER Medium Laser · 2 Medium Pulse Laser" },
  { chassis: "Atlas III",     model: "AS7-D3",        tonnage: 100, battleValue: 2564, pointValue: 58, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "C", weapons: "LB 20-X AC · 4 ER Medium Laser · 2 SRM-6" },
  { chassis: "Sagittaire",    model: "SGT-14R",       tonnage: 95,  battleValue: 2626, pointValue: 49, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "C", weapons: "ER Large Laser · Heavy PPC · SRM-4 · 2 ER Medium Laser" },
  { chassis: "Devastator",    model: "DVS-11",        tonnage: 100, battleValue: 3170, pointValue: 57, techBase: "IS", isOmni: false, table: "FEDERATED_SUNS", subtable: "C", weapons: "2 Gauss Rifle · 4 ER Medium Laser" },

  // ── RAVEN ALLIANCE ──────────────────────────────────────────────────────────
  // Subtable A
  { chassis: "Wasp",          model: "WSP-3A",        tonnage: 20,  battleValue: 401,  pointValue: 16, techBase: "IS",   isOmni: false, table: "RAVEN_ALLIANCE", subtable: "A", weapons: "Medium Laser · SRM-2" },
  { chassis: "Locust C",      model: "Locust C",      tonnage: 20,  battleValue: 672,  pointValue: 23, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "A", weapons: "2 ER Small Laser · 2 Machine Gun (Clan tech)" },
  { chassis: "Stinger IIC",   model: "Stinger IIC",   tonnage: 20,  battleValue: 730,  pointValue: 22, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "A", weapons: "2 ER Small Laser · SRM-4" },
  { chassis: "Bear Cub",      model: "Bear Cub",      tonnage: 30,  battleValue: 1052, pointValue: 28, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "A", weapons: "2 ER Medium Laser · SRM-4" },
  { chassis: "Baboon",        model: "Baboon 3",      tonnage: 25,  battleValue: 1277, pointValue: 24, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "A", weapons: "3 ER Medium Laser · SRM-4 · jump jets" },
  { chassis: "Cadaver",       model: "CVR-T1",        tonnage: 55,  battleValue: 1288, pointValue: 37, techBase: "IS",   isOmni: false, table: "RAVEN_ALLIANCE", subtable: "A", weapons: "ER Large Laser · 2 SRM-6" },
  // Subtable B
  { chassis: "Clint IIC",     model: "Clint IIC",     tonnage: 40,  battleValue: 1395, pointValue: 25, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "B", weapons: "3 ER Medium Laser · 2 SRM-6" },
  { chassis: "Bombardier",    model: "BMB-12D",       tonnage: 65,  battleValue: 1480, pointValue: 39, techBase: "IS",   isOmni: false, table: "RAVEN_ALLIANCE", subtable: "B", weapons: "2 LRM-20 · 2 ER Medium Laser" },
  { chassis: "Dark Crow",     model: "Dark Crow",     tonnage: 30,  battleValue: 1594, pointValue: 35, techBase: "CLAN", isOmni: true,  table: "RAVEN_ALLIANCE", subtable: "B", weapons: "OmniMech — Prime: ER Large Laser · 2 SRM-4" },
  { chassis: "Merlin C",      model: "Merlin C",      tonnage: 60,  battleValue: 1870, pointValue: 39, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "B", weapons: "3 ER Medium Laser · 2 LRM-10 · SRM-4 (Clan refit)" },
  { chassis: "Shadow Hawk IIC",model: "Shadow Hawk IIC 7", tonnage: 45, battleValue: 1999, pointValue: 41, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "B", weapons: "ER PPC · 2 SRM-6 · 2 ER Medium Laser" },
  { chassis: "Vapor Eagle",   model: "Vapor Eagle (Goshawk) 6", tonnage: 55, battleValue: 2021, pointValue: 45, techBase: "CLAN", isOmni: true, table: "RAVEN_ALLIANCE", subtable: "B", weapons: "OmniMech — ER Large Laser · LRM-10 · SRM-4" },
  // Subtable C
  { chassis: "Goshawk II",    model: "Goshawk II 3",  tonnage: 55,  battleValue: 2115, pointValue: 42, techBase: "CLAN", isOmni: true,  table: "RAVEN_ALLIANCE", subtable: "C", weapons: "OmniMech — ER Large Laser · 2 ER Medium Laser · LRM-5" },
  { chassis: "Warhammer IIC", model: "Warhammer IIC 13", tonnage: 80, battleValue: 2715, pointValue: 51, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "C", weapons: "2 ER PPC · 4 ER Medium Laser" },
  { chassis: "Omen",          model: "Omen",          tonnage: 55,  battleValue: 2750, pointValue: 55, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "C", weapons: "ER PPC · 2 Heavy Large Laser · ER Medium Laser" },
  { chassis: "Charger C",     model: "Charger C",     tonnage: 80,  battleValue: 2756, pointValue: 83, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "C", weapons: "Ultra AC/20 · SRM-6 · 4 ER Medium Laser" },
  { chassis: "Rifleman IIC",  model: "Rifleman IIC 9",tonnage: 65,  battleValue: 2794, pointValue: 41, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "C", weapons: "2 ER PPC · 2 ER Large Laser" },
  { chassis: "White Raven",   model: "White Raven",   tonnage: 75,  battleValue: 2941, pointValue: 56, techBase: "CLAN", isOmni: false, table: "RAVEN_ALLIANCE", subtable: "C", weapons: "2 ER PPC · 2 ER Large Laser · 4 ER Medium Laser" },

  // ── VICTORY INDUSTRIES ──────────────────────────────────────────────────────
  { chassis: "Avatar",        model: "AV1-O",   tonnage: 70, battleValue: 1395, pointValue: 37, techBase: "IS",   isOmni: true,  table: "VICTORY_INDUSTRIES", subtable: "", weapons: "OmniMech — Prime: LRM-15 · 2 ER Medium Laser · SRM-4" },
  { chassis: "Black Hawk-KU", model: "BHKU-O",  tonnage: 60, battleValue: 1770, pointValue: 35, techBase: "CLAN", isOmni: true,  table: "VICTORY_INDUSTRIES", subtable: "", weapons: "OmniMech — config varies" },
  { chassis: "Griffin",       model: "GRF-5K",  tonnage: 55, battleValue: 1390, pointValue: 40, techBase: "IS",   isOmni: false, table: "VICTORY_INDUSTRIES", subtable: "", weapons: "PPC · LRM-10 · 2 Medium Laser · jump jets" },
  { chassis: "Griffin",       model: "GRF-6S2", tonnage: 55, battleValue: 1870, pointValue: 36, techBase: "IS",   isOmni: false, table: "VICTORY_INDUSTRIES", subtable: "", weapons: "ER PPC · MML-5 · 2 Medium Laser · jump jets" },
  { chassis: "Orochi",        model: "OR-2I",   tonnage: 90, battleValue: 2077, pointValue: 47, techBase: "IS",   isOmni: false, table: "VICTORY_INDUSTRIES", subtable: "", weapons: "4 LRM-15 · ER Large Laser · 4 ER Small Laser" },
  { chassis: "Orochi",        model: "OR-3K",   tonnage: 90, battleValue: 2029, pointValue: 40, techBase: "IS",   isOmni: false, table: "VICTORY_INDUSTRIES", subtable: "", weapons: "2 Gauss Rifle · 4 ER Medium Laser" },
  { chassis: "Wolverine",     model: "WVR-8C",  tonnage: 55, battleValue: 1447, pointValue: 39, techBase: "IS",   isOmni: false, table: "VICTORY_INDUSTRIES", subtable: "", weapons: "ER PPC · SRM-6 · 3 ER Medium Laser" },
  { chassis: "Wolverine",     model: "WVR-8D",  tonnage: 55, battleValue: 1547, pointValue: 34, techBase: "IS",   isOmni: false, table: "VICTORY_INDUSTRIES", subtable: "", weapons: "LB 10-X AC · 4 ER Small Laser · SRM-4" },
  { chassis: "Wolverine",     model: "WVR-8K",  tonnage: 55, battleValue: 1576, pointValue: 38, techBase: "IS",   isOmni: false, table: "VICTORY_INDUSTRIES", subtable: "", weapons: "ER PPC · 3 Medium Laser · SRM-6" },

  // ── STARCORPS INDUSTRIES (CROFTON) ──────────────────────────────────────────
  { chassis: "Gallant",       model: "GLT-10-0",  tonnage: 70, battleValue: 1555, pointValue: 39, techBase: "IS", isOmni: false, table: "STARCORPS_INDUSTRIES", subtable: "", weapons: "ER Large Laser · 2 ER Medium Laser · SRM-4" },
  { chassis: "Thanatos",      model: "TNS-4S",    tonnage: 75, battleValue: 1844, pointValue: 46, techBase: "IS", isOmni: false, table: "STARCORPS_INDUSTRIES", subtable: "", weapons: "ER PPC · LRM-15 · 2 SRM-4 · ER Medium Laser" },
  { chassis: "Warhammer",     model: "WHM-9D",    tonnage: 70, battleValue: 2152, pointValue: 43, techBase: "IS", isOmni: false, table: "STARCORPS_INDUSTRIES", subtable: "", weapons: "2 ER PPC · 4 ER Medium Laser · AMS" },
  { chassis: "Inferno",       model: "INF-NO",    tonnage: 75, battleValue: 1597, pointValue: 41, techBase: "IS", isOmni: true,  table: "STARCORPS_INDUSTRIES", subtable: "", weapons: "OmniMech — Prime: LRM-20 · ER PPC · ER Medium Laser" },
  { chassis: "Longbow",       model: "LGB-14C",   tonnage: 85, battleValue: 1421, pointValue: 40, techBase: "IS", isOmni: false, table: "STARCORPS_INDUSTRIES", subtable: "", weapons: "2 LRM-20 w/ Artemis · 2 SRM-6" },
  { chassis: "Stalker",       model: "STK-7D",    tonnage: 85, battleValue: 1872, pointValue: 45, techBase: "IS", isOmni: false, table: "STARCORPS_INDUSTRIES", subtable: "", weapons: "2 LRM-15 · 2 Medium Laser · 4 Medium Pulse Laser" },

  // ── INDEPENDENCE WEAPONRY ───────────────────────────────────────────────────
  { chassis: "Fujin",         model: "RJN-301-F", tonnage: 50,  battleValue: 1770, pointValue: 32, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "ER PPC · 2 ER Medium Laser · SRM-4 · C3 Slave" },
  { chassis: "Hatchetman",    model: "HCT-5K",    tonnage: 45,  battleValue: 1070, pointValue: 31, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "Hatchet · ER PPC · 2 Medium Pulse Laser" },
  { chassis: "Tessen",        model: "TSN-C3",    tonnage: 55,  battleValue: 1234, pointValue: 34, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "2 ER Medium Laser · SRM-4 · C3 Slave" },
  { chassis: "Tessen",        model: "TSN-C3M",   tonnage: 55,  battleValue: 1547, pointValue: 43, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "2 ER Medium Laser · SRM-4 · C3 Master" },
  { chassis: "Exhumer",       model: "EXR-3P",    tonnage: 55,  battleValue: 1469, pointValue: 34, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "LB 10-X AC · 2 ER Medium Laser · CASE" },
  { chassis: "Marauder",      model: "MAD-9W2",   tonnage: 75,  battleValue: 1868, pointValue: 43, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "2 ER PPC · 2 ER Medium Laser · C3 Slave" },
  { chassis: "Gunslinger",    model: "GUN-3ERD",  tonnage: 85,  battleValue: 2844, pointValue: 49, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "2 ER Large Laser · 4 ER Medium Laser" },
  { chassis: "Peacekeeper",   model: "PKP-1B",    tonnage: 95,  battleValue: 2981, pointValue: 47, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "2 Gauss Rifle · 2 ER Medium Laser" },
  { chassis: "Akuma",         model: "AKU-2XK",   tonnage: 90,  battleValue: 2170, pointValue: 54, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "ER PPC · 2 ER Large Laser · 4 Medium Laser" },
  { chassis: "Atlas",         model: "AS8-KE",    tonnage: 100, battleValue: 2658, pointValue: 53, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "2 ER PPC · Large Pulse Laser · 2 LRM-10 · 4 Medium Laser" },
  { chassis: "Marauder II",   model: "MAD-8K",    tonnage: 100, battleValue: 2849, pointValue: 51, techBase: "IS", isOmni: false, table: "INDEPENDENCE_WEAPONRY", subtable: "", weapons: "Gauss Rifle · 2 ER PPC · 4 ER Medium Laser" },
];
