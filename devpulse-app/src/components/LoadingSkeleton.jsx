// A "skeleton" is a gray placeholder shape that mimics the
// real content's layout. It tells the user "something is
// loading here" instead of showing a blank white screen.
// count = how many skeleton blocks to repeat.
export default function LoadingSkeleton({ count = 3, height = 90 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: `${height}px` }}
        />
      ))}
    </>
  );
}
