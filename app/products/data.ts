type GarmentCategory =
  | "full_body"
  | "upper_body"
  | "lower_body"
  | "outerwear"
  | "shoes"
  | "auto";

export type Product = {
  id: number;
  name: string;
  price: string | null;
  image: string | null;
  category: GarmentCategory;
  status: "in_stock" | "concept";
  tagline: string; // small subtitle on product card
  description: string;
};

export type GarmentSource =
  | { type: "product"; imageUrl: string; category: GarmentCategory }
  | { type: "upload"; category: GarmentCategory };

// Our Updated Store Inventory
export const INVENTORY: Product[] = [
  {
    id: 1,
    name: "Monochrome Brushstroke Co-ord",
    price: "£43.99",
    image: "/wifey-design-1.jpg",
    category: "full_body",
    status: "in_stock",
    tagline: "In stock · Sourced from Lagos",
    description:
      "Make a bold statement with this striking two-piece matching set. Featuring a dramatic black-and-white abstract brushstroke print, this ensemble pairs a relaxed-fit, button-down shirt with flowing wide-leg trousers for an effortless, chic silhouette.",
  },
  {
    id: 2,
    name: "Stylish Aso-Oke Design Dress",
    price: "£43.99",
    image: "/aso-oke-dress.jpg",
    category: "full_body",
    status: "concept",
    tagline: "",
    description:
      "Make a bold statement with this Aso Oke dress. Elegantly styled and fitted for your events and gatherings.",
  },
  {
    id: 3,
    name: "Aso Oke Top",
    price: "£43.99",
    image: "/aso-oke-top.jpg",
    category: "upper_body",
    status: "concept",
    tagline: "",
    description: "A beautiful inspired top made from aso oke and amkara",
  },
];
