import type {
  Bank,
  BankSummary,
  Expense,
  TransactionTypeSummary,
} from "../backend.d";

const BANKS_KEY = "expense_tracker_banks";
const EXPENSES_KEY = "expense_tracker_expenses";
const NEXT_ID_KEY = "expense_tracker_next_id";

function loadBanks(): Bank[] {
  try {
    const raw = localStorage.getItem(BANKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBanks(banks: Bank[]) {
  localStorage.setItem(BANKS_KEY, JSON.stringify(banks));
}

function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((e: Expense) => ({
      ...e,
      id: BigInt(String(e.id)),
      createdAt: BigInt(String(e.createdAt)),
    }));
  } catch {
    return [];
  }
}

function saveExpenses(expenses: Expense[]) {
  const serializable = expenses.map((e) => ({
    ...e,
    id: String(e.id),
    createdAt: String(e.createdAt),
  }));
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(serializable));
}

function nextId(): bigint {
  const raw = localStorage.getItem(NEXT_ID_KEY);
  const current = raw ? Number.parseInt(raw, 10) : 1;
  localStorage.setItem(NEXT_ID_KEY, String(current + 1));
  return BigInt(current);
}

export function getAllBanks(): Bank[] {
  return loadBanks();
}

export function addBank(name: string): string {
  const banks = loadBanks();
  const id = `bank_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  banks.push({ id, name });
  saveBanks(banks);
  return id;
}

export function deleteBank(id: string): void {
  const banks = loadBanks().filter((b) => b.id !== id);
  saveBanks(banks);
}

export function setBankBudgetLimit(bankId: string, limit: number): void {
  const banks = loadBanks().map((b) =>
    b.id === bankId ? { ...b, budgetLimit: limit } : b,
  );
  saveBanks(banks);
}

export function removeBankBudgetLimit(bankId: string): void {
  const banks = loadBanks().map((b) => {
    if (b.id === bankId) {
      const { budgetLimit: _, ...rest } = b;
      return rest;
    }
    return b;
  });
  saveBanks(banks);
}

export function getAllExpenses(): Expense[] {
  return loadExpenses();
}

export function addExpense(
  date: string,
  bankId: string,
  bankName: string,
  transactionType: string,
  amount: number,
  splitAmount: number,
  notes: string | null,
  takeFrom: string | null,
  purpose: string | null,
  category: string | null,
): bigint {
  const expenses = loadExpenses();
  const id = nextId();
  const expense: Expense = {
    id,
    date,
    createdAt: BigInt(Date.now()),
    bankId,
    bankName,
    transactionType,
    amount,
    splitAmount,
    ...(notes ? { notes } : {}),
    ...(takeFrom ? { takeFrom } : {}),
    ...(purpose ? { purpose } : {}),
    ...(category ? { category } : {}),
  };
  expenses.push(expense);
  saveExpenses(expenses);
  return id;
}

export function updateExpense(
  expenseId: bigint,
  updates: Partial<Omit<Expense, "id" | "createdAt">>,
): void {
  const expenses = loadExpenses();
  const idx = expenses.findIndex((e) => e.id === expenseId);
  if (idx === -1) return;
  expenses[idx] = { ...expenses[idx], ...updates };
  saveExpenses(expenses);
}

export function deleteExpense(expenseId: bigint): void {
  const expenses = loadExpenses().filter((e) => e.id !== expenseId);
  saveExpenses(expenses);
}

export function getTotalSummary(): {
  bankSummaries: BankSummary[];
  totalAmount: number;
  transactionTypeSummaries: TransactionTypeSummary[];
} {
  const expenses = loadExpenses();
  const banks = loadBanks();

  let totalAmount = 0;
  const bankMap: Record<string, BankSummary> = {};
  const txMap: Record<string, number> = {};

  for (const e of expenses) {
    totalAmount += e.amount;
    if (!bankMap[e.bankId]) {
      const bank = banks.find((b) => b.id === e.bankId);
      bankMap[e.bankId] = {
        bankId: e.bankId,
        bankName: e.bankName,
        budgetLimit: bank?.budgetLimit,
        totalAmount: 0,
      };
    }
    bankMap[e.bankId].totalAmount += e.amount;
    txMap[e.transactionType] = (txMap[e.transactionType] || 0) + e.amount;
  }

  const bankSummaries = Object.values(bankMap);
  const transactionTypeSummaries: TransactionTypeSummary[] = Object.entries(
    txMap,
  ).map(([transactionType, amount]) => ({
    transactionType,
    totalAmount: amount,
  }));

  return { bankSummaries, totalAmount, transactionTypeSummaries };
}
