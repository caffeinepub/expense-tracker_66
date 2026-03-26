import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransactionTypeSummary {
    transactionType: TransactionType;
    totalAmount: number;
}
export type Time = bigint;
export type BankId = string;
export type ExpenseId = bigint;
export interface BankSummary {
    bankId: BankId;
    bankName: string;
    budgetLimit?: number;
    totalAmount: number;
}
export interface Bank {
    id: BankId;
    name: string;
    budgetLimit?: number;
}
export type TransactionType = string;
export interface Expense {
    id: ExpenseId;
    transactionType: TransactionType;
    date: string;
    createdAt: Time;
    bankId: BankId;
    splitAmount: number;
    bankName: string;
    notes?: string;
    takeFrom?: string;
    amount: number;
    purpose?: string;
    category?: string;
}
export interface backendInterface {
    addBank(name: string): Promise<BankId>;
    addExpense(date: string, bankId: string, bankName: string, transactionType: string, amount: number, splitAmount: number, notes: string | null, takeFrom: string | null, purpose: string | null, category: string | null): Promise<ExpenseId>;
    deleteBank(bankId: BankId): Promise<void>;
    deleteExpense(expenseId: ExpenseId): Promise<void>;
    getAllBankNames(): Promise<Array<string>>;
    getAllBanks(): Promise<Array<Bank>>;
    getAllExpenses(): Promise<Array<Expense>>;
    getAllTransactionTypes(): Promise<Array<TransactionType>>;
    getBank(bankId: BankId): Promise<Bank>;
    getBankBudgetLimit(bankId: BankId): Promise<number | null>;
    getBankSummaryStats(): Promise<Array<BankSummary>>;
    getExpense(expenseId: ExpenseId): Promise<Expense>;
    getExpensesForBank(bankId: BankId): Promise<Array<Expense>>;
    getExpensesForTransactionType(transactionType: TransactionType): Promise<Array<Expense>>;
    getTotalAmountForBank(bankId: BankId): Promise<number>;
    getTotalAmountForTransactionType(transactionType: TransactionType): Promise<number>;
    getTotalExpenseAmount(): Promise<number>;
    getTotalSummary(): Promise<{
        bankSummaries: Array<BankSummary>;
        totalAmount: number;
        transactionTypeSummaries: Array<TransactionTypeSummary>;
    }>;
    getTransactionTypeSummaryStats(): Promise<Array<TransactionTypeSummary>>;
    removeBankBudgetLimit(bankId: BankId): Promise<void>;
    setBankBudgetLimit(bankId: BankId, limit: number): Promise<void>;
}
