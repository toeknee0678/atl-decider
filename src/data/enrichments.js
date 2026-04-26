// src/data/enrichments.js
// Operational data layered on top of places.json:
//   - reservation: { platform, url } OR null for walk-in / unknown
//   - coords: [lat, lng] — approximate centroids for map pins
//
// Honest notes:
//   * Lat/lng are neighborhood-level approximations, accurate to within a few
//     hundred feet. For "Multiple Locations" venues, the flagship is used.
//   * Reservation platforms are best-effort based on each venue's known
//     booking presence. When unknown or walk-in, we set null so the UI
//     falls back to a "Get directions" CTA.
//
// Platform values: "resy" | "opentable" | "tock" | "tickets" | "yelp" | null

export const enrichments = {
  // ----- High-end / chef-driven -----
  "staplehouse": {
    reservation: { platform: "tock", url: "https://www.exploretock.com/staplehouse" },
    coords: [33.7556, -84.3658]
  },
  "lazy-betty": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/lazy-betty" },
    coords: [33.7676, -84.3431]
  },
  "mujo": {
    reservation: { platform: "tock", url: "https://www.exploretock.com/mujo" },
    coords: [33.7906, -84.4117]
  },
  "marcel": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/marcel" },
    coords: [33.7916, -84.4109]
  },
  "atlas": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/atlas-atlanta" },
    coords: [33.8412, -84.3793]
  },
  "umi": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/umi" },
    coords: [33.8432, -84.3781]
  },
  "talat-market": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/talat-market" },
    coords: [33.7373, -84.3866]
  },
  "little-bear": {
    reservation: { platform: "tock", url: "https://www.exploretock.com/littlebear" },
    coords: [33.7361, -84.3903]
  },
  "the-optimist": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/the-optimist" },
    coords: [33.7912, -84.4105]
  },
  "cooks-and-soldiers": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/cooks-and-soldiers" },
    coords: [33.7903, -84.4108]
  },
  "gunshow": {
    reservation: { platform: "tock", url: "https://www.exploretock.com/gunshow" },
    coords: [33.7359, -84.3517]
  },
  "spring-marietta": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/spring-marietta" },
    coords: [33.9526, -84.5499]
  },
  "watchman-seafood": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/watchmans" },
    coords: [33.7541, -84.3614]
  },
  "south-city-kitchen-midtown": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/south-city-kitchen-midtown" },
    coords: [33.7793, -84.3870]
  },
  "empire-state-south": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/empire-state-south" },
    coords: [33.7910, -84.3868]
  },

  // ----- Casual restaurants & breakfast -----
  "chai-pani": {
    reservation: { platform: "yelp", url: "https://www.yelp.com/biz/chai-pani-decatur" },
    coords: [33.7748, -84.2963]
  },
  "home-grown": {
    reservation: null,
    coords: [33.7479, -84.3522]
  },
  "ria-bluebird": {
    reservation: null,
    coords: [33.7488, -84.3722]
  },
  "buttermilk-kitchen": {
    reservation: { platform: "yelp", url: "https://www.yelp.com/biz/buttermilk-kitchen-atlanta" },
    coords: [33.8579, -84.3683]
  },
  "the-busy-bee": {
    reservation: null,
    coords: [33.7536, -84.4082]
  },
  "mary-macs": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/mary-macs-tea-room" },
    coords: [33.7724, -84.3793]
  },
  "antico-pizza": {
    reservation: null,
    coords: [33.7776, -84.4124]
  },
  "varuni-napoli": {
    reservation: { platform: "yelp", url: "https://www.yelp.com/biz/varuni-napoli-atlanta" },
    coords: [33.7889, -84.3672]
  },
  "fellini-pizza": {
    reservation: null,
    coords: [33.7977, -84.3522]
  },
  "superica": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/superica-krog-street" },
    coords: [33.7549, -84.3623]
  },
  "minero": {
    reservation: { platform: "yelp", url: "https://www.yelp.com/biz/minero-atlanta" },
    coords: [33.7557, -84.3528]
  },
  "el-valle": {
    reservation: null,
    coords: [33.8667, -84.3115]
  },
  "ponko-chicken": {
    reservation: null,
    coords: [33.8484, -84.3695]
  },
  "heirloom-market-bbq": {
    reservation: null,
    coords: [33.8714, -84.5148]
  },
  "fox-bros-bar-b-q": {
    reservation: null,
    coords: [33.7651, -84.3373]
  },

  // ----- Bars / cocktails / wine -----
  "kimball-house": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/kimball-house" },
    coords: [33.7704, -84.2962]
  },
  "ticonderoga-club": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/ticonderoga-club" },
    coords: [33.7548, -84.3617]
  },
  "sos-tiki-bar": {
    reservation: null,
    coords: [33.7714, -84.2954]
  },
  "expat": {
    reservation: { platform: "tock", url: "https://www.exploretock.com/expat-decatur" },
    coords: [33.7724, -84.2974]
  },
  "golden-eagle": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/golden-eagle" },
    coords: [33.7361, -84.3899]
  },
  "lucian-books-and-wine": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/lucian-books-and-wine" },
    coords: [33.8418, -84.3785]
  },
  "the-lawrence": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/the-lawrence" },
    coords: [33.7807, -84.3812]
  },
  "humble-pie": {
    reservation: { platform: "resy", url: "https://resy.com/cities/atl/humble-pie" },
    coords: [33.8732, -84.3389]
  },
  "argosy": {
    reservation: null,
    coords: [33.7430, -84.3404]
  },
  "porter-beer-bar": {
    reservation: null,
    coords: [33.7656, -84.3492]
  },
  "brick-store-pub": {
    reservation: null,
    coords: [33.7740, -84.2958]
  },
  "manuels-tavern": {
    reservation: null,
    coords: [33.7716, -84.3580]
  },"northern-china-eatery": {
    reservation: null,
    coords: [33.8895, -84.2964]
  },
  "gus-fried-chicken": {
    reservation: null,
    coords: [33.7546, -84.3893]
  },
  "ponce-city-market-food-hall": {
    reservation: null,
    coords: [33.7726, -84.3658]
  },

  // ----- Breweries / casual drinking -----
  "monday-night-brewing": {
    reservation: null,
    coords: [33.7868, -84.4123]
  },
  "scofflaw-brewing": {
    reservation: null,
    coords: [33.7989, -84.4253]
  },
  "wild-heaven-beer": {
    reservation: null,
    coords: [33.7359, -84.4159]
  },
  "new-realm-brewing": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/new-realm-brewing" },
    coords: [33.7727, -84.3641]
  },
  "orpheus-brewing": {
    reservation: null,
    coords: [33.7861, -84.3687]
  },
  "sceptre-brewing-arts": {
    reservation: null,
    coords: [33.7755, -84.2967]
  },
  "second-self-beer": {
    reservation: null,
    coords: [33.8019, -84.4321]
  },
  "torched-hop-brewing": {
    reservation: null,
    coords: [33.7798, -84.3795]
  },
  "biggerstaff-brewing": {
    reservation: null,
    coords: [33.7705, -84.3678]
  },
  "halfway-crooks-beer": {
    reservation: null,
    coords: [33.7361, -84.3902]
  },
  "eventide-brewing": {
    reservation: null,
    coords: [33.7364, -84.3690]
  },
  "the-iberian-pig": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/the-iberian-pig-decatur" },
    coords: [33.7741, -84.2961]
  },
  "leons-full-service": {
    reservation: { platform: "opentable", url: "https://www.opentable.com/leons-full-service" },
    coords: [33.7735, -84.2960]
  },
  "victory-sandwich-bar": {
    reservation: null,
    coords: [33.7572, -84.3548]
  },
  "the-nook-on-piedmont": {
    reservation: null,
    coords: [33.7806, -84.3829]
  },

  // ----- Activities / things to do -----
  "atlanta-beltline-eastside": {
    reservation: null,
    coords: [33.7727, -84.3661]
  },
  "piedmont-park": {
    reservation: null,
    coords: [33.7851, -84.3735]
  },
  "high-museum-of-art": {
    reservation: { platform: "tickets", url: "https://high.org/tickets/" },
    coords: [33.7900, -84.3855]
  },
  "fernbank-museum": {
    reservation: { platform: "tickets", url: "https://www.fernbankmuseum.org/visit/tickets/" },
    coords: [33.7785, -84.3179]
  },
  "atlanta-history-center": {
    reservation: { platform: "tickets", url: "https://www.atlantahistorycenter.com/tickets/" },
    coords: [33.8425, -84.3863]
  },
  "michael-c-carlos-museum": {
    reservation: { platform: "tickets", url: "https://carlos.emory.edu/visit" },
    coords: [33.7912, -84.3231]
  },
  "center-civil-human-rights": {
    reservation: { platform: "tickets", url: "https://www.civilandhumanrights.org/tickets/" },
    coords: [33.7634, -84.3938]
  },
  "georgia-aquarium": {
    reservation: { platform: "tickets", url: "https://www.georgiaaquarium.org/tickets/" },
    coords: [33.7634, -84.3951]
  },
  "world-of-coca-cola": {
    reservation: { platform: "tickets", url: "https://www.worldofcoca-cola.com/tickets/" },
    coords: [33.7625, -84.3925]
  },
  "atlanta-botanical-garden": {
    reservation: { platform: "tickets", url: "https://atlantabg.org/visit/tickets/" },
    coords: [33.7895, -84.3722]
  },
  "stone-mountain-park": {
    reservation: { platform: "tickets", url: "https://www.stonemountainpark.com/Plan/Tickets" },
    coords: [33.8053, -84.1452]
  },
  "chattahoochee-river-nra": {
    reservation: null,
    coords: [33.9248, -84.3770]
  },
  "ponce-city-market-roof": {
    reservation: { platform: "tickets", url: "https://poncecitymarket.com/skyline-park/" },
    coords: [33.7724, -84.3658]
  },
  "the-fox-theatre": {
    reservation: { platform: "tickets", url: "https://www.foxtheatre.org/events" },
    coords: [33.7723, -84.3858]
  },
  "tabernacle": {
    reservation: { platform: "tickets", url: "https://tabernacleatl.com/events/" },
    coords: [33.7596, -84.3923]
  },
  "center-for-puppetry-arts": {
    reservation: { platform: "tickets", url: "https://puppet.org/visit/" },
    coords: [33.7833, -84.3878]
  },
  "zoo-atlanta": {
    reservation: { platform: "tickets", url: "https://zooatlanta.org/tickets/" },
    coords: [33.7327, -84.3722]
  },
  "krog-street-tunnel": {
    reservation: null,
    coords: [33.7574, -84.3573]
  },
  "oakland-cemetery": {
    reservation: null,
    coords: [33.7491, -84.3717]
  },
  "westside-provisions-district": {
    reservation: null,
    coords: [33.7912, -84.4127]
  },
  "krog-street-market": {
    reservation: null,
    coords: [33.7549, -84.3623]
  },
  "buford-highway-farmers-market": {
    reservation: null,
    coords: [33.8946, -84.2853]
  },
  "plaza-theatre": {
    reservation: { platform: "tickets", url: "https://www.plazaatlanta.com/showtimes" },
    coords: [33.7716, -84.3502]
  },
  "puttshack-atlanta": {
    reservation: { platform: "tickets", url: "https://puttshack.com/venue/atlanta/" },
    coords: [33.8847, -84.4694]
  },
  "the-battery-atlanta": {
    reservation: null,
    coords: [33.8908, -84.4677]
  }
};

// Helper to merge enrichments into a venue object
export function enrich(venue) {
  const extra = enrichments[venue.id] || {};
  return {
    ...venue,
    reservation: extra.reservation ?? null,
    coords: extra.coords ?? null
  };
}

export default enrichments;

/* END OF FILE — last line above is "export default enrichments;" */
