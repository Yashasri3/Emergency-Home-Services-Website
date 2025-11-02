import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase clients
const getServiceClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const getAnonClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Helper function to verify user
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Health check endpoint
app.get("/make-server-87815866/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-87815866/signup", async (c) => {
  try {
    const { email, password, name, role, phone, additionalData } = await c.req.json();
    
    const supabase = getServiceClient();
    
    // Create user with Supabase auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: role || 'user' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: role || 'user',
      phone: phone || '',
      address: additionalData?.address || '',
      createdAt: new Date().toISOString()
    });
    
    // If role is worker, create worker profile
    if (role === 'worker') {
      await kv.set(`worker:${data.user.id}`, {
        id: data.user.id,
        userId: data.user.id,
        name,
        email,
        phone: phone || '',
        serviceType: additionalData?.serviceType || [],
        rating: 0,
        totalRatings: 0,
        hourlyRate: additionalData?.hourlyRate || 500,
        advancePayment: additionalData?.advancePayment || 200,
        availableTimes: additionalData?.availableTimes || '9 AM - 6 PM',
        previousWorks: [],
        bio: additionalData?.bio || '',
        experience: additionalData?.experience || '',
        location: additionalData?.location || '',
        verified: false,
        createdAt: new Date().toISOString()
      });
      
      // Add to workers index
      const workersIndex = await kv.get('workers:index') || [];
      workersIndex.push(data.user.id);
      await kv.set('workers:index', workersIndex);
    }
    
    // Add to users index
    const usersIndex = await kv.get('users:index') || [];
    usersIndex.push(data.user.id);
    await kv.set('users:index', usersIndex);
    
    return c.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email: data.user.email,
        role: role || 'user'
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to sign up' }, 500);
  }
});

// Get user profile
app.get("/make-server-87815866/profile", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    // If user is a worker, also get worker profile
    let workerProfile = null;
    if (profile.role === 'worker') {
      workerProfile = await kv.get(`worker:${user.id}`);
    }
    
    return c.json({ profile, workerProfile });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// Get all service categories
app.get("/make-server-87815866/services", async (c) => {
  try {
    let services = await kv.get('services:categories');
    
    // Initialize default services if not exists
    if (!services) {
      services = [
        { id: 'plumber', name: 'Plumber', icon: 'wrench', description: 'Pipe repairs, leaks, installations' },
        { id: 'electrician', name: 'Electrician', icon: 'zap', description: 'Electrical repairs and installations' },
        { id: 'ac-repair', name: 'AC Repair', icon: 'wind', description: 'Air conditioning repair and maintenance' },
        { id: 'carpenter', name: 'Carpenter', icon: 'hammer', description: 'Furniture and wood work' },
        { id: 'gardener', name: 'Gardener', icon: 'leaf', description: 'Garden maintenance and landscaping' },
        { id: 'gas-repair', name: 'Gas Repair', icon: 'flame', description: 'Gas line repairs and installations' },
        { id: 'painter', name: 'Painter', icon: 'paintbrush', description: 'Interior and exterior painting' },
        { id: 'cleaner', name: 'House Cleaning', icon: 'sparkles', description: 'Deep cleaning services' },
        { id: 'pest-control', name: 'Pest Control', icon: 'bug', description: 'Pest elimination services' },
        { id: 'appliance-repair', name: 'Appliance Repair', icon: 'settings', description: 'Home appliance repairs' }
      ];
      await kv.set('services:categories', services);
    }
    
    return c.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    return c.json({ error: 'Failed to get services' }, 500);
  }
});

// Get workers by service type
app.get("/make-server-87815866/workers/:serviceType", async (c) => {
  try {
    const serviceType = c.req.param('serviceType');
    const workersIndex = await kv.get('workers:index') || [];
    
    const workers = [];
    for (const workerId of workersIndex) {
      const worker = await kv.get(`worker:${workerId}`);
      if (worker && worker.serviceType && worker.serviceType.includes(serviceType)) {
        workers.push(worker);
      }
    }
    
    return c.json({ workers });
  } catch (error) {
    console.error('Get workers error:', error);
    return c.json({ error: 'Failed to get workers' }, 500);
  }
});

// Get all workers (for admin)
app.get("/make-server-87815866/workers", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const workersIndex = await kv.get('workers:index') || [];
    const workers = [];
    
    for (const workerId of workersIndex) {
      const worker = await kv.get(`worker:${workerId}`);
      if (worker) {
        workers.push(worker);
      }
    }
    
    return c.json({ workers });
  } catch (error) {
    console.error('Get all workers error:', error);
    return c.json({ error: 'Failed to get workers' }, 500);
  }
});

