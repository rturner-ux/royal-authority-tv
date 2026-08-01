// Static reference data, not derived from our own case coverage. Each
// corridor is a small set of waypoints along a real interstate highway
// that has been publicly identified, by federal law enforcement data or
// multiple independent news outlets, as a documented route for human
// trafficking and related serial crime. This replaces the earlier
// state-level choropleth, which was too broad to convey anything close
// to an actual "hot spot" -- an entire state colored one shade doesn't
// tell a visitor anything actionable. A highlighted highway corridor is
// still not a precise location, but it's a meaningfully more specific
// and still well-sourced claim than "this whole state."
export type TraffickingCorridor = {
  name: string
  description: string
  sourceName: string
  sourceUrl: string
  waypoints: [number, number][]
}

export const TRAFFICKING_CORRIDORS: TraffickingCorridor[] = [
  {
    name: 'I-10',
    description:
      'Running roughly 2,460 miles from Santa Monica, California to Jacksonville, Florida, I-10 has been identified in federal and state analyses as carrying more missing-children and trafficking cases than any other single US route, with one review finding nearly 40% of a national missing-children sample vanished along this corridor.',
    sourceName: 'Yahoo News / Florida AG',
    sourceUrl: 'https://www.yahoo.com/news/interstate-10-major-human-trafficking-120017681.html',
    waypoints: [
      [34.0194704, -118.4912270], // Santa Monica, CA
      [33.4484367, -112.0741410], // Phoenix, AZ
      [31.7601001, -106.4870476], // El Paso, TX
      [29.4246002, -98.4951405], // San Antonio, TX
      [29.7589382, -95.3676974], // Houston, TX
      [30.4494155, -91.1869659], // Baton Rouge, LA
      [30.6913462, -88.0437509], // Mobile, AL
      [30.4380832, -84.2809332], // Tallahassee, FL
      [30.3262247, -81.6579179], // Jacksonville, FL
    ],
  },
  {
    name: 'I-40',
    description:
      'Stretching about 2,555 miles from Barstow, California to Wilmington, North Carolina, I-40 has been flagged in FBI data and multiple regional reports as a corridor exploited for trafficking and, per the FBI\'s Highway Serial Killings Initiative, other serial violent crime tied to interstate trucking routes.',
    sourceName: 'Arkansas Radio / FBI data',
    sourceUrl: 'https://arkansasradio.com/2025/11/interstates-like-i-40-identified-as-corridors-for-serial-offenders-and-human-trafficking-fbi-data-shows/',
    waypoints: [
      [34.8986215, -117.0244313], // Barstow, CA
      [35.1987522, -111.6518220], // Flagstaff, AZ
      [35.0841034, -106.6509850], // Albuquerque, NM
      [35.2072900, -101.8371192], // Amarillo, TX
      [35.4729886, -97.5170536], // Oklahoma City, OK
      [34.7465071, -92.2896267], // Little Rock, AR
      [35.1460260, -90.0517786], // Memphis, TN
      [36.1622767, -86.7742984], // Nashville, TN
      [35.9603948, -83.9210261], // Knoxville, TN
      [36.0998131, -80.2440518], // Winston-Salem, NC
      [34.2352853, -77.9487284], // Wilmington, NC
    ],
  },
  {
    name: 'I-95',
    description:
      'The primary East Coast corridor, running from Miami, Florida to the Northeast, has been documented alongside its parallel route I-81 as a major trafficking pathway extending through the Southeast and Mid-Atlantic into the New York-Canada border region.',
    sourceName: 'Regional news reporting',
    sourceUrl: 'https://kfdm.com/news/local/human-trafficking-and-use-of-the-i-10-corridor',
    waypoints: [
      [25.7741566, -80.1935973], // Miami, FL
      [32.0790074, -81.0921335], // Savannah, GA
      [32.7884363, -79.9399309], // Charleston, SC
      [37.5385087, -77.4342800], // Richmond, VA
      [38.8950982, -77.0363849], // Washington, DC
      [39.2908816, -76.6107590], // Baltimore, MD
      [39.9527237, -75.1635262], // Philadelphia, PA
      [40.7127281, -74.0060152], // New York, NY
      [42.3588336, -71.0578303], // Boston, MA
    ],
  },
]
