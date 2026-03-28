import { UserMenu } from "./user-menu";

interface TopBarProps {
  userName: string;
  actions?: React.ReactNode;
}

export function TopBar({ userName, actions }: TopBarProps) {
  return (
    <header className="bg-navy text-white h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <img
          src="/assets/logo.svg"
          alt="HarborPass"
          width={140}
          height={36}
        />
        <span className="font-heading text-lg font-semibold">
          Sunset Harbor Marina
        </span>
      </div>
      <div className="flex items-center gap-4">
        {actions}
        <UserMenu userName={userName} />
      </div>
    </header>
  );
}
