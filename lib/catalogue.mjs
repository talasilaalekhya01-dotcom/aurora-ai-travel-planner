/**
 * Small educational catalogue. Names are grounded in official tourism sources.
 * Regions, tags and visit durations are our planning heuristics, not route data.
 * There are deliberately NO invented live prices, ratings or opening hours.
 * Source pages were consulted on 2026-10-16. Verify venue rules before travel.
 */
const hyderabadSource = 'https://hyderabad.telangana.gov.in/tourist-places/';
const jaipurSource = 'https://www.tourism.rajasthan.gov.in/jaipur.html';
const miramarSource = 'https://goa-tourism.com/guide/miramar-beach/';
const basilicaSource = 'https://www.incredibleindia.gov.in/en/goa/goa/basilica-of-bom-jesus';
function place(id, name, area, tags, minutes = 90, indoor = false, source = '', note = '') {
  return { id, name, area, tags, minutes, indoor, source, note, hoursVerified: false };
}
export const catalogue = {
  Hyderabad: {
    latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata',
    places: [
      place('hyd-charminar', 'Charminar', 'Old City', ['history','architecture'], 75),
      place('hyd-palace', 'Chowmahalla Palace', 'Old City', ['history','architecture'], 105),
      place('hyd-salar', 'Salar Jung Museum', 'Old City', ['museums','culture'], 120, true),
      place('hyd-paigah', 'Paigah Tombs', 'Old City', ['history','architecture'], 75),
      place('hyd-golconda', 'Golconda Fort', 'Golconda', ['history','architecture'], 120),
      place('hyd-tombs', 'Qutb Shahi Tombs', 'Golconda', ['history','architecture'], 90),
      place('hyd-lake', 'Hussain Sagar Lake', 'Lake district', ['nature','culture'], 60, false, '', 'Lakeside visit; no boat trip or water activity is included.'),
      place('hyd-ntr', 'NTR Gardens', 'Lake district', ['nature'], 75),
      place('hyd-birla', 'Birla Mandir', 'Lake district', ['architecture','culture'], 60),
      place('hyd-zoo', 'Nehru Zoological Park', 'South Hyderabad', ['nature'], 150)
    ].map(p => ({ ...p, source: p.source || hyderabadSource }))
  },
  Jaipur: {
    latitude: 26.9124, longitude: 75.7873, timezone: 'Asia/Kolkata',
    places: [
      place('jai-hawa', 'Hawa Mahal', 'Old Jaipur', ['history','architecture'], 75),
      place('jai-palace', 'City Palace Jaipur', 'Old Jaipur', ['history','culture'], 105),
      place('jai-jantar', 'Jantar Mantar Jaipur', 'Old Jaipur', ['history','architecture'], 90),
      place('jai-albert', 'Albert Hall Museum', 'Central Jaipur', ['museums','culture'], 105, true),
      place('jai-amber', 'Amber Fort', 'Amber', ['history','architecture'], 120),
      place('jai-jaigarh', 'Jaigarh Fort', 'Amber', ['history','architecture'], 120),
      place('jai-nahargarh', 'Nahargarh Fort', 'Northern hills', ['history','nature'], 105),
      place('jai-jal', 'Jal Mahal lakeside viewpoint', 'Amber route', ['nature','architecture'], 60, false, '', 'Exterior/lakeside viewing only; the plan does not promise palace admission.'),
      place('jai-galtaji', 'Galtaji', 'Eastern Jaipur', ['culture','architecture'], 90),
      place('jai-garden', 'Sisodia Rani Garden', 'Eastern Jaipur', ['nature','architecture'], 75)
    ].map(p => ({ ...p, source: jaipurSource }))
  },
  Goa: {
    latitude: 15.4909, longitude: 73.8278, timezone: 'Asia/Kolkata',
    places: [
      place('goa-miramar', 'Miramar Beach', 'Panaji', ['nature'], 75, false, miramarSource, 'Shore visit only. No swimming, boat trip or water-sports booking is included.'),
      place('goa-campal', 'Campal Gardens', 'Panaji', ['nature'], 60, false, miramarSource),
      place('goa-science', 'Goa Science Centre', 'Panaji', ['museums'], 105, true, miramarSource),
      place('goa-kala', 'Kala Academy riverside area', 'Panaji', ['culture','architecture'], 60, false, miramarSource, 'Outdoor area suggestion; no performance, event or interior access is promised.'),
      place('goa-state', 'Goa State Museum', 'Panaji', ['museums','history'], 90, true, 'https://museum.goa.gov.in/', 'Check the official weekday opening sessions before visiting.'),
      place('goa-basilica', 'Basilica of Bom Jesus', 'Old Goa', ['history','architecture','culture'], 75, true, basilicaSource, 'Check visitor access around religious services.'),
      place('goa-se', 'Se Cathedral', 'Old Goa', ['history','architecture'], 75, true, basilicaSource, 'Check visitor access around religious services.'),
      place('goa-assisi', 'Church of St. Francis of Assisi', 'Old Goa', ['history','architecture'], 75, true, basilicaSource),
      place('goa-archaeology', 'Archaeological Museum, Old Goa', 'Old Goa', ['museums','history'], 90, true, basilicaSource),
      place('goa-aguada', 'Fort Aguada', 'Candolim', ['history','nature'], 105, false, 'https://goa-tourism.com/fort/fort-aguada/')
    ]
  }
};
export const interests = ['history','architecture','culture','nature','museums','food'];
export const cityNames = Object.keys(catalogue);
