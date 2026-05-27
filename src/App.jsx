import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const COUNTRIES = [
  "Albania","Andorra","Austria","Belarus","Belgium","Bosnia and Herzegovina","Bulgaria",
  "Croatia","Cyprus","Czechia","Denmark","Estonia","Finland","France","Germany","Greece",
  "Hungary","Iceland","Ireland","Italy","Kosovo","Latvia","Liechtenstein","Lithuania",
  "Luxembourg","Malta","Moldova","Monaco","Montenegro","Netherlands","North Macedonia",
  "Norway","Poland","Portugal","Romania","San Marino","Serbia","Slovakia","Slovenia",
  "Spain","Sweden","Switzerland","Ukraine","United Kingdom","Vatican City"
];

const ACTIVITY_TYPES = [
  "Hidden gems",
  "Local culture",
  "Breakfast/Brunch",
  "Lunch",
  "Dinner",
  "Sports bars",
  "Open late",
  "Good for large groups",
  "Airport hotels",
  "Day rooms",
  "Golf clubs",
  "Padel",
  "Coffee",
  "Laundrette",
  "Climbing / Bouldering"
];

const emptyForm = {
  place_name: "",
  country: "",
  city: "",
  maps_link: "",
  description: "",
  activity_types: [],
  price_range: "£",
  image_file: null,
  visit_date: "",
};

export default function App() {
  const isAdmin =
    window.location.pathname === "/admin" ||
    window.location.search.includes("admin");

  const [listings, setListings] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [session, setSession] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [reportDrafts, setReportDrafts] = useState({});

  useEffect(() => {
    fetchListings();
    fetchComments();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session && isAdmin) fetchPendingListings();
    });
  }, []);

  async function fetchListings() {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    setListings(data || []);
  }

  async function fetchPendingListings() {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .or("approved.is.false,approved.is.null")
      .order("created_at", { ascending: false });

    setPendingListings(data || []);
  }

  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });

    setComments(data || []);
  }

  function toggleActivity(activity) {
    setForm((current) => ({
      ...current,
      activity_types: current.activity_types.includes(activity)
        ? current.activity_types.filter((a) => a !== activity)
        : [...current.activity_types, activity],
    }));
  }

  function toggleEditActivity(activity) {
    setEditForm((current) => ({
      ...current,
      activity_types: current.activity_types.includes(activity)
        ? current.activity_types.filter((a) => a !== activity)
        : [...current.activity_types, activity],
    }));
  }

  async function compressImage(file, maxWidth = 1400, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const scale = Math.min(maxWidth / img.width, 1);
      const canvas = document.createElement("canvas");

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Image compression failed"));

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, ".jpg"),
            { type: "image/jpeg" }
          );

          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = reject;
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

