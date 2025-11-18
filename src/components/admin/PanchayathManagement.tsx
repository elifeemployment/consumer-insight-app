import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Panchayath {
  id: string;
  name: string;
  name_ml: string | null;
  ward_count: number;
}

const PanchayathManagement = () => {
  const [panchayaths, setPanchayaths] = useState<Panchayath[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_ml: "",
    ward_count: 1,
  });

  useEffect(() => {
    fetchPanchayaths();
  }, []);

  const fetchPanchayaths = async () => {
    try {
      const { data, error } = await supabase
        .from("panchayaths")
        .select("*")
        .order("name");

      if (error) throw error;
      setPanchayaths(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch panchayaths");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editMode && currentId) {
        const { error } = await supabase
          .from("panchayaths")
          .update(formData)
          .eq("id", currentId);

        if (error) throw error;
        toast.success("Panchayath updated successfully");
      } else {
        const { error } = await supabase
          .from("panchayaths")
          .insert([formData]);

        if (error) throw error;
        toast.success("Panchayath added successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchPanchayaths();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (panchayath: Panchayath) => {
    setEditMode(true);
    setCurrentId(panchayath.id);
    setFormData({
      name: panchayath.name,
      name_ml: panchayath.name_ml || "",
      ward_count: panchayath.ward_count,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this panchayath?")) return;

    try {
      const { error } = await supabase
        .from("panchayaths")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Panchayath deleted successfully");
      fetchPanchayaths();
    } catch (error: any) {
      toast.error("Failed to delete panchayath");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", name_ml: "", ward_count: 1 });
    setEditMode(false);
    setCurrentId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Panchayath Management</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Panchayath
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit" : "Add"} Panchayath</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Name (English)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Name (Malayalam)"
                  value={formData.name_ml}
                  onChange={(e) => setFormData({ ...formData, name_ml: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Ward Count"
                  value={formData.ward_count}
                  onChange={(e) => setFormData({ ...formData, ward_count: parseInt(e.target.value) })}
                  min={1}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editMode ? "Update" : "Add"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Name (ML)</TableHead>
              <TableHead>Wards</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {panchayaths.map((panchayath) => (
              <TableRow key={panchayath.id}>
                <TableCell>{panchayath.name}</TableCell>
                <TableCell>{panchayath.name_ml || "-"}</TableCell>
                <TableCell>{panchayath.ward_count}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(panchayath)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(panchayath.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PanchayathManagement;
