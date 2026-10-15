export default function Button({ children, ...props }) {
  return (
    <button
      className="h-[54px] w-full rounded-full bg-brand text-base font-extrabold text-white disabled:opacity-60"
      {...props}
    >
      {children}
    </button>
  );
}