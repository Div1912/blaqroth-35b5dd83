 Blaqroth — Modern Fashion E-Commerce Platform

Blaqroth is a modern, performance-focused fashion e-commerce platform designed to deliver a premium shopping experience.
Built with scalability, smooth UI, and secure authentication in mind, Blaqroth bridges aesthetics with functionality for contemporary clothing brands.

 Features

 Secure User Authentication

Email & password login

Google OAuth sign-in

User profile & address management

 Product Management

Product listing with categories

Featured collections & offers

Real-time inventory updates

 Shopping Experience

Add to cart & wishlist

Seamless checkout flow

Order history & status tracking

 Modern UI/UX

Smooth animations & transitions

Mobile-first responsive design

Transparent & minimal card layouts

🧑‍💼 Admin Panel

Add/update products

Manage orders & delivery status

Create offers & promotions (reflected instantly on UI)

🧠 Tech Stack

Frontend: React / Next.js, Tailwind CSS

Backend: Supabase (Auth, Database, Storage)

Authentication: Supabase Auth (Email + Google OAuth)

Database: PostgreSQL (via Supabase)

Hosting: Vercel / Lovable

Domain: Custom domain (e.g. blaqroth.in)

📁 Project Structure
blaqroth/
├── components/        # Reusable UI components
├── pages/             # Application pages
├── styles/            # Global styles & Tailwind config
├── utils/             # Helper functions
├── supabase/          # Supabase configuration
└── public/            # Assets & images

⚙️ Setup & Installation

Clone the repository

git clone https://github.com/your-username/blaqroth.git
cd blaqroth


Install dependencies

npm install


Environment Variables
Create a .env.local file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key


Run the project

npm run dev

🔐 Authentication Branding Note

Google OAuth authentication is handled via Supabase.
For brand name display (e.g. “Continue to Blaqroth” instead of supabase.co), the OAuth consent screen must be configured in Google Cloud Console with:

App name

Domain verification

Authorized redirect URLs

📈 Scalability & Costs

Supabase offers a free tier suitable for early-stage startups

Easily scalable to paid plans as traffic grows

Hosting costs depend on traffic & storage usage

No monthly developer fee after handover

🆚 Why Blaqroth Over Shopify?
Blaqroth	Shopify
Full code ownership	Platform-locked
Custom UI/UX	Template-driven
No transaction fees	Per-transaction charges
Custom features	Limited flexibility
Brand-first experience	Generic flow
🧩 Future Enhancements

AI-based product recommendations

Size & style personalization

AR try-on preview

Multi-vendor support

Analytics dashboard

👤 Author

Divyanshu Raj
Full-Stack Developer | Tech Enthusiast
Building scalable, design-driven products.

📄 License

This project is licensed under the MIT License.
