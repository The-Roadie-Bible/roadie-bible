import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const [formData, setFormData] = useState({
    place_name: "",
    country: "",
    city: "",
    activity_type: "",
    price_range: "£",
    description: "",
    google_maps: "",
    image_url: "",
    last_visited: "",
  });

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (!error) {
      setListings(data);
    }
  }

  async function submitTip(e) {
    e.preventDefault();

    const { error } = await supabase.from("listings").insert([
      {
        ...formData,
        approved: false,
        votes: 0,
      },
    ]);

    if (!error) {
      alert("Tip submitted for approval!");
      setFormData({
        place_name: "",
        country: "",
        city: "",
        activity_type: "",
        price_range: "£",
        description: "",
        google_maps: "",
        image_url: "",
        last_visited: "",
      });
    } else {
      alert("Error submitting tip");
    }
  }

  async function vote(id, currentVotes) {
    await supabase
      .from("listings")
      .update({ votes: currentVotes + 1 })
      .eq("id", id);

    fetchListings();
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.place_name?.toLowerCase().includes(search.toLowerCase()) ||
      listing.city?.toLowerCase().includes(search.toLowerCase()) ||
      listing.country?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedType === "All" ||
      listing.activity_type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
        The Roadie Bible
      </h1>

      <p style={{ marginBottom: "30px" }}>
        Global travel help guide for touring crew & travellers
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <input
          placeholder="Search city, country or venue"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            minWidth: "250px",
          }}
        />

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
          }}
        >
          <option>All</option>

          {activityTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>

      <h2>Approved Recommendations</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "20px",
          marginBottom: "60px",
        }}
      >
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            style={{
              background: "#1e293b",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            {listing.image_url && (
              <img
                src={listing.image_url}
                alt={listing.place_name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
            )}

            <div style={{ padding: "20px" }}>
              <h3>{listing.place_name}</h3>

              <p>
                {listing.city}, {listing.country}
              </p>

              <p>{listing.activity_type}</p>

              <p>{listing.price_range}</p>

              <p>{listing.description}</p>

              {listing.google_maps && (
                <a
                  href={listing.google_maps}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#38bdf8" }}
                >
                  Open in Google Maps
                </a>
              )}

              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={() => vote(listing.id, listing.votes)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  👍 {listing.votes || 0}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2>Submit a Tip</h2>

      <form
        onSubmit={submitTip}
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "600px",
        }}
      >
        <input
          placeholder="Place name"
          value={formData.place_name}
          onChange={(e) =>
            setFormData({
              ...formData,
              place_name: e.target.value,
            })
          }
        />

        <input
          placeholder="Country"
          value={formData.country}
          onChange={(e) =>
            setFormData({
              ...formData,
              country: e.target.value,
            })
          }
        />

        <input
          placeholder="City"
          value={formData.city}
          onChange={(e) =>
            setFormData({
              ...formData,
              city: e.target.value,
            })
          }
        />

        <select
          value={formData.activity_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              activity_type: e.target.value,
            })
          }
        >
          <option value="">Select activity type</option>

          {activityTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <select
          value={formData.price_range}
          onChange={(e) =>
            setFormData({
              ...formData,
              price_range: e.target.value,
            })
          }
        >
          <option>£</option>
          <option>££</option>
          <option>£££</option>
          <option>££££</option>
        </select>

        <textarea
          placeholder="Brief description"
          rows="4"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
        />

        <input
          placeholder="Google Maps link"
          value={formData.google_maps}
          onChange={(e) =>
            setFormData({
              ...formData,
              google_maps: e.target.value,
            })
          }
        />

        <input
          placeholder="Image URL"
          value={formData.image_url}
          onChange={(e) =>
            setFormData({
              ...formData,
              image_url: e.target.value,
            })
          }
        />

        <input
          type="date"
          value={formData.last_visited}
          onChange={(e) =>
            setFormData({
              ...formData,
              last_visited: e.target.value,
            })
          }
        />

        <label>
          <input type="checkbox" required /> I am not a bot
        </label>

        <button
          type="submit"
          style={{
            padding: "14px",
            borderRadius: "10px",
            border: "none",
            background: "#facc15",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Submit Recommendation
        </button>
      </form>
    </div>
  );
}
