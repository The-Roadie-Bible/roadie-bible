import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search,
  MapPin,
  Hotel,
  Utensils,
  Martini,
  Trophy,
  Landmark,
  Globe2,
  Star,
  Plane,
  Clock,
  Users,
  Music,
  Compass
} from 'lucide-react';
import './styles.css';

const places = [
  {
    name: 'The Plaza Hotel',
    country: 'USA',
    city: 'New York',
    type: 'Hotels',
    description: 'Classic luxury hotel close to Central Park and Fifth Avenue.',
    area: 'Midtown Manhattan',
    tag: 'Iconic stay'
  },
  {
    name: "Joe's Pizza",
    country: 'USA',
    city: 'New York',
    type: 'Restaurants',
    description: 'Famous no-frills New York slice spot. Fast, cheap and reliable after a long day.',
    area: 'Greenwich Village',
    tag: 'Late-night bite'
  },
  {
    name: 'Football Factory at Legends',
    country: 'USA',
    city: 'New York',
    type: 'Places to watch sport',
    description: 'Popular bar for watching football and international sport with travelling fans.',
    area: 'Manhattan',
    tag: 'Match-day pick'
  },
  {
    name: 'Sensoji Temple',
    country: 'Japan',
    city: 'Tokyo',
    type: 'Sites to see',
    description: 'Historic temple area with food stalls, shops and classic Tokyo atmosphere.',
    area: 'Asakusa',
    tag: 'Must-see'
  },
  {
    name: 'Golden Gai',
    country: 'Japan',
    city: 'Tokyo',
    type: 'Bars',
    description: 'Tiny atmospheric bars packed into narrow alleys. Great for a memorable night out.',
    area: 'Shinjuku',
    tag: 'After-show drinks'
  },
  {
    name: 'Time Out Market',
    country: 'Portugal',
    city: 'Lisbon',
    type: 'Restaurants',
    description: 'Easy food hall option with plenty of Portuguese food choices in one place.',
    area: 'Cais do Sodré',
    tag: 'Crew-friendly'
  },
  {
    name: 'Carmo Rooftop',
    country: 'Portugal',
    city: 'Lisbon',
    type: 'Bars',
    description: 'Relaxed rooftop drinks with city views, good for winding down after travel.',
    area: 'Chiado',
    tag: 'Views'
  },
  {
    name: 'Edinburgh Castle',
    country: 'Scotland',
    city: 'Edinburgh',
    type: 'Sites to see',
    description: 'Iconic castle overlooking the city, ideal for first-time visitors with limited time.',
    area: 'Old Town',
    tag: 'Classic landmark'
  },
  {
    name: 'Jodd Fairs Night Market',
    country: 'Thailand',
    city: 'Bangkok',
    type: 'Fun things to do',
    description: 'Busy night market with food, drinks and a lively atmosphere.',
    area: 'Rama 9',
    tag: 'Night market'
  }
];

const activityTypes = [
  'All',
  'Hotels',
  'Restaurants',
  'Bars',
  'Places to watch sport',
  'Fun things to do',
  'Sites to see'
];

const featuredCities = ['Tokyo', 'Bangkok', 'Lisbon', 'New York', 'Edinburgh'];

const roadiePicks = [
  {
    title: 'Best late-night food',
    text: 'Quick places to eat when restaurants are closing and everyone is starving.',
    icon: Clock
  },
  {
    title: 'Crew-friendly spots',
    text: 'Easy places for groups, tired travellers and people carrying too many bags.',
    icon: Users
  },
  {
    title: 'Watch the match',
    text: 'Bars and venues showing football, rugby, boxing, F1 and big live sport.',
    icon: Trophy
  },
  {
    title: 'Day-off ideas',
    text: 'Sites, markets, walks and local things worth doing when you finally get time off.',
    icon: Compass
  }
];

const iconMap = {
  Hotels: Hotel,
  Restaurants: Utensils,
  Bars: Martini,
  'Places to watch sport': Trophy,
  'Fun things to do': Music,
  'Sites to see': Landmark
};

