# Digital ID Card Generator

A web-based application for generating professional student ID cards with Firebase authentication and storage.

## 🚀 Features

- User authentication with Firebase
- Dynamic ID card generation
- Photo upload and processing
- Barcode generation
- Download functionality for front and back of ID cards
- Responsive design

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (for build process)
- Firebase account
- Git

### Local Development

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd newidcard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Copy the `.env.example` to `.env`
   - Update the `.env` file with your Firebase configuration values

4. **Run locally**
   ```bash
   npm run dev
   ```

### Building for Production

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

## 🔒 Security Configuration

This project uses environment variables to keep Firebase configuration secure:

- **Local Development**: Uses `.env` file (never commit this!)
- **Production**: Environment variables are injected during build process

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Set Environment Variables in Vercel**

   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add all the environment variables from your `.env` file

4. **Deploy**
   - Vercel will automatically build and deploy your project
   - Your app will be available at the provided URL

### Manual Deployment

If you prefer manual deployment to any static hosting service:

1. Run the build command: `npm run build`
2. Upload the contents of the `build/` directory to your hosting service
3. Configure environment variables in your hosting platform

## 📁 Project Structure

```
├── index.html              # Main HTML file
├── app.js                  # Main JavaScript logic
├── styles.css              # Styling
├── firebase-config-env.js  # Firebase config (uses env vars)
├── admin.js                # Admin functionality
├── build.js                # Build script
├── package.json            # Node.js dependencies
├── vercel.json             # Vercel configuration
├── .env                    # Environment variables (local only)
├── .gitignore              # Git ignore rules
└── build/                  # Build output directory
```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage
5. Copy the configuration to your `.env` file

### Vercel Environment Variables

In your Vercel project settings, add these environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
