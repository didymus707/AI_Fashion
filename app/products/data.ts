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
    name: "The Olori Sculpted Mini",
    price: null,
    image: "/aso-oke-dress.jpg",
    category: "full_body",
    status: "concept",
    tagline: "Made-to-order · Tailored in Ibadan",
    description:
      "An original Maison de Luxe design in Aso Oke, tailored to your measurements. Try it on virtually, reserve your piece, and our tailors bring it to life.",
  },
  {
    id: 2,
    name: "The Majestic Illusion Blouse",
    price: null,
    image: "/aso-oke-top.jpg",
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
  {
    id: 4,
    name: "The Empress Structured Mini",
    price: null,
    image: "/ankara-aso-oke-mini.jpg",
    category: "full_body",
    status: "concept",
    tagline: "Made-to-order · Tailored in Ibadan",
    description:
      "A flawless marriage of cultural heritage and modern tailoring. This breathtaking piece features a vibrant Ankara corset bodice with statement puff sleeves and intricate contrast piping. It flows seamlessly into a textured Aso-oke skirt, masterfully seamed to accentuate a striking hourglass silhouette.",
  },
  {
    id: 5,
    name: "The Sovereign Peplum Suit",
    price: null,
    image: "/navy-peplum.jpg",
    category: "full_body",
    status: "concept",
    tagline: "Made-to-order · Tailored in Ibadan",
    description:
      "Exude absolute power and elegance in this meticulously tailored two-piece ensemble. Crafted in a rich navy textured fabric, the structured jacket features striking gold button closures, a delicate 3D floral shoulder appliqué, and a statement peplum adorned with a vibrant Ankara print. Paired with a sleek, front-slit midi skirt, this suit redefines boardroom-to-evening couture.",
  },
];
