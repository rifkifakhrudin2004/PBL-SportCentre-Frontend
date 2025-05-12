// File ini hanya re-export hook useAuth dari context
import { useAuth as useAuthContext } from '@/context/auth/auth.context';

// Menggunakan useAuth dari context
const useAuth = useAuthContext;

export default useAuth; 