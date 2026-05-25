import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fieldStyle = {
  padding: "12px",
  borderRadius: "8px",
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
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");

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
  }, []);

  async function fetchListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (!error) setListings(data || []);
  }

  function toggleActivityType(type) {
    const current = formData.activity_type;

    setFormData({
      ...formData,
      activity_type: current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
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

    if (error) {
      alert("Error submitting tip: " + error.message);
      return;
    }

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

  async function upvote(id, currentVotes) {
    await supabase
      .from("listings")
      .update({ upvotes: currentVotes + 1 })
      .eq("id", id);

    fetchListings();
  }

  const filteredListings = listings.filter((listing) => {
    const text =
      `${listing.place_name} ${listing.country} ${listing.city} ${listing.activity_type} ${listing.description}`.toLowerCase();

    return (
      text.includes(search.toLowerCase()) &&
      (selectedType === "All" ||
        listing.activity_type?.includes(selectedType))
    );
  });

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "52px", marginBottom: "10px" }}>
        The Roadie Bible
      </h1>

      <p style={{ marginBottom: "30px", fontSize: "18px" }}>
        Global travel help guide for touring crew & travellers
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        <input
          style={{ ...fieldStyle, maxWidth: "300px" }}
          placeholder="Search city, country or venue"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={{ ...fieldStyle, maxWidth: "260px" }}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
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
          gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
          gap: "20px",
          marginBottom: "60px",
        }}
      >
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            style={{
              background: "#1e293b",
              borderRadius: "16px",
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

              <p>{listing.location}</p>

              <p>
                {listing.city}, {listing.country}
              </p>

              <p>{listing.activity_type}</p>

              <p>{"£".repeat(listing.price_range || 1)}</p>

              <p>{listing.description}</p>

              {listing.google_maps && (
                <p>
                  <a
                    href={listing.google_maps}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#38bdf8" }}
                  >
                    Open in Google Maps
                  </a>
                </p>
              )}

              {listing.google_reviews && (
                <p>
                  <a
                    href={listing.google_reviews}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#facc15" }}
                  >
                    Google Reviews
                  </a>
                </p>
              )}

              <button
                onClick={() => upvote(listing.id, listing.upvotes || 0)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                👍 {listing.upvotes || 0}
              </button>
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
          maxWidth: "650px",
        }}
      >
        <input
          style={fieldStyle}
          placeholder="Place name"
          value={formData.place_name}
          onChange={(e) =>
            setFormData({
              ...formData,
              place_name: e.target.value,
            })
          }
          required
        />

        <input
          style={fieldStyle}
          placeholder="Country"
          value={formData.country}
          onChange={(e) =>
            setFormData({
              ...formData,
              country: e.target.value,
            })
          }
          required
        />

        <input
          style={fieldStyle}
          placeholder="City"
          value={formData.city}
          onChange={(e) =>
            setFormData({
              ...formData,
              city: e.target.value,
            })
          }
          required
        />

        <input
          style={fieldStyle}
          placeholder="Location / area"
          value={formData.location}
          onChange={(e) =>
            setFormData({
              ...formData,
              location: e.target.value,
            })
          }
        />

        <div style={fieldStyle}>
          <strong>Activity type</strong>

          <div
            style={{
              display: "grid",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            {activityTypes.map((type) => (
              <label key={type} style={{ color: "#000" }}>
                <input
                  type="checkbox"
                  checked={formData.activity_type.includes(type)}
                  onChange={() => toggleActivityType(type)}
                />{" "}
                {type}
              </label>
            ))}
          </div>
        </div>

        <select
          style={fieldStyle}
          value={formData.price_range}
          onChange={(e) =>
            setFormData({
              ...formData,
              price_range: e.target.value,
            })
          }
          required
        >
          <option value="1">£</option>
          <option value="2">££</option>
          <option value="3">£££</option>
          <option value="4">££££</option>
        </select>

        <textarea
          style={fieldStyle}
          placeholder="Brief description"
          rows="4"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
          required
        />

        <input
          style={fieldStyle}
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
          style={fieldStyle}
          placeholder="Google Reviews link"
          value={formData.google_reviews}
          onChange={(e) =>
            setFormData({
              ...formData,
              google_reviews: e.target.value,
            })
          }
        />

        <input
          style={fieldStyle}
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
          style={fieldStyle}
          type="date"
          value={formData.last_visited}
          onChange={(e) =>
            setFormData({
              ...formData,
              last_visited: e.target.value,
            })
          }
        />

        <label style={{ color: "white" }}>
          <input type="checkbox" required /> I am not a bot
        </label>

        <button
          type="submit"
          style={{
            padding: "16px",
            borderRadius: "12px",
            border: "none",
            background: "#facc15",
            color: "#000",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Submit Recommendation
        </button>
      </form>
    </div>
  );
}
