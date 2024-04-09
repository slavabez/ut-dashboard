import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import CardWrapper from "@/components/auth/card-wrapper";
import PageWrapper from "@/components/layout-components";

const AuthErrorPage = () => {
  return (
    <PageWrapper>
      <CardWrapper
        headerLabel="Что-то пошло не так!"
        backButtonHref="/auth/login"
        backButtonLabel="Вернуться к входу"
      >
        <div className="flex w-full items-center justify-center">
          <ExclamationTriangleIcon className="text-destructive" />
        </div>
      </CardWrapper>
    </PageWrapper>
  );
};

export default AuthErrorPage;
