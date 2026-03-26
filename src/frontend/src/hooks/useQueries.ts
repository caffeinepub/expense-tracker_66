import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bank, Expense } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllBanks() {
  const { actor, isFetching } = useActor();
  return useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBanks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalSummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["totalSummary"],
    queryFn: async () => {
      if (!actor)
        return {
          bankSummaries: [],
          totalAmount: 0,
          transactionTypeSummaries: [],
        };
      return actor.getTotalSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBank() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addBank(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useDeleteBank() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bankId: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteBank(bankId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useAddExpense() {
  const { actor } = useActor();
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
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addExpense(
        data.date,
        data.bankId,
        data.bankName,
        data.transactionType,
        data.amount,
        data.splitAmount,
        data.notes,
        data.takeFrom,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useDeleteExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expenseId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteExpense(expenseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useSetBankBudgetLimit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bankId,
      limit,
    }: { bankId: string; limit: number }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setBankBudgetLimit(bankId, limit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}

export function useRemoveBankBudgetLimit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bankId: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeBankBudgetLimit(bankId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["totalSummary"] });
    },
  });
}
