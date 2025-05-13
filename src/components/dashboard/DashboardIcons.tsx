import { 
  Building2, Users, Landmark, TagsIcon, 
  CalendarCheck, Clock, Layers, 
  BarChart4, UserCog, Banknote, Star, 
  BellRing, LayoutGrid
} from 'lucide-react';

export const Icons = {
  // Super Admin Icons
  Branches: Building2,
  Users: Users,
  Fields: LayoutGrid,
  Promotions: TagsIcon,
  
  // Admin Cabang Icons
  Bookings: CalendarCheck,
  PendingPayments: Clock,
  Income: Banknote,
  AvailableFields: Layers,
  
  // Owner Cabang Icons
  TotalBranches: Building2,
  Admins: UserCog,
  Revenue: Landmark,
  TotalBookings: BarChart4,
  
  // User Icons
  ActiveBookings: CalendarCheck,
  CompletedBookings: CheckCircle,
  FavoriteField: Star,
  Notifications: BellRing
};

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
} 