import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Pencil,
  PlusCircle,
  Receipt,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { Expense } from "../backend.d";
import { AddExpenseModal } from "../components/AddExpenseModal";
import {
  useDeleteExpense,
  useGetAllBanks,
  useGetAllExpenses,
  useGetTotalSummary,
  useUpdateExpense,
} from "../hooks/useQueries";

const TRANSACTION_TYPES = ["Cash", "Credit Card", "Debit Card", "UPI"];
const CHART_COLORS = [
  "#2D5BFF",
  "#10B981",
  "#1E3A8A",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

const txBadgeColor: Record<string, string> = {
  Cash: "bg-emerald-100 text-emerald-700",
  "Credit Card": "bg-blue-100 text-blue-700",
  "Debit Card": "bg-violet-100 text-violet-700",
  UPI: "bg-orange-100 text-orange-700",
};

function exportToCSV(expenses: Expense[] | undefined) {
  const rows = expenses ?? [];
  const headers = [
    "Date",
    "Bank",
    "Transaction Type",
    "Take From",
    "Amount",
    "Split Amount",
    "Notes",
    "Purpose",
    "Category",
  ];
  const csvRows = [
    headers.join(","),
    ...rows.map((e) =>
      [
        e.date,
        `"${e.bankName.replace(/"/g, '""')}"`,
        `"${e.transactionType.replace(/"/g, '""')}"`,
        `"${(e.takeFrom ?? "").replace(/"/g, '""')}"`,
        e.amount,
        e.splitAmount,
        `"${(e.notes ?? "").replace(/"/g, '""')}"`,
        `"${(e.purpose ?? "").replace(/"/g, '""')}"`,
        `"${(e.category ?? "").replace(/"/g, '""')}"`,
      ].join(","),
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface EditFormProps {
  expense: Expense;
  banks: { id: string; name: string }[];
  onClose: () => void;
}

function EditExpenseForm({ expense, banks, onClose }: EditFormProps) {
  const updateExpense = useUpdateExpense();

  const [date, setDate] = useState(expense.date);
  const [bankId, setBankId] = useState(expense.bankId);
  const [transactionType, setTransactionType] = useState(
    expense.transactionType,
  );
  const [takeFrom, setTakeFrom] = useState(expense.takeFrom ?? "");
  const [amount, setAmount] = useState(String(expense.amount));
  const [splitAmount, setSplitAmount] = useState(
    expense.splitAmount ? String(expense.splitAmount) : "",
  );
  const [notes, setNotes] = useState(expense.notes ?? "");
  const [purpose, setPurpose] = useState(expense.purpose ?? "");
  const [category, setCategory] = useState(expense.category ?? "");

  const selectedBank = banks.find((b) => b.id === bankId);

  const handleSave = async () => {
    if (!bankId || !transactionType || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await updateExpense.mutateAsync({
        expenseId: expense.id,
        updates: {
          date,
          bankId,
          bankName: selectedBank?.name ?? expense.bankName,
          transactionType,
          amount: Number.parseFloat(amount),
          splitAmount: splitAmount ? Number.parseFloat(splitAmount) : 0,
          notes: notes || undefined,
          takeFrom: takeFrom || undefined,
          purpose: purpose || undefined,
          category: category || undefined,
        },
      });
      toast.success("Expense updated");
      onClose();
    } catch {
      toast.error("Failed to update expense");
    }
  };

  return (
    <>
      <div className="space-y-4 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-date">Date *</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-ocid="edit_expense.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bank *</Label>
            <Select value={bankId} onValueChange={setBankId}>
              <SelectTrigger data-ocid="edit_expense.select">
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Transaction Type *</Label>
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger data-ocid="edit_expense.select">
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
          <Label htmlFor="edit-take-from">Take From</Label>
          <Input
            id="edit-take-from"
            type="text"
            value={takeFrom}
            onChange={(e) => setTakeFrom(e.target.value)}
            placeholder="e.g. Wallet, Savings..."
            data-ocid="edit_expense.input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-amount">Amount (₹) *</Label>
            <Input
              id="edit-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              data-ocid="edit_expense.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-split">Split Amount (₹)</Label>
            <Input
              id="edit-split"
              type="number"
              min="0"
              step="0.01"
              value={splitAmount}
              onChange={(e) => setSplitAmount(e.target.value)}
              placeholder="0.00"
              data-ocid="edit_expense.input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-notes">Notes</Label>
          <Textarea
            id="edit-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            rows={2}
            data-ocid="edit_expense.textarea"
          />
        </div>

        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Optional Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-purpose">
                Purpose{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                id="edit-purpose"
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Groceries..."
                data-ocid="edit_expense.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-category">
                Category{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                id="edit-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Food..."
                data-ocid="edit_expense.input"
              />
            </div>
          </div>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button
          variant="outline"
          onClick={onClose}
          data-ocid="edit_expense.cancel_button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={updateExpense.isPending}
          data-ocid="edit_expense.save_button"
        >
          {updateExpense.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

interface EditDialogProps {
  expense: Expense | null;
  banks: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditExpenseDialog({
  expense,
  banks,
  open,
  onOpenChange,
}: EditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="edit_expense.dialog"
      >
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        {expense && (
          <EditExpenseForm
            key={expense.id.toString()}
            expense={expense}
            banks={banks}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function Dashboard({ onAddExpense }: { onAddExpense: () => void }) {
  const { data: expenses = [], isLoading: expLoading } = useGetAllExpenses();
  const { data: summary, isLoading: sumLoading } = useGetTotalSummary();
  const { data: banks = [] } = useGetAllBanks();
  const deleteExpense = useDeleteExpense();

  const [filterBank, setFilterBank] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const thisMonth = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return expenses
      .filter((e) => e.date.startsWith(ym))
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => filterBank === "all" || e.bankId === filterBank)
      .filter((e) => filterType === "all" || e.transactionType === filterType)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [expenses, filterBank, filterType]);

  const bankChartData = useMemo(() => {
    return (summary?.bankSummaries ?? []).map((b) => ({
      name: b.bankName,
      value: b.totalAmount,
    }));
  }, [summary]);

  const typeChartData = useMemo(() => {
    return (summary?.transactionTypeSummaries ?? []).map((t) => ({
      name: t.transactionType,
      amount: t.totalAmount,
    }));
  }, [summary]);

  const budgetProgressData = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return banks
      .filter((b) => b.budgetLimit != null)
      .map((b) => {
        const spent = expenses
          .filter((e) => e.bankId === b.id && e.date.startsWith(ym))
          .reduce((s, e) => s + e.amount, 0);
        const limit = b.budgetLimit as number;
        const pct = Math.min((spent / limit) * 100, 100);
        const color =
          spent > limit
            ? "bg-red-500"
            : pct >= 80
              ? "bg-amber-400"
              : "bg-emerald-500";
        return { bank: b, spent, limit, pct, color };
      });
  }, [banks, expenses]);

  const handleDelete = async (id: bigint) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Expense deleted");
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const handleEdit = (exp: Expense) => {
    setEditExpense(exp);
    setEditOpen(true);
  };

  const isLoading = expLoading || sumLoading;

  return (
    <>
      <AddExpenseModal open={addOpen} onOpenChange={setAddOpen} />
      <EditExpenseDialog
        expense={editExpense}
        banks={banks}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Expense Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage all your expenses in one place
          </p>
        </motion.div>
        <Button
          onClick={() => {
            onAddExpense();
            setAddOpen(true);
          }}
          className="gap-2 self-start sm:self-auto"
          data-ocid="dashboard.primary_button"
        >
          <PlusCircle size={16} />
          Add New Expense
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Expenses",
            value: isLoading ? null : fmt(summary?.totalAmount ?? 0),
            icon: <Wallet size={18} className="text-primary" />,
            sub: `${expenses.length} entries`,
          },
          {
            label: "This Month",
            value: isLoading ? null : fmt(thisMonth),
            icon: <TrendingUp size={18} className="text-emerald-500" />,
            sub: new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            }),
          },
          {
            label: "Entries",
            value: isLoading ? null : expenses.length.toString(),
            icon: <Receipt size={18} className="text-violet-500" />,
            sub: "total records",
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">
                    {kpi.label}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    {kpi.icon}
                  </div>
                </div>
                {kpi.value === null ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {kpi.sub}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Expenses by Bank
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : bankChartData.length === 0 ? (
                <div
                  className="h-48 flex items-center justify-center text-muted-foreground text-sm"
                  data-ocid="bank_chart.empty_state"
                >
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={bankChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {bankChartData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {/* Budget Progress Bars */}
              {!isLoading && budgetProgressData.length > 0 && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Monthly Budget
                  </p>
                  {budgetProgressData.map(
                    ({ bank, spent, limit, pct, color }) => (
                      <div key={bank.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {bank.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {fmt(spent)}{" "}
                            <span className="text-foreground/50">/</span>{" "}
                            {fmt(limit)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Expenses by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : typeChartData.length === 0 ? (
                <div
                  className="h-48 flex items-center justify-center text-muted-foreground text-sm"
                  data-ocid="type_chart.empty_state"
                >
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={typeChartData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Bar
                      dataKey="amount"
                      fill="#2D5BFF"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-semibold">
                Recent Expense Entries
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Select value={filterBank} onValueChange={setFilterBank}>
                  <SelectTrigger
                    className="w-36 h-8 text-xs"
                    data-ocid="table.select"
                  >
                    <SelectValue placeholder="All Banks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Banks</SelectItem>
                    {banks.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger
                    className="w-36 h-8 text-xs"
                    data-ocid="table.select"
                  >
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {TRANSACTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  disabled={expenses.length === 0}
                  onClick={() => {
                    exportToCSV(expenses);
                    toast.success("CSV downloaded");
                  }}
                  data-ocid="dashboard.secondary_button"
                >
                  <Download size={13} />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-2" data-ocid="expenses.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="p-8 text-center text-muted-foreground text-sm"
                data-ocid="expenses.empty_state"
              >
                No expenses found. Add your first expense!
              </div>
            ) : (
              <>
                {/* Mobile card list */}
                <div className="sm:hidden divide-y divide-border">
                  {filtered.map((exp, idx) => (
                    <div
                      key={exp.id.toString()}
                      className="p-4"
                      data-ocid={`expenses.item.${idx + 1}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {exp.date}
                        </span>
                        <span className="font-bold text-sm text-foreground">
                          {fmt(exp.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {exp.bankName}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              txBadgeColor[exp.transactionType] ??
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {exp.transactionType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(exp)}
                            className="h-7 w-7 p-0 hover:text-primary"
                            data-ocid={`expenses.edit_button.${idx + 1}`}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exp.id)}
                            className="h-7 w-7 p-0 hover:text-destructive"
                            data-ocid={`expenses.delete_button.${idx + 1}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                      {exp.takeFrom && (
                        <p className="text-xs text-muted-foreground mt-1">
                          From: {exp.takeFrom}
                        </p>
                      )}
                      {(exp.purpose || exp.category) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[exp.purpose, exp.category]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      {exp.splitAmount > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Split: {fmt(exp.splitAmount)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table data-ocid="expenses.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Take From</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Split</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((exp, idx) => (
                        <TableRow
                          key={exp.id.toString()}
                          data-ocid={`expenses.item.${idx + 1}`}
                        >
                          <TableCell className="text-sm">{exp.date}</TableCell>
                          <TableCell className="text-sm font-medium">
                            {exp.bankName}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                txBadgeColor[exp.transactionType] ??
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {exp.transactionType}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {exp.takeFrom ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                            {exp.purpose ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                            {exp.category ?? "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm">
                            {fmt(exp.amount)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {exp.splitAmount > 0 ? fmt(exp.splitAmount) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(exp)}
                                className="h-7 w-7 p-0 hover:text-primary"
                                data-ocid={`expenses.edit_button.${idx + 1}`}
                              >
                                <Pencil size={13} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(exp.id)}
                                className="h-7 w-7 p-0 hover:text-destructive"
                                data-ocid={`expenses.delete_button.${idx + 1}`}
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
