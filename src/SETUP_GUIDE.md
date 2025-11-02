# Emergency Home Services - Setup Guide

## Overview
Your Emergency Home Services platform is now ready! This application connects customers with emergency service providers like plumbers, electricians, AC technicians, and more.

## Features Implemented

### 🔐 Authentication System
- **Email/Password Login & Signup**
- **Google OAuth Integration** (requires setup - see below)
- **Role-Based Access Control** (User, Worker, Admin)

### 👤 User Dashboard
- Browse services by category
- View available workers with ratings
- See worker profiles, rates, and availability
- Book services with advance payment
- Track all service requests
- View request status (pending, accepted, completed)

### 🔧 Worker Dashboard
- View incoming service requests in real-time
- Accept or reject job requests
- View customer details (location, contact, payment info)
- Track active jobs
- Mark jobs as completed
- View earnings and ratings

### 👨‍💼 Admin Dashboard
- View all users and workers
- Monitor all service requests
- Track platform statistics
- View revenue metrics
- Manage user accounts

## How to Use

### For Users (Customers)
1. **Sign Up** as a User
2. **Browse Services** - Select from 10 service categories
3. **Choose a Worker** - View ratings, rates, and availability
4. **Book Service** - Provide details, location, and preferred time
5. **Track Request** - Monitor status in "My Requests" tab

### For Workers (Service Providers)
1. **Sign Up** as a Worker
2. Select **services you provide**
3. Set your **hourly rate** and **advance payment**
4. **Wait for requests** - You'll see them in the "Pending" tab
5. **Accept jobs** - View customer location and details
6. **Complete work** - Mark jobs as complete

### For Admins
1. Sign up with admin role (or modify existing user in database)
2. Access comprehensive dashboard with all platform data
3. Monitor users, workers, and requests
4. Track platform performance

## Google Authentication Setup

⚠️ **Important**: Google login requires additional setup in your Supabase dashboard.

### Steps:
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and enable it
4. Follow the setup guide at: https://supabase.com/docs/guides/auth/social-login/auth-google
5. You'll need to:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs from Supabase
   - Copy Client ID and Client Secret to Supabase

## Service Categories Available

1. **Plumber** - Pipe repairs, leaks, installations
2. **Electrician** - Electrical repairs and installations
3. **AC Repair** - Air conditioning repair and maintenance
4. **Carpenter** - Furniture and wood work
5. **Gardener** - Garden maintenance and landscaping
6. **Gas Repair** - Gas line repairs and installations
7. **Painter** - Interior and exterior painting
8. **House Cleaning** - Deep cleaning services
9. **Pest Control** - Pest elimination services
10. **Appliance Repair** - Home appliance repairs

## Database Structure

The application uses Supabase's key-value store with the following data:

- **Users**: Customer and worker profiles
- **Workers**: Extended profiles for service providers
- **Requests**: Service booking requests
- **Services**: Available service categories

## Security Notes

⚠️ **Important Security Information**:
- This is a **prototype** application for demonstration
- **Not production-ready** for handling real payment data
- Additional security measures needed for production use
- PII (Personally Identifiable Information) should be handled with care
- For production, implement:
  - Proper payment gateway integration (Stripe, Razorpay, etc.)
  - SSL/TLS encryption
  - Data encryption at rest
  - Proper authentication token management
  - Rate limiting and DDoS protection

## Testing the Application

### Create Test Accounts:
1. **Admin Account**: 
   - Email: admin@test.com
   - Password: admin123
   - Role: Admin

2. **Worker Account**:
   - Email: worker@test.com
   - Password: worker123
   - Role: Worker
   - Services: Plumber, Electrician

3. **User Account**:
   - Email: user@test.com
   - Password: user123
   - Role: User

## Next Steps & Improvements

Here are some suggested enhancements:

1. **Payment Integration**: Integrate real payment gateways (Razorpay, Stripe)
2. **Real-time Notifications**: Add push notifications for new requests
3. **Chat System**: Enable direct messaging between users and workers
4. **Worker Verification**: Add document upload and verification system
5. **Review System**: Allow users to rate and review workers after job completion
6. **Advanced Search**: Filter workers by location, price, rating
7. **Calendar Integration**: Show worker availability calendar
8. **Photo Upload**: Allow workers to upload previous work photos
9. **Emergency SOS**: Quick booking for urgent services
10. **Location Services**: Auto-detect user location with GPS

## Support

For any issues or questions, the application includes:
- Toast notifications for user feedback
- Error logging in browser console
- Responsive design for mobile and desktop

---

**Built with**: React, TypeScript, Tailwind CSS, Supabase, Hono
