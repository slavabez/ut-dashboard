interface HeaderProps {
  label: string;
}

const Header = ({ label }: HeaderProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-4">
      <h1 className={"text-2xl font-semibold"}>Сказка п/у</h1>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

export default Header;
