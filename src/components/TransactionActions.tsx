"use client";

import { IoReceiptOutline } from 'react-icons/io5';
import Link from 'next/link'; // <--- Import komponen Link

interface TransactionActionsProps {
    transactionId: string;
}

export default function TransactionActions({ transactionId }: TransactionActionsProps) {

    // Karena ini adalah Client Component, Anda bisa menggunakan hooks atau event handlers
    const handleViewTicket = () => {
        alert(`Melihat E-Ticket untuk Transaksi ID: ${transactionId}`);
        // Logika sebenarnya: router.push('/ticket/' + transactionId)
    };

    return (
        <div className="mt-10 text-center">
            <button
                onClick={handleViewTicket}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
                Lihat E-Ticket
            </button>
            <Link
                href="/" // <--- Tujuan navigasi internal
                className="block mt-4 text-sm text-gray-500 hover:text-indigo-600"
            >
                Kembali ke Home
            </Link>
        </div>
    );
}