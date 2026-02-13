interface AppLogoIconProps {
    className?: string;
}

export default function AppLogoIcon(props: AppLogoIconProps) {
    return (
        <div className={props.className}>
            <img src="/logo.svg" alt="" className="h-full w-full" />
        </div>
    );
}
