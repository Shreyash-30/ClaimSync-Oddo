const mongoose = require('mongoose');
const expenseRepository = require('./expense.repository');
const versionService = require('../version/version.service');
const auditService = require('../audit/audit.service');
const { convertToBaseCurrency } = require('../../utils/currency.util');

class ExpenseService {
  async createExpense(data, userId, companyId) {
    try {
      // 1. Apply currency conversion
      const { converted_amount, conversion_rate } = await convertToBaseCurrency(data.amount, data.currency);

      const expenseData = {
        user_id: userId,
        company_id: companyId,
        amount: data.amount,
        currency: data.currency,
        converted_amount,
        conversion_rate,
        conversion_rate_snapshot: conversion_rate,
        conversion_timestamp: new Date(),
        category: data.category,
        date: data.date,
        description: data.description,
        status: 'DRAFT',
        version: 1,
      };

      // 2. Create the Expense doc
      const expense = await expenseRepository.create(expenseData);

      // 3. Create Version Snapshot
      await versionService.createSnapshot(expense._id, expense.version, expense.toObject());

      // 4. Audit Log
      await auditService.log(
        'Expense',
        expense._id,
        'CREATE',
        userId,
        null,
        { amount: data.amount, status: 'DRAFT' }
      );

      return expense;
    } catch (err) {
      throw err;
    }
  }

  async declareMissingReceipt(expenseId, declarationReason, userId) {
    try {
      const expense = await expenseRepository.findById(expenseId);
      if (!expense) throw new Error('Expense not found');
      if (expense.status !== 'DRAFT') {
         throw new Error('Expense is locked and cannot be modified');
      }

      if (expense.flags && expense.flags.some(f => f.type === 'MISSING_RECEIPT')) {
         throw new Error('Receipt missing already declared');
      }

      const flags = [...(expense.flags || []), {
        type: 'MISSING_RECEIPT',
        field: 'receipt_id',
        message: `User declared receipt missing. Reason: ${declarationReason}`
      }];

      // Important: Ensure proper optimistic update/versioning happens via the findByIdAndUpdate logic
      const updateData = { flags };
      const updatedExpense = await expenseRepository.findByIdAndUpdate(expenseId, updateData);

      // Versioning
      await versionService.createSnapshot(updatedExpense._id, updatedExpense.version, updatedExpense);

      // Audit
      await auditService.log(
        'Expense',
        updatedExpense._id,
        'DECLARE_MISSING_RECEIPT',
        userId,
        { reason: null },
        { reason: declarationReason }
      );

      return updatedExpense;

    } catch (err) {
      throw err;
    }
  }
}

module.exports = new ExpenseService();
