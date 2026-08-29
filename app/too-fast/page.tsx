import { APP_NAME } from "@/lib/brand";

const Page = () => {
  return (
    <main className="root-container flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-serif text-5xl font-semibold text-dark-100">
        Slow down there.
      </h1>
      <p className="mt-3 max-w-xl text-center text-light-100">
        {APP_NAME} paused this request because too many attempts came from your
        network. Wait a moment, then try again.
      </p>
    </main>
  );
};

export default Page;