// Create service request
app.post("/make-server-87815866/requests", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { workerId, serviceType, description, location, scheduledTime, paymentMethod } = await c.req.json();
    
    const userProfile = await kv.get(`user:${user.id}`);
    const worker = await kv.get(`worker:${workerId}`);
    
    if (!worker) {
      return c.json({ error: 'Worker not found' }, 404);
    }
    
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request = {
      id: requestId,
      userId: user.id,
      userName: userProfile.name,
      userPhone: userProfile.phone,
      userEmail: userProfile.email,
      workerId,
      workerName: worker.name,
      serviceType,
      description,
      location,
      scheduledTime,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      advanceAmount: worker.advancePayment,
      totalAmount: worker.hourlyRate,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`request:${requestId}`, request);
    
    // Add to user's requests
    const userRequests = await kv.get(`user:${user.id}:requests`) || [];
    userRequests.push(requestId);
    await kv.set(`user:${user.id}:requests`, userRequests);
    
    // Add to worker's requests
    const workerRequests = await kv.get(`worker:${workerId}:requests`) || [];
    workerRequests.push(requestId);
    await kv.set(`worker:${workerId}:requests`, workerRequests);
    
    return c.json({ success: true, request });
  } catch (error) {
    console.error('Create request error:', error);
    return c.json({ error: 'Failed to create request' }, 500);
  }
});

// Get user requests
app.get("/make-server-87815866/my-requests", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const requestIds = await kv.get(`user:${user.id}:requests`) || [];
    const requests = [];
    
    for (const requestId of requestIds) {
      const request = await kv.get(`request:${requestId}`);
      if (request) {
        requests.push(request);
      }
    }
    
    return c.json({ requests });
  } catch (error) {
    console.error('Get requests error:', error);
    return c.json({ error: 'Failed to get requests' }, 500);
  }
});

// Get worker requests
app.get("/make-server-87815866/worker-requests", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'worker') {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const requestIds = await kv.get(`worker:${user.id}:requests`) || [];
    const requests = [];
    
    for (const requestId of requestIds) {
      const request = await kv.get(`request:${requestId}`);
      if (request) {
        requests.push(request);
      }
    }
    
    return c.json({ requests });
  } catch (error) {
    console.error('Get worker requests error:', error);
    return c.json({ error: 'Failed to get worker requests' }, 500);
  }
});

// Update request status (worker accepting/rejecting)
app.put("/make-server-87815866/requests/:requestId/status", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const requestId = c.req.param('requestId');
    const { status } = await c.req.json();
    
    const request = await kv.get(`request:${requestId}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }
    
    if (request.workerId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    request.status = status;
    request.updatedAt = new Date().toISOString();
    
    if (status === 'accepted') {
      request.acceptedAt = new Date().toISOString();
    } else if (status === 'completed') {
      request.completedAt = new Date().toISOString();
    }
    
    await kv.set(`request:${requestId}`, request);
    
    return c.json({ success: true, request });
  } catch (error) {
    console.error('Update request status error:', error);
    return c.json({ error: 'Failed to update request status' }, 500);
  }
});

// Update payment status
app.put("/make-server-87815866/requests/:requestId/payment", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const requestId = c.req.param('requestId');
    const { paymentStatus } = await c.req.json();
    
    const request = await kv.get(`request:${requestId}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }
    
    if (request.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    request.paymentStatus = paymentStatus;
    request.updatedAt = new Date().toISOString();
    
    await kv.set(`request:${requestId}`, request);
    
    return c.json({ success: true, request });
  } catch (error) {
    console.error('Update payment status error:', error);
    return c.json({ error: 'Failed to update payment status' }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-87815866/users", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const usersIndex = await kv.get('users:index') || [];
    const users = [];
    
    for (const userId of usersIndex) {
      const userProfile = await kv.get(`user:${userId}`);
      if (userProfile) {
        users.push(userProfile);
      }
    }
    
    return c.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    return c.json({ error: 'Failed to get users' }, 500);
  }
});

// Get all requests (admin only)
app.get("/make-server-87815866/all-requests", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const requests = await kv.getByPrefix('request:');
    
    return c.json({ requests });
  } catch (error) {
    console.error('Get all requests error:', error);
    return c.json({ error: 'Failed to get all requests' }, 500);
  }
});

// Add rating to worker
app.post("/make-server-87815866/workers/:workerId/rating", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const workerId = c.req.param('workerId');
    const { rating, review } = await c.req.json();
    
    const worker = await kv.get(`worker:${workerId}`);
    if (!worker) {
      return c.json({ error: 'Worker not found' }, 404);
    }
    
    // Calculate new rating
    const totalRatings = (worker.totalRatings || 0) + 1;
    const currentTotal = (worker.rating || 0) * (worker.totalRatings || 0);
    const newRating = (currentTotal + rating) / totalRatings;
    
    worker.rating = newRating;
    worker.totalRatings = totalRatings;
    
    if (!worker.reviews) {
      worker.reviews = [];
    }
    
    worker.reviews.push({
      userId: user.id,
      rating,
      review,
      createdAt: new Date().toISOString()
    });
    
    await kv.set(`worker:${workerId}`, worker);
    
    return c.json({ success: true, worker });
  } catch (error) {
    console.error('Add rating error:', error);
    return c.json({ error: 'Failed to add rating' }, 500);
  }
});

Deno.serve(app.fetch);
