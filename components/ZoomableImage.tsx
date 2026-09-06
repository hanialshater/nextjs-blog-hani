'use client'

// The named scroll region needs keyboard focus to pan an actual-size image.
/* eslint jsx-a11y/no-noninteractive-tabindex: ["error", { "roles": ["region"] }] */

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ImageProps } from 'next/image'
import Image from './Image'
import { useLocale } from '@/i18n/LocaleContext'

export default function ZoomableImage(props: ImageProps) {
  const { locale } = useLocale()
  const arabic = locale === 'ar'
  const root = useRef<HTMLSpanElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const captionId = useId()
  const [canZoom, setCanZoom] = useState(false)
  const [open, setOpen] = useState(false)
  const [actualSize, setActualSize] = useState(false)

  useEffect(() => {
    // Preserve linked images' navigation and keep decorative images quiet.
    setCanZoom(!!props.alt && !root.current?.closest('a, button'))
  }, [props.alt])

  useEffect(() => {
    if (!open) return
    const modal = dialog.current
    const opener = trigger.current
    modal?.showModal()
    closeButton.current?.focus()
    return () => {
      modal?.close()
      opener?.focus({ preventScroll: true })
    }
  }, [open])

  const source =
    typeof props.src === 'string'
      ? props.src
      : 'default' in props.src
        ? props.src.default.src
        : props.src.src
  const original =
    source.startsWith('/') && !source.startsWith('//')
      ? `${process.env.BASE_PATH || ''}${source}`
      : source

  return (
    <span ref={root} className="image-zoom">
      <Image {...props} alt={props.alt} />
      {canZoom && (
        <button
          ref={trigger}
          type="button"
          className="image-zoom-trigger"
          aria-label={`${arabic ? 'تكبير الصورة' : 'Enlarge image'}: ${props.alt}`}
          aria-haspopup="dialog"
          onClick={() => {
            setActualSize(false)
            setOpen(true)
          }}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="10" cy="10" r="6" />
            <path d="m15 15 6 6M10 7v6M7 10h6" />
          </svg>
          {arabic ? 'تكبير' : 'Enlarge'}
        </button>
      )}
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="image-viewer"
            aria-labelledby={captionId}
            onClose={() => setOpen(false)}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) dialog.current?.close()
            }}
          >
            <div className="image-viewer-toolbar">
              <button
                type="button"
                aria-pressed={actualSize}
                onClick={() => setActualSize((value) => !value)}
              >
                {actualSize
                  ? arabic
                    ? 'ملاءمة الشاشة'
                    : 'Fit to screen'
                  : arabic
                    ? 'الحجم الأصلي'
                    : 'Actual size'}
              </button>
              <button ref={closeButton} type="button" onClick={() => dialog.current?.close()}>
                {arabic ? 'إغلاق الصورة' : 'Close image'} <span aria-hidden="true">×</span>
              </button>
            </div>
            <div
              className="image-viewer-canvas"
              tabIndex={0}
              role="region"
              aria-label={arabic ? 'الصورة المكبرة' : 'Enlarged image'}
            >
              <img
                src={original}
                alt={props.alt}
                className={actualSize ? 'image-viewer-actual' : 'image-viewer-fit'}
              />
            </div>
            <p id={captionId} className="image-viewer-caption">
              {props.alt}
            </p>
          </dialog>,
          document.body
        )}
    </span>
  )
}
