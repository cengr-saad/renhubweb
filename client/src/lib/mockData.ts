import { House, BedDouble, Car, Warehouse, Building2, Armchair, Box, KeyRound } from "lucide-react";

export const CATEGORIES = [
  { id: "all", label: "All", icon: KeyRound },
  { id: "house", label: "House", icon: House },
  { id: "apartment", label: "Apartment", icon: Building2 },
  { id: "room", label: "Room", icon: BedDouble },
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "storage", label: "Storage", icon: Box },
  { id: "office", label: "Office", icon: Armchair },
  { id: "shop", label: "Shop", icon: Warehouse },
];

export const MOCK_USER = {
  id: "u1",
  name: "Alex Johnson",
  email: "alex@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  isPublic: true,
};

export const LISTINGS = [
  {
    id: "l1",
    title: "Modern Minimalist Home",
    category: "house",
    description: "Beautiful 3-bedroom home with modern architecture, large windows, and a private garden. Perfect for families looking for a quiet neighborhood.",
    location: "San Francisco, CA",
    price: 3500,
    unit: "month",
    image: "/src/assets/cat-house.jpg",
    poster: { name: "Sarah W.", id: "u2" },
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: "l2",
    title: "Cozy Bedroom in Shared Apt",
    category: "room",
    description: "Spacious bedroom with en-suite bathroom in a shared luxury apartment. Access to gym and pool included.",
    location: "New York, NY",
    price: 1200,
    unit: "month",
    image: "/src/assets/cat-room.jpg",
    poster: { name: "Mike T.", id: "u3" },
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: "l3",
    title: "Tesla Model 3 Performance",
    category: "vehicle",
    description: "Experience the speed and comfort of a Tesla. Full self-driving capability included for your trip.",
    location: "Los Angeles, CA",
    price: 150,
    unit: "day",
    image: "/src/assets/cat-vehicle.jpg",
    poster: { name: "Elon M. (Fake)", id: "u4" },
    coordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: "l4",
    title: "Downtown Luxury Apartment",
    category: "apartment",
    description: "High-rise apartment with stunning city views. Walking distance to all major tech offices and nightlife.",
    location: "Austin, TX",
    price: 2800,
    unit: "month",
    image: "/src/assets/cat-apartment.jpg",
    poster: { name: "Lisa K.", id: "u5" },
    coordinates: { lat: 30.2672, lng: -97.7431 }
  },
  {
    id: "l5",
    title: "Secure Storage Unit 10x10",
    category: "storage",
    description: "Climate controlled storage unit. 24/7 access with security cameras.",
    location: "Seattle, WA",
    price: 100,
    unit: "month",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    poster: { name: "StoreIt Inc.", id: "u6" },
    coordinates: { lat: 47.6062, lng: -122.3321 }
  }
];

export const CHATS = [
  {
    id: "c1",
    partner: { name: "Sarah W.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    lastMessage: "Is the place still available for viewing?",
    time: "2m ago",
    unread: 2,
    listingId: "l1"
  },
  {
    id: "c2",
    partner: { name: "Mike T.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    lastMessage: "Sounds good, see you then!",
    time: "1d ago",
    unread: 0,
    listingId: "l2"
  }
];
