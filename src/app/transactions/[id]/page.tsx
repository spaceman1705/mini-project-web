// src/app/transactions/[id]/page.tsx (Komponen SERVER)

import React from 'react';
import { IoReceiptOutline, IoCalendarOutline, IoTimeOutline, IoCheckmarkCircle } from 'react-icons/io5';
import TransactionActions from '@/components/TransactionActions';

export default function TransactionDetailPage({ params }: { params: { id: string } }) {
    const transactionId = params.id;
    // ... data placeholder ...

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-8 border-t-4 border-green-500">

                {/* ... Detail Transaksi di sini (Server rendering) ... */}

                {/* Render komponen Client di sini. 
                   Sekarang event handler ada di dalamnya, bukan di Server Component.
                */}
                <TransactionActions transactionId={transactionId} />

            </div>
        </div>
    );
}