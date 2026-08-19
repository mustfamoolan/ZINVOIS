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
    const formattedDate = (invoice.invoice_date || '').split('T')[0];

    if (isMisk) {
        // =========================================================================
        // DESIGN 2: شركة دلال المسك (Clean Editorial Layout - Light & Elegant)
        // =========================================================================
        return (
            <div
                id={id}
                className="hidden print:block font-sans text-black bg-white p-4 leading-relaxed text-right dir-rtl w-full max-w-[210mm] mx-auto"
                dir="rtl"
            >
                {/* Header: Centered Double-Border Executive Frame (No Logo) */}
                <div className="border-t-2 border-b-2 border-black py-3 mb-4 text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight text-black">{info.name}</h1>
                    <p className="text-xs font-semibold text-neutral-700 mt-0.5">{info.subTitle}</p>
                    <div className="flex justify-center items-center gap-6 text-[11px] font-bold text-neutral-800 mt-2 pt-2 border-t border-black/20">
                        <div>العنوان: {info.address}</div>
                        <div className="font-mono">الهواتف: {info.phones}</div>
                    </div>
                </div>

                {/* Customer & Meta Box */}
                <div className="border border-black p-3 mb-4 grid grid-cols-3 gap-3 text-xs font-bold items-center bg-neutral-50/50">
                    <div className="col-span-2 space-y-1">
                        <div>اسم العميل: <span className="text-sm font-extrabold">{invoice.customer_name}</span></div>
                        <div className="text-neutral-700">عنوان العميل: <span>{invoice.customer_address || '.'}</span></div>
                    </div>
                    <div className="text-left font-mono space-y-1" dir="rtl">
                        <div>رقم الفاتورة: <span className="font-black text-sm">{invoice.invoice_number}</span></div>
                        <div className="text-[11px]">نوع الفاتورة: <span className="font-bold">نقد</span></div>
                        <div className="text-[11px]">التاريخ: <span className="font-bold">{formattedDate}</span></div>
                    </div>
                </div>

                {/* Table: Clean White Header with Top & Bottom Rules */}
                <div className="mb-4">
                    <table className="w-full text-xs text-right border-collapse border border-black">
                        <thead>
                            <tr className="border-b-2 border-black bg-neutral-100 text-black font-extrabold">
                                <th className="p-2 border-r border-black text-center w-10">ت</th>
                                <th className="p-2 border-r border-black text-right">اسم المنتج</th>
                                <th className="p-2 border-r border-black text-center w-16">الكرتون</th>
                                <th className="p-2 border-r border-black text-center w-16">التعبئة</th>
                                <th className="p-2 border-r border-black text-center w-20">العدد</th>
                                <th className="p-2 border-r border-black text-center w-28">السعر</th>
                                <th className="p-2 border-r border-black text-center w-32">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item, index) => (
                                <tr key={index} className="border-b border-black/40 text-black font-bold">
                                    <td className="p-2 border-r border-black text-center font-mono">{index + 1}</td>
                                    <td className="p-2 border-r border-black text-right font-extrabold">{item.product_name}</td>
                                    <td className="p-2 border-r border-black text-center font-mono">{formatCurrency(item.boxes)}</td>
                                    <td className="p-2 border-r border-black text-center font-mono">{formatCurrency(item.units_per_box)}</td>
                                    <td className="p-2 border-r border-black text-center font-mono">{formatCurrency(item.total_pieces)}</td>
                                    <td className="p-2 border-r border-black text-center font-mono">
                                        {formatCurrency(Math.round(item.box_price / (item.units_per_box || 1)))}
                                    </td>
                                    <td className="p-2 border-r border-black text-center font-mono font-black">{formatCurrency(item.total_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Total Summary & Signature */}
                <div className="flex justify-between items-end border-t border-black pt-3 mt-4">
                    <div className="text-xs font-bold text-neutral-700 space-y-1">
                        <div>توقيع المستلم: ................................</div>
                        <div className="text-[10px]">شكراً لتعاملكم معنا</div>
                    </div>

                    <div className="border-2 border-black p-3 text-left bg-neutral-100 min-w-[200px]">
                        <span className="text-xs font-bold block text-black">مبلغ القائمة الإجمالي:</span>
                        <span className="text-xl font-mono font-black text-black">{formatCurrency(invoice.total_amount)} د.ع</span>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // DESIGN 1: شركة دلال دجلة (Clean Modern Layout - Light & Crisp)
    // =========================================================================
    return (
        <div
            id={id}
            className="hidden print:block font-sans text-black bg-white p-4 leading-relaxed text-right dir-rtl w-full max-w-[210mm] mx-auto"
            dir="rtl"
        >
            {/* Header: Clean 2-Column Modern Header (No Solid Black Block) */}
            <div className="flex justify-between items-end border-b-2 border-black pb-3 mb-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-black">{info.name}</h1>
                    <p className="text-xs font-bold text-neutral-700 mt-0.5">{info.subTitle}</p>
                    <p className="text-[11px] font-semibold text-neutral-600 mt-1">{info.address}</p>
                </div>
                <div className="text-left font-mono">
                    <div className="text-xs font-bold text-neutral-700">هاتف المحل: {info.phones.split('-')[0]}</div>
                    <div className="inline-block border border-black px-3 py-1 text-sm font-black mt-1 bg-neutral-100">
                        رقم الفاتورة: {invoice.invoice_number}
                    </div>
                </div>
            </div>

            {/* Customer & Invoice Meta Details */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-xs font-bold">
                <div className="col-span-2 border-b border-black pb-2">
                    <div>اسم العميل: <span className="text-sm font-extrabold">{invoice.customer_name}</span></div>
                    <div className="text-neutral-700 mt-0.5">العنوان: <span>{invoice.customer_address || '.'}</span></div>
                </div>
                <div className="text-left border-b border-black pb-2 font-mono" dir="rtl">
                    <div>نوع الفاتورة: <span className="font-bold">نقد</span></div>
                    <div>تاريخ الفاتورة: <span className="font-bold">{formattedDate}</span></div>
                </div>
            </div>

            {/* Table: Fine Grid Borders & Clean White Headers */}
            <div className="mb-4">
                <table className="w-full text-xs text-right border-collapse border border-black">
                    <thead>
                        <tr className="bg-neutral-100 border-b border-black text-black font-extrabold">
                            <th className="p-2 border-r border-black text-center w-10">ت</th>
                            <th className="p-2 border-r border-black text-right">اسم المنتج</th>
                            <th className="p-2 border-r border-black text-center w-16">الكرتون</th>
                            <th className="p-2 border-r border-black text-center w-16">التعبئة</th>
                            <th className="p-2 border-r border-black text-center w-20">العدد</th>
                            <th className="p-2 border-r border-black text-center w-28">السعر</th>
                            <th className="p-2 border-r border-black text-center w-32">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((item, index) => (
                            <tr key={index} className="border-b border-black/40 text-black font-bold">
                                <td className="p-2 border-r border-black text-center font-mono">{index + 1}</td>
                                <td className="p-2 border-r border-black text-right font-extrabold">{item.product_name}</td>
                                <td className="p-2 border-r border-black text-center font-mono">{formatCurrency(item.boxes)}</td>
                                <td className="p-2 border-r border-black text-center font-mono">{formatCurrency(item.units_per_box)}</td>
                                <td className="p-2 border-r border-black text-center font-mono">{formatCurrency(item.total_pieces)}</td>
                                <td className="p-2 border-r border-black text-center font-mono">
                                    {formatCurrency(Math.round(item.box_price / (item.units_per_box || 1)))}
                                </td>
                                <td className="p-2 text-center font-mono font-black">{formatCurrency(item.total_price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Total Summary Bar */}
            <div className="flex justify-between items-center border-t-2 border-black pt-3 mt-4">
                <div className="text-xs font-bold text-neutral-700">
                    <div>هواتف التنسيق: <span className="font-mono">{info.phones}</span></div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold">مبلغ القائمة الإجمالي:</span>
                    <div className="border-2 border-black px-5 py-1.5 font-mono text-xl font-black bg-neutral-100">
                        {formatCurrency(invoice.total_amount)} د.ع
                    </div>
                </div>
            </div>
        </div>
    );
}
