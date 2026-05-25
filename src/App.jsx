import React, { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Globe2,
  Plane,
  Clock,
  Users,
  Trophy,
  Compass,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Navigation,
  Send,
  ShieldCheck,
  Camera
} from "lucide-react";

const countries = [
  { country: "United Kingdom", cities: ["Aberdeen", "Glasgow", "Edinburgh", "Newcastle", "Sunderland", "Sheffield", "Leeds", "Nottingham", "Manchester", "Liverpool", "Birmingham", "Cardiff", "London"] },
  { country: "France", cities: ["Paris", "Lyon"] },
  { country: "Spain", cities: ["Madrid", "Barcelona"] },
  { country: "Portugal", cities: ["Lisbon", "Porto"] },
  { country: "Netherlands", cities: ["Amsterdam"] },
  { country: "Belgium", cities: ["Brussels"] },
  { country: "Luxembourg", cities: ["Luxembourg"] },
  { country: "Czechia", cities: ["Prague"] },
  { country: "Germany", cities: ["Berlin", "Munich", "Dusseldorf", "Cologne", "Mannheim", "Stuttgart", "Hamburg", "Frankfurt"] },
  { country: "Switzerland", cities: ["Zurich"] },
  { country: "Austria", cities: ["Zurich", "Salzburg"] },
  { country: "Hungary", cities: ["Budapest"] },
  { country: "Romania", cities: ["Bucharest"] },
  { country: "Poland", cities: ["Warsaw", "Lodz", "Kraken"] },
  { country: "Norway", cities: ["Oslo", "Bergen"] },
  { country: "Sweden", cities: ["Stockholm", "Gottenburg"] },
  { country: "Denmark", cities: ["Copenhagen"] },
  { country: "Finland", cities: ["Helsinki"] },
  { country: "Italy", cities: ["Milan", "Rome", "Naples"] },
  { country: "Greece", cities: ["Athens"] }
];

const activityTypes = ["All", "Hidden gems", "Local culture", "Breakfast/Brunch", "Lunch", "Dinner", "Sports bars", "Open late", "Good for large groups", "Airport hotels", "Day rooms", "Golf clubs", "Padel"];
const priceRanges = ["All", "£", "££", "£££", "££££"];

const listings = [
  {
    id: 1,
    name: "Example Sports Bar",
    country: "United Kingdom",
    city: "Manchester",
    location: "City centre",
    activityType: "Sports bars",
    description: "Example listing for watching live sport. Replace with a real recommendation.",
    priceRange: "££",
    rating: 4.5,
    upvotes: 0,
    downvotes: 0,
    comments: [],
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    googleReviews: "https://www.google.com/search?q=Manchester+sports+bar+reviews",
    approved: true,
    lastVisited: "2026-01"
  },
  {
    id: 2,
    name: "Example Late Night Food",
    country: "Portugal",
    city: "Lisbon",
    location: "Central Lisbon",
    activityType: "Open late",
    description: "Example listing for late-night food after travel, work or a show. Replace with a real recommendation.",
    priceRange: "££",
    rating: 4.4,
    upvotes: 0,
    downvotes: 0,
}
