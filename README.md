# Maison de Luxe | AI-Driven Bespoke 

Maison de Luxe is a next-generation, on-demand AI fashion e-commerce storefront. It bridges the gap between digital design and artisan craftsmanship by allowing customers to preview curated designer collections—or upload their own custom fashion inspirations—and instantly visualize the garments on their own bodies using advanced AI virtual try-on technology.

---

## ✨ Key Features

* **AI Virtual Try-On Engine:** Powered by the YouCam Cloth-v4 API, enabling seamless asynchronous image stitching and real-time status polling.
* **The Bespoke Commission Mode:** Empowers customers to upload custom design inspirations (e.g., from Pinterest or Instagram) and preview them before ordering.
* **Curated Collections Gallery:** Showcases high-end apparel (Aso-oke, Ankara couture, and luxury dresses) with rich editorial descriptions.
* **Responsive Editorial UI:** Styled with a sophisticated purple-and-white luxury design system, complete with mobile hamburger navigation and active route highlighting using Next.js App Router and Tailwind CSS.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router, Server Actions)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **AI Integration:** YouCam S2S v4.0 Task Cloth-v4 API
* **Deployment:** Vercel

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have Node.js (version 18+) installed on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/ai-fashion-mvp.git](https://github.com/your-username/ai-fashion-mvp.git)
cd ai-fashion-mvp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory of your project and add your YouCam API key:

```env
YOUCAM_API_KEY=your_youcam_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the storefront.

---

## 📦 Deployment on Vercel

The easiest way to deploy your Maison de Luxe storefront is via Vercel.

1. Push your code to a GitHub repository.
2. Import the project into [Vercel](https://vercel.com/).
3. In the project settings, add the following **Environment Variable**:
   * **Key:** `YOUCAM_API_KEY`
   * **Value:** `your_actual_youcam_api_key`
4. Click **Deploy**.

---

## 📄 License & Attribution

Developed as an AI-Driven B2B Solutions, showcasing zero-inventory, on-demand luxury fashion retail.