async function uploadImage(file) {
  const compressedFile = await compressImage(file);

  const fileName = `${Date.now()}-${compressedFile.name}`;

  const { error } = await supabase.storage
    .from("listing-images")
    .upload(fileName, compressedFile);

  if (error) {
    alert("Image upload error: " + error.message);
    return "";
  }

  const { data } = supabase.storage
    .from("listing-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

  async function submitRecommendation(e) {
    e.preventDefault();

    if (!form.image_file) return alert("Please upload an image.");
    if (!form.activity_types.length) return alert("Please choose at least one activity type.");

    const imageUrl = await uploadImage(form.image_file);
    if (!imageUrl) return;

    const { error } = await supabase.from("listings").insert([
      {
        place_name: form.place_name,
        country: form.country,
        city: form.city,
        maps_link: form.maps_link,
        google_maps: form.maps_link,
        description: form.description,
        activity_types: form.activity_types,
        price_range: form.price_range,
        image_url: imageUrl,
        visit_date: form.visit_date,
        approved: false,
        upvotes: 0,
        downvotes: 0,
      },
    ]);

    if (error) return alert("Error submitting tip: " + error.message);

    try {
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          place_name: form.place_name,
          city: form.city,
          country: form.country,
          description: form.description,
        }),
      });

      const emailData = await emailResponse.json();
      console.log("Email response:", emailData);

    } catch (emailError) {
      console.error("Email failed:", emailError);
      alert("Email failed, but tip was submitted.");
    }

    alert("Tip submitted for approval!");

    setForm(emptyForm);
    e.target.reset();
  }

  async function adminLogin(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) return alert(error.message);

    setSession(data.session);
    fetchPendingListings();
  }

  async function approveListing(id) {
    await supabase.from("listings").update({ approved: true }).eq("id", id);
    fetchPendingListings();
    fetchListings();
  }

  async function deleteListing(id) {
    if (!confirm("Delete this listing?")) return;

    await supabase.from("listings").delete().eq("id", id);
    fetchPendingListings();
    fetchListings();
  }

  function startEdit(listing) {
    setEditingId(listing.id);
    setEditForm({
      place_name: listing.place_name || "",
      country: listing.country || "",
      city: listing.city || "",
      maps_link: listing.maps_link || listing.google_maps || "",
      description: listing.description || "",
      price_range: listing.price_range || "£",
      visit_date: listing.visit_date || "",
      activity_types: listing.activity_types || [],
    });
  }

  async function saveEdit(id) {
    const { error } = await supabase
      .from("listings")
      .update({
        ...editForm,
        google_maps: editForm.maps_link,
      })
      .eq("id", id);

    if (error) return alert(error.message);

    setEditingId(null);
    setEditForm(null);
    fetchPendingListings();
    fetchListings();
  }

  async function vote(listing, direction) {
    const voteKey = `roadie-vote-${listing.id}`;
    const previousVote = localStorage.getItem(voteKey);

    let newUpvotes = listing.upvotes || 0;
    let newDownvotes = listing.downvotes || 0;

    if (previousVote === direction) {
      if (direction === "up") newUpvotes = Math.max(0, newUpvotes - 1);
      if (direction === "down") newDownvotes = Math.max(0, newDownvotes - 1);
      localStorage.removeItem(voteKey);
    } else if (previousVote === "up" && direction === "down") {
      newUpvotes = Math.max(0, newUpvotes - 1);
      newDownvotes += 1;
      localStorage.setItem(voteKey, "down");
    } else if (previousVote === "down" && direction === "up") {
      newDownvotes = Math.max(0, newDownvotes - 1);
      newUpvotes += 1;
      localStorage.setItem(voteKey, "up");
    } else {
      if (direction === "up") newUpvotes += 1;
      if (direction === "down") newDownvotes += 1;
      localStorage.setItem(voteKey, direction);
    }

    const { error } = await supabase
      .from("listings")
      .update({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      })
      .eq("id", listing.id);

    if (error) return alert("Vote error: " + error.message);

    fetchListings();
  }

  async function addComment(listingId) {
    const draft = commentDrafts[listingId] || {};
    if (!draft.name || !draft.comment) return alert("Please add your name and comment.");

    const { error } = await supabase.from("comments").insert([
      {
        listing_id: listingId,
        name: draft.name,
        comment: draft.comment,
      },
    ]);

    if (error) return alert(error.message);

    setCommentDrafts((current) => ({
      ...current,
      [listingId]: { name: "", comment: "" },
    }));

    fetchComments();
  }

  async function reportListing(listingId) {
    const reason = reportDrafts[listingId];
    if (!reason) return alert("Please add a reason for the report.");

    const { error } = await supabase.from("reports").insert([
      {
        listing_id: listingId,
        reason,
      },
    ]);

    if (error) return alert(error.message);

    alert("Report submitted. Thank you.");
    setReportDrafts((current) => ({ ...current, [listingId]: "" }));
  }

  const cities = useMemo(() => {
    return [...new Set(listings.map((l) => l.city).filter(Boolean))].sort();
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const text = `${listing.place_name} ${listing.city} ${listing.country} ${listing.description}`.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (!countryFilter || listing.country === countryFilter) &&
        (!cityFilter || listing.city === cityFilter) &&
        (!activityFilter || listing.activity_types?.includes(activityFilter)) &&
        (!priceFilter || listing.price_range === priceFilter)
      );
    });
  }, [listings, search, countryFilter, cityFilter, activityFilter, priceFilter]);

  const recentlyAdded = useMemo(() => filteredListings.slice(0, 3), [filteredListings]);

  const topRatedInCity = useMemo(() => {
    const targetCity = cityFilter || filteredListings[0]?.city;
    if (!targetCity) return [];

    return filteredListings
      .filter((listing) => listing.city === targetCity)
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 3);
  }, [filteredListings, cityFilter]);

  function listingComments(listingId) {
    return comments.filter((comment) => comment.listing_id === listingId);
  }

  function ListingCard({ listing }) {
    return (
      <article className="bg-white text-zinc-950 rounded-3xl overflow-hidden shadow-xl">
        {listing.image_url && (
          <img
            src={listing.image_url}
            alt={listing.place_name}
            className="w-full h-52 sm:h-56 object-cover"
          />
        )}

        <div className="p-5">
          <h3 className="text-2xl font-black mb-1">{listing.place_name}</h3>
          <p className="text-zinc-600 mb-3">{listing.city}, {listing.country}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {listing.activity_types?.map((activity) => (
              <span
                key={activity}
                className="bg-amber-400 text-black rounded-full px-3 py-1 text-sm font-bold"
              >
                {activity}
              </span>
            ))}
          </div>

          <p className="mb-4">{listing.description}</p>

          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="font-black text-lg">{listing.price_range}</span>

            <a
              href={listing.maps_link || listing.google_maps}
              target="_blank"
              rel="noreferrer"
              className="bg-zinc-950 text-white rounded-xl px-4 py-2 font-bold text-sm"
            >
              Google Maps
            </a>
          </div>

          <div className="flex gap-2 mb-5">
            <button
              onClick={() => vote(listing, "up")}
              className="bg-zinc-100 rounded-xl px-4 py-2 font-bold"
            >
              👍 {listing.upvotes || 0}
            </button>

            <button
              onClick={() => vote(listing, "down")}
              className="bg-zinc-100 rounded-xl px-4 py-2 font-bold"
            >
              👎 {listing.downvotes || 0}
            </button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-black mb-3">Comments</h4>

            {listingComments(listing.id).map((comment) => (
              <div key={comment.id} className="bg-zinc-100 rounded-xl p-3 mb-2">
                <strong>{comment.name}</strong>
                <p>{comment.comment}</p>
              </div>
            ))}

            <input
              className="border rounded-xl p-3 w-full mb-2"
              placeholder="Your name"
              value={commentDrafts[listing.id]?.name || ""}
              onChange={(e) =>
                setCommentDrafts({
                  ...commentDrafts,
                  [listing.id]: {
                    ...commentDrafts[listing.id],
                    name: e.target.value,
                  },
                })
              }
            />

            <textarea
              className="border rounded-xl p-3 w-full mb-2"
              placeholder="Add a comment"
              value={commentDrafts[listing.id]?.comment || ""}
              onChange={(e) =>
                setCommentDrafts({
                  ...commentDrafts,
                  [listing.id]: {
                    ...commentDrafts[listing.id],
                    comment: e.target.value,
                  },
                })
              }
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => addComment(listing.id)}
                className="bg-amber-400 text-black rounded-xl px-4 py-2 font-black"
              >
                Post Comment
              </button>

              <button
                onClick={() =>
                  setReportDrafts({
                    ...reportDrafts,
                    [listing.id]:
                      reportDrafts[listing.id] === undefined ? "" : undefined,
                  })
                }
                className="bg-zinc-200 text-black rounded-xl px-4 py-2 font-black"
              >
                Report
              </button>
            </div>

            {reportDrafts[listing.id] !== undefined && (
              <div className="mt-3">
                <textarea
                  className="border rounded-xl p-3 w-full mb-2"
                  placeholder="Why are you reporting this listing?"
                  value={reportDrafts[listing.id] || ""}
                  onChange={(e) =>
                    setReportDrafts({
                      ...reportDrafts,
                      [listing.id]: e.target.value,
                    })
                  }
                />

                <button
                  onClick={() => reportListing(listing.id)}
                  className="bg-red-600 text-white rounded-xl px-4 py-2 font-black"
                >
                  Send Report
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  function AdminList({ items, live = false }) {
    if (!items.length) return <p className="text-zinc-400">No listings here.</p>;

    return (
      <div className="grid gap-5">
        {items.map((listing) => (
          <div key={listing.id} className="bg-zinc-800 rounded-2xl p-5">
            {editingId === listing.id ? (
              <div className="grid gap-3">
                <input
                  className="p-3 rounded text-black"
                  value={editForm.place_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, place_name: e.target.value })
                  }
                />

                <input
                  className="p-3 rounded text-black"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm({ ...editForm, city: e.target.value })
                  }
                />

                <input
                  className="p-3 rounded text-black"
                  value={editForm.maps_link}
                  onChange={(e) =>
                    setEditForm({ ...editForm, maps_link: e.target.value })
                  }
                />

                <textarea
                  className="p-3 rounded text-black"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />

                <div className="bg-zinc-700 rounded-xl p-3">
                  {ACTIVITY_TYPES.map((activity) => (
                    <label key={activity} className="flex gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.activity_types.includes(activity)}
                        onChange={() => toggleEditActivity(activity)}
                      />
                      {activity}
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => saveEdit(listing.id)}
                  className="bg-green-600 rounded-xl px-4 py-2 font-bold"
                >
                  Save Edit
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black">{listing.place_name}</h3>
                <p>{listing.city}, {listing.country}</p>
                <p>{listing.description}</p>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => startEdit(listing)}
                    className="bg-blue-600 rounded-xl px-4 py-2 font-bold"
                  >
                    Edit
                  </button>

                  {!live && (
                    <button
                      onClick={() => approveListing(listing.id)}
                      className="bg-green-600 rounded-xl px-4 py-2 font-bold"
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => deleteListing(listing.id)}
                    className="bg-red-600 rounded-xl px-4 py-2 font-bold"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_35%)]" />

        <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-white/10 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <a
  href="/"
  className="flex items-center gap-3 text-amber-300"
>
  <img
    src="/roadie-bible-logo.jpg"
    alt="Roadie Bible"
    className="w-14 h-14 object-contain"
  />

  <span className="text-2xl font-black tracking-tight">
    The Roadie Bible
  </span>
</a>

          <div className="flex flex-wrap gap-4 text-sm md:text-base font-bold">
            <a href="#about" className="hover:text-amber-300">About</a>
            <a href="#submit" className="hover:text-amber-300">Add a Recommendation</a>
            <a href="#contact" className="hover:text-amber-300">Contact</a>
          </div>
        </nav>
                <section className="bg-white text-black rounded-3xl p-4 md:p-5 shadow-2xl -mt-12 md:-mt-16 relative z-10 mb-10 md:mb-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              className="border rounded-2xl p-4 sm:col-span-2 lg:col-span-1"
              placeholder="Search city, venue or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border rounded-2xl p-4"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="">All countries</option>
              {COUNTRIES.map((country) => (
                <option key={country}>{country}</option>
              ))}
            </select>

            <select
              className="border rounded-2xl p-4"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>

            <select
              className="border rounded-2xl p-4"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <option value="">All activities</option>
              {ACTIVITY_TYPES.map((activity) => (
                <option key={activity}>{activity}</option>
              ))}
            </select>

            <select
              className="border rounded-2xl p-4"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="">All prices</option>
              <option>£</option>
              <option>££</option>
              <option>£££</option>
            </select>
          </div>
        </section>

        <div className="relative max-w-7xl mx-auto px-4 pt-64 pb-12 md:pt-56 md:pb-24">
          <p className="text-amber-300 uppercase tracking-[0.25em] text-xs sm:text-sm font-bold mb-4">
            Global travel help guide
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-none mb-6">
            If we've never been it's probably not worth going.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl">
            Hotels, food, sport, hidden gems and road-tested places for touring crew and global travellers.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-10">

        <section id="about" className="my-10 md:my-12 bg-white/10 border border-white/10 rounded-3xl p-5 md:p-6">
          <h2 className="text-2xl md:text-3xl font-black mb-4">About The Roadie Bible</h2>

          <p className="text-base md:text-lg text-zinc-200 leading-relaxed">
            If you're looking for a Wetherspoon or Starbucks, Google might be your best bet.
            If you want peer reviewed hangouts and things to do around the globe, that have
            been tried and tested by the people who spend the longest on the road, then dive
            in and search away. Add your own suggestions and up/down vote existing listings
            to help the rest of the community find the best places around.
          </p>
        </section>

        {recentlyAdded.length > 0 && (
          <>
            <h2 className="text-2xl md:text-3xl font-black mb-6">Recently Added</h2>
            {viewMode === "list" ? (
  <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
    {filteredListings.map((listing) => (
      <ListingCard key={listing.id} listing={listing} />
    ))}
  </section>
) : (
  <section className="grid gap-4 mb-16">
    {filteredListings.map((listing) => (
      <div
        key={listing.id}
        className="bg-zinc-900 border border-white/10 rounded-3xl p-4 flex justify-between gap-4"
      >
        <div>
          <h3 className="text-xl font-black">{listing.place_name}</h3>
          <p className="text-zinc-400">{listing.city}, {listing.country}</p>
        </div>

        <a
          href={listing.maps_link || listing.google_maps}
          target="_blank"
          rel="noreferrer"
          className="bg-amber-400 text-black px-4 py-2 rounded-2xl font-black h-fit"
        >
          Open Map
        </a>
      </div>
    ))}
  </section>
)}
          </>
        )}

        {topRatedInCity.length > 0 && (
          <>
            <h2 className="text-2xl md:text-3xl font-black mb-6">
              Top Rated {cityFilter ? `in ${cityFilter}` : `in ${topRatedInCity[0]?.city}`}
            </h2>

            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {topRatedInCity.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </section>
          </>
        )}

        <h2 className="text-2xl md:text-3xl font-black mb-6">Approved Recommendations</h2>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </section>

        <section id="submit" className="bg-white/10 border border-white/10 rounded-3xl p-5 md:p-6 mb-16">
          <h2 className="text-2xl md:text-3xl font-black mb-6">Submit a Tip</h2>

          <form onSubmit={submitRecommendation} className="grid gap-4">
            <input
              className="p-4 rounded-2xl text-black"
              placeholder="Place name"
              value={form.place_name}
              onChange={(e) => setForm({ ...form, place_name: e.target.value })}
              required
            />

            <select
              className="p-4 rounded-2xl text-black"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              required
            >
              <option value="">Select country</option>
              {COUNTRIES.map((country) => (
                <option key={country}>{country}</option>
              ))}
            </select>

            <input
              className="p-4 rounded-2xl text-black"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />

            <input
              className="p-4 rounded-2xl text-black"
              placeholder="Google Maps link"
              value={form.maps_link}
              onChange={(e) => setForm({ ...form, maps_link: e.target.value })}
              required
            />

            <div className="bg-zinc-900 rounded-2xl p-4">
              <p className="font-black mb-3">Activity types</p>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {ACTIVITY_TYPES.map((activity) => (
                  <label key={activity} className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={form.activity_types.includes(activity)}
                      onChange={() => toggleActivity(activity)}
                    />
                    {activity}
                  </label>
                ))}
              </div>
            </div>

            <select
              className="p-4 rounded-2xl text-black"
              value={form.price_range}
              onChange={(e) => setForm({ ...form, price_range: e.target.value })}
              required
            >
              <option>£</option>
              <option>££</option>
              <option>£££</option>
            </select>

            <textarea
              className="p-4 rounded-2xl text-black"
              rows={5}
              placeholder="Brief description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />

            <input
              className="p-4 rounded-2xl bg-white text-black"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, image_file: e.target.files[0] })
              }
              required
            />

            <input
              className="p-4 rounded-2xl text-black"
              type="date"
              value={form.visit_date}
              onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
              required
            />

            <label className="flex gap-2">
              <input type="checkbox" required />
              I am not a bot
            </label>

            <button className="bg-amber-400 text-black rounded-2xl p-4 font-black text-lg">
              Submit Recommendation
            </button>
          </form>
        </section>

        <section id="contact" className="my-12 bg-white/10 border border-white/10 rounded-3xl p-5 md:p-6">
          <h2 className="text-2xl md:text-3xl font-black mb-4">Contact</h2>

          <p className="text-base md:text-lg text-zinc-200 mb-2">
            For admin, corrections, removals or general enquiries:
          </p>

          <a
            href="mailto:admin@roadiebible.com"
            className="text-amber-400 font-black text-xl"
          >
            admin@roadiebible.com
          </a>
        </section>

        {isAdmin && (
          <section className="bg-zinc-900 border border-white/10 rounded-3xl p-5 md:p-6">
            <h2 className="text-2xl md:text-3xl font-black mb-6">Admin Dashboard</h2>

            {!session ? (
              <form onSubmit={adminLogin} className="grid gap-3 max-w-md">
                <input
                  className="p-4 rounded-2xl text-black"
                  placeholder="Admin email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />

                <input
                  className="p-4 rounded-2xl text-black"
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />

                <button className="bg-amber-400 text-black rounded-2xl p-4 font-black">
                  Login
                </button>
              </form>
            ) : (
              <div className="grid gap-10">
                <div>
                  <h3 className="text-xl font-black mb-4">Pending Submissions</h3>
                  <AdminList items={pendingListings} />
                </div>

                <div>
                  <h3 className="text-xl font-black mb-4">Live Listings</h3>
                  <AdminList items={listings} live />
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <img
        src="/roadie-corner.png"
        alt="Roadie"
        className="fixed bottom-4 right-4 w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl border-4 border-white z-50 object-cover"
      />
    </div>
  );
}
