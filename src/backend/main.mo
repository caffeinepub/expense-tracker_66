import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";

actor {
  // Legacy stable variables retained for upgrade compatibility (M0169).
  // These were part of the previous authorization mixin and cannot be dropped implicitly.
  let accessControlState = AccessControl.initState();
  type OldUserProfile = { name : Text };
  let userProfiles = Map.empty<Principal, OldUserProfile>();

  // Expense Tracker Types
  type BankId = Text;
  type ExpenseId = Nat;
  type TransactionType = Text;

  type Bank = {
    id : BankId;
    name : Text;
    budgetLimit : ?Float;
  };

  type Expense = {
    id : ExpenseId;
    date : Text;
    bankId : BankId;
    bankName : Text;
    transactionType : TransactionType;
    amount : Float;
    splitAmount : Float;
    notes : ?Text;
    takeFrom : ?Text;
    createdAt : Time.Time;
  };

  type BankSummary = {
    bankId : BankId;
    bankName : Text;
    totalAmount : Float;
    budgetLimit : ?Float;
  };

  type TransactionTypeSummary = {
    transactionType : TransactionType;
    totalAmount : Float;
  };

  // Stable storage (persists across upgrades)
  stable var stableBanks : [Bank] = [];
  stable var stableExpenses : [Expense] = [];
  stable var nextExpenseId : ExpenseId = 0;

  // In-memory working maps (rebuilt from stable storage on upgrade)
  let banks = Map.empty<BankId, Bank>();
  let expenses = Map.empty<ExpenseId, Expense>();

  do {
    for (bank in stableBanks.values()) {
      banks.add(bank.id, bank);
    };
    for (expense in stableExpenses.values()) {
      expenses.add(expense.id, expense);
    };
  };

  system func preupgrade() {
    stableBanks := banks.values().toArray();
    stableExpenses := expenses.values().toArray();
  };

  func getBankInternal(bankId : BankId) : Bank {
    switch (banks.get(bankId)) {
      case (?bank) { bank };
      case (null) { Runtime.trap("Bank not found") };
    };
  };

  func getExpenseInternal(expenseId : ExpenseId) : Expense {
    switch (expenses.get(expenseId)) {
      case (?expense) { expense };
      case (null) { Runtime.trap("Expense not found") };
    };
  };

  func getExpensesForBankInternal(bankId : BankId) : [Expense] {
    expenses.values().toArray().filter(func(e) { e.bankId == bankId });
  };

  func getExpensesForTransactionTypeInternal(transactionType : TransactionType) : [Expense] {
    expenses.values().toArray().filter(func(e) { e.transactionType == transactionType });
  };

  func getAllExpensesInternal() : [Expense] {
    expenses.values().toArray();
  };

  func calculateBankSummary(bankId : BankId) : BankSummary {
    let bank = getBankInternal(bankId);
    let bankExpenses = getExpensesForBankInternal(bankId);
    let total = bankExpenses.foldLeft(
      0.0,
      func(acc, exp) { acc + exp.amount },
    );
    {
      bankId;
      bankName = bank.name;
      totalAmount = total;
      budgetLimit = bank.budgetLimit;
    };
  };

  func calculateTransactionTypeSummary(transactionType : TransactionType) : TransactionTypeSummary {
    let typeExpenses = getExpensesForTransactionTypeInternal(transactionType);
    let total = typeExpenses.foldLeft(
      0.0,
      func(acc, exp) { acc + exp.amount },
    );
    {
      transactionType;
      totalAmount = total;
    };
  };

  func sumAllExpenses() : Float {
    getAllExpensesInternal().foldLeft(
      0.0,
      func(acc, exp) { acc + exp.amount },
    );
  };

  // Bank Management
  public shared func addBank(name : Text) : async BankId {
    let bankId = name;
    if (banks.containsKey(bankId)) {
      Runtime.trap("Bank with the same name already exists. Use unique bank names.");
    };
    let newBank : Bank = {
      id = bankId;
      name;
      budgetLimit = null;
    };
    banks.add(bankId, newBank);
    stableBanks := banks.values().toArray();
    bankId;
  };

  public shared func deleteBank(bankId : BankId) : async () {
    let _existing = getBankInternal(bankId);
    banks.remove(bankId);
    stableBanks := banks.values().toArray();
  };

  public shared func setBankBudgetLimit(bankId : BankId, limit : Float) : async () {
    let bank = getBankInternal(bankId);
    let updatedBank : Bank = {
      id = bank.id;
      name = bank.name;
      budgetLimit = ?limit;
    };
    banks.add(bankId, updatedBank);
    stableBanks := banks.values().toArray();
  };

  public shared func removeBankBudgetLimit(bankId : BankId) : async () {
    let bank = getBankInternal(bankId);
    let updatedBank : Bank = {
      id = bank.id;
      name = bank.name;
      budgetLimit = null;
    };
    banks.add(bankId, updatedBank);
    stableBanks := banks.values().toArray();
  };

  public query func getBank(bankId : BankId) : async Bank {
    getBankInternal(bankId);
  };

  public query func getAllBanks() : async [Bank] {
    banks.values().toArray().sort(func(a, b) { Text.compare(a.name, b.name) });
  };

  public query func getAllBankNames() : async [Text] {
    banks.values().toArray().map(func(b) { b.name });
  };

  public query func getBankBudgetLimit(bankId : BankId) : async ?Float {
    let bank = getBankInternal(bankId);
    bank.budgetLimit;
  };

  // Expense Management
  public shared func addExpense(
    date : Text,
    bankId : Text,
    bankName : Text,
    transactionType : Text,
    amount : Float,
    splitAmount : Float,
    notes : ?Text,
    takeFrom : ?Text,
  ) : async ExpenseId {
    if (not (banks.containsKey(bankId))) {
      Runtime.trap("Bank with id " # bankId # " does not exist");
    };
    let expenseId = nextExpenseId;
    nextExpenseId += 1;
    let newExpense : Expense = {
      id = expenseId;
      date;
      bankId;
      bankName;
      transactionType;
      amount;
      splitAmount;
      notes;
      takeFrom;
      createdAt = Time.now();
    };
    expenses.add(expenseId, newExpense);
    stableExpenses := expenses.values().toArray();
    expenseId;
  };

  public shared func deleteExpense(expenseId : ExpenseId) : async () {
    let _existing = getExpenseInternal(expenseId);
    expenses.remove(expenseId);
    stableExpenses := expenses.values().toArray();
  };

  public query func getExpense(expenseId : ExpenseId) : async Expense {
    getExpenseInternal(expenseId);
  };

  public query func getAllExpenses() : async [Expense] {
    expenses.values().toArray().sort(func(a, b) { Int.compare(b.createdAt, a.createdAt) });
  };

  public query func getExpensesForBank(bankId : BankId) : async [Expense] {
    getExpensesForBankInternal(bankId);
  };

  public query func getExpensesForTransactionType(transactionType : TransactionType) : async [Expense] {
    getExpensesForTransactionTypeInternal(transactionType);
  };

  public query func getAllTransactionTypes() : async [TransactionType] {
    let transactionTypes = getAllExpensesInternal().map(func(e) { e.transactionType });
    let uniqueTransactionTypes = List.empty<TransactionType>();
    for (t in transactionTypes.values()) {
      if (not (uniqueTransactionTypes.contains(t))) {
        uniqueTransactionTypes.add(t);
      };
    };
    uniqueTransactionTypes.toArray();
  };

  public query func getTotalAmountForBank(bankId : BankId) : async Float {
    let expensesForBank = getExpensesForBankInternal(bankId);
    expensesForBank.foldLeft(
      0.0,
      func(acc, exp) { acc + exp.amount },
    );
  };

  public query func getTotalAmountForTransactionType(transactionType : TransactionType) : async Float {
    let expensesForType = getExpensesForTransactionTypeInternal(transactionType);
    expensesForType.foldLeft(
      0.0,
      func(acc, exp) { acc + exp.amount },
    );
  };

  public query func getBankSummaryStats() : async [BankSummary] {
    banks.values().toArray().map(
      func(b) { calculateBankSummary(b.id) }
    );
  };

  public query func getTransactionTypeSummaryStats() : async [TransactionTypeSummary] {
    let allExpenses = getAllExpensesInternal();
    let transactionTypes = allExpenses.map(func(e) { e.transactionType });
    let uniqueTransactionTypes = List.empty<TransactionType>();
    for (t in transactionTypes.values()) {
      if (not (uniqueTransactionTypes.contains(t))) {
        uniqueTransactionTypes.add(t);
      };
    };
    uniqueTransactionTypes.toArray().map(
      func(t) { calculateTransactionTypeSummary(t) }
    );
  };

  public query func getTotalExpenseAmount() : async Float {
    sumAllExpenses();
  };

  public query func getTotalSummary() : async {
    totalAmount : Float;
    bankSummaries : [BankSummary];
    transactionTypeSummaries : [TransactionTypeSummary];
  } {
    {
      totalAmount = sumAllExpenses();
      bankSummaries = banks.values().toArray().map(
        func(b) { calculateBankSummary(b.id) }
      );
      transactionTypeSummaries = getAllExpensesInternal().map(func(e) { e.transactionType }).foldLeft(
        List.empty<TransactionType>(),
        func(acc, t) {
          if (not (acc.contains(t))) { acc.add(t) };
          acc;
        },
      ).toArray().map(
        func(t) { calculateTransactionTypeSummary(t) }
      );
    };
  };
};
