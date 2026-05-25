import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const EUROPEAN_COUNTRIES = [
  "Albania",
  "Andorra",
  "Austria",
  "Belarus",
  "Belgium",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Ireland",
  "Italy",
  "Kosovo",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Moldova",
  "Monaco",
  "Montenegro",
  "Netherlands",
  "North Macedonia",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "San Marino",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
  "Ukraine",
  "United Kingdom",
  "Vatican City",
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
];

export default function App() {
  const [listings, setListings] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);

  const [placeName, setPlaceName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [description, setDescription] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [priceRange, setPriceRange] = useState("£");
  const [visitDate, setVisitDate] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("");
  const [selectedActivityFilter, setSelectedActivityFilter] = useState("");

  const isAdmin = window.location.pathname === "/admin";

  useEffect(() => {
    fetchListings();

    if (isAdmin) {
      fetchPendingListings();
    }
  }, []);

  async function fetchListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (!error) {
      setListings(data || []);
    }
  }

  async function fetchPendingListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (!error) {
      setPendingListings(data || []);
    }
  }

  function toggleActivity(activity) {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(
        selectedActivities.filter((a) => a !== activity)
      );
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  }

  async function uploadImage(file) {
    if (!file) return "";

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("listing-images")
      .upload(fileName, file);

    if (error) {
      alert("Image upload error: " + error.message);
      return "";
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("listing-images")
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async function submitRecommendation(e) {
    e.preventDefault();

    if (!imageFile) {
      alert("Please upload an image");
      return;
    }

    const imageUrl = await uploadImage(imageFile);

    if (!imageUrl) return;

    const { error } = await supabase.from("listings").insert([
      {
        place_name: placeName,
        country,
        city,
        maps_link: mapsLink,
        description,
        activity_types: selectedActivities,
        price_range: priceRange,
        image_url: imageUrl,
        visit_date: visitDate,
        approved: false,
      },
    ]);

    if (error) {
      alert("Error submitting tip: " + error.message);
      return;
    }

    alert("Tip submitted for approval!");

    setPlaceName("");
    setCountry("");
    setCity("");
    setMapsLink("");
    setDescription("");
    setSelectedActivities([]);
    setPriceRange("£");
    setVisitDate("");
    setImageFile(null);

    document.getElementById("image-upload").value = "";
  }

  async function approveListing(id) {
    const { error } = await supabase
      .from("listings")
      .update({ approved: true })
      .eq("id", id);

    if (!error) {
      fetchPendingListings();
      fetchListings();
    }
  }

  async function deleteListing(id) {
    const confirmDelete = confirm("Delete this submission?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchPendingListings();
      fetchListings();
    }
  }

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.place_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        listing.city?.toLowerCase().includes(search.toLowerCase()) ||
        listing.country?.toLowerCase().includes(search.toLowerCase());

      const matchesCountry =
        !selectedCountryFilter ||
        listing.country === selectedCountryFilter;

      const matchesActivity =
        !selectedActivityFilter ||
        listing.activity_types?.includes(selectedActivityFilter);

      return matchesSearch && matchesCountry && matchesActivity;
    });
  }, [
    listings,
    search,
    selectedCountryFilter,
    selectedActivityFilter,
  ]);

  return (
    <div className="min-h-screen bg-[#0b1220] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2">
          The Roadie Bible
        </h1>

        <p className="text-xl text-gray-300 mb-10">
          Global travel help guide for touring crew & travellers
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <input
            type="text"
            placeholder="Search city, country or venue"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded bg-white text-black"
          />

          <select
            value={selectedCountryFilter}
            onChange={(e) =>
              setSelectedCountryFilter(e.target.value)
            }
            className="p-3 rounded bg-white text-black"
          >
            <option value="">All countries</option>

            {EUROPEAN_COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <select
            value={selectedActivityFilter}
            onChange={(e) =>
              setSelectedActivityFilter(e.target.value)
            }
            className="p-3 rounded bg-white text-black"
          >
            <option value="">All activity types</option>

            {ACTIVITY_TYPES.map((activity) => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-3xl font-bold mb-6">
          Approved Recommendations
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-[#111827] rounded-2xl overflow-hidden border border-gray-800"
            >
              {listing.image_url && (
                <img
                  src={listing.image_url}
                  alt={listing.place_name}
                  className="w-full h-64 object-cover"
                />
              )}

              <div className="p-5">
                <h3 className="text-2xl font-bold mb-2">
                  {listing.place_name}
                </h3>

                <p className="text-gray-300 mb-3">
                  {listing.city}, {listing.country}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.activity_types?.map((activity) => (
                    <span
                      key={activity}
                      className="bg-yellow-500 text-black text-sm px-3 py-1 rounded-full"
                    >
                      {activity}
                    </span>
                  ))}
                </div>

                <p className="mb-4 text-gray-200">
                  {listing.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 font-bold">
                    {listing.price_range}
                  </span>

                  <a
                    href={listing.maps_link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                  >
                    Open Maps
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 mb-12">
          <h2 className="text-3xl font-bold mb-6">
            Submit a Tip
          </h2>

          <form
            onSubmit={submitRecommendation}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Place name"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              required
              className="w-full p-3 rounded bg-white text-black"
            />

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="w-full p-3 rounded bg-white text-black"
            >
              <option value="">Select country</option>

              {EUROPEAN_COUNTRIES.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full p-3 rounded bg-white text-black"
            />

            <input
              type="url"
              placeholder="Google Maps link"
              value={mapsLink}
              onChange={(e) => setMapsLink(e.target.value)}
              required
              className="w-full p-3 rounded bg-white text-black"
            />

            <div className="bg-[#1f2937] p-4 rounded-xl">
              <p className="font-bold mb-3">
                Activity Types
              </p>

              <div className="grid md:grid-cols-3 gap-2">
                {ACTIVITY_TYPES.map((activity) => (
                  <label
                    key={activity}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(
                        activity
                      )}
                      onChange={() => toggleActivity(activity)}
                    />

                    <span>{activity}</span>
                  </label>
                ))}
              </div>
            </div>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              required
              className="w-full p-3 rounded bg-white text-black"
            >
              <option value="£">£ Budget</option>
              <option value="££">££ Mid-range</option>
              <option value="£££">£££ Premium</option>
            </select>

            <textarea
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full p-3 rounded bg-white text-black"
            />

            <div>
              <label className="block mb-2 font-bold">
                Upload Image
              </label>

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                required
                onChange={(e) =>
                  setImageFile(e.target.files[0])
                }
                className="w-full p-3 rounded bg-white text-black"
              />
            </div>

            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
              className="w-full p-3 rounded bg-white text-black"
            />

            <label className="flex items-center gap-2">
              <input type="checkbox" required />
              <span>I am not a bot</span>
            </label>

            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl text-lg"
            >
              Submit Recommendation
            </button>
          </form>
        </div>

        {isAdmin && (
          <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
            <h2 className="text-3xl font-bold mb-6">
              Admin Approval Dashboard
            </h2>

            <div className="space-y-6">
              {pendingListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-[#1f2937] rounded-xl overflow-hidden"
                >
                  {listing.image_url && (
                    <img
                      src={listing.image_url}
                      alt={listing.place_name}
                      className="w-full h-64 object-cover"
                    />
                  )}

                  <div className="p-5">
                    <h3 className="text-2xl font-bold">
                      {listing.place_name}
                    </h3>

                    <p className="text-gray-300 mb-2">
                      {listing.city}, {listing.country}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {listing.activity_types?.map((activity) => (
                        <span
                          key={activity}
                          className="bg-yellow-500 text-black text-sm px-3 py-1 rounded-full"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>

                    <p className="mb-4">
                      {listing.description}
                    </p>

                    <div className="flex gap-4">
                      <button
                        onClick={() =>
                          approveListing(listing.id)
                        }
                        className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg font-bold"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          deleteListing(listing.id)
                        }
                        className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingListings.length === 0 && (
                <p className="text-gray-400">
                  No pending submissions.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
