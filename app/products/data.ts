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
    name: "Stylish Aso-Oke Dress",
    price: "£43.99",
    image: "/aso-oke-dress.JPG",
    category: "full_body",
    status: "concept",
    tagline: "Made-to-order · Tailored in Ibadan",
    description:
      "An original Maison de Luxe design in Aso Oke, tailored to your measurements. Try it on virtually, reserve your piece, and our tailors bring it to life.",
  },
  {
    id: 2,
    name: "Elegantly Designed Aso Oke Dress",
    price: "£43.99",
    image: "/aso-oke-top.JPG",
    category: "full_body",
    status: "concept",
    tagline: "Made-to-order · Tailored in Ibadan",
    description:
      "A Maison de Luxe original — Aso Oke top with Ankara accents, made to your measurements by our Ibadan tailoring partner.",
  },
  {
    id: 3,
    name: "Monochrome Brushstroke Co-ord",
    price: "£43.99",
    image: "/wifey-design-1.jpg",
    category: "full_body",
    status: "in_stock",
    tagline: "In stock · Sourced from Lagos",
    description:
      "Make a bold statement with this striking two-piece matching set. Featuring a dramatic black-and-white abstract brushstroke print, this ensemble pairs a relaxed-fit, button-down shirt with flowing wide-leg trousers for an effortless, chic silhouette.",
  },
];
