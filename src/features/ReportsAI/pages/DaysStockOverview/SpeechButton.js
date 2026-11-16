import React, { useRef, useState } from 'react'
import clsx from 'clsx'
import reportsApi from 'src/api/reports.api'
import { buildSpeechRequest, buildSpeechText, speechSrc } from './speech'

/* Nút "Đọc báo cáo" cạnh nút bộ lọc — giống trang mẫu:
   ghép câu từ số liệu 5 khối -> gọi Google/Zalo TTS qua UrlAction@invoke -> phát trong khung dưới màn hình.
   Câu không đổi thì phát lại âm thanh cũ, không gọi lại. */
function SpeechButton({ provider, data, date, stockNames, disabled }) {
  const [pending, setPending] = useState(false)
  const [src, setSrc] = useState('')
  const [error, setError] = useState('')
  const cacheRef = useRef({ text: '', src: '' })

  if (!provider) return null

  const onPlay = () => {
    const text = buildSpeechText({ data, date, stockNames })
    setError('')
    if (cacheRef.current.text === text && cacheRef.current.src) {
      setSrc(cacheRef.current.src)
      return
    }
    const body = buildSpeechRequest(provider, text)
    if (!body) return
    setPending(true)
    reportsApi
      .urlAction(body)
      .then(({ data: res }) => {
        const url = speechSrc(provider, res)
        if (url) {
          cacheRef.current = { text, src: url }
          setSrc(url)
        } else {
          setError('Không tạo được giọng đọc')
        }
      })
      .catch(err => {
        console.log(err)
        setError('Không tạo được giọng đọc')
      })
      .finally(() => setPending(false))
  }

  const busy = disabled || pending
  return (
    <>
      <button
        type="button"
        className={clsx(
          'btn p-0 w-40px h-35px me-2 so-play',
          pending && 'spinner spinner-success spinner-center'
        )}
        onClick={onPlay}
        disabled={busy}
        aria-label="Đọc báo cáo"
        title={error || 'Đọc báo cáo'}
      >
        {!pending && (
          <i className="fa-regular fa-play font-size-lg" aria-hidden="true"></i>
        )}
      </button>
      {src && (
        <div className="so-player" role="dialog" aria-label="Đọc báo cáo">
          <div className="so-player__overlay" onClick={() => setSrc('')}></div>
          <div className="so-player__sheet">
            <div className="so-player__head">
              <span>Đọc báo cáo</span>
              <button
                type="button"
                className="so-player__close"
                onClick={() => setSrc('')}
                aria-label="Đóng"
              >
                <i className="fa-regular fa-xmark" aria-hidden="true"></i>
              </button>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio src={src} controls autoPlay className="so-player__audio" />
          </div>
        </div>
      )}
    </>
  )
}

export default SpeechButton
