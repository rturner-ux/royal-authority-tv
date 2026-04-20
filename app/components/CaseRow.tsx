export default function CaseRow() {
  const cases = [
    {
      title: "THE ZANZIBAR INCIDENT",
      tag: "FEATURED CASE",
    },
    {
      title: "INVESTIGATIVE DESK",
      tag: "SERIES",
    },
    {
      title: "BREAKING ANALYSIS",
      tag: "LIVE",
    },
  ];

  return (
    <div className="mt-16 w-full max-w-6xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-300">
        Featured Cases
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {cases.map((c, i) => (
          <div
            key={i}
            className="min-w-[300px] h-[180px] bg-zinc-900 rounded-xl p-4 flex flex-col justify-end hover:scale-105 transition cursor-pointer border border-white/10"
          >
            <span className="text-xs text-red-500">{c.tag}</span>
            <h3 className="text-lg font-bold">{c.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}