import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const initialBalance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    const balance = (await this.find()).reduce((acc, transaction) => {
      switch (transaction.type) {
        case 'income':
          return {
            ...acc,
            income: acc.income + transaction.value,
            total: acc.total + transaction.value,
          };
        case 'outcome':
          return {
            ...acc,
            outcome: acc.outcome + transaction.value,
            total: acc.total - transaction.value,
          };
        default:
          return acc;
      }
    }, initialBalance);

    return balance;
  }
}

export default TransactionsRepository;
