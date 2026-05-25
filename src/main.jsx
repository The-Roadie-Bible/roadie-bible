import React, { useMemo, useState } from "react"; import { Search, MapPin, Globe2, Plane, Clock, Users, Trophy, Compass, Star, ThumbsUp, ThumbsDown, MessageCircle, Navigation, Send, ShieldCheck, Camera } from "lucide-react";

const countries = [ { country: "United Kingdom", cities: ["Aberdeen", "Glasgow", "Edinburgh", "Newcastle", "Sunderland", "Sheffield", "Leeds", "Nottingham", "Manchester", "Liverpool", "Birmingham", "Cardiff", "London"] }, { country: "France", cities: ["Paris", "Lyon"] }, { country: "Spain", cities: ["Madrid", "Barcelona"] }, { country: "Portugal", cities: ["Lisbon", "Porto"] }, { country: "Netherlands", cities: ["Amsterdam"] }, { country: "Belgium", cities: ["Brussels"] }, { country: "Luxembourg", cities: ["Luxembourg"] }, { country: "Czechia", cities: ["Prague"] }, { country: "Germany", cities: ["Berlin", "Munich", "Dusseldorf", "Cologne", "Mannheim", "Stuttgart", "Hamburg", "Frankfurt"] }, { country: "Switzerland", cities: ["Zurich"] }, { country: "Austria", cities: ["Zurich", "Salzburg"] }, { country: "Hungary", cities: ["Budapest"] }, { country: "Romania", cities: ["Bucharest"] }, { country: "Poland", cities: ["Warsaw", "Lodz", "Kraken"] }, { country: "Norway", cities: ["Oslo", "Bergen"] }, { country: "Sweden", cities: ["Stockholm", "Gottenburg"] }, { country: "Denmark", cities: ["Copenhagen"] }, { country: "Finland", cities: ["Helsinki"] }, { country: "Italy", cities: ["Milan", "Rome", "Naples"] }, { country: "Greece", cities: ["Athens"] } ];

const activityTypes = ["All", "Hidden gems", "Local culture", "Breakfast/Brunch", "Lunch", "Dinner", "Sports bars", "Open late", "Good for large groups", "Airport hotels", "Day rooms", "Golf clubs", "Padel"]; const priceRanges = ["All", "£", "££", "£££", "££££"];

