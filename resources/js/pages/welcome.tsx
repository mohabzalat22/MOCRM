import { Head, Link } from '@inertiajs/react';
import { 
    Activity, 
    CheckCircle2, 
    ChevronRight, 
    Users 
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';

interface WelcomeProps {
    canRegister: boolean;
}

export default function Welcome({ canRegister }: WelcomeProps) {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            <Head title="Welcome" />
            
            {/* Header */}
            <header className="w-full">
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <AppLogo />
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                            Log in
                        </Link>
                        {canRegister && (
                            <Link href="/register">
                                <Button size="sm" className="rounded-full px-5">Get Started</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="pt-24 pb-32">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl mb-8 leading-[1.1]">
                            Manage your business, <br />
                            <span className="text-muted-foreground">one client at a time.</span>
                        </h1>
                        <p className="mx-auto max-w-xl text-lg text-muted-foreground mb-12 leading-relaxed">
                            A minimalist CRM designed for clarity. Track interactions, manage projects, and stay organized without the clutter.
                        </p>
                        <div className="flex items-center justify-center">
                            <Link href="/register">
                                <Button size="lg" className="h-14 px-10 text-base rounded-full shadow-lg hover:shadow-xl transition-all">
                                    Start your free trial <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 border-t bg-muted/5">
                    <div className="container mx-auto px-6">
                        <div className="grid gap-12 md:grid-cols-3">
                            <FeatureCard 
                                icon={<Users className="h-5 w-5" />}
                                title="Client focused"
                                description="A clean directory for all your client data, custom fields, and tags."
                            />
                            <FeatureCard 
                                icon={<Activity className="h-5 w-5" />}
                                title="Activity history"
                                description="Every call, email, and meeting logged in a simple, chronological timeline."
                            />
                            <FeatureCard 
                                icon={<CheckCircle2 className="h-5 w-5" />}
                                title="Project tracking"
                                description="Organize deliverables and hit milestones with straightforward project tools."
                            />
                        </div>
                    </div>
                </section>

                {/* Simplified CTA */}
                <section className="py-32">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-semibold mb-6">Ready to simplify your workflow?</h2>
                        <Link href="/register">
                            <Button variant="outline" size="lg" className="rounded-full px-12 h-14 text-lg hover:bg-primary hover:text-primary-foreground transition-all">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
                        <p className="text-sm">
                            &copy; {new Date().getFullYear()} MOCRM.
                        </p>
                        <div className="flex gap-8">
                            <a href="#" className="text-xs hover:text-primary underline-offset-4 hover:underline">Privacy</a>
                            <a href="#" className="text-xs hover:text-primary underline-offset-4 hover:underline">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary border border-primary/20">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}
