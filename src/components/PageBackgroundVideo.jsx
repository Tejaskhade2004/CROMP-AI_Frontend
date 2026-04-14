import React from 'react';

function PageBackgroundVideo({
  src,
  overlayClass = 'bg-black/42',
  videoClass = 'opacity-48',
  poster = '/images/hero-poster.jpg'
}) {
  if (!src) return null;

  return (
    <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload='metadata'
        poster={poster}
        className={`h-full w-full object-cover ${videoClass}`}
      >
        <source src={src} type='video/mp4' />
      </video>

      <div className={`absolute inset-0 ${overlayClass}`} />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(124,58,237,0.22),transparent_45%)]' />
    </div>
  );
}

export default PageBackgroundVideo;
