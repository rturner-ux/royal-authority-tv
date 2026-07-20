// This is static reference data (not a secret), and needs to be usable from
// the client-side map component to color the choropleth, so no 'server-only'
// guard here.
//
// Sourced from the National Human Trafficking Hotline's published 2024
// state-by-state case statistics (humantraffickinghotline.org/en/statistics,
// operated by Polaris Project) and US Census Bureau state population
// estimates. This is real, externally published data, not derived from our
// own site's case coverage -- we don't have enough ingested trafficking
// cases to make that meaningful (see the disclaimer shown alongside this on
// the map). Update the `cases` figures when the Hotline publishes a new
// year's statistics.
export const TRAFFICKING_HOTLINE_DATA_YEAR = 2024

export const STATE_TRAFFICKING_DATA: Record<string, { cases: number; population: number }> = {
  Alabama: { cases: 105, population: 5193088 },
  Alaska: { cases: 22, population: 737270 },
  Arizona: { cases: 300, population: 7623818 },
  Arkansas: { cases: 80, population: 3114791 },
  California: { cases: 1733, population: 39355309 },
  Colorado: { cases: 185, population: 6012561 },
  Connecticut: { cases: 96, population: 3688496 },
  Delaware: { cases: 32, population: 1059952 },
  'District of Columbia': { cases: 55, population: 702250 },
  Florida: { cases: 832, population: 23462518 },
  Georgia: { cases: 342, population: 11302748 },
  Hawaii: { cases: 55, population: 1432820 },
  Idaho: { cases: 32, population: 2029733 },
  Illinois: { cases: 385, population: 12719141 },
  Indiana: { cases: 154, population: 6973333 },
  Iowa: { cases: 88, population: 3238387 },
  Kansas: { cases: 126, population: 2977220 },
  Kentucky: { cases: 139, population: 4606864 },
  Louisiana: { cases: 133, population: 4618189 },
  Maine: { cases: 41, population: 1414874 },
  Maryland: { cases: 179, population: 6265347 },
  Massachusetts: { cases: 115, population: 7154084 },
  Michigan: { cases: 340, population: 10127884 },
  Minnesota: { cases: 83, population: 5830405 },
  Mississippi: { cases: 195, population: 2954160 },
  Missouri: { cases: 272, population: 6270541 },
  Montana: { cases: 43, population: 1144694 },
  Nebraska: { cases: 71, population: 2018006 },
  Nevada: { cases: 236, population: 3282188 },
  'New Hampshire': { cases: 22, population: 1415342 },
  'New Jersey': { cases: 269, population: 9548215 },
  'New Mexico': { cases: 78, population: 2125498 },
  'New York': { cases: 570, population: 20002427 },
  'North Carolina': { cases: 301, population: 11197968 },
  'North Dakota': { cases: 21, population: 799358 },
  Ohio: { cases: 334, population: 11900510 },
  Oklahoma: { cases: 125, population: 4123288 },
  Oregon: { cases: 160, population: 4273586 },
  Pennsylvania: { cases: 287, population: 13059432 },
  'Rhode Island': { cases: 19, population: 1114521 },
  'South Carolina': { cases: 136, population: 5570274 },
  'South Dakota': { cases: 34, population: 935094 },
  Tennessee: { cases: 213, population: 7315076 },
  Texas: { cases: 1360, population: 31709821 },
  Utah: { cases: 99, population: 3538904 },
  Vermont: { cases: 15, population: 644663 },
  Virginia: { cases: 228, population: 8880107 },
  Washington: { cases: 271, population: 8001020 },
  'West Virginia': { cases: 38, population: 1766147 },
  Wisconsin: { cases: 111, population: 5972787 },
  Wyoming: { cases: 17, population: 588753 },
}

export function casesPer100k(stateName: string): number | null {
  const entry = STATE_TRAFFICKING_DATA[stateName]
  if (!entry || !entry.population) return null
  return (entry.cases / entry.population) * 100000
}
