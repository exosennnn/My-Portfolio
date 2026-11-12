import DotGrid from './DotGrid';

// Fixed background behind everything: a reactive dot grid plus two slowly drifting blurred blobs.
// Blobs stop moving when the user prefers reduced motion.
export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-white dark:bg-neutral-950"
    >
      <DotGrid />
      <div className="bg-blob blob-a" />
      <div className="bg-blob blob-b" />
    </div>
  );
}
