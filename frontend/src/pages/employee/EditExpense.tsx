import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const categories = ["Meals", "Travel", "Supplies", "Events", "Software", "Equipment", "Other"];
const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"];

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ 
    amount: "", 
    currency: "USD", 
    category: "", 
    date: "", 
    description: "" 
  });

  // Today's date for the date lock (max date)
  const today = new Date().toISOString().split("T")[0];

  // Fetch existing expense data
  const { data: expenseRes, isLoading: isFetching } = useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const res = await api.get(`/expenses`); // We should ideally have a getById, but let's filter from list if missing
      const expense = res.data.data.find((e: any) => e._id === id);
      return expense;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (expenseRes) {
      setForm({
        amount: String(expenseRes.amount),
        currency: expenseRes.currency || "USD",
        category: expenseRes.category || "",
        date: expenseRes.date ? new Date(expenseRes.date).toISOString().split("T")[0] : "",
        description: expenseRes.description || ""
      });
    }
  }, [expenseRes]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put(`/expenses/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "Expense updated", description: "Changes have been saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      navigate("/employee/dashboard");
    },
    onError: (err: any) => {
      toast({ 
        title: "Update failed", 
        description: err.response?.data?.message || err.message, 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      ...form,
      amount: parseFloat(form.amount)
    });
  };

  if (isFetching) {
    return (
      <DashboardLayout allowedRoles={["employee"]}>
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={["employee"]}>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Edit Expense</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                value={form.amount} 
                onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                required 
                className="mt-1.5" 
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date (Future dates disabled)</Label>
              <Input 
                id="date" 
                type="date" 
                max={today}
                value={form.date} 
                onChange={(e) => setForm({ ...form, date: e.target.value })} 
                required 
                className="mt-1.5" 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="mt-1.5" 
              rows={3} 
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={updateMutation.isPending} className="min-w-32">
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
