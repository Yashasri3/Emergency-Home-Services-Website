import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { UserProfileMenu } from './UserProfileMenu';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { MapPin, Clock, IndianRupee, Phone, Mail, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';

interface WorkerDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

export function WorkerDashboard({ user, profile, onLogout }: WorkerDashboardProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    fetchRequests();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await (window as any).supabase?.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/profile`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkerProfile(data.workerProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await (window as any).supabase?.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/worker-requests`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests.reverse());
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { data: { session } } = await (window as any).supabase?.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/requests/${requestId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        toast.success(`Request ${status} successfully!`);
        fetchRequests();
        setSelectedRequest(null);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl text-blue-600">Worker Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {profile.name}</p>
          </div>
          <UserProfileMenu profile={profile} onLogout={onLogout} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {workerProfile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-2xl">{pendingRequests.length}</p>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl">{acceptedRequests.length}</p>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl">{completedRequests.length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400 fill-yellow-400" />
                  <p className="text-2xl">{workerProfile.rating ? workerProfile.rating.toFixed(1) : 'N/A'}</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Card */}
        {workerProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Services Offered:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {workerProfile.serviceType?.map((service: string) => (
                      <Badge key={service} variant="secondary">
                        {service.replace('-', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rates:</p>
                  <p className="text-sm mt-1">
                    Hourly: ₹{workerProfile.hourlyRate} | Advance: ₹{workerProfile.advancePayment}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience:</p>
                  <p className="text-sm mt-1">{workerProfile.experience || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Times:</p>
                  <p className="text-sm mt-1">{workerProfile.availableTimes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({acceptedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pendingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onAccept={() => updateRequestStatus(request.id, 'accepted')}
                    onReject={() => updateRequestStatus(request.id, 'rejected')}
                    onViewDetails={() => setSelectedRequest(request)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            {acceptedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No active jobs</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {acceptedRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onComplete={() => updateRequestStatus(request.id, 'completed')}
                    onViewDetails={() => setSelectedRequest(request)}
                    isActive
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No completed jobs yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {completedRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onViewDetails={() => setSelectedRequest(request)}
                    isCompleted
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Request Details Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription>Complete information about this service request</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{selectedRequest.userName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{selectedRequest.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span>{selectedRequest.userPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span>{selectedRequest.userEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm mb-2">Service Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Service Type:</span>
                        <Badge className="ml-2" variant="secondary">
                          {selectedRequest.serviceType.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-gray-600" />
                        <span>Advance: ₹{selectedRequest.advanceAmount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="ml-2">{selectedRequest.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm mb-2">Description</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.description}</p>
                </div>

                <div>
                  <h4 className="text-sm mb-2">Location</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-600 mt-1" />
                    <span>{selectedRequest.location}</span>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600"
                    onClick={() => {
                      const encodedAddress = encodeURIComponent(selectedRequest.location);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                    }}
                  >
                    Open in Google Maps
                  </Button>
                </div>

                <div>
                  <h4 className="text-sm mb-2">Scheduled Time</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>{new Date(selectedRequest.scheduledTime).toLocaleString()}</span>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Status: <Badge className="ml-2">{selectedRequest.status}</Badge>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function RequestCard({ 
  request, 
  onAccept, 
  onReject, 
  onComplete, 
  onViewDetails, 
  isActive, 
  isCompleted 
}: { 
  request: any; 
  onAccept?: () => void; 
  onReject?: () => void; 
  onComplete?: () => void; 
  onViewDetails: () => void; 
  isActive?: boolean; 
  isCompleted?: boolean; 
}) {
  return (
    <Card className={isActive ? 'border-blue-500' : isCompleted ? 'border-green-500' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {request.serviceType.replace('-', ' ').toUpperCase()}
            </CardTitle>
            <CardDescription>Customer: {request.userName}</CardDescription>
          </div>
          <Badge variant={isCompleted ? 'default' : isActive ? 'default' : 'secondary'}>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm line-clamp-2">{request.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="line-clamp-1">{request.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span>{new Date(request.scheduledTime).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gray-600" />
            <span>Advance: ₹{request.advanceAmount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-600" />
            <span>{request.userPhone}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onViewDetails}>
            View Details
          </Button>
          {onAccept && onReject && (
            <>
              <Button className="flex-1" onClick={onAccept}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Button variant="destructive" onClick={onReject}>
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          {onComplete && (
            <Button className="flex-1" onClick={onComplete}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
