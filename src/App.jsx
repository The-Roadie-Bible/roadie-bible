import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fieldStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  color: "#000",
  backgroundColor: "#fff",
  width: "100%",
  boxSizing: "border-box",
};

const activityTypes = [
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
];

export default function App() {
  const [listings, setListings] = useState([]);
  const [adminListings, setAdminListings] = useState([]);
  const [session, setSession] = useState(null);
  const [showAdmin, setShowAdmin] = useState(window.location.search.includes("admin"));

  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formData, setFormData] = useState({
    place_name: "",
    country: "",
    city: "",
    activity_type: [],
    price_range: "1",
    description: "",
    location: "",
    google_maps: "",
    google_reviews: "",
    image_url: "",
    last_visited: "",
  });

  useEffect(() => {
    fetchListings();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchAdminListings();
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

  async function fetchAdminListings() {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    setAdminListings(data || []);
  }

  function toggleActivityType(type) {
    setFormData({
      ...formData,
      activity_type: formData.activity_type.includes(type)
        ? formData.activity_type.filter((item) => item !== type)
        : [...formData.activity_type, type],
    });
  }

  async function submitTip(e) {
    e.preventDefault();

    const { error } = await supabase.from("listings").insert([
      {
        ...formData,
        activity_type: formData.activity_type.join(", "),
        price_range: Number(formData.price_range),
        approved: false,
        upvotes: 0,
        downvotes: 0,
      },
    ]);

    if (error) return alert("Error submitting tip: " + error.message);

    alert("Tip submitted for approval!");

    setFormData({
      place_name: "",
      country: "",
      city: "",
      activity_type: [],
      price_range: "1",
      description: "",
      location: "",
      google_maps: "",
      google_reviews: "",
      image_url: "",
      last_visited: "",
    });
  }

  async function signIn(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);

    setSession(data.session);
    fetchAdminListings();
  }

  async function approveListing(id) {
    await supabase.from("listings").update({ approved: true }).eq("id", id);
    fetchListings();
    fetchAdminListings();
  }

  async function deleteListing(id) {
    await supabase.from("listings").delete().eq("id", id);
    fetchListings();
    fetchAdminListings();
  }

  async function upvote(id, currentVotes) {
    await supabase
      .from("listings")
      .update({ upvotes: currentVotes + 1 })
      .eq("id", id);

    fetchListings();
  }

  const filteredListings = listings.filter((listing) => {
    const text = `${listing.place_name} ${listing.country} ${listing.city} ${listing.location} ${listing.activity_type} ${listing.description}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
    const matchesActivity =
      activityFilter === "All" || listing.activity_type?.includes(activityFilter);
    const matchesPrice =
      priceFilter === "All" || Number(listing.price_range) === Number(priceFilter);

    return matchesSearch && matchesActivity && matchesPrice;
  });

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <button onClick={() => setShowAdmin(!showAdmin)} style={{ float: "right" }}>
        Admin
      </button>

      <h1 style={{ fontSize: 52, marginBottom: 8 }}>The Roadie Bible</h1>
      <p style={{ fontSize: 18, marginBottom: 30 }}>
        Global travel help guide for touring crew & travellers
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 30 }}>
        <input
          style={fieldStyle}
          placeholder="Search city, country, venue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={fieldStyle}
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
        >
          <option>All</option>
          {activityTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <select
          style={fieldStyle}
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="All">All prices</option>
          <option value="1">£</option>
          <option value="2">££</option>
          <option value="3">£££</option>
          <option value="4">££££</option>
        </select>
      </div>

      <h2>Approved Recommendations</h2>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: 60 }}>
        {filteredListings.map((listing) => (
          <div key={listing.id} style={{ background: "#1e293b", borderRadius: 18, overflow: "hidden" }}>
            {listing.image_url ? (
              <img src={listing.image_url} alt={listing.place_name} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            ) : (
              <div style={{ height: 200, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                No image yet
              </div>
            )}

            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 24, marginTop: 0 }}>{listing.place_name}</h3>
              <p>{listing.location}</p>
              <p>{listing.city}, {listing.country}</p>
              <p><strong>{listing.activity_type}</strong></p>
              <p>{"£".repeat(listing.price_range || 1)}</p>
              <p>{listing.description}</p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                {listing.google_maps && (
                  <a href={listing.google_maps} target="_blank" rel="noreferrer" style={{ color: "#000", background: "#38bdf8", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: "bold" }}>
                    Google Maps
                  </a>
                )}

                {listing.google_reviews && (
                  <a href={listing.google_reviews} target="_blank" rel="noreferrer" style={{ color: "#000", background: "#facc15", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: "bold" }}>
                    Google Reviews
                  </a>
                )}

                <button onClick={() => upvote(listing.id, listing.upvotes || 0)} style={{ padding: "10px 14px", borderRadius: 10, border: 0 }}>
                  👍 {listing.upvotes || 0}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2>Submit a Tip</h2>

      <form onSubmit={submitTip} style={{ display: "grid", gap: 12, maxWidth: 700 }}>
        <input style={fieldStyle} placeholder="Place name" value={formData.place_name} onChange={(e) => setFormData({ ...formData, place_name: e.target.value })} required />
        <input style={fieldStyle} placeholder="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} required />
        <input style={fieldStyle} placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
        <input style={fieldStyle} placeholder="Location / area" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />

        <div style={fieldStyle}>
          <strong>Activity type</strong>
          {activityTypes.map((type) => (
            <label key={type} style={{ display: "block", marginTop: 8 }}>
              <input
                type="checkbox"
                checked={formData.activity_type.includes(type)}
                onChange={() => toggleActivityType(type)}
              />{" "}
              {type}
            </label>
          ))}
        </div>

        <select style={fieldStyle} value={formData.price_range} onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}>
          <option value="1">£</option>
          <option value="2">££</option>
          <option value="3">£££</option>
          <option value="4">££££</option>
        </select>

        <textarea style={fieldStyle} placeholder="Brief description" rows="5" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
        <input style={fieldStyle} placeholder="Google Maps link" value={formData.google_maps} onChange={(e) => setFormData({ ...formData, google_maps: e.target.value })} />
        <input style={fieldStyle} placeholder="Google Reviews link" value={formData.google_reviews} onChange={(e) => setFormData({ ...formData, google_reviews: e.target.value })} />
        <input style={fieldStyle} placeholder="Image URL" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
        <input style={fieldStyle} type="date" value={formData.last_visited} onChange={(e) => setFormData({ ...formData, last_visited: e.target.value })} />

        <label><input type="checkbox" required /> I am not a bot</label>

        <button style={{ padding: 16, background: "#facc15", color: "#000", border: 0, borderRadius: 12, fontWeight: "bold", fontSize: 16 }}>
          Submit Recommendation
        </button>
      </form>

      {showAdmin && (
        <section style={{ marginTop: 60, padding: 20, background: "#111827", borderRadius: 16 }}>
          <h2>Admin Approval Dashboard</h2>

          {!session ? (
            <form onSubmit={signIn} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
              <input style={fieldStyle} placeholder="Admin email" onChange={(e) => setEmail(e.target.value)} />
              <input style={fieldStyle} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              <button>Login</button>
            </form>
          ) : (
            <>
              <button onClick={() => supabase.auth.signOut().then(() => setSession(null))}>
                Logout
              </button>

              <h3>Pending / All Submissions</h3>

              {adminListings.map((item) => (
                <div key={item.id} style={{ background: "#1e293b", marginTop: 12, padding: 16, borderRadius: 12 }}>
                  <strong>{item.place_name}</strong>
                  <p>{item.city}, {item.country}</p>
                  <p>{item.activity_type}</p>
                  <p>{item.description}</p>
                  <p>Status: {item.approved ? "Approved" : "Pending"}</p>

                  {!item.approved && (
                    <button onClick={() => approveListing(item.id)} style={{ marginRight: 8 }}>
                      Approve
                    </button>
                  )}

                  <button onClick={() => deleteListing(item.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
}
