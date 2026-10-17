export type City = 'Hyderabad' | 'Jaipur' | 'Goa'
export type Pace = 'balanced' | 'relaxed'
export type Action = '' | 'cheaper' | 'relaxed' | 'indoor' | 'food' | 'custom'
export interface TripInput {
  city: City; startDate: string; days: number; travellers: number; budget: number;
  interests: string[]; pace: Pace; useAI: boolean; hours: number; startHour: number;
  roomRate: number; foodRate: number; transportRate: number; activityRate: number;
  intercity: number; bufferPercent: number; rooms: number; diet: 'any'|'vegetarian'|'vegan';
  request: string; action: Action; seed: number; arrivalHour?: number;
  departureHour?: number; excludedPlaceIds?: string[];
}
export interface WeatherDay { date: string; available: boolean; high?: number; low?: number; rain?: number|null; description?: string }
export interface Weather { status: string; message: string; fetchedAt: string|null; days: WeatherDay[] }
export interface Entry {
  type: 'attraction'|'transfer'|'meal'|'free'; title: string; start: string; end: string;
  startMinutes: number; endMinutes: number; placeId?: string; area?: string; tags?: string[];
  indoor?: boolean; details: string; source?: string; mapUrl?: string; allowance?: number;
}
export interface Day { number: number; date: string; weather: WeatherDay; entries: Entry[] }
export interface Budget { items: {key: string; label: string; amount: number; calculation: string}[]; total: number; remaining: number; withinBudget: boolean; cap: number; perPerson: number }
export interface Plan {
  version: number; id: string; createdAt: string; input: TripInput; title: string; summary: string;
  ai: {mode: string; note: string; summary: string}; days: Day[]; budget: Budget;
  weather: Weather; warnings: string[]; packing: string[]; workflow: string[];
  hotelSearch: string; restaurantSearch: string; limitations: string;
}
export interface AppConfig {aiConfigured: boolean; model: string; cities: City[]; interests: string[]; today: string; weatherEnabled: boolean; heroAvailable: boolean}
export interface SavedTrip {name: string; savedAt: string; plan: Plan}
export interface DemoBooking {id: string; tripId: string; city: City; title: string; startDate: string; endDate: string; type: 'Stay'|'Transport'|'Activity'; note: string; status: 'Demo recorded'|'Cancelled'; createdAt: string}
export type Tab = 'itinerary'|'budget'|'weather'|'bookings'|'checklist'
