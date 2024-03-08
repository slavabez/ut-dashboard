import Link from "next/link";
import React from "react";

const AdminPage = () => {
  return (
    <div>
      <h1 className="text-2xl p-4 text-center font-bold">Админка</h1>
      <nav>
        <ul className="flex flex-col items-center space-y-2 text-orange-500 text-lg">
          <li>
            <Link href="/admin/sync">Синхронизация</Link>
          </li>
          <li>
            <Link href="/admin/users">Пользователи</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminPage;
