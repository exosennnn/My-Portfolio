// Fixed background behind everything: a faded dot grid plus two slowly drifting blurred blobs.
// Pure CSS, no JS per frame. Blobs stop moving when the user prefers reduced motion.
export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-white dark:bg-neutral-950"
    >
      <div className="bg-dots absolute inset-0" />
      <div className="bg-blob blob-a" />
      <div className="bg-blob blob-b" />
    </div>
  );
}
