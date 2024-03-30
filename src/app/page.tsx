import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl p-4 text-center font-bold">Главная страница</h1>
      <nav>
        <ul className="flex flex-col items-center space-y-2 text-orange-500 text-lg">
          <li>
            <Link href="/auth/register">Регистрация</Link>
          </li>
          <li>
            <Link href="/auth/login">Вход</Link>
          </li>
          <li>
            <Link href="/profile">Настройки</Link>
          </li>
          <li>
            <Link href="/admin">Админка</Link>
          </li>
          <li>
            <Link href="/orders">Заказы</Link>
          </li>
          <li>
            <Link href="/reports">Отчёты</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
