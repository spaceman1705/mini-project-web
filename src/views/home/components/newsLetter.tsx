export default function NewsLetterSection() {
  return (
    <section className="bg-secondary mt-16 mb-4 rounded-3xl p-8 text-center shadow-lg md:p-10">
      <h3 className="text-2xl font-semibold md:text-3xl">Stay in the loop</h3>
      <p className="text-muted mx-auto mt-3 max-w-xl text-sm md:text-base">
        Enter your email to receive weekly updates on popular events, curated
        just for you.
      </p>
      <form className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
        <input
          className="bg-tertiary border-lines h-12 flex-1 rounded-xl border px-4 text-sm outline-none"
          placeholder="your@email.com"
        />
        <button
          type="submit"
          className="h-12 rounded-xl bg-black px-5 text-sm font-medium text-white hover:bg-neutral-900"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}
