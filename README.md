# Talk To My Lawyer - Legal Letter Generation Platform

A full-stack application for generating professional legal letters using AI, with multi-role authentication, subscription management, and employee commission tracking.

## 🚀 Features

- **Multi-Role Authentication**: Users, Employees, and Admins with separate dashboards
- **AI-Powered Letter Generation**: Using Gemini 2.5-Flash for professional legal documents
- **Subscription Management**: Stripe integration with multiple pricing tiers
- **Employee Commission System**: Coupon codes with automatic commission tracking
- **Admin Dashboard**: Comprehensive analytics and user management
- **Timeline Interface**: Animated letter generation process
- **PDF Generation**: Download letters as professional PDFs

## 🛠 Tech Stack

- **Frontend**: Next.js 13+, React, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Google Gemini 2.5-Flash
- **Payments**: Stripe Checkout + Webhooks
- **Authentication**: Supabase Auth with Row Level Security

## 📋 Prerequisites

Before setting up the project, ensure you have:

1. **Node.js** (v18 or higher)
2. **Supabase Account** - [Create one here](https://supabase.com)
3. **Stripe Account** - [Create one here](https://stripe.com)
4. **Google AI Studio Account** - [Get Gemini API key](https://makersuite.google.com/app/apikey)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd talk-to-my-lawyer
npm install
```

### 2. Set Up Supabase Project

1. **Create a new Supabase project**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose your organization and set project details

2. **Run Database Migrations**:
   ```bash
   # Install Supabase CLI if you haven't already
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project (get project ref from Supabase dashboard)
   supabase link --project-ref YOUR_PROJECT_REF

   # Run migrations
   supabase db push
   ```

3. **Set Environment Variables in Supabase**:
   ```bash
   # Set your API keys in Supabase
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
   supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key_here
   supabase secrets set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
   ```

### 3. Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy generate-draft
supabase functions deploy stripe-webhook  
supabase functions deploy create-checkout-session
```

### 4. Configure Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in your environment variables**:
   ```env
   # Get these from your Supabase project settings
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Get this from Google AI Studio
   GEMINI_API_KEY=your_gemini_api_key_here

   # Get these from your Stripe dashboard
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Your application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 5. Set Up Stripe Webhooks

1. **In your Stripe Dashboard**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Set endpoint URL to: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy the webhook secret to your environment variables

### 6. Create Admin User

1. **Sign up through the app** with any email/password
2. **In Supabase Dashboard**:
   - Go to Authentication → Users
   - Find your user and copy the UUID
   - Go to Table Editor → profiles
   - Update your user's role to 'admin'

### 7. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 🔐 Security Configuration

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Employees can manage their coupons and see their commissions
- Admins can access all data for dashboard purposes

### Environment Variables Security

**⚠️ CRITICAL SECURITY WARNINGS:**

- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- **NEVER** expose `STRIPE_SECRET_KEY` to the client  
- **NEVER** expose `GEMINI_API_KEY` to the client
- Always use `NEXT_PUBLIC_` prefix only for client-safe variables

### API Rate Limiting

The `generate-draft` function includes basic rate limiting. For production, consider implementing:
- Redis-based rate limiting
- User-specific quotas
- IP-based restrictions

## 📊 Database Schema

### Core Tables

- **profiles**: User information and roles
- **letters**: Generated legal documents
- **subscriptions**: User subscription plans
- **coupons**: Employee discount codes
- **coupon_usage**: Commission tracking
- **transactions**: Payment records

### Relationships

```
auth.users (1) → (1) profiles
profiles (1) → (many) letters
profiles (1) → (many) subscriptions  
profiles (1) → (many) coupons (for employees)
coupons (1) → (many) coupon_usage
```

## 🎯 User Flows

### User Journey
1. Sign up → Choose "User" role
2. Access dashboard → Fill letter form
3. Generate letter → View timeline
4. Subscribe → Download/preview letters

### Employee Journey  
1. Sign up → Choose "Employee" role
2. Access employee dashboard → Get coupon code
3. Share code → Earn commissions
4. Track performance → View analytics

### Admin Journey
1. Sign in via `/admin-login`
2. Access admin dashboard
3. View user/employee analytics
4. Export reports

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on push

### Deploy to Netlify

1. **Connect repository to Netlify**
2. **Set build command**: `npm run build`
3. **Set publish directory**: `out`
4. **Set environment variables**

### Production Checklist

- [ ] Set up proper domain and SSL
- [ ] Configure Stripe webhook URLs for production
- [ ] Set up monitoring and error tracking
- [ ] Configure backup strategies
- [ ] Set up proper logging
- [ ] Review and test all RLS policies
- [ ] Set up rate limiting
- [ ] Configure CORS properly

## 🧪 Testing

### Test Data

The seed migration includes:
- 1 admin user
- 2 test users (1 subscribed, 1 free)
- 1 employee with coupon codes
- Sample letters in various states

### Test Stripe Integration

Use Stripe's test card numbers:
- Success: `4242424242424242`
- Decline: `4000000000000002`

## 📝 API Documentation

### Edge Functions

#### `/functions/v1/generate-draft`
- **Method**: POST
- **Auth**: Required
- **Body**: Letter form data
- **Returns**: Generated letter object

#### `/functions/v1/create-checkout-session`
- **Method**: POST  
- **Auth**: Required
- **Body**: `{ plan, couponCode, successUrl, cancelUrl }`
- **Returns**: Stripe session URL

#### `/functions/v1/stripe-webhook`
- **Method**: POST
- **Auth**: Stripe signature
- **Body**: Stripe webhook payload
- **Returns**: Success confirmation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation
- Review the troubleshooting section below

## 🔧 Troubleshooting

### Common Issues

**"Unauthorized" errors**:
- Check your Supabase URL and keys
- Verify RLS policies are correctly set
- Ensure user is properly authenticated

**Stripe webhook failures**:
- Verify webhook secret matches
- Check endpoint URL is correct
- Review webhook event types

**AI generation failures**:
- Verify Gemini API key is valid
- Check rate limits
- Review input validation

**Database connection issues**:
- Verify Supabase project is active
- Check connection strings
- Review migration status

### Getting Help

If you encounter issues:

1. **Check the logs**:
   - Supabase: Dashboard → Logs
   - Vercel: Dashboard → Functions → Logs
   - Browser: Developer Console

2. **Verify environment variables**:
   - All required variables are set
   - No typos in variable names
   - Correct API keys and secrets

3. **Test individual components**:
   - Authentication flow
   - Database queries
   - API endpoints
   - Stripe integration

---

**Built with ❤️ for legal professionals and their clients**