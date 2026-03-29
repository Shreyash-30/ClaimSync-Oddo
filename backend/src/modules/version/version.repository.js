const ExpenseVersion = require('./version.model');

class ExpenseVersionRepository {
  async create(expenseId, version, snapshot, session = null) {
    const expenseVersion = new ExpenseVersion({
      expense_id: expenseId,
      version: version,
      snapshot: snapshot
    });
    return expenseVersion.save({ session });
  }

  async findByExpenseId(expenseId) {
    return ExpenseVersion.find({ expense_id: expenseId }).sort({ version: 1 }).lean();
  }
}

module.exports = new ExpenseVersionRepository();
