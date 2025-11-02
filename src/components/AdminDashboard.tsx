import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { UserProfileMenu } from './UserProfileMenu';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Users, Briefcase, FileText, TrendingUp, Star, Phone, Mail } from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

export function AdminDashboard({ user, profile, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await (window as any).supabase?.auth.getSession();
      if (!session) return;

      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
      };

      // Fetch users
      const usersResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/users`,
        { headers }
      );

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      // Fetch workers
      const workersResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/workers`,
        { headers }
      );

      if (workersResponse.ok) {
        const workersData = await workersResponse.json();
        setWorkers(workersData.workers);
      }

      // Fetch all requests
      const requestsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/all-requests`,
        { headers }
      );

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setRequests(requestsData.requests);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const regularUsers = users.filter(u => u.role === 'user');
  const workerUsers = users.filter(u => u.role === 'worker');
  const adminUsers = users.filter(u => u.role === 'admin');

  const totalRevenue = requests
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.advanceAmount || 0), 0);

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const activeRequests = requests.filter(r => r.status === 'accepted').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl text-blue-600">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {profile.name}</p>
          </div>
          <UserProfileMenu profile={profile} onLogout={onLogout} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl">{regularUsers.length}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Workers</p>
                  <p className="text-2xl">{workers.length}</p>
                </div>
                <Briefcase className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl">{requests.length}</p>
                </div>
                <FileText className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl">₹{totalRevenue}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl text-yellow-600">{pendingRequests}</p>
                <p className="text-sm text-gray-600 mt-1">Pending Requests</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl text-blue-600">{activeRequests}</p>
                <p className="text-sm text-gray-600 mt-1">Active Jobs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl text-green-600">{completedRequests}</p>
                <p className="text-sm text-gray-600 mt-1">Completed Jobs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="users">Users ({regularUsers.length})</TabsTrigger>
            <TabsTrigger value="workers">Workers ({workers.length})</TabsTrigger>
            <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>List of all registered customers</CardDescription>
              </CardHeader>
              <CardContent>
                {regularUsers.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No users registered yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regularUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {user.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {user.phone || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Workers</CardTitle>
                <CardDescription>List of all registered service providers</CardDescription>
              </CardHeader>
              <CardContent>
                {workers.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No workers registered yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Services</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Hourly Rate</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workers.map((worker) => (
                          <TableRow key={worker.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{worker.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p>{worker.name}</p>
                                  <p className="text-xs text-gray-500">{worker.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {worker.serviceType?.slice(0, 2).map((service: string) => (
                                  <Badge key={service} variant="secondary" className="text-xs">
                                    {service.replace('-', ' ')}
                                  </Badge>
                                ))}
                                {worker.serviceType?.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{worker.serviceType.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{worker.rating ? worker.rating.toFixed(1) : 'New'}</span>
                                {worker.totalRatings > 0 && (
                                  <span className="text-xs text-gray-500">({worker.totalRatings})</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>₹{worker.hourlyRate}</TableCell>
                            <TableCell>
                              <Badge variant={worker.verified ? 'default' : 'secondary'}>
                                {worker.verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>Complete list of service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No requests yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Worker</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.slice(0, 50).reverse().map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {request.serviceType?.replace('-', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>{request.userName}</TableCell>
                            <TableCell>{request.workerName}</TableCell>
                            <TableCell>₹{request.advanceAmount}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  request.status === 'completed'
                                    ? 'default'
                                    : request.status === 'accepted'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
