// src/app/transactions/[id]/page.tsx (Komponen SERVER)

import React from 'react';
import TransactionActions from '@/components/TransactionActions';

export default async function TransactionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolved = await params;
    const transactionId = resolved.id;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-8 border-t-4 border-green-500">
                <TransactionActions transactionId={transactionId} />
            </div>
        </div>
    );
}
