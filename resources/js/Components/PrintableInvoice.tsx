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
        // DESIGN 2: شركة دلال المسك (Luxury Framed Editorial - 100% Black & White)
        // =========================================================================
        return (
            <div
                id={id}
                className="hidden print:block font-sans text-black bg-white p-3 leading-relaxed text-right dir-rtl w-full max-w-[210mm] mx-auto border-4 border-black"
                dir="rtl"
            >
                {/* Header Frame */}
                <div className="border-b-2 border-black pb-3 mb-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Right: Company Monogram Emblem */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center border-2 border-black font-black text-lg tracking-widest bg-white">
                                مسك
                            </div>
                            <div>
                                <h1 className="text-2xl font-black leading-none">{info.name}</h1>
                                <h2 className="text-xs font-bold text-black mt-1">{info.subTitle}</h2>
                            </div>
                        </div>

                        {/* Center: Large Invoice Badge */}
                        <div className="text-center border-2 border-black px-4 py-1.5 bg-neutral-100">
                            <span className="text-[11px] font-bold block">قائمة {invoice.type === 'sale' ? 'بيع' : 'شراء'}</span>
                            <span className="text-base font-black font-mono tracking-wider">{invoice.invoice_number}</span>
                        </div>

                        {/* Left: Date */}
                        <div className="text-left font-mono text-xs font-bold space-y-1">
                            <div>التاريخ: <span className="font-black">{formattedDate}</span></div>
                            <div className="text-[11px] font-sans">المحرر: {invoice.user_name || 'مدير النظام'}</div>
                        </div>
                    </div>

                    {/* Address & Phone Bar */}
                    <div className="flex justify-between items-center text-xs font-bold border-t border-black pt-2 mt-3 text-black">
                        <div>العنوان: {info.address}</div>
                        <div className="font-mono">{info.phones}</div>
                    </div>
                </div>

                {/* Customer Details Box */}
                <div className="border-2 border-black p-3 mb-4 bg-neutral-50 grid grid-cols-2 gap-4 text-xs font-bold">
                    <div>اسم العميــــل: <span className="font-black text-sm">{invoice.customer_name}</span></div>
                    <div>عنوان العميـل: <span>{invoice.customer_address || '.'}</span></div>
                </div>

                {/* Items Table with Grayscale Zebra Striping & Thick Underline Header */}
                <div className="mb-4">
                    <table className="w-full text-xs text-right border-collapse border-2 border-black">
                        <thead>
                            <tr className="border-b-4 border-black bg-neutral-200 text-black font-black">
                                <th className="p-2 border-r border-black text-center w-10">ت</th>
                                <th className="p-2 border-r border-black text-right">اسم المنتج</th>
                                <th className="p-2 border-r border-black text-center w-16">الكرتون</th>
                                <th className="p-2 border-r border-black text-center w-16">التعبئة</th>
                                <th className="p-2 border-r border-black text-center w-20">العدد</th>
                                <th className="p-2 border-r border-black text-center w-28">السعر</th>
                                <th className="p-2 text-center w-32">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item, index) => (
                                <tr key={index} className="border-b border-black text-black font-bold odd:bg-white even:bg-neutral-100">
                                    <td className="p-2 border-r border-black text-center font-mono">{index + 1}</td>
                                    <td className="p-2 border-r border-black text-right font-black">{item.product_name}</td>
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

                {/* Footer Signature & Grand Total Frame */}
                <div className="flex justify-between items-end gap-4 border-t-2 border-black pt-3">
                    <div className="text-xs font-bold space-y-1">
                        <div>توقيع المستلم: ................................</div>
                        <div className="text-[10px] text-neutral-600">شكراً لتعاملكم مع {info.name}</div>
                    </div>

                    <div className="border-4 border-double border-black px-6 py-2 bg-neutral-100 text-left">
                        <span className="text-xs font-bold block text-black">مبلغ القائمة الإجمالي:</span>
                        <span className="text-2xl font-mono font-black text-black">{formatCurrency(invoice.total_amount)} د.ع</span>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // DESIGN 1: شركة دلال دجلة (Executive Geometric Minimalist - 100% Black & White)
    // =========================================================================
    return (
        <div
            id={id}
            className="hidden print:block font-sans text-black bg-white p-3 leading-relaxed text-right dir-rtl w-full max-w-[210mm] mx-auto"
            dir="rtl"
        >
            {/* Header: Solid Black Top Banner with Inverted White Title */}
            <div className="bg-black text-white p-4 mb-4 flex justify-between items-center border-b-4 border-black">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">{info.name}</h1>
                    <p className="text-xs font-medium text-neutral-300 mt-0.5">{info.subTitle}</p>
                </div>
                <div className="text-left font-mono">
                    <div className="text-lg font-black tracking-wider bg-white text-black px-3 py-1 border border-white">
                        {invoice.invoice_number}
                    </div>
                    <div className="text-[11px] text-neutral-300 mt-1">تاريخ: {formattedDate}</div>
                </div>
            </div>

            {/* Information Grid: Crisp 2-Column Framed Layout */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-xs font-bold">
                {/* Customer Box */}
                <div className="col-span-2 border-2 border-black p-3 space-y-1">
                    <div className="text-[11px] text-neutral-600">تفاصيل العميل:</div>
                    <div className="text-sm font-black">{invoice.customer_name}</div>
                    <div>العنوان: <span>{invoice.customer_address || '.'}</span></div>
                </div>

                {/* Meta Box */}
                <div className="border-2 border-black p-3 space-y-1 bg-neutral-50 text-left" dir="rtl">
                    <div className="text-[11px] text-neutral-600">بيانات الفاتورة:</div>
                    <div>نوع الفاتورة: <span className="font-black">{invoice.type === 'sale' ? 'فاتورة بيع' : 'فاتورة شراء'}</span></div>
                    <div>الهاتف: <span className="font-mono">{info.phones.split('-')[0]}</span></div>
                </div>
            </div>

            {/* Items Table: Solid Black Header with White Text */}
            <div className="mb-4">
                <table className="w-full text-xs text-right border-collapse border-2 border-black">
                    <thead>
                        <tr className="bg-black text-white font-black">
                            <th className="p-2 border border-black text-center w-10">ت</th>
                            <th className="p-2 border border-black text-right">اسم المنتج</th>
                            <th className="p-2 border border-black text-center w-16">الكرتون</th>
                            <th className="p-2 border border-black text-center w-16">التعبئة</th>
                            <th className="p-2 border border-black text-center w-20">العدد</th>
                            <th className="p-2 border border-black text-center w-28">السعر</th>
                            <th className="p-2 border border-black text-center w-32">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((item, index) => (
                            <tr key={index} className="border-b border-black text-black font-bold">
                                <td className="p-2 border border-black text-center font-mono">{index + 1}</td>
                                <td className="p-2 border border-black text-right font-black">{item.product_name}</td>
                                <td className="p-2 border border-black text-center font-mono">{formatCurrency(item.boxes)}</td>
                                <td className="p-2 border border-black text-center font-mono">{formatCurrency(item.units_per_box)}</td>
                                <td className="p-2 border border-black text-center font-mono">{formatCurrency(item.total_pieces)}</td>
                                <td className="p-2 border border-black text-center font-mono">
                                    {formatCurrency(Math.round(item.box_price / (item.units_per_box || 1)))}
                                </td>
                                <td className="p-2 border border-black text-center font-mono font-black">{formatCurrency(item.total_price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary: Geometric Black Total Block */}
            <div className="flex justify-between items-center border-2 border-black p-3 bg-neutral-50">
                <div className="text-xs font-bold">
                    <span>العنوان: {info.address}</span>
                    <span className="block font-mono text-[11px] text-neutral-700">{info.phones}</span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold">مبلغ القائمة الإجمالي:</span>
                    <div className="bg-black text-white px-5 py-2 font-mono text-xl font-black">
                        {formatCurrency(invoice.total_amount)} د.ع
                    </div>
                </div>
            </div>
        </div>
    );
}
