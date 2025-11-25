import { getDb } from '../../lib/mongo';

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const transactionsCollection = db.collection('transactions');

    if (req.method === 'GET') {
      // Fetch all transactions
      const transactions = await transactionsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      return res.status(200).json({ success: true, data: transactions });
    }

    if (req.method === 'POST') {
      // Add a new transaction
      const { amount, description, category, type, date } = req.body;

      // Basic validation
      if (!amount || !description || !type) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: amount, description, and type are required',
        });
      }

      const newTransaction = {
        amount: parseFloat(amount),
        description,
        category: category || 'uncategorized',
        type, // 'income' or 'expense'
        date: date || new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await transactionsCollection.insertOne(newTransaction);

      return res.status(201).json({
        success: true,
        data: {
          _id: result.insertedId,
          ...newTransaction,
        },
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
}


