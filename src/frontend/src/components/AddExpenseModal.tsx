import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddExpense, useGetAllBanks } from "../hooks/useQueries";

const TRANSACTION_TYPES = ["Cash", "Credit Card", "Debit Card", "UPI"];

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExpenseModal({ open, onOpenChange }: AddExpenseModalProps) {
  const { data: banks = [] } = useGetAllBanks();
  const addExpense = useAddExpense();

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [bankId, setBankId] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [takeFrom, setTakeFrom] = useState("");
  const [amount, setAmount] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [notes, setNotes] = useState("");

  const selectedBank = banks.find((b) => b.id === bankId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankId || !transactionType || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await addExpense.mutateAsync({
        date,
        bankId,
        bankName: selectedBank?.name ?? "",
        transactionType,
        amount: Number.parseFloat(amount),
        splitAmount: splitAmount ? Number.parseFloat(splitAmount) : 0,
        notes: notes || null,
        takeFrom: takeFrom || null,
      });
      toast.success("Expense added successfully");
      onOpenChange(false);
      setDate(today);
      setBankId("");
      setTransactionType("");
      setTakeFrom("");
      setAmount("");
      setSplitAmount("");
      setNotes("");
    } catch {
      toast.error("Failed to add expense");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="add_expense.dialog">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="exp-date">Date *</Label>
              <Input
                id="exp-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-ocid="add_expense.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bank *</Label>
              <Select value={bankId} onValueChange={setBankId}>
                <SelectTrigger data-ocid="add_expense.select">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No banks added
                    </SelectItem>
                  ) : (
                    banks.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Transaction Type *</Label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger data-ocid="add_expense.select">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exp-take-from">Take From</Label>
            <Input
              id="exp-take-from"
              type="text"
              value={takeFrom}
              onChange={(e) => setTakeFrom(e.target.value)}
              placeholder="e.g. Wallet, Savings, Cash on hand..."
              data-ocid="add_expense.input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="exp-amount">Amount (₹) *</Label>
              <Input
                id="exp-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                data-ocid="add_expense.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-split">Split Amount (₹)</Label>
              <Input
                id="exp-split"
                type="number"
                min="0"
                step="0.01"
                value={splitAmount}
                onChange={(e) => setSplitAmount(e.target.value)}
                placeholder="0.00"
                data-ocid="add_expense.input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exp-notes">Notes</Label>
            <Textarea
              id="exp-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              data-ocid="add_expense.textarea"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="add_expense.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addExpense.isPending}
              data-ocid="add_expense.submit_button"
            >
              {addExpense.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {addExpense.isPending ? "Saving..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
