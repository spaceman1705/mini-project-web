import React from 'react';

// Next.js secara otomatis memberikan ID sebagai params.id
export default function TransactionDetailPage({ params }: { params: { id: string } }) {
    const transactionId = params.id;

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold">Halaman Detail Transaksi</h1>
            <p className="mt-4 text-lg">
                Transaksi ID: <span className="font-mono bg-gray-100 p-1 rounded">{transactionId}</span>
            </p>
            <div className="mt-8 p-6 bg-green-50 border-l-4 border-green-500 text-green-700">
                Checkout berhasil!
            </div>
        </div>
    );
}