import { getCustomRepository, getRepository } from 'typeorm';

import csv from 'csvtojson';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  csvPath: string;
}

interface Request2 {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ csvPath }: Request): Promise<Transaction[]> {
    const csvJson = await csv().fromFile(csvPath);

    const transactions: Transaction[] = [];

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    for (const { title, value, type, category: categoryTitle } of csvJson) {
      let category = await categoriesRepository.findOne({
        where: { title: categoryTitle },
      });

      if (!category) {
        category = categoriesRepository.create({
          title: categoryTitle,
        });
        await categoriesRepository.save(category);
      }

      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id: category.id,
      });

      await transactionsRepository.save(transaction);

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
