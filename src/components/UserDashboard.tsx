import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserProfileMenu } from './UserProfileMenu';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Wrench, Zap, Wind, Hammer, Leaf, Flame, Paintbrush, Sparkles, Bug, Settings, Star, MapPin, Clock, IndianRupee } from 'lucide-react';

interface UserDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

export function UserDashboard({ user, profile, onLogout }: UserDashboardProps) {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchMyRequests();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/services`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const fetchWorkers = async (serviceType: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/workers/${serviceType}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkers(data.workers);
        setSelectedService(serviceType);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data: { session } } = await (window as any).supabase?.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/my-requests`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMyRequests(data.requests.reverse());
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const getServiceIcon = (serviceId: string) => {
    const icons: any = {
      'plumber': Wrench,
      'electrician': Zap,
      'ac-repair': Wind,
      'carpenter': Hammer,
      'gardener': Leaf,
      'gas-repair': Flame,
      'painter': Paintbrush,
      'cleaner': Sparkles,
      'pest-control': Bug,
      'appliance-repair': Settings,
    };
    return icons[serviceId] || Wrench;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl text-blue-600">Emergency Home Services</h1>
            <p className="text-sm text-gray-600">Welcome, {profile.name}</p>
          </div>
          <UserProfileMenu profile={profile} onLogout={onLogout} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="services">Browse Services</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            {!selectedService ? (
              <>
                <h2 className="text-2xl mb-6">Select a Service</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {services.map((service) => {
                    const Icon = getServiceIcon(service.id);
                    return (
                      <Card
                        key={service.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => fetchWorkers(service.id)}
                      >
                        <CardContent className="pt-6 text-center">
                          <Icon className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                          <h3 className="mb-1">{service.name}</h3>
                          <p className="text-xs text-gray-600">{service.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl">
                    Available {services.find(s => s.id === selectedService)?.name}s
                  </h2>
                  <Button variant="outline" onClick={() => setSelectedService(null)}>
                    Back to Services
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : workers.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-600">No workers available for this service yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workers.map((worker) => (
                      <WorkerCard 
                        key={worker.id} 
                        worker={worker} 
                        onRequestSubmitted={fetchMyRequests}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <h2 className="text-2xl mb-6">My Service Requests</h2>
            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">You haven't made any requests yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function WorkerCard({ worker, onRequestSubmitted }: { worker: any; onRequestSubmitted: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const scheduledTime = formData.get('scheduled-time') as string;
    const paymentMethod = formData.get('payment-method') as string;

    try {
      const { data: { session } } = await (window as any).supabase?.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            workerId: worker.id,
            serviceType: worker.serviceType[0],
            description,
            location,
            scheduledTime,
            paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create request');
      }

      toast.success('Request sent successfully!');
      setIsOpen(false);
      onRequestSubmitted();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{worker.name?.charAt(0) || 'W'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{worker.name}</CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">
                  {worker.rating ? worker.rating.toFixed(1) : 'New'} 
                  {worker.totalRatings > 0 && ` (${worker.totalRatings})`}
                </span>
              </div>
            </div>
          </div>
          {worker.verified && (
            <Badge variant="secondary">Verified</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-gray-600 mb-2">{worker.bio || 'Professional service provider'}</p>
          {worker.experience && (
            <p className="text-sm text-gray-600">Experience: {worker.experience}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Hourly Rate:</span>
            <span className="flex items-center">
              <IndianRupee className="w-4 h-4" />
              {worker.hourlyRate}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Advance Payment:</span>
            <span className="flex items-center">
              <IndianRupee className="w-4 h-4" />
              {worker.advancePayment}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-600" />
            <span>{worker.availableTimes}</span>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Book Now</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book {worker.name}</DialogTitle>
              <DialogDescription>
                Fill in the details to request this service
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <Label htmlFor="description">Service Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the work needed..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Your Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Full address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="scheduled-time">Preferred Date & Time</Label>
                <Input
                  id="scheduled-time"
                  name="scheduled-time"
                  type="datetime-local"
                  required
                />
              </div>
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select name="payment-method" defaultValue="cash" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm">
                  Advance Payment: <span>₹{worker.advancePayment}</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Payment will be processed after worker confirms
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Request...' : 'Send Request'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function RequestCard({ request }: { request: any }) {
  const getStatusColor = (status: string) => {
    const colors: any = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{request.serviceType.replace('-', ' ').toUpperCase()}</CardTitle>
            <CardDescription>Worker: {request.workerName}</CardDescription>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{request.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span>{request.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span>{new Date(request.scheduledTime).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gray-600" />
            <span>Advance: ₹{request.advanceAmount}</span>
          </div>
        </div>
        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500">
            Requested on: {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