const listings = [ { id: 1, name: "Example Sports Bar", country: "United Kingdom", city: "Manchester", location: "City centre", activityType: "Sports bars", description: "Example listing for watching live sport. Replace with a real recommendation.", priceRange: "££", rating: 4.5, upvotes: 0, downvotes: 0, comments: [], image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80", googleReviews: "https://www.google.com/search?q=Manchester+sports+bar+reviews", approved: true, lastVisited: "2026-01" }, { id: 2, name: "Example Late Night Food", country: "Portugal", city: "Lisbon", location: "Central Lisbon", activityType: "Open late", description: "Example listing for late-night food after travel, work or a show. Replace with a real recommendation.", priceRange: "££", rating: 4.4, upvotes: 0, downvotes: 0, comments: [], image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80", googleReviews: "https://www.google.com/search?q=Lisbon+late+night+food+reviews", approved: true, lastVisited: "2026-01" }, { id: 3, name: "Example Local Culture Spot", country: "United Kingdom", city: "Edinburgh", location: "Old Town", activityType: "Local culture", description: "Example listing for a cultural place to visit on a day off. Replace with a real recommendation.", priceRange: "££", rating: 4.6, upvotes: 0, downvotes: 0, comments: [], image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80", googleReviews: "https://www.google.com/search?q=Edinburgh+Old+Town+reviews", approved: true, lastVisited: "2026-01" } ];

export default function TheRoadieBible() { const [search, setSearch] = useState(""); const [country, setCountry] = useState("All"); const [city, setCity] = useState("All"); const [activityType, setActivityType] = useState("All"); const [priceRange, setPriceRange] = useState("All"); const [sortBy, setSortBy] = useState("Highest rated"); const [showSubmitForm, setShowSubmitForm] = useState(false); const [antiBotChecked, setAntiBotChecked] = useState(false);

const countryNames = useMemo(() => ["All", ...countries.map((item) => item.country)], []); const availableCities = useMemo(() => { if (country === "All") return ["All", ...countries.flatMap((item) => item.cities)]; const selected = countries.find((item) => item.country === country); return ["All", ...(selected ? selected.cities : [])]; }, [country]);

const filteredListings = listings .filter((listing) => { const text = ${listing.name} ${listing.country} ${listing.city} ${listing.location} ${listing.activityType} ${listing.description}.toLowerCase(); return ( listing.approved && text.includes(search.toLowerCase()) && (country === "All" || listing.country === country) && (city === "All" || listing.city === city) && (activityType === "All" || listing.activityType === activityType) && (priceRange === "All" || listing.priceRange === priceRange) ); }) .sort((a, b) => { if (sortBy === "Highest rated") return b.rating - a.rating; if (sortBy === "Most upvoted") return b.upvotes - a.upvotes; return a.name.localeCompare(b.name); });

const handleSubmit = (event) => { event.preventDefault(); if (!antiBotChecked) return alert("Please tick the anti-bot box before submitting."); alert("Recommendation submitted for approval. Once approved by you, it can appear on the site."); setShowSubmitForm(false); };

return ( <div className="min-h-screen bg-zinc-950 text-white"> <header className="relative overflow-hidden border-b border-white/10"> <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.2),_transparent_35%)]" /> <nav className="relative max-w-7xl mx-auto px-4 py-5 flex items-center justify-between"> <div className="flex items-center gap-3"> <div className="p-2 rounded-2xl bg-amber-400 text-zinc-950"><Globe2 className="w-7 h-7" /></div> <div><p className="text-2xl font-black">The Roadie Bible</p><p className="text-xs uppercase tracking-[0.25em] text-amber-300">Global travel help guide</p></div> </div> <button onClick={() => setShowSubmitForm(true)} className="rounded-full bg-white text-zinc-950 hover:bg-amber-300 px-5 py-3 font-bold">Submit a tip</button> </nav>

<section className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-amber-200 mb-6"><Plane className="w-4 h-4" /> Built for travellers, touring crew and people who never stop moving.</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">Find the good stuff before you land.</h1>
        <p className="text-lg md:text-xl text-zinc-300 max-w-xl mb-8">Search trusted places to eat, stay, drink, watch sport and spend your day off.</p>
        <div className="bg-white/10 backdrop-blur rounded-3xl border border-white/10 p-4 shadow-2xl">
          <div className="relative"><Search className="absolute left-4 top-4 w-5 h-5 text-zinc-400" /><input className="w-full bg-white text-zinc-950 rounded-2xl py-4 pl-12 pr-4 outline-none text-lg" placeholder="Search city, country, venue, activity..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[[Clock, "Open late"], [Users, "Large groups"], [Trophy, "Watch sport"], [Compass, "Hidden gems"]].map(([Icon, title]) => <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5"><div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center mb-5"><Icon className="w-6 h-6" /></div><h3 className="font-bold text-lg">{title}</h3></div>)}
      </div>
    </section>
  </header>

  <main className="max-w-7xl mx-auto px-4 py-10">
    <section className="bg-white text-zinc-950 rounded-3xl shadow-2xl p-5 md:p-6 mb-10 -mt-14 relative z-10">
      <div className="grid md:grid-cols-6 gap-4">
        <button onClick={() => alert("Near me will work once location services and a live database are connected.")} className="rounded-2xl p-4 bg-zinc-950 text-white font-bold flex items-center justify-center gap-2"><Navigation className="w-4 h-4" />Near me</button>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={country} onChange={(e) => { setCountry(e.target.value); setCity("All"); }}>{countryNames.map((item) => <option key={item}>{item}</option>)}</select>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={city} onChange={(e) => setCity(e.target.value)}>{availableCities.map((item) => <option key={item}>{item}</option>)}</select>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={activityType} onChange={(e) => setActivityType(e.target.value)}>{activityTypes.map((item) => <option key={item}>{item}</option>)}</select>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>{priceRanges.map((item) => <option key={item}>{item}</option>)}</select>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option>Highest rated</option><option>Most upvoted</option><option>A-Z</option></select>
      </div>
    </section>

    <section className="mb-8"><h2 className="text-2xl md:text-3xl font-black mb-4">Activity types</h2><div className="flex flex-wrap gap-2">{activityTypes.map((item) => <button key={item} className={activityType === item ? "rounded-full bg-amber-400 text-zinc-950 px-4 py-2 font-bold" : "rounded-full border border-white/20 text-white hover:bg-white hover:text-zinc-950 px-4 py-2"} onClick={() => setActivityType(item)}>{item}</button>)}</div></section>

    <section className="mb-4"><h2 className="text-2xl md:text-3xl font-black">Approved recommendations</h2><p className="text-zinc-400">Showing {filteredListings.length} result{filteredListings.length === 1 ? "" : "s"}</p></section>

    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredListings.map((listing) => (
        <article key={listing.id} className="rounded-3xl bg-white text-zinc-950 shadow-xl overflow-hidden">
          <div className="h-48 bg-zinc-800 relative overflow-hidden"><img src={listing.image} alt={listing.name} className="w-full h-full object-cover" /><div className="absolute top-4 right-4 rounded-full bg-zinc-950 text-white px-3 py-1 text-sm font-bold">{listing.priceRange}</div></div>
          <div className="p-5"><div className="flex items-center justify-between mb-2"><span className="text-xs font-bold uppercase tracking-wide text-amber-700">{listing.activityType}</span><span className="text-sm font-bold flex items-center gap-1"><Star className="w-4 h-4" /> {listing.rating}</span></div><h3 className="text-xl font-black mb-2">{listing.name}</h3><p className="text-zinc-600 mb-5">{listing.description}</p><div className="text-sm text-zinc-500 flex items-center gap-2 mb-4"><MapPin className="w-4 h-4" />{listing.location}, {listing.city}, {listing.country}</div><div className="grid grid-cols-3 gap-2 mb-4 text-sm"><button className="rounded-xl bg-zinc-100 px-3 py-2 flex items-center justify-center gap-1"><ThumbsUp className="w-4 h-4" /> {listing.upvotes}</button><button className="rounded-xl bg-zinc-100 px-3 py-2 flex items-center justify-center gap-1"><ThumbsDown className="w-4 h-4" /> {listing.downvotes}</button><button className="rounded-xl bg-zinc-100 px-3 py-2 flex items-center justify-center gap-1"><MessageCircle className="w-4 h-4" /> {listing.comments.length}</button></div><a href={listing.googleReviews} target="_blank" rel="noreferrer" className="block text-center rounded-xl bg-zinc-950 text-white py-3 font-bold">Google reviews</a></div>
        </article>
      ))}
    </section>
  </main>

  {showSubmitForm && (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white text-zinc-950 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <h2 className="text-3xl font-black mb-2">Submit a recommendation</h2><p className="text-zinc-600 mb-6">Submissions go to an approval queue before appearing on the site.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <select required className="border rounded-2xl p-4"><option value="">Country</option>{countries.map((item) => <option key={item.country}>{item.country}</option>)}</select>
          <input required className="border rounded-2xl p-4" placeholder="City" />
          <select required className="border rounded-2xl p-4"><option value="">Activity type</option>{activityTypes.filter((x) => x !== "All").map((item) => <option key={item}>{item}</option>)}</select>
          <select required className="border rounded-2xl p-4"><option value="">Price range</option>{priceRanges.filter((x) => x !== "All").map((item) => <option key={item}>{item}</option>)}</select>
          <input required className="border rounded-2xl p-4" placeholder="Location / area" />
          <input required type="date" className="border rounded-2xl p-4" placeholder="Last visited" />
          <label className="border rounded-2xl p-4 md:col-span-2 flex items-center gap-3"><Camera className="w-5 h-5" /> Picture upload placeholder</label>
          <textarea required className="border rounded-2xl p-4 md:col-span-2" rows="4" placeholder="Brief description" />
          <label className="md:col-span-2 flex items-center gap-3 bg-zinc-100 rounded-2xl p-4"><input type="checkbox" checked={antiBotChecked} onChange={(e) => setAntiBotChecked(e.target.checked)} /><ShieldCheck className="w-5 h-5" /> I am not a bot</label>
        </div>
        <div className="flex gap-3 mt-6"><button type="submit" className="rounded-full bg-amber-400 text-zinc-950 px-6 py-3 font-black flex items-center gap-2"><Send className="w-4 h-4" /> Submit for approval</button><button type="button" onClick={() => setShowSubmitForm(false)} className="rounded-full bg-zinc-200 px-6 py-3 font-bold">Cancel</button></div>
      </form>
    </div>
  )}
