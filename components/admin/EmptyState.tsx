import Image from "next/image";

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-light-300 px-6 py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
        <Image src="/icons/admin/book.svg" alt="" width={28} height={28} />
      </div>
      <h3 className="text-lg font-semibold text-dark-400">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-light-500">{description}</p>
    </div>
  );
};

export default EmptyState;
