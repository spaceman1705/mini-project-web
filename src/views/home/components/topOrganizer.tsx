export default function TopOrganizersSection() {
  return (
    <section className="mt-14">
      <div className="mb-4 flex items-end justify-between">
        <h3 className="text-xl font-semibold md:text-2xl">Top organizers</h3>
        <button
          type="button"
          className="text-muted hover:text-foreground text-sm underline underline-offset-4"
        >
          View all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-secondary border-lines rounded-2xl border p-4"
          >
            <div className="bg-tertiary h-16 w-16 rounded-xl" />
            <div className="mt-3 font-medium">Organizer {index + 1}</div>
            <div className="text-muted text-sm">
              {10 + index} events · ★ 4.{index + 1}
            </div>
            <button className="bg-tertiary border-lines mt-3 w-full rounded-xl border py-2 text-sm">
              Visit
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