</div>

); } import React, { useMemo, useState } from "react"; import { Search, MapPin, Globe2, Plane, Clock, Users, Trophy, Compass, Star, ThumbsUp, ThumbsDown, MessageCircle, Navigation, Send, ShieldCheck, Camera } from "lucide-react";

const countries = [ { country: "United Kingdom", cities: ["Aberdeen", "Glasgow", "Edinburgh", "Newcastle", "Sunderland", "Sheffield", "Leeds", "Nottingham", "Manchester", "Liverpool", "Birmingham", "Cardiff", "London"] }, { country: "France", cities: ["Paris", "Lyon"] }, { country: "Spain", cities: ["Madrid", "Barcelona"] }, { country: "Portugal", cities: ["Lisbon", "Porto"] }, { country: "Netherlands", cities: ["Amsterdam"] }, { country: "Belgium", cities: ["Brussels"] }, { country: "Luxembourg", cities: ["Luxembourg"] }, { country: "Czechia", cities: ["Prague"] }, { country: "Germany", cities: ["Berlin", "Munich", "Dusseldorf", "Cologne", "Mannheim", "Stuttgart", "Hamburg", "Frankfurt"] }, { country: "Switzerland", cities: ["Zurich"] }, { country: "Austria", cities: ["Zurich", "Salzburg"] }, { country: "Hungary", cities: ["Budapest"] }, { country: "Romania", cities: ["Bucharest"] }, { country: "Poland", cities: ["Warsaw", "Lodz", "Kraken"] }, { country: "Norway", cities: ["Oslo", "Bergen"] }, { country: "Sweden", cities: ["Stockholm", "Gottenburg"] }, { country: "Denmark", cities: ["Copenhagen"] }, { country: "Finland", cities: ["Helsinki"] }, { country: "Italy", cities: ["Milan", "Rome", "Naples"] }, { country: "Greece", cities: ["Athens"] } ];

