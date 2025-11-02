import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function CreateAdminHelper() {
  const createAdminUser = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87815866/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: 'admin@emergency.com',
            password: 'admin123456',
            name: 'Admin User',
            role: 'admin',
            phone: '+1234567890',
            additionalData: {}
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }

      toast.success('Admin user created! Email: admin@emergency.com, Password: admin123456');
      
    } catch (error: any) {
      console.error('Create admin error:', error);
      toast.error(error.message || 'Failed to create admin');
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Quick Admin Setup</CardTitle>
        <CardDescription>
          Create a default admin account for testing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={createAdminUser} className="w-full">
          Create Admin User
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Email: admin@emergency.com<br />
          Password: admin123456
        </p>
      </CardContent>
    </Card>
  );
}
