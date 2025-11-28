interface TransactionDTO {
  transaction_type: string;
  transaction_number: string;
  amount: string;
  status: string;
  year: string;
}

export interface Transaction {
  transaction_type: string;
  transaction_number: string;
  amount: number;
  status: string;
  year: number;
}

const parseTransaction = (dto: TransactionDTO): Transaction => {
  return {
    transaction_type: dto.transaction_type,
    transaction_number: dto.transaction_number,
    amount: parseFloat(dto.amount),
    status: dto.status,
    year: parseInt(dto.year),
  };
};

export const transactionsService = {
  async list(): Promise<Transaction[]> {
    const response = await fetch('/transactions');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const dtos = await response.json() as TransactionDTO[];
    return dtos.map(parseTransaction);
  },
};
