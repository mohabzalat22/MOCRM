import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

export function MarkdownEditor({
    value,
    onChange,
    placeholder,
    className,
    minHeight = '150px',
}: MarkdownEditorProps) {
    const [mode, setMode] = useState<'write' | 'preview'>('write');

    return (
        <div className={cn(
            'flex flex-col rounded-xl border bg-background shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all duration-200', 
            className
        )}>
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'write' | 'preview')} className="w-full flex flex-col">
                <div className="flex items-center justify-between bg-muted/30 px-3 py-2 border-b">
                    <TabsList className="h-8 bg-background/50 p-1 border shadow-inner rounded-lg">
                        <TabsTrigger 
                            value="write" 
                            className="h-6 rounded-md px-3 py-1 text-[11px] font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            Write
                        </TabsTrigger>
                        <TabsTrigger 
                            value="preview" 
                            className="h-6 rounded-md px-3 py-1 text-[11px] font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            Preview
                        </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/40 border border-border/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">
                            Markdown Active
                        </span>
                    </div>
                </div>
                
                <div className="relative flex-1">
                    <TabsContent value="write" className="m-0 border-none p-0 focus-visible:ring-0">
                        <Textarea
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="min-h-[150px] w-full resize-none border-none bg-transparent p-4 text-sm leading-relaxed focus-visible:ring-0"
                            style={{ minHeight }}
                        />
                    </TabsContent>
                    
                    <TabsContent 
                        value="preview" 
                        className="m-0 border-none p-4 prose prose-sm dark:prose-invert max-w-none bg-muted/5 overflow-auto"
                        style={{ minHeight }}
                    >
                        {value ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {value}
                            </ReactMarkdown>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8 opacity-40">
                                <p className="text-sm italic">Nothing to preview yet...</p>
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
