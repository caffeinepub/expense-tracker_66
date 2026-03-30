import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddExpense, useGetAllBanks } from "../hooks/useQueries";

const TRANSACTION_TYPES = ["Cash", "Credit Card", "Debit Card", "UPI"];

export function AddExpensePage() {
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
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState("");
  const [success, setSuccess] = useState(false);

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
        purpose: purpose || null,
        category: category || null,
      });
      toast.success("Expense added successfully!");
      setSuccess(true);
      setDate(today);
      setBankId("");
      setTransactionType("");
      setTakeFrom("");
      setAmount("");
      setSplitAmount("");
      setNotes("");
      setPurpose("");
      setCategory("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      toast.error("Failed to add expense");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-foreground">Add Expense</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Record a new expense entry
        </p>
      </motion.div>

      <div className="max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Expense Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="page-date">Date *</Label>
                    <Input
                      id="page-date"
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
                            No banks — add one first
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
                  <Select
                    value={transactionType}
                    onValueChange={setTransactionType}
                  >
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
                  <Label htmlFor="page-take-from">Take From</Label>
                  <Input
                    id="page-take-from"
                    type="text"
                    value={takeFrom}
                    onChange={(e) => setTakeFrom(e.target.value)}
                    placeholder="e.g. Wallet, Savings, Cash on hand..."
                    data-ocid="add_expense.input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="page-amount">Amount (₹) *</Label>
                    <Input
                      id="page-amount"
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
                    <Label htmlFor="page-split">Split Amount (₹)</Label>
                    <Input
                      id="page-split"
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
                  <Label htmlFor="page-notes">Notes</Label>
                  <Textarea
                    id="page-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes..."
                    rows={3}
                    data-ocid="add_expense.textarea"
                  />
                </div>

                {/* Optional fields */}
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Optional Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="page-purpose">
                        Purpose{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="page-purpose"
                        type="text"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="e.g. Groceries, Rent..."
                        data-ocid="add_expense.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="page-category">
                        Category{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="page-category"
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Food, Housing..."
                        data-ocid="add_expense.input"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={addExpense.isPending}
                    className="gap-2"
                    data-ocid="add_expense.submit_button"
                  >
                    {addExpense.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {addExpense.isPending ? "Saving..." : "Add Expense"}
                  </Button>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 text-emerald-600 text-sm"
                      data-ocid="add_expense.success_state"
                    >
                      <CheckCircle2 size={16} />
                      Expense saved!
                    </motion.div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
