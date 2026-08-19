import React from 'react';
import { formatCurrency } from '@/lib/utils';

export interface PrintableInvoiceData {
    company_id?: string; // 'dijlah' | 'misk'
    invoice_number: string;
    invoice_date: string;
    customer_name: string;
    customer_address?: string | null;
    type: 'sale' | 'purchase';
    total_amount: number;
    user_name?: string;
    items: Array<{
        product_name: string;
        boxes: number;
        units_per_box: number;
        total_pieces: number;
        box_price: number;
        total_price: number;
    }>;
}

const COMPANY_INFO = {
    dijlah: {
        name: 'شركة دلال دجلة',
        subTitle: 'للتجارة العامة محدودة المسؤولية',
        phones: '07709997932 - 07744480050',
        address: 'العراق - بغداد الشورجة - سوق المطيبات',
    },
    misk: {
        name: 'شركة دلال المسك',
        subTitle: 'للتجارة العامة محدودة المسؤولية',
        phones: '07902566155 - 07708810103',
        address: 'العراق - بغداد - سوق الصابون - قرب سوق المسقف',
    },
};

interface PrintableInvoiceProps {
    invoice: PrintableInvoiceData;
    id?: string;
}

export function PrintableInvoice({ invoice, id = 'printable-invoice' }: PrintableInvoiceProps) {
    const isMisk = invoice.company_id === 'misk';
    const info = isMisk ? COMPANY_INFO.misk : COMPANY_INFO.dijlah;

    // Clean Date Formatter (removes T00:00:00.000000Z ISO strings)
    const formattedDate = (invoice.invoice_date || '').split('T')[0];

    return (
        <div
            id={id}
            className="hidden print:block font-sans text-black bg-white p-2 leading-relaxed text-right dir-rtl w-full max-w-[210mm] mx-auto"
            dir="rtl"
        >
            {/* Header Section (الهيدر الرئيسي) */}
            <div className="text-center space-y-1 mb-2">
                <h1 className="text-3xl font-black text-black tracking-normal leading-tight">{info.name}</h1>
                <h2 className="text-base font-bold text-black">{info.subTitle}</h2>
            </div>

            {/* Sub-header Meta Line (الهاتف والعنوان) */}
            <div className="flex justify-between items-center text-xs font-bold text-black border-b-2 border-black pb-1.5 mb-5">
                <div className="font-mono tracking-wide">{info.phones}</div>
                <div>{info.address}</div>
            </div>

            {/* Customer & Invoice Info Grid (بيانات العميل والفاتورة) */}
            <div className="grid grid-cols-3 items-start text-sm font-bold text-black mb-4 gap-2">
                {/* Right Column: Customer Info */}
                <div className="space-y-1.5">
                    <div>اسم العميل : <span className="font-extrabold">{invoice.customer_name}</span></div>
                    <div>العنــــــوان : <span>{invoice.customer_address || '.'}</span></div>
                </div>

                {/* Center Column: Invoice Number */}
                <div className="text-center self-center">
                    <span className="text-base font-black font-mono tracking-wide">
                        {invoice.invoice_number}
                    </span>
                </div>

                {/* Left Column: Invoice Type and Date */}
                <div className="space-y-1.5 text-left" dir="rtl">
                    <div className="flex justify-end gap-1">
                        <span>نوع الفاتورة :</span>
                        <span className="font-black">{invoice.type === 'sale' ? 'بيع' : 'شراء'}</span>
                    </div>
                    <div className="flex justify-end gap-1">
                        <span>التاريــــخ :</span>
                        <span className="font-mono font-black">{formattedDate}</span>
                    </div>
                </div>
            </div>

            {/* Items Table (الجدول المعتمد 100% في الصورة) */}
            <div className="mb-4">
                <table className="w-full text-xs text-right border-collapse border-2 border-black">
                    <thead>
                        <tr className="bg-slate-100 border-b-2 border-black text-black font-black">
                            <th className="p-1.5 border border-black text-center w-10 text-xs">ت</th>
                            <th className="p-1.5 border border-black text-right text-xs">اسم المنتج</th>
                            <th className="p-1.5 border border-black text-center w-16 text-xs">الكرتون</th>
                            <th className="p-1.5 border border-black text-center w-16 text-xs">التعبئة</th>
                            <th className="p-1.5 border border-black text-center w-20 text-xs">العدد</th>
                            <th className="p-1.5 border border-black text-center w-28 text-xs">السعر</th>
                            <th className="p-1.5 border border-black text-center w-32 text-xs">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                        {invoice.items?.map((item, index) => (
                            <tr key={index} className="border-b border-black text-black font-bold">
                                <td className="p-1.5 border border-black text-center font-mono text-xs">
                                    {index + 1}
                                </td>
                                <td className="p-1.5 border border-black text-right font-bold text-xs">
                                    {item.product_name}
                                </td>
                                <td className="p-1.5 border border-black text-center text-xs font-mono">
                                    {formatCurrency(item.boxes)}
                                </td>
                                <td className="p-1.5 border border-black text-center text-xs font-mono">
                                    {formatCurrency(item.units_per_box)}
                                </td>
                                <td className="p-1.5 border border-black text-center text-xs font-mono">
                                    {formatCurrency(item.total_pieces)}
                                </td>
                                <td className="p-1.5 border border-black text-center text-xs font-mono">
                                    {formatCurrency(item.box_price)}
                                </td>
                                <td className="p-1.5 border border-black text-center font-black text-xs font-mono">
                                    {formatCurrency(item.total_price)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total Summary Row (مبلغ القائمة في الأسفل) */}
                <div className="flex items-center gap-3 mt-3 text-xs font-black">
                    <div className="bg-slate-100 border border-black px-4 py-1 font-mono text-base tracking-tight font-black">
                        {formatCurrency(invoice.total_amount)}
                    </div>
                    <span className="text-black font-bold text-sm">مبلغ القائمة</span>
                </div>
            </div>
        </div>
    );
}
