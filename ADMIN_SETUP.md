# Admin Panel Setup Guide

This project includes a private admin panel that is protected from public access when deployed.

## Security Features

1. **Admin Access**: Admin users can access the panel from any IP address
2. **IP Whitelisting**: IP restrictions only apply to non-admin users (optional security layer)
3. **Authentication**: Users must be authenticated via Supabase
4. **Authorization**: Users must have admin privileges
5. **404 Response**: Unauthorized access returns 404 (hides admin panel existence)

## Setup

### 1. Environment Variables

Add these to your `.env.local` file:

```env
# Admin Panel Configuration
ADMIN_ALLOWED_IPS=127.0.0.1,::1
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

- `ADMIN_ALLOWED_IPS`: Comma-separated list of IP addresses (production only, optional)
  - Default: `127.0.0.1,::1` (localhost)
  - In development, all IPs are allowed
  - **Note**: Admin users can access from any IP. IP restrictions only apply to non-admin users as an additional security layer
- `ADMIN_EMAILS`: Comma-separated list of admin email addresses
  - Users with these emails will have admin access
  - Alternative: Set `role: 'admin'` or `isAdmin: true` in user metadata

### 2. Create Admin User in Supabase

You have two options:

#### Option A: Set User Metadata (Recommended)

1. Go to Supabase Dashboard → Authentication → Users
2. Find or create your admin user
3. Edit user metadata and add:
   ```json
   {
     "role": "admin"
   }
   ```
   OR
   ```json
   {
     "isAdmin": true
   }
   ```

#### Option B: Use Email List

1. Add your email to `ADMIN_EMAILS` environment variable
2. Sign up/login with that email
3. You'll automatically have admin access

### 3. Access Admin Panel

1. **Development**:
   - Navigate to `http://localhost:3000/admin/login`
   - Login with your admin credentials
   - Access granted from any IP

2. **Production**:
   - Navigate to `https://yourdomain.com/admin/login`
   - **Admin users can access from any IP address**
   - Login with admin credentials
   - Unauthorized access returns 404

## Admin Panel Features

The admin panel (`/admin`) includes:

- **Dashboard**: Overview statistics
- **User Management**: Manage users and permissions (customize as needed)
- **Game Statistics**: View game analytics (customize as needed)
- **System Settings**: Configure system-wide settings (customize as needed)

## Customization

### Adding Admin Features

Edit `components/admin/AdminDashboard.tsx` to add custom admin functionality:

```typescript
// Example: Fetch data from Supabase
const { data, error } = await supabase.from('your_table').select('*');
```

### Customizing Access Control

Edit `lib/admin/auth.ts` to customize admin verification logic:

```typescript
// Add custom admin check logic
async function isAdminUser(): Promise<boolean> {
  // Your custom logic here
}
```

### Protecting Additional Routes

To protect other routes with admin access:

```typescript
import { verifyAdminAccess } from '@/lib/admin/auth';

export default async function ProtectedPage() {
  const { authorized } = await verifyAdminAccess();

  if (!authorized) {
    redirect('/404');
  }

  // Your protected content
}
```

## Security Best Practices

1. **Never commit admin credentials** to version control
2. **Use strong passwords** for admin accounts
3. **Admin users can access from any IP** - ensure only trusted users have admin privileges
4. **Limit ADMIN_ALLOWED_IPS** (optional) - only applies to non-admin users
5. **Regularly audit** admin user list
6. **Use Supabase Row Level Security (RLS)** for database tables
7. **Enable 2FA** for admin accounts in Supabase

## Troubleshooting

### Can't access admin panel in production

- **Admin users can access from any IP** - verify you're logged in with an admin account
- Check browser console for errors
- Verify environment variables are set correctly
- If you're not an admin, check that your IP is in `ADMIN_ALLOWED_IPS` (if IP restrictions are enabled)

### Getting 404 on admin routes

- This is expected behavior for unauthorized access
- Verify your IP is allowed
- Check user has admin role/metadata
- Check environment variables

### Admin login not working

- Verify Supabase credentials are correct
- Check user exists in Supabase
- Verify user has admin metadata or email is in `ADMIN_EMAILS`

## Production Deployment

When deploying to production:

1. Add admin emails to `ADMIN_EMAILS` or set admin role in user metadata
2. **Admin users can access from any IP** - ensure only trusted users have admin privileges
3. Optionally set `ADMIN_ALLOWED_IPS` for additional non-admin IP restrictions
4. Ensure environment variables are set in your hosting platform
5. Test admin access from any IP (for admin users)
6. Monitor access logs for unauthorized attempts

The admin panel will automatically:

- Allow admin users from any IP address
- Require authentication
- Verify admin privileges
- Return 404 for unauthorized access (hiding the panel)
