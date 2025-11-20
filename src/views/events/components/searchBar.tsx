import { IoSearch } from "react-icons/io5";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="border-lines bg-tertiary mb-4 flex items-center gap-3 rounded-2xl border px-3 py-2 sm:px-4">
      <IoSearch className="text-muted text-xl" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search events…"
        className="w-full bg-transparent py-2 outline-none"
      />
    </div>
  );
}
