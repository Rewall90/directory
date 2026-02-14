/**
 * Course data types for JSON file-based storage
 *
 * Schema version: 2.0 (Feb 2026)
 * - Added Booking interface for booking actions
 * - Enhanced Visitors with handicap/dressCode
 * - Enhanced Pricing with more price tiers
 * - Enhanced MembershipTier with proper structure
 * - Added MembershipStatus for waitlist info
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

/**
 * Booking information for visitors
 * Enables "Book Now" actions on the course page
 */
export interface Booking {
  /** Dedicated booking email (e.g., booking@klubb.no) */
  email: string | null;
  /** Dedicated booking phone */
  phone: string | null;
  /** Direct booking URL if available */
  url: string | null;
  /** Whether the club uses GolfBox for bookings */
  golfboxEnabled: boolean;
  /** How many days in advance guests can book */
  windowDays: number | null;
  /** Extra fee for booking more than windowDays in advance */
  advanceBookingFee: number | null;
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
  /** Maximum handicap allowed (null = no requirement) */
  handicapRequired: number | null;
  /** Dress code requirements (e.g., "Golfklær påkrevd") */
  dressCode: string | null;
  /** Typical round duration in minutes */
  roundTimeMinutes: number | null;
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
  /** Standard 18-hole greenfee (preferred over greenFeeWeekday) */
  greenFee18: number | null;
  /** 9-hole greenfee if offered */
  greenFee9: number | null;
  /** @deprecated Use greenFee18 instead */
  greenFeeDaily: number | null;
  /** @deprecated Use greenFee18 instead */
  greenFeeWeekday: number | null;
  /** Weekend/holiday surcharge if different from standard */
  greenFeeWeekend: number | null;
  greenFeeSenior: number | null;
  greenFeeJunior: number | null;
  /** Student/military discount price */
  greenFeeStudent: number | null;
  /** Price when a member brings a guest */
  greenFeeMemberGuest: number | null;
  /** Twilight/evening price */
  greenFeeTwilight: number | null;
  /** When twilight pricing starts (e.g., "15:00") */
  twilightStartTime: string | null;
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
  /** Internal category key (e.g., "voksen", "junior", "ung_voksen") */
  category: string;
  /** Display name (e.g., "Voksen 31-99 år") */
  name: string | null;
  /** Full annual membership price (NOT just club dues) */
  price: number;
  /** Separate club dues/kontingent if applicable */
  clubDues: number | null;
  /** Total annual cost (price + clubDues) */
  totalAnnual: number | null;
  description: string | null;
  /** Age range as string (e.g., "20-30") */
  ageRange: string | null;
  /** Minimum age for this tier */
  ageMin: number | null;
  /** Maximum age for this tier */
  ageMax: number | null;
  /** Any restrictions (e.g., "Kun hverdager", "Maks 3 runder/uke") */
  restrictions: string | null;
}

/**
 * Membership availability and waitlist status
 */
export interface MembershipStatus {
  /** Whether the club is currently accepting new members */
  accepting: boolean | null;
  /** Current membership status */
  status: "open" | "waitlist" | "closed" | null;
  /** Number of people on waiting list */
  waitingListSize: number | null;
  /** Estimated wait time in years */
  waitingListYears: number | null;
  /** One-time joining fee (innmeldingsavgift) */
  joiningFee: number | null;
  /** Note about joining fee */
  joiningFeeNote: string | null;
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

/**
 * Photo from Google Places API (runtime only, not persisted)
 */
export interface PlacePhoto {
  /** Temporary URL from Google (expires after ~1 hour) */
  url: string;
  /** Attribution HTML required by Google ToS */
  attributionHtml: string;
  /** Photo width in pixels */
  width: number;
  /** Photo height in pixels */
  height: number;
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
  /** Google Place ID for fetching photos (optional) */
  googlePlaceId?: string;
  course: CourseDetails;
  description: string | null;
  contact: Contact;
  phoneNumbers: PhoneNumber[];
  /** Booking information for visitors (NEW in v2.0) */
  booking: Booking | null;
  season: Season;
  visitors: Visitors;
  organization: Organization;
  facilities: Facilities | null;
  pricing: Record<string, Pricing>;
  membershipPricing: Record<string, MembershipTier[]>;
  /** Membership availability and waitlist info (NEW in v2.0) */
  membershipStatus: MembershipStatus | null;
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
  /** Standard 18-hole greenfee for quick price comparison */
  greenFee18: number | null;
  /** Whether booking info is available (email, phone, or URL) */
  bookingAvailable: boolean;
}

/**
 * Region with course count for homepage
 */
export interface RegionWithCount {
  name: string;
  slug: string;
  count: number;
}
