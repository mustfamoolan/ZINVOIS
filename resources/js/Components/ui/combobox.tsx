import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
    id: number | string;
    label: string;
    sublabel?: string;
    badge?: string;
    badgeVariant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' | 'destructive';
    extraInfo?: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string, option?: ComboboxOption) => void;
    placeholder?: string;
    noResultsText?: string;
    className?: string;
    icon?: React.ReactNode;
    autoFocus?: boolean;
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = 'ابحث أو اختر...',
    noResultsText = 'لا توجد نتائج تطابق البحث',
    className,
    icon,
    autoFocus = false,
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const updatePosition = () => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
            });
        }
    };

    const handleOpen = () => {
        updatePosition();
        setIsOpen(true);
    };

    // Auto Focus logic ONLY for currently visible element in DOM (offsetParent !== null)
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            // Check if element is visible on current screen breakpoint (not hidden by display:none)
            if (inputRef.current.offsetParent !== null) {
                inputRef.current.focus();
                updatePosition();
                setIsOpen(true);
            }
        }
    }, [autoFocus]);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes((searchTerm || '').toLowerCase()))
    );

    // Reset highlight index on filter change
    useEffect(() => {
        setHighlightedIndex(0);
    }, [searchTerm]);

    useEffect(() => {
        function handleScrollOrResize() {
            if (isOpen) {
                updatePosition();
            }
        }

        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                const targetEl = event.target as HTMLElement;
                if (!targetEl.closest('.combobox-portal-panel')) {
                    setIsOpen(false);
                }
            }
        }

        if (isOpen) {
            window.addEventListener('scroll', handleScrollOrResize, true);
            window.addEventListener('resize', handleScrollOrResize);
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelectOption = (opt: ComboboxOption) => {
        setSearchTerm(opt.label);
        onChange(opt.label, opt);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        onChange(val);
        updatePosition();
        setIsOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            handleOpen();
            return;
        }

        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault(); // Prevent accidental form submission
            if (filteredOptions.length > 0 && filteredOptions[highlightedIndex]) {
                handleSelectOption(filteredOptions[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            <div className="relative flex items-center">
                <div className="absolute right-3 text-muted-foreground pointer-events-none">
                    {icon || <Search className="h-3.5 w-3.5" />}
                </div>
                <Input
                    ref={inputRef}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleOpen}
                    onClick={handleOpen}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="pr-9 pl-8 text-xs font-bold h-9 bg-background border-input focus:ring-1 focus:ring-ring"
                />
                <button
                    type="button"
                    onClick={() => {
                        if (isOpen) {
                            setIsOpen(false);
                        } else {
                            handleOpen();
                        }
                    }}
                    className="absolute left-2.5 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Portal Floating Search Panel */}
            {isOpen &&
                createPortal(
                    <div
                        style={{
                            position: 'fixed',
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            width: `${Math.max(coords.width, 280)}px`,
                            zIndex: 9999,
                        }}
                        className="combobox-portal-panel max-h-60 overflow-y-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 dir-rtl"
                    >
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2.5 text-xs text-muted-foreground text-center">
                                {searchTerm ? (
                                    <span>سيتم حفظ <strong>"{searchTerm}"</strong> كاسم جديد</span>
                                ) : (
                                    <span>{noResultsText}</span>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {filteredOptions.map((opt, index) => {
                                    const isSelected = opt.label === searchTerm;
                                    const isHighlighted = index === highlightedIndex;
                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => handleSelectOption(opt)}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                            className={cn(
                                                'flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors',
                                                isHighlighted || isSelected
                                                    ? 'bg-primary/10 text-primary font-bold'
                                                    : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                                            )}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="truncate">{opt.label}</span>
                                                {opt.sublabel && (
                                                    <span className="text-[11px] text-muted-foreground truncate">
                                                        ({opt.sublabel})
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {opt.badge && (
                                                    <Badge
                                                        variant={opt.badgeVariant || 'secondary'}
                                                        className="text-[10px] px-2 py-0"
                                                    >
                                                        {opt.badge}
                                                    </Badge>
                                                )}
                                                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>,
                    document.body
                )}
        </div>
    );
}