function App() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [city, setCity] = useState('All');
  const [type, setType] = useState('All');

  const countries = useMemo(() => ['All', ...new Set(places.map((p) => p.country))], []);
  const cities = useMemo(() => {
    const filtered = country === 'All' ? places : places.filter((p) => p.country === country);
    return ['All', ...new Set(filtered.map((p) => p.city))];
  }, [country]);

  const filteredPlaces = places.filter((place) => {
    const searchableText = `${place.name} ${place.country} ${place.city} ${place.type} ${place.description} ${place.area} ${place.tag}`.toLowerCase();
    return (
      searchableText.includes(search.toLowerCase()) &&
      (country === 'All' || place.country === country) &&
      (city === 'All' || place.city === city) &&
      (type === 'All' || place.type === type)
    );
  });

  return (
    <div className="site">
      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <div className="brandIcon"><Globe2 size={30} /></div>
            <div>
              <div className="brandName">The Roadie Bible</div>
              <div className="brandSub">Global travel help guide</div>
            </div>
          </div>
          <button className="lightButton">Submit a tip</button>
        </nav>

        <section className="heroGrid">
          <div>
            <div className="eyebrow"><Plane size={16} /> Built for travellers, touring crew and people who never stop moving.</div>
            <h1>Find the good stuff before you land.</h1>
            <p className="heroText">Search hotels, restaurants, bars, sports bars, sights and day-off ideas by country, city or activity type.</p>
            <div className="searchBox">
              <Search className="searchIcon" size={22} />
              <input
                placeholder="Search Tokyo bars, Lisbon food, Bangkok sport..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="picksGrid">
            {roadiePicks.map((pick) => {
              const Icon = pick.icon;
              return (
                <div className="pickCard" key={pick.title}>
                  <div className="pickIcon"><Icon size={26} /></div>
                  <h3>{pick.title}</h3>
                  <p>{pick.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      </header>

      <main className="main">
        <section className="filters">
          <select value={country} onChange={(e) => { setCountry(e.target.value); setCity('All'); }}>
            {countries.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {cities.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {activityTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </section>

        <section className="sectionHead">
          <div>
            <h2>Featured cities</h2>
            <p>Start with trusted road-tested favourites.</p>
          </div>
        </section>

        <section className="cityButtons">
          {featuredCities.map((item) => (
            <button
              key={item}
              onClick={() => {
                setCity(item);
                const found = places.find((p) => p.city === item);
                if (found) setCountry(found.country);
              }}
            >
              <MapPin size={16} /> {item}
            </button>
          ))}
        </section>

        <section className="typeButtons">
          {activityTypes.map((item) => (
            <button key={item} className={type === item ? 'active' : ''} onClick={() => setType(item)}>{item}</button>
          ))}
        </section>

        <section className="sectionHead">
          <div>
            <h2>Roadie-approved places</h2>
            <p>Showing {filteredPlaces.length} result{filteredPlaces.length === 1 ? '' : 's'}</p>
          </div>
        </section>

        <section className="cards">
          {filteredPlaces.map((place) => {
            const Icon = iconMap[place.type] || MapPin;
            return (
              <article className="placeCard" key={`${place.name}-${place.city}`}>
                <div className="cardTop">
                  <div className="cardIcon"><Icon size={26} /></div>
                  <span>{place.tag}</span>
                </div>
                <div className="cardBody">
                  <div className="cardType">{place.type}</div>
                  <h3>{place.name}</h3>
                  <p>{place.description}</p>
                  <div className="location"><MapPin size={16} /> {place.area}, {place.city}, {place.country}</div>
                </div>
              </article>
            );
          })}
        </section>

        {filteredPlaces.length === 0 && <div className="empty">No places found. Try changing your filters or search term.</div>}

        <section className="submitSection">
          <Star size={42} />
          <h2>Know a place every traveller should know?</h2>
          <p>The Roadie Bible is built on real recommendations: places that work when you are tired, hungry, lost, jet-lagged or trying to watch a match in another country.</p>
          <button>Add your recommendation</button>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
