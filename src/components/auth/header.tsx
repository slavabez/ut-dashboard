import { H1, Muted } from "@/components/typography";

interface HeaderProps {
  label: string;
}

const Header = ({ label }: HeaderProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-4">
      <H1>Сказка портал</H1>
      <Muted>{label}</Muted>
    </div>
  );
};

export default Header;
