import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import CardWrapper from "@/components/auth/card-wrapper";

const AuthErrorPage = () => {
  return (
    <CardWrapper
      headerLabel="Что-то пошло не так!"
      backButtonHref="/auth/login"
      backButtonLabel="Вернуться к входу"
    >
      <div className="flex w-full items-center justify-center">
        <ExclamationTriangleIcon className="text-destructive" />
      </div>
    </CardWrapper>
  );
};

export default AuthErrorPage;
