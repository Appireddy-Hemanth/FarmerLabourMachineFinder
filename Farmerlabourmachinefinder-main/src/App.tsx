import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { FarmerDashboard } from './components/FarmerDashboard';
import { LabourerDashboard } from './components/LabourerDashboard';
import { MachineDashboard } from './components/MachineDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Chatbot } from './components/Chatbot';

export interface User {
  id: string;
  name: string;
  role: 'farmer' | 'labourer' | 'machine_owner' | 'admin';
  phone: string;
  village: string;
  password: string;
  skills?: string[];
  machines?: Machine[];
}

export interface Job {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerPhone: string;
  workType: string;
  location: string;
  date: string;
  duration: string;
  payment: number;
  status: 'posted' | 'accepted' | 'completed';
  acceptedBy?: string;
  acceptedByName?: string;
  description?: string;
  postedAt?: number;
  negotiatedPrice?: number;
  workPhotos?: string[];
  toolsRequired?: string[];
  toolsProvidedBy?: 'Labour' | 'Farmer' | 'Machine Owner';
  toolConfirmed?: boolean;
  attachments?: string[];
}

export interface Machine {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerVillage: string;
  ownerPhone: string;
  machineType: string;
  price: number;
  priceUnit: 'hour' | 'day';
  availability: boolean;
  description?: string;
}

export interface MachineRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  machineId: string;
  machineType: string;
  ownerId: string;
  location: string;
  date: string;
  duration: string;
  status: 'pending' | 'accepted' | 'completed';
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Load current user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Initialize with demo data if first time
    const users = localStorage.getItem('users');
    if (!users) {
      initializeDemoData();
    } else {
      // Ensure admin demo account exists
      const parsed: User[] = JSON.parse(users);
      const hasAdmin = parsed.some(u => u.role === 'admin');
      if (!hasAdmin) {
        parsed.push({
          id: '5',
          name: 'Admin Panel',
          role: 'admin',
          phone: '9000000000',
          village: 'HQ',
          password: 'admin123'
        });
        localStorage.setItem('users', JSON.stringify(parsed));
      }
    }
  }, []);

  const initializeDemoData = () => {
    // Demo users
    const demoUsers: User[] = [
      {
        id: '1',
        name: 'Ravi Kumar',
        role: 'farmer',
        phone: '9876543210',
        village: 'Anantapur',
        password: 'farmer123'
      },
      {
        id: '2',
        name: 'Suresh Reddy',
        role: 'labourer',
        phone: '9876543211',
        village: 'Anantapur',
        password: 'labourer123',
        skills: ['Ploughing', 'Harvesting', 'Sowing']
      },
      {
        id: '3',
        name: 'Lakshmi Devi',
        role: 'labourer',
        phone: '9876543212',
        village: 'Kurnool',
        password: 'labourer123',
        skills: ['Harvesting', 'Weeding']
      },
      {
        id: '4',
        name: 'Prasad Rao',
        role: 'machine_owner',
        phone: '9876543213',
        village: 'Anantapur',
        password: 'machine123'
      },
      {
        id: '5',
        name: 'Admin Panel',
        role: 'admin',
        phone: '9000000000',
        village: 'HQ',
        password: 'admin123'
      }
    ];

    // Demo jobs
    const demoJobs: Job[] = [
      {
        id: '1',
        farmerId: '1',
        farmerName: 'Ravi Kumar',
        farmerVillage: 'Anantapur',
        farmerPhone: '9876543210',
        workType: 'Ploughing',
        location: 'Anantapur',
        date: '2026-02-10',
        duration: '2 days',
        payment: 2000,
        status: 'posted',
        description: 'Need ploughing for 5 acres of land'
        ,
        postedAt: Date.now() - 1000 * 60 * 60 * 8
      },
      {
        id: '2',
        farmerId: '1',
        farmerName: 'Ravi Kumar',
        farmerVillage: 'Anantapur',
        farmerPhone: '9876543210',
        workType: 'Harvesting',
        location: 'Anantapur',
        date: '2026-02-15',
        duration: '3 days',
        payment: 3500,
        status: 'posted',
        description: 'Harvesting cotton crop'
        ,
        postedAt: Date.now() - 1000 * 60 * 60 * 2
      }
    ];

    // Demo machines
    const demoMachines: Machine[] = [
      {
        id: '1',
        ownerId: '4',
        ownerName: 'Prasad Rao',
        ownerVillage: 'Anantapur',
        ownerPhone: '9876543213',
        machineType: 'Tractor',
        price: 500,
        priceUnit: 'hour',
        availability: true,
        description: 'John Deere 5050D, 50 HP'
      },
      {
        id: '2',
        ownerId: '4',
        ownerName: 'Prasad Rao',
        ownerVillage: 'Anantapur',
        ownerPhone: '9876543213',
        machineType: 'Harvester',
        price: 3000,
        priceUnit: 'day',
        availability: true,
        description: 'Combine harvester for wheat and rice'
      }
    ];

    localStorage.setItem('users', JSON.stringify(demoUsers));
    localStorage.setItem('jobs', JSON.stringify(demoJobs));
    localStorage.setItem('machines', JSON.stringify(demoMachines));
    localStorage.setItem('machineRequests', JSON.stringify([]));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser.role === 'farmer' && (
        <FarmerDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.role === 'labourer' && (
        <LabourerDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.role === 'machine_owner' && (
        <MachineDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.role === 'admin' && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}
      <Chatbot currentUser={currentUser} />
    </div>
  );
}

export default App;
