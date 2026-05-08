export default function FeedbackCard({
  feedback,
}: any) {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          Customer Review
        </h2>

        <div className="px-4 py-2 rounded-full bg-yellow-100 text-sm font-bold">
          ⭐ {feedback.rating}/5
        </div>
      </div>

      <p className="mt-5 text-slate-600 leading-7">
        {feedback.review}
      </p>
    </div>
  );
}