const activityTypes = ["All", "Hidden gems", "Local culture", "Breakfast/Brunch", "Lunch", "Dinner", "Sports bars", "Open late", "Good for large groups", "Airport hotels", "Day rooms", "Golf clubs", "Padel"]; const priceRanges = ["All", "£", "££", "£££", "££££"];

const listings = [ { id: 1, name: "Example Sports Bar", country: "United Kingdom", city: "Manchester", location: "City centre", activityType: "Sports bars", description: "Example listing for watching live sport. Replace with a real recommendation.", priceRange: "££", rating: 4.5, upvotes: 0, downvotes: 0, comments: [], image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80", googleReviews: "https://www.google.com/search?q=Manchester+sports+bar+reviews", approved: true, lastVisited: "2026-01" }, { id: 2, name: "Example Late Night Food", country: "Portugal", city: "Lisbon", location: "Central Lisbon", activityType: "Open late", description: "Example listing for late-night food after travel, work or a show. Replace with a real recommendation.", priceRange: "££", rating: 4.4, upvotes: 0, downvotes: 0, comments: [], image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80", googleReviews: "https://www.google.com/search?q=Lisbon+late+night+food+reviews", approved: true, lastVisited: "2026-01" }, { id: 3, name: "Example Local Culture Spot", country: "United Kingdom", city: "Edinburgh", location: "Old Town", activityType: "Local culture", description: "Example listing for a cultural place to visit on a day off. Replace with a real recommendation.", priceRange: "££", rating: 4.6, upvotes: 0, downvotes: 0, comments: [], image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80", googleReviews: "https://www.google.com/search?q=Edinburgh+Old+Town+reviews", approved: true, lastVisited: "2026-01" } ];

export default function TheRoadieBible() { const [search, setSearch] = useState(""); const [country, setCountry] = useState("All"); const [city, setCity] = useState("All"); const [activityType, setActivityType] = useState("All"); const [priceRange, setPriceRange] = useState("All"); const [sortBy, setSortBy] = useState("Highest rated"); const [showSubmitForm, setShowSubmitForm] = useState(false); const [antiBotChecked, setAntiBotChecked] = useState(false);

const countryNames = useMemo(() => ["All", ...countries.map((item) => item.country)], []); const availableCities = useMemo(() => { if (country === "All") return ["All", ...countries.flatMap((item) => item.cities)]; const selected = countries.find((item) => item.country === country); return ["All", ...(selected ? selected.cities : [])]; }, [country]);

const filteredListings = listings .filter((listing) => { const text = ${listing.name} ${listing.country} ${listing.city} ${listing.location} ${listing.activityType} ${listing.description}.toLowerCase(); return ( listing.approved && text.includes(search.toLowerCase()) && (country === "All" || listing.country === country) && (city === "All" || listing.city === city) && (activityType === "All" || listing.activityType === activityType) && (priceRange === "All" || listing.priceRange === priceRange) ); }) .sort((a, b) => { if (sortBy === "Highest rated") return b.rating - a.rating; if (sortBy === "Most upvoted") return b.upvotes - a.upvotes; return a.name.localeCompare(b.name); });

const handleSubmit = (event) => { event.preventDefault(); if (!antiBotChecked) return alert("Please tick the anti-bot box before submitting."); alert("Recommendation submitted for approval. Once approved by you, it can appear on the site."); setShowSubmitForm(false); };

return ( <div className="min-h-screen bg-zinc-950 text-white"> <header className="relative overflow-hidden border-b border-white/10"> <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.2),_transparent_35%)]" /> <nav className="relative max-w-7xl mx-auto px-4 py-5 flex items-center justify-between"> <div className="flex items-center gap-3"> <div className="p-2 rounded-2xl bg-amber-400 text-zinc-950"><Globe2 className="w-7 h-7" /></div> <div><p className="text-2xl font-black">The Roadie Bible</p><p className="text-xs uppercase tracking-[0.25em] text-amber-300">Global travel help guide</p></div> </div> <button onClick={() => setShowSubmitForm(true)} className="rounded-full bg-white text-zinc-950 hover:bg-amber-300 px-5 py-3 font-bold">Submit a tip</button> </nav>

<section className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-amber-200 mb-6"><Plane className="w-4 h-4" /> Built for travellers, touring crew and people who never stop moving.</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">Find the good stuff before you land.</h1>
        <p className="text-lg md:text-xl text-zinc-300 max-w-xl mb-8">Search trusted places to eat, stay, drink, watch sport and spend your day off.</p>
        <div className="bg-white/10 backdrop-blur rounded-3xl border border-white/10 p-4 shadow-2xl">
          <div className="relative"><Search className="absolute left-4 top-4 w-5 h-5 text-zinc-400" /><input className="w-full bg-white text-zinc-950 rounded-2xl py-4 pl-12 pr-4 outline-none text-lg" placeholder="Search city, country, venue, activity..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[[Clock, "Open late"], [Users, "Large groups"], [Trophy, "Watch sport"], [Compass, "Hidden gems"]].map(([Icon, title]) => <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5"><div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center mb-5"><Icon className="w-6 h-6" /></div><h3 className="font-bold text-lg">{title}</h3></div>)}
      </div>
    </section>
  </header>

  <main className="max-w-7xl mx-auto px-4 py-10">
    <section className="bg-white text-zinc-950 rounded-3xl shadow-2xl p-5 md:p-6 mb-10 -mt-14 relative z-10">
      <div className="grid md:grid-cols-6 gap-4">
        <button onClick={() => alert("Near me will work once location services and a live database are connected.")} className="rounded-2xl p-4 bg-zinc-950 text-white font-bold flex items-center justify-center gap-2"><Navigation className="w-4 h-4" />Near me</button>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={country} onChange={(e) => { setCountry(e.target.value); setCity("All"); }}>{countryNames.map((item) => <option key={item}>{item}</option>)}</select>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={city} onChange={(e) => setCity(e.target.value)}>{availableCities.map((item) => <option key={item}>{item}</option>)}</select>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={activityType} onChange={(e) => setActivityType(e.target.value)}>{activityTypes.map((item) => <option key={item}>{item}</option>)}</select>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>{priceRanges.map((item) => <option key={item}>{item}</option>)}</select>
        <select className="border rounded-2xl p-4 bg-zinc-50" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option>Highest rated</option><option>Most upvoted</option><option>A-Z</option></select>
      </div>
    </section>

    <section className="mb-8"><h2 className="text-2xl md:text-3xl font-black mb-4">Activity types</h2><div className="flex flex-wrap gap-2">{activityTypes.map((item) => <button key={item} className={activityType === item ? "rounded-full bg-amber-400 text-zinc-950 px-4 py-2 font-bold" : "rounded-full border border-white/20 text-white hover:bg-white hover:text-zinc-950 px-4 py-2"} onClick={() => setActivityType(item)}>{item}</button>)}</div></section>

    <section className="mb-4"><h2 className="text-2xl md:text-3xl font-black">Approved recommendations</h2><p className="text-zinc-400">Showing {filteredListings.length} result{filteredListings.length === 1 ? "" : "s"}</p></section>

    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredListings.map((listing) => (
        <article key={listing.id} className="rounded-3xl bg-white text-zinc-950 shadow-xl overflow-hidden">
          <div className="h-48 bg-zinc-800 relative overflow-hidden"><img src={listing.image} alt={listing.name} className="w-full h-full object-cover" /><div className="absolute top-4 right-4 rounded-full bg-zinc-950 text-white px-3 py-1 text-sm font-bold">{listing.priceRange}</div></div>
          <div className="p-5"><div className="flex items-center justify-between mb-2"><span className="text-xs font-bold uppercase tracking-wide text-amber-700">{listing.activityType}</span><span className="text-sm font-bold flex items-center gap-1"><Star className="w-4 h-4" /> {listing.rating}</span></div><h3 className="text-xl font-black mb-2">{listing.name}</h3><p className="text-zinc-600 mb-5">{listing.description}</p><div className="text-sm text-zinc-500 flex items-center gap-2 mb-4"><MapPin className="w-4 h-4" />{listing.location}, {listing.city}, {listing.country}</div><div className="grid grid-cols-3 gap-2 mb-4 text-sm"><button className="rounded-xl bg-zinc-100 px-3 py-2 flex items-center justify-center gap-1"><ThumbsUp className="w-4 h-4" /> {listing.upvotes}</button><button className="rounded-xl bg-zinc-100 px-3 py-2 flex items-center justify-center gap-1"><ThumbsDown className="w-4 h-4" /> {listing.downvotes}</button><button className="rounded-xl bg-zinc-100 px-3 py-2 flex items-center justify-center gap-1"><MessageCircle className="w-4 h-4" /> {listing.comments.length}</button></div><a href={listing.googleReviews} target="_blank" rel="noreferrer" className="block text-center rounded-xl bg-zinc-950 text-white py-3 font-bold">Google reviews</a></div>
        </article>
      ))}
    </section>
  </main>

  {showSubmitForm && (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white text-zinc-950 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <h2 className="text-3xl font-black mb-2">Submit a recommendation</h2><p className="text-zinc-600 mb-6">Submissions go to an approval queue before appearing on the site.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <select required className="border rounded-2xl p-4"><option value="">Country</option>{countries.map((item) => <option key={item.country}>{item.country}</option>)}</select>
          <input required className="border rounded-2xl p-4" placeholder="City" />
          <select required className="border rounded-2xl p-4"><option value="">Activity type</option>{activityTypes.filter((x) => x !== "All").map((item) => <option key={item}>{item}</option>)}</select>
          <select required className="border rounded-2xl p-4"><option value="">Price range</option>{priceRanges.filter((x) => x !== "All").map((item) => <option key={item}>{item}</option>)}</select>
          <input required className="border rounded-2xl p-4" placeholder="Location / area" />
          <input required type="date" className="border rounded-2xl p-4" placeholder="Last visited" />
          <label className="border rounded-2xl p-4 md:col-span-2 flex items-center gap-3"><Camera className="w-5 h-5" /> Picture upload placeholder</label>
          <textarea required className="border rounded-2xl p-4 md:col-span-2" rows="4" placeholder="Brief description" />
          <label className="md:col-span-2 flex items-center gap-3 bg-zinc-100 rounded-2xl p-4"><input type="checkbox" checked={antiBotChecked} onChange={(e) => setAntiBotChecked(e.target.checked)} /><ShieldCheck className="w-5 h-5" /> I am not a bot</label>
        </div>
        <div className="flex gap-3 mt-6"><button type="submit" className="rounded-full bg-amber-400 text-zinc-950 px-6 py-3 font-black flex items-center gap-2"><Send className="w-4 h-4" /> Submit for approval</button><button type="button" onClick={() => setShowSubmitForm(false)} className="rounded-full bg-zinc-200 px-6 py-3 font-bold">Cancel</button></div>
      </form>
    </div>
  )}
</div>

); }
