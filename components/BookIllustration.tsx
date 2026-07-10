import Image from './Image'

interface BookIllustrationProps {
  src: string
  alt: string
  caption?: string
  priority?: boolean
}

export default function BookIllustration({
  src,
  alt,
  caption,
  priority = false,
}: BookIllustrationProps) {
  return (
    <figure className="not-prose my-10 sm:my-14" dir="rtl">
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-[#f4ecd9] shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <Image
          src={src}
          alt={alt}
          width={1536}
          height={1024}
          sizes="(min-width: 1280px) 760px, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
          priority={priority}
          className="block h-auto w-full"
        />
      </div>
      {caption && (
        <figcaption className="mx-auto mt-3 max-w-2xl px-2 text-center text-sm leading-7 text-gray-600 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
