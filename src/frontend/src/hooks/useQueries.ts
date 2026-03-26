import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bank, Expense } from "../backend.d";
import * as localStore from "../utils/localStore";

export function useGetAllBanks() {
  return useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: async () => localStore.getAllBanks(),
  });
}

export function useGetAllExpenses() {
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => localStore.getAllExpenses(),
  });
}

export function useGetTotalSummary() {
  return useQuery({
    queryKey: ["totalSummary"],
    queryFn: async () => localStore.getTotalSummary(),
  });
}

export function useAddBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => localStore.addBank(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useDeleteBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bankId: string) => localStore.deleteBank(bankId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      date: string;
      bankId: string;
      bankName: string;
      transactionType: string;
      amount: number;
      splitAmount: number;
      notes: string | null;
      takeFrom: string | null;
    }) =>
      localStore.addExpense(
        data.date,
        data.bankId,
        data.bankName,
        data.transactionType,
        data.amount,
        data.splitAmount,
        data.notes,
        data.takeFrom,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expenseId: bigint) =>
      localStore.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useSetBankBudgetLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bankId, limit }: { bankId: string; limit: number }) =>
      localStore.setBankBudgetLimit(bankId, limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useRemoveBankBudgetLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bankId: string) =>
      localStore.removeBankBudgetLimit(bankId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}
