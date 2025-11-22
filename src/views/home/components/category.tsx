type CategorySectionProps = {
  activeCategory: string | "All";
  onCategoryChange: (value: string | "All") => void;
  totalEvents: number;
  categories: string[];
};

export default function CategorySection({
  activeCategory,
  onCategoryChange,
  totalEvents,
  categories,
}: CategorySectionProps) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold md:text-2xl">Category</h2>
        <div className="text-muted text-sm">
          {totalEvents} {totalEvents === 1 ? "event found" : "events found"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        <button
          type="button"
          onClick={() => onCategoryChange("All")}
          className={`text-muted border-lines flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-lg transition ${
            activeCategory === "All"
              ? "from-accent1-hover to-accent2-hover bg-linear-to-r"
              : "bg-tertiary"
          }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`text-muted border-lines flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-lg transition ${
              activeCategory === category
                ? "from-accent1-hover to-accent2-hover bg-linear-to-r"
                : "bg-tertiary"
            }`}
            title={category}
          >
            <span className="truncate">{category}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
