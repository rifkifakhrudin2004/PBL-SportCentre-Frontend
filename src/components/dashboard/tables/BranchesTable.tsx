import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, MapPin, User } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  adminCount: number;
  fieldCount: number;
}

interface BranchesTableProps {
  branches: Branch[];
  title?: string;
  caption?: string;
  isLoading?: boolean;
}

export function BranchesTable({
  branches,
  title = "Daftar Cabang",
  caption = "Daftar semua cabang yang terdaftar dalam sistem",
  isLoading = false,
}: BranchesTableProps) {
  return (
    <Card className="border shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        
        {isLoading ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-muted-foreground">Tidak ada data cabang</p>
          </div>
        ) : (
          <Table>
            <TableCaption>{caption}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Cabang</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Jumlah Lapangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{branch.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={branch.status === 'active' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-red-100 text-red-700 border-red-200'}>
                      {branch.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" />
                      <span>{branch.adminCount} admin</span>
                    </div>
                  </TableCell>
                  <TableCell>{branch.fieldCount} lapangan</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
} 