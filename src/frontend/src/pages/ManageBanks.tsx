import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddBank,
  useDeleteBank,
  useGetAllBanks,
  useRemoveBankBudgetLimit,
  useSetBankBudgetLimit,
} from "../hooks/useQueries";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ManageBanks() {
  const { data: banks = [], isLoading } = useGetAllBanks();
  const addBank = useAddBank();
  const deleteBank = useDeleteBank();
  const setBudget = useSetBankBudgetLimit();
  const removeBudget = useRemoveBankBudgetLimit();
  const [bankName, setBankName] = useState("");
  const [expandedBudget, setExpandedBudget] = useState<string | null>(null);
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = bankName.trim();
    if (!name) return;
    try {
      await addBank.mutateAsync(name);
      toast.success(`"${name}" added successfully`);
      setBankName("");
    } catch {
      toast.error("Failed to add bank");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteBank.mutateAsync(id);
      toast.success(`"${name}" removed`);
    } catch {
      toast.error("Failed to delete bank");
    }
  };

  const handleSetBudget = async (bankId: string, bankName: string) => {
    const val = Number.parseFloat(budgetInputs[bankId] ?? "");
    if (Number.isNaN(val) || val <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await setBudget.mutateAsync({ bankId, limit: val });
      toast.success(`Budget set for ${bankName}`);
      setExpandedBudget(null);
      setBudgetInputs((prev) => ({ ...prev, [bankId]: "" }));
    } catch {
      toast.error("Failed to set budget");
    }
  };

  const handleRemoveBudget = async (bankId: string, bankName: string) => {
    try {
      await removeBudget.mutateAsync(bankId);
      toast.success(`Budget removed for ${bankName}`);
      setExpandedBudget(null);
    } catch {
      toast.error("Failed to remove budget");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-foreground">Manage Banks</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add and manage your bank accounts
        </p>
      </motion.div>

      <div className="max-w-xl space-y-5">
        {/* Add Bank Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Add New Bank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="bank-name" className="sr-only">
                    Bank Name
                  </Label>
                  <Input
                    id="bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI, ICICI..."
                    data-ocid="manage_banks.input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={addBank.isPending || !bankName.trim()}
                  className="gap-2"
                  data-ocid="manage_banks.primary_button"
                >
                  {addBank.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Add Bank
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Banks List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Saved Banks ({banks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-2" data-ocid="banks.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : banks.length === 0 ? (
                <div className="p-8 text-center" data-ocid="banks.empty_state">
                  <Building2
                    size={32}
                    className="mx-auto text-muted-foreground mb-2"
                  />
                  <p className="text-muted-foreground text-sm">
                    No banks added yet.
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Add a bank above to get started.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border" data-ocid="banks.list">
                  <AnimatePresence>
                    {banks.map((bank, idx) => (
                      <motion.li
                        key={bank.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        data-ocid={`banks.item.${idx + 1}`}
                        className="px-5 py-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 size={14} className="text-primary" />
                            </div>
                            <div>
                              <span className="font-medium text-sm text-foreground">
                                {bank.name}
                              </span>
                              {bank.budgetLimit != null && (
                                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                                  Budget: {fmt(bank.budgetLimit)}/mo
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setExpandedBudget(
                                  expandedBudget === bank.id ? null : bank.id,
                                )
                              }
                              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                              data-ocid={`banks.toggle.${idx + 1}`}
                            >
                              {expandedBudget === bank.id ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              )}
                              Budget
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(bank.id, bank.name)}
                              className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                              data-ocid={`banks.delete_button.${idx + 1}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>

                        {/* Inline Budget Form */}
                        <AnimatePresence>
                          {expandedBudget === bank.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 ml-11"
                            >
                              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                                <span className="text-sm text-muted-foreground shrink-0">
                                  ₹
                                </span>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="Monthly budget amount"
                                  value={budgetInputs[bank.id] ?? ""}
                                  onChange={(e) =>
                                    setBudgetInputs((prev) => ({
                                      ...prev,
                                      [bank.id]: e.target.value,
                                    }))
                                  }
                                  className="h-8 text-sm"
                                  data-ocid={`banks.budget_input.${idx + 1}`}
                                />
                                <Button
                                  size="sm"
                                  className="h-8 text-xs shrink-0"
                                  disabled={setBudget.isPending}
                                  onClick={() =>
                                    handleSetBudget(bank.id, bank.name)
                                  }
                                  data-ocid={`banks.save_button.${idx + 1}`}
                                >
                                  {setBudget.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                                {bank.budgetLimit != null && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-xs shrink-0 text-destructive hover:text-destructive"
                                    disabled={removeBudget.isPending}
                                    onClick={() =>
                                      handleRemoveBudget(bank.id, bank.name)
                                    }
                                    data-ocid={`banks.delete_button.${idx + 1}`}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
