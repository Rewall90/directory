/**
 * Course data types for JSON file-based storage
 */

export interface Address {
  street: string;
  postalCode: string;
  area: string | null;
}

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy: string | null;
}

export interface CourseDetails {
  holes: number;
  holesPlayed: number;
  par: number | null;
  parPerRound: number | null;
  lengthMeters: number | null;
  lengthYards: number | null;
  lengthNote: string | null;
  terrain: string | null;
  courseType: string | null;
  designer: string | null;
  yearBuilt: number | null;
  yearRedesigned: number | null;
  waterHazards: boolean | null;
  signatureHole: string | null;
  scenicHole: string | null;
  par3Count: number | null;
  par4Count: number | null;
  par5Count: number | null;
  mountainViews: boolean | null;
  viewDescription: string | null;
}

export interface Contact {
  phone: string | null;
  email: string | null;
  emailAlt: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  golfbox: boolean | null;
}

export interface PhoneNumber {
  number: string;
  type: string | null;
  primary: boolean;
}

export interface Season {
  start: string | null;
  end: string | null;
  winterUse: string | null;
}

export interface Visitors {
  welcome: boolean | null;
  walkingAllowed: boolean | null;
  nearbyCity: string | null;
  distanceFromCenter: string | null;
}

export interface Organization {
  courseCompany: string | null;
  clubOrganization: string | null;
}

export interface Facilities {
  drivingRange: boolean | null;
  drivingRangeLength: number | null;
  drivingRangeNotes: string | null;
  puttingGreen: boolean | null;
  chippingArea: boolean | null;
  practiceBunker: boolean | null;
  clubhouse: boolean | null;
  clubhouseName: string | null;
  proShop: boolean | null;
  restaurant: boolean | null;
  restaurantName: string | null;
  clubRental: boolean | null;
  clubRentalNotes: string | null;
  cartRental: boolean | null;
  pullCartRental: boolean | null;
  golfLessons: boolean | null;
  teachingPro: boolean | null;
  clubFitting: boolean | null;
  lockerRooms: boolean | null;
  showers: boolean | null;
  lockerRental: boolean | null;
  conferenceRoom: boolean | null;
  eventVenue: boolean | null;
  eventCapacity: number | null;
  simulator: boolean | null;
  simulatorType: string | null;
  simulatorCourses: string | null;
  simulatorNotes: string | null;
  bunkers: number | null;
  footgolf: boolean | null;
  footgolfHoles: number | null;
  footgolfPar: number | null;
  tennis: boolean | null;
  tennisCourts: number | null;
  discGolf: boolean | null;
  discGolfStandard: string | null;
}

export interface Pricing {
  currency: string;
  greenFeeDaily: number | null;
  greenFeeWeekday: number | null;
  greenFeeWeekend: number | null;
  greenFeeSenior: number | null;
  greenFeeJunior: number | null;
  greenFeeDescription: string | null;
  cartRental: number | null;
  pullCartRental: number | null;
  clubRental: number | null;
  specialOfferPrice: number | null;
  specialOfferIncludes: string | null;
  freeTrial: boolean | null;
  notes: string | null;
}

export interface MembershipTier {
  category: string;
  price: number;
  description: string | null;
  ageRange: string | null;
}

export interface Rating {
  rating: number | null;
  reviewCount: number | null;
  maxRating: number | null;
  url: string | null;
  likes: number | null;
  checkIns: number | null;
}

export interface CourseRating {
  teeColor: string;
  teeNumber: number | null;
  gender: string;
  courseRating: number | null;
  slopeRating: number | null;
  lengthYards: number | null;
  lengthMeters: number | null;
  par: number | null;
}

export interface NearbyCourse {
  slug: string;
  distanceKm: number | null;
}

export interface AdditionalFeature {
  feature: string;
  description: string | null;
}

export interface Sponsor {
  name: string;
  logo: string | null;
  website: string | null;
  holeNumber: number | null;
}

export interface Source {
  type: string;
  url: string | null;
  dataObtained: string[];
  pagesScraped: number | null;
  scrapedAt: string | null;
}

export interface Meta {
  dataQuality: string | null;
  websiteQuality: string | null;
  completenessPercentage: number | null;
  pagesScraped: number | null;
  scrapedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Course {
  slug: string;
  name: string;
  formerName: string | null;
  region: string;
  city: string;
  municipality: string;
  country: string;
  address: Address;
  coordinates: Coordinates | null;
  course: CourseDetails;
  description: string | null;
  contact: Contact;
  phoneNumbers: PhoneNumber[];
  season: Season;
  visitors: Visitors;
  organization: Organization;
  facilities: Facilities | null;
  pricing: Record<string, Pricing>;
  membershipPricing: Record<string, MembershipTier[]>;
  ratings: Record<string, Rating>;
  courseRatings: CourseRating[];
  nearbyCourses: NearbyCourse[];
  additionalFeatures: AdditionalFeature[];
  sponsors: Sponsor[];
  sources: Source[];
  meta: Meta;
}

/**
 * Lightweight course data for listings and search results
 */
export interface CourseSummary {
  slug: string;
  name: string;
  region: string;
  city: string;
  holes: number;
  par: number | null;
  coordinates: Coordinates | null;
  ratings: Record<string, Rating>;
}

/**
 * Region with course count for homepage
 */
export interface RegionWithCount {
  name: string;
  slug: string;
  count: number;
}
