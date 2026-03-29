const expenseService = require('./expense.service');

class ExpenseController {
  async createExpense(req, res, next) {
    try {
      // In real enterprise app, user_id and company_id come from req.user
      const { amount, currency, category, date, description, user_id, company_id } = req.body;
      
      const expense = await expenseService.createExpense(
        { amount, currency, category, date, description },
        user_id, // Mocking auth
        company_id
      );

      return res.status(201).json({
        success: true,
        data: expense
      });
    } catch (error) {
      next(error);
    }
  }

  async declareMissingReceipt(req, res, next) {
    try {
      const { expenseId } = req.params;
      const { declaration_reason, user_id } = req.body;

      const updatedExpense = await expenseService.declareMissingReceipt(
        expenseId, 
        declaration_reason, 
        user_id
      );

      return res.status(200).json({
        success: true,
        data: updatedExpense
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpenseController();
