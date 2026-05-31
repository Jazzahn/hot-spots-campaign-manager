// General Tracks from Hot Spots: Draconis Reach (pp. 168–175)
// These are the reusable battle scenarios referenced by contracts.

export interface TrackObjective {
  name: string;
  description: string;
  vp: number;
  side: "ATTACKER" | "DEFENDER" | "BOTH";
}

export interface GeneralTrack {
  name: string;
  description: string;
  attackerRole: string;
  defenderRole: string;
  attackerSetup: string;
  defenderSetup: string;
  objectives: TrackObjective[];
  trackEnd: string;
  salvageRule: string;
  specialRules?: string;
}

export const GENERAL_TRACKS: GeneralTrack[] = [
  {
    name: "Assault",
    description: "A pitched battle where the Attacker tries to drive the Defender from the field entirely.",
    attackerRole: "GARRISON",
    defenderRole: "GARRISON",
    attackerSetup: "Attacker enters from their home edge (opposite long edge) during Movement Phase of Turn 1. May not select Minefield or Immobile BSP assets.",
    defenderSetup: "Defender deploys within 5 full hexes of their home edge (long edge), prior to first turn's Initiative.",
    objectives: [
      { name: "Orders—Attacker", description: "At least half of your units (by number, excluding assets) must either make an attack on an enemy unit for two consecutive turns, or be within LOS and medium range of an enemy unit's weapon for two consecutive turns.", vp: 50, side: "ATTACKER" },
      { name: "Orders—Defender", description: "All of your units must stay on the field of play for the first three turns, or be crippled or destroyed.", vp: 50, side: "DEFENDER" },
      { name: "Conquer", description: "Destroy/Cripple at least half of the opponent's starting force (by BV or PV, excluding assets) before having more than 50% of your own force destroyed. If both players finish in the same phase, neither score this objective.", vp: 200, side: "BOTH" },
      { name: "Hold the Field", description: "If one side's entire deployed force, including assets, is crippled or destroyed, the other side successfully holds the field.", vp: 100, side: "BOTH" },
    ],
    trackEnd: "After the end of any turn where at least one side has no 'Mech units in play, or after turn 10 (turn 8 Alpha Strike).",
    salvageRule: "The side that successfully completes the track earns all salvage.",
  },
  {
    name: "Breakthrough",
    description: "The Attacker attempts a pinpoint strike to break through the Defender's lines.",
    attackerRole: "STANDARD",
    defenderRole: "GARRISON",
    attackerSetup: "Attacker enters from their home edge (opposite long edge) during Movement Phase of Turn 1. May not select Minefield or Immobile BSP assets.",
    defenderSetup: "Defender deploys within 6 full hexes of their home edge (long edge), prior to first turn's Initiative.",
    objectives: [
      { name: "Orders—Attacker", description: "At least half of your starting units (by BV/PV, excluding assets) must cross the center line towards the Defender's home edge.", vp: 50, side: "ATTACKER" },
      { name: "Orders—Defender", description: "At least half of your surviving units (by number, excluding assets) must make an attack on an enemy unit for two consecutive turns.", vp: 50, side: "DEFENDER" },
      { name: "Push Through", description: "The Attacker moves at least half their starting force (by BV or PV, including assets) off the Defender's home edge.", vp: 300, side: "ATTACKER" },
      { name: "Suppressing Fire", description: "Every non-BSP unit in the opponent's force suffers at least 1 point of internal damage (AS: 1 damage point).", vp: 100, side: "BOTH" },
      { name: "You Shall Not Pass", description: "The Defender cripples or destroys at least half of the Attacker's starting force (by BV or PV, including assets) before they can exit off the Defender's home edge.", vp: 300, side: "DEFENDER" },
    ],
    trackEnd: "After the end of any turn where at least one side has no units in play, or after turn 10 (turn 8 Alpha Strike).",
    salvageRule: "Both sides may claim salvage. All destroyed/crippled units form a single salvage pool; players alternate selecting. Track completer chooses first. If neither or both completed all objectives, no opposing salvage is claimed.",
  },
  {
    name: "Defend",
    description: "The Defender attempts a defense-in-depth to hold back the onslaught of the Attacker's force.",
    attackerRole: "RAIDERS",
    defenderRole: "GARRISON",
    attackerSetup: "Attacker's force enters from their home edge (short edge) during Turn 1 Movement Phase. May not select Minefield or Immobile BSP assets.",
    defenderSetup: "Defender holds up to 33% of force off the map at start; remainder deployed within 6 full hexes of their home edge (short edge). Held units placed anywhere in Defender's half after Turn 1 Movement Phase. Defenders may not select BSP Strikes.",
    objectives: [
      { name: "Orders—Attacker/Defender", description: "At least half of your surviving units (by number, excluding assets) are within 4 hexes/8\" of the center line at the end of turn 3 (6 hexes/12\" on turn 4 for Scale 2+).", vp: 50, side: "BOTH" },
      { name: "Overpower", description: "At the end of turn 6 (turn 8 at Scale 2+), have more non-crippled units than the opponent (by BV, excluding assets) within 4 hexes/8\" of the center line.", vp: 250, side: "BOTH" },
      { name: "Cut Off The Head", description: "Destroy/Cripple the enemy commander's unit.", vp: 150, side: "BOTH" },
    ],
    trackEnd: "After the End Phase of any turn where at least one side has no units in play, or Turn 6 (Turn 8 at Scale 2+).",
    salvageRule: "The side that successfully completes the track earns all salvage.",
  },
  {
    name: "Flank",
    description: "The Attacker attempts to maneuver past the fixed fortifications of the Defender to roll up the line.",
    attackerRole: "RAIDERS",
    defenderRole: "STANDARD",
    attackerSetup: "At least one third of Attacker's force (by number of units, rounding down, including assets) enters from home edge (long edge) during Turn 1 Movement Phase. Remainder enters from a short edge during Turn 2 Movement Phase. Attacker may not select Minefield or Immobile BSP assets.",
    defenderSetup: "Defender granted two veteran Medium Emplacements per scale (or choice of emplacements up to 20 BSP each) placed in Attacker's half of play area. Defender deploys entire force within their half prior to Turn 1.",
    objectives: [
      { name: "Orders—Attacker", description: "At least half of your surviving units (by number, including assets) are in the Defender's half of the battlefield during any end phase.", vp: 50, side: "ATTACKER" },
      { name: "Orders—Defender", description: "At least half of your units (by number, excluding assets) must make an attack on an enemy unit for two consecutive turns.", vp: 50, side: "DEFENDER" },
      { name: "Crush", description: "Destroy/Cripple at least 50% of the opponent's force (by BV or PV, including assets).", vp: 150, side: "ATTACKER" },
      { name: "Ramming Speed", description: "Destroy all of the Defender's Emplacements.", vp: 150, side: "ATTACKER" },
      { name: "Cut off Retreat", description: "Have at least one non-crippled 'Mech (or 2 BSP assets) per scale within 3 hexes (AS: 6\") of the opponent's home edge during the end phase for a minimum of 2 consecutive turns.", vp: 150, side: "ATTACKER" },
      { name: "Turn the Tide", description: "Destroy/Cripple at least 50% of the Attacker's force (by BV or PV, including assets).", vp: 150, side: "DEFENDER" },
      { name: "Fall Back in Order", description: "After completing Turn the Tide, withdraw at least 50% of the Defender starting force (by BV or PV, including assets) off your home edge.", vp: 150, side: "DEFENDER" },
    ],
    trackEnd: "After the end of any turn where at least one side has no units in play, or after turn 10 (turn 8 Alpha Strike).",
    salvageRule: "The side that successfully completes the track earns all salvage.",
  },
  {
    name: "Meeting Engagement",
    description: "Two forces make contact and quickly assess each other before falling back.",
    attackerRole: "STANDARD",
    defenderRole: "STANDARD",
    attackerSetup: "Attacker enters from their home edge (short edge) during Turn 1 Movement Phase. Neither side may select Minefield or Immobile BSP assets.",
    defenderSetup: "Defender enters from their home edge (short edge) during Turn 1 Movement Phase.",
    objectives: [
      { name: "Orders—Attacker/Defender", description: "At least half of your units (by number, excluding assets) must either make an attack on an enemy unit for two consecutive turns, or move within 12 hexes (AS: 24\") of an enemy unit for two consecutive turns.", vp: 50, side: "BOTH" },
      { name: "Make Their Acquaintance", description: "The first team to destroy or cripple one-third or more of the opponent's starting force (by BV or PV, excluding assets). Units withdrawing from home edge before being crippled count as crippled. If both teams do this in the same phase, neither achieve this objective.", vp: 200, side: "BOTH" },
      { name: "Suppressing Fire", description: "Every non-BSP unit in the opponent's force suffers at least 1 point of structure damage.", vp: 100, side: "BOTH" },
    ],
    trackEnd: "After the end of any turn where at least one side has no units in play, or after the End Phase of turn 8 (turn 6 Alpha Strike).",
    salvageRule: "Neither side may claim salvage in this track.",
  },
  {
    name: "Objective Raid",
    description: "The Attacker attempts a smash and grab to steal vital assets from the Defender.",
    attackerRole: "RAIDERS",
    defenderRole: "GARRISON",
    attackerSetup: "Attacker's force enters from their home edge (short edge) during Turn 1 Movement Phase. May not select Minefield or Immobile BSP assets.",
    defenderSetup: "Defender places 2 Medium objective buildings (height 1–4 levels) within 4 hexes (6 hexes at Scale 2+) of the center. At least half of Defender's force must be within 6 hexes of the objective buildings. Buildings are indestructible.",
    objectives: [
      { name: "Orders—Attacker", description: "At least one of your units (per scale, excluding assets) must cross the center line towards the Defender's home edge.", vp: 50, side: "ATTACKER" },
      { name: "Orders—Defender", description: "All units must stay within 3 hexes (AS: 6\") of one of the objective buildings, or closer to Attacker's home edge than one of the buildings, for the first two turns, or be crippled or destroyed.", vp: 50, side: "DEFENDER" },
      { name: "Grab the Stuff", description: "Each component carried off the Attacker's home edge.", vp: 100, side: "ATTACKER" },
      { name: "You Must Pay for That", description: "Each non-asset Attacker unit crippled or destroyed.", vp: 100, side: "DEFENDER" },
    ],
    trackEnd: "After the end of any turn where at least one side has no units in play, or after turn 12 (turn 10 Alpha Strike).",
    salvageRule: "The Attacker may not claim salvage. The Defender claims salvage if they successfully complete the track; otherwise all salvage is returned to owners.",
    specialRules: "Raid special rule: Attacker units ('Mechs with at least one hand or infantry) adjacent to an objective building may grab objective components. 'Mechs may carry components equal to their weight class (Light=1, Medium=2, Heavy=3, Assault=4). Carrying components reduces walking/cruising MP by 1 (AS: MV by 2\").",
  },
  {
    name: "Pursuit",
    description: "The Defenders run for their lives while the Attacker attempts to chase them down.",
    attackerRole: "RAIDERS",
    defenderRole: "RAIDERS",
    attackerSetup: "Attacker enters from their home edge (short edge) during Turn 2 Movement Phase.",
    defenderSetup: "Defender enters from the ATTACKER's home edge during Turn 1 Movement Phase. At least half of Defender's units (by BV/PV, excluding assets) must have a maximum movement of 8 hexes or less (AS: 16\" or less).",
    objectives: [
      { name: "Orders—Attacker", description: "Engage (make an attack on) at least half of the Defender's units (by number, including assets).", vp: 50, side: "ATTACKER" },
      { name: "Orders—Defender", description: "At least half of the Defender's starting force (by BV/PV, excluding assets) cross the center line toward their home edge.", vp: 50, side: "DEFENDER" },
      { name: "Prevention", description: "Prevent at least 75% of the Defender's starting force (by BV or PV, excluding assets) from exiting through their home edge through the end of Turn 10.", vp: 300, side: "ATTACKER" },
      { name: "No Quarter", description: "Destroy/Cripple 100% of the Defender's starting force (by BV or PV, including assets).", vp: 100, side: "ATTACKER" },
      { name: "Escape", description: "At least half of the Defender's starting force (by BV or PV, excluding assets) with qualifying maximum movement must exit through their home edge by the end of Turn 10.", vp: 300, side: "DEFENDER" },
      { name: "We Were Never Here", description: "At least 75% of the Defender's starting force (by BV or PV, excluding assets) with qualifying maximum movement must exit through their home edge by the end of Turn 10.", vp: 100, side: "DEFENDER" },
    ],
    trackEnd: "After the end of any turn where at least one side has no non-crippled units in play, or after the End Phase of Turn 10.",
    salvageRule: "The Defender may not claim salvage. The Attacker claims salvage if they successfully complete the track; otherwise all salvage is returned to owners.",
    specialRules: "Played on two mapsheets (long edges touching) at Scale 1–2, four mapsheets at Scale 3+. Both sides deploy from the same edge (Attacker's home edge).",
  },
  {
    name: "Pushback",
    description: "The Attacker makes a two-pronged attack to push the Defender's lines back.",
    attackerRole: "STANDARD",
    defenderRole: "STANDARD",
    attackerSetup: "Attacker receives an additional 32 BSP in vehicle assets per Scale (AS: additional scale 1 force total) and must split their force in two. First force enters from home edge (short edge) during Turn 1 Movement Phase. Second force enters from a long edge (at least halfway up from Defender's home edge) during Turn 1 Movement Phase. May not select Minefield or Immobile BSP assets.",
    defenderSetup: "Defender sets up first anywhere at least 5 hexes (AS: 10\") away from their home edge (10 hexes/16\" at Scale 2+).",
    objectives: [
      { name: "Orders—Attacker", description: "At least half of the Attacker's surviving units (by number, including assets) cross the center line towards the Defender's home edge.", vp: 50, side: "ATTACKER" },
      { name: "Orders—Defender", description: "At least half of your surviving units (by number, excluding assets) must make an attack on an enemy unit for two consecutive turns.", vp: 50, side: "DEFENDER" },
      { name: "Push", description: "75% of the Attacker's remaining force (by BV or PV, including assets) are in the half of the map closest to the Defender's home edge at the end of turn 4.", vp: 200, side: "ATTACKER" },
      { name: "Crush", description: "Destroy/Cripple at least 33% of the opponent's starting forces (by BV or PV, excluding assets).", vp: 400, side: "ATTACKER" },
      { name: "Gutted", description: "Destroy/Cripple at least 75% of the opponent's starting forces (by BV or PV, excluding assets).", vp: 150, side: "ATTACKER" },
      { name: "Advance To The Rear", description: "At least 50% of the Defender starting forces (by BV or PV, excluding assets) retreat off their home edge between turn 6 and 10.", vp: 200, side: "DEFENDER" },
      { name: "Make Them Hurt", description: "Cripple/Destroy at least 50% of the Attacker's starting force (by BV or PV, excluding assets).", vp: 400, side: "DEFENDER" },
      { name: "Lead Them To Victory", description: "Complete the other three Defender Objectives and the commander survives.", vp: 150, side: "DEFENDER" },
    ],
    trackEnd: "After the end of any turn where at least one side has no units in play, or after turn 10 (turn 8 Alpha Strike).",
    salvageRule: "Both sides may claim salvage. All destroyed/crippled units form a single salvage pool; players alternate selecting. Track completer chooses first. If neither or both completed all objectives, no opposing salvage is claimed.",
  },
  {
    name: "Recon",
    description: "The Attacker attempts to assess the composition of the Defender's force before slipping away.",
    attackerRole: "RAIDERS",
    defenderRole: "STANDARD",
    attackerSetup: "Attacker's force enters from their home edge (any edge they choose) during Turn 1 Movement Phase. May not select Minefield or Immobile BSP assets.",
    defenderSetup: "Defender's force is set up anywhere on the battlefield. At least 50% (by number of units, including assets) must be within hexes fully within the half of the play area closest to the Attacker's home edge.",
    objectives: [
      { name: "Orders—Attacker", description: "Scan at least one Defender unit (by number, per scale, including assets).", vp: 50, side: "ATTACKER" },
      { name: "Orders—Defender", description: "At least half of your units (by number, excluding assets) must remain on the battlefield and survive (not be destroyed) the first two turns.", vp: 50, side: "DEFENDER" },
      { name: "Identify The Opposition", description: "Successfully scan at least two thirds of the Defender's starting force (measured by number of units, including assets).", vp: 100, side: "ATTACKER" },
      { name: "Preemptive Strike", description: "Destroy/Cripple at least 25% of the Defender's starting force (by BV or PV, excluding assets).", vp: 100, side: "ATTACKER" },
      { name: "Observe And Report", description: "At least 50% of the Attacker's starting force must survive and exit their home edge anytime after 4 turns (by BV or PV, including assets).", vp: 100, side: "ATTACKER" },
      { name: "Deny", description: "Any Attacker objectives not met by the end of Turn 8 are counted for the Defender instead. Defender units withdrawing from home edge prior to Turn 8 count as Scanned and Destroyed.", vp: 50, side: "DEFENDER" },
    ],
    trackEnd: "After the End Phase of Turn 8, or any turn where at least one side has no units in play.",
    salvageRule: "Neither side may claim salvage. All salvage returns to their owners.",
    specialRules: "Scanning rules apply. Use scanning rules on p. 167 of the rulebook.",
  },
  {
    name: "Retreat",
    description: "After a successful mission, the Defender attempts to slip away before the Attacker can ascertain their identities and retaliate.",
    attackerRole: "STANDARD",
    defenderRole: "STANDARD",
    attackerSetup: "Attacker enters from their home edge (short edge) during Turn 2 Movement Phase.",
    defenderSetup: "Defender enters from the ATTACKER's starting edge during Turn 1 Movement Phase.",
    objectives: [
      { name: "Orders—Attacker", description: "Successfully scan one Defender unit OR have at least half of your starting units (by number, excluding assets) on the Defender's half of the battlefield at the end of turn 4.", vp: 50, side: "ATTACKER" },
      { name: "Orders—Defender", description: "Exit at least one unit from your home edge.", vp: 50, side: "DEFENDER" },
      { name: "Identify Weaknesses", description: "Successfully scan at least two thirds of the Defender's starting force (measured by number of units, rounding up, including assets).", vp: 200, side: "ATTACKER" },
      { name: "Hammer", description: "Be the first to Destroy/Cripple at least 25% of the opponent's starting force (by BV or PV, excluding assets). If both players finish in the same phase, both score this objective.", vp: 100, side: "BOTH" },
      { name: "Gauntlet", description: "Exit at least half of the player's starting force (measured by number of units, excluding assets) through the Defender's home edge. Crippled units that escape count.", vp: 200, side: "DEFENDER" },
    ],
    trackEnd: "After the end of any turn where at least one side has no units in play, or after turn 10.",
    salvageRule: "The Defender may not claim salvage. The Attacker claims salvage if they successfully complete the track; otherwise all salvage is returned to owners.",
    specialRules: "Scanning rules apply. Played on two mapsheets (long edges touching) at Scale 1–2, four mapsheets at Scale 3+. Both sides deploy from the same edge (Attacker's home edge).",
  },
  {
    name: "Strike",
    description: "The Attacker attempts to locate a vital target building and then destroy it.",
    attackerRole: "RAIDERS",
    defenderRole: "GARRISON",
    attackerSetup: "Attacker enters at least half of their force (by number of units, including assets) from their home edge (long edge) during Turn 1 Movement Phase. Remainder enters from a short edge during Turn 2 Movement Phase. May not select Minefield or Immobile BSP assets.",
    defenderSetup: "Defender designates 4 Medium Level 2+ buildings within 3 hexes (6\") of the center of the battlefield. Secretly designate one as headquarters. Defender deploys entire force prior to Initiative anywhere on their half; at least 50% must be within 3 hexes (6\") of designated buildings.",
    objectives: [
      { name: "Orders—Attacker", description: "Successfully scan 2 buildings, or locate the headquarters building.", vp: 50, side: "ATTACKER" },
      { name: "Orders—Defender", description: "At least half of your surviving units (by number, including assets) are within 6 hexes (AS: 12\") of designated buildings at the end of turn 4.", vp: 50, side: "DEFENDER" },
      { name: "Identify And Destroy", description: "Destroy the headquarters building after it is scanned.", vp: 200, side: "ATTACKER" },
      { name: "Rough Up The Place", description: "Destroy/Cripple at least half of the opponent's starting force (by BV or PV, including assets).", vp: 100, side: "BOTH" },
      { name: "Seek And Destroy", description: "Destroy/Cripple the Attacker's Commander.", vp: 200, side: "DEFENDER" },
    ],
    trackEnd: "After the end of any turn where at least one side has no units in play, or after turn 10 (turn 8 Alpha Strike).",
    salvageRule: "Both sides may claim salvage. All destroyed/crippled units form a single salvage pool; players alternate selecting. Track completer chooses first. If neither or both completed all objectives, no opposing salvage is claimed.",
    specialRules: "Scanning rules apply. Buildings may be scanned to determine if they are the headquarters. When successfully scanned, the Defender reveals whether it is the headquarters or not. Battle armor and infantry may only scan if adjacent to or inside the building, and did not attack this turn. Buildings take 30 damage (AS: 6) before being destroyed and have a −4 target number modifier (immobile).",
  },
];

export const TRACK_NAMES = GENERAL_TRACKS.map((t) => t.name);
