import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Wrench, Zap, Wind, Hammer, Leaf, Flame, Shield, Clock, Star, Users } from 'lucide-react';

interface LandingPageProps {
  onLogin: (accessToken: string) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('signup-email') as string;
    const password = formData.get('signup-password') as string;
    const name = formData.get('signup-name') as string;
    const phone = formData.get('signup-phone') as string;
    const role = formData.get('signup-role') as string;

    try {
      // Additional data for workers
      let additionalData: any = {};
      
      if (role === 'worker') {
        const serviceTypes = formData.getAll('service-types');
        const hourlyRate = formData.get('hourly-rate') as string;
        const advancePayment = formData.get('advance-payment') as string;
        const experience = formData.get('experience') as string;
        const bio = formData.get('bio') as string;
        
        additionalData = {
          serviceType: serviceTypes,
          hourlyRate: parseInt(hourlyRate) || 500,
          advancePayment: parseInt(advancePayment) || 200,
          experience,
          bio,
          availableTimes: '9 AM - 6 PM'
        };
      }

      // Call backend signup endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email,
            password,
            name,
            role,
            phone,
            additionalData
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      toast.success('Account created successfully! Please sign in.');
      
      // Switch to login tab
      const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement;
      loginTab?.click();
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('login-email') as string;
    const password = formData.get('login-password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Logged in successfully!');
        onLogin(data.session.access_token);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
      
      toast.success('Redirecting to Google...');
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to login with Google');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl mb-4">Emergency Home Services</h1>
            <p className="text-xl opacity-90">
              Connect with trusted professionals for all your urgent home repair needs
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <Clock className="w-12 h-12 mx-auto mb-3" />
                <h3 className="mb-2">24/7 Availability</h3>
                <p className="text-sm opacity-80">Get help whenever you need it</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-3" />
                <h3 className="mb-2">Verified Workers</h3>
                <p className="text-sm opacity-80">All professionals are verified</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <Star className="w-12 h-12 mx-auto mb-3" />
                <h3 className="mb-2">Rated Services</h3>
                <p className="text-sm opacity-80">Check reviews before booking</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-3" />
                <h3 className="mb-2">Expert Network</h3>
                <p className="text-sm opacity-80">Skilled professionals ready to help</p>
              </CardContent>
            </Card>
          </div>

          {/* Services Offered */}
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-6">Our Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {[
                { icon: Wrench, name: 'Plumber' },
                { icon: Zap, name: 'Electrician' },
                { icon: Wind, name: 'AC Repair' },
                { icon: Hammer, name: 'Carpenter' },
                { icon: Leaf, name: 'Gardener' },
                { icon: Flame, name: 'Gas Repair' },
                { icon: Wrench, name: 'Painter' },
                { icon: Wrench, name: 'Cleaner' },
                { icon: Wrench, name: 'Pest Control' },
                { icon: Wrench, name: 'Appliance' }
              ].map((service, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                  <service.icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{service.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input 
                        id="login-email" 
                        name="login-email"
                        type="email" 
                        placeholder="your@email.com"
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input 
                        id="login-password" 
                        name="login-password"
                        type="password" 
                        placeholder="••••••••"
                        required 
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Login with Google
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Note: Google login requires additional setup in Supabase dashboard
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm onSubmit={handleSignup} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignupForm({ onSubmit, isLoading }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; isLoading: boolean }) {
  const [role, setRole] = useState('user');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const services = [
    'plumber', 'electrician', 'ac-repair', 'carpenter', 'gardener',
    'gas-repair', 'painter', 'cleaner', 'pest-control', 'appliance-repair'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join our platform today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="signup-name">Full Name</Label>
            <Input 
              id="signup-name" 
              name="signup-name"
              type="text" 
              placeholder="John Doe"
              required 
            />
          </div>
          <div>
            <Label htmlFor="signup-email">Email</Label>
            <Input 
              id="signup-email" 
              name="signup-email"
              type="email" 
              placeholder="your@email.com"
              required 
            />
          </div>
          <div>
            <Label htmlFor="signup-phone">Phone Number</Label>
            <Input 
              id="signup-phone" 
              name="signup-phone"
              type="tel" 
              placeholder="+1 234 567 8900"
              required 
            />
          </div>
          <div>
            <Label htmlFor="signup-password">Password</Label>
            <Input 
              id="signup-password" 
              name="signup-password"
              type="password" 
              placeholder="••••••••"
              required 
            />
          </div>
          <div>
            <Label htmlFor="signup-role">I am a</Label>
            <Select name="signup-role" value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User (Need Services)</SelectItem>
                <SelectItem value="worker">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'worker' && (
            <>
              <div>
                <Label>Services You Provide</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {services.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`service-${service}`}
                        name="service-types"
                        value={service}
                        checked={selectedServices.includes(service)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedServices([...selectedServices, service]);
                          } else {
                            setSelectedServices(selectedServices.filter(s => s !== service));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`service-${service}`}
                        className="text-sm cursor-pointer"
                      >
                        {service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourly-rate">Hourly Rate (₹)</Label>
                  <Input 
                    id="hourly-rate" 
                    name="hourly-rate"
                    type="number" 
                    placeholder="500"
                    defaultValue="500"
                  />
                </div>
                <div>
                  <Label htmlFor="advance-payment">Advance Payment (₹)</Label>
                  <Input 
                    id="advance-payment" 
                    name="advance-payment"
                    type="number" 
                    placeholder="200"
                    defaultValue="200"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="experience">Experience (years)</Label>
                <Input 
                  id="experience" 
                  name="experience"
                  type="text" 
                  placeholder="5 years"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio / Description</Label>
                <Input 
                  id="bio" 
                  name="bio"
                  type="text" 
                  placeholder="Tell us about your expertise"
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
