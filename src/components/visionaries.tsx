// components/VisionariesGallery.tsx

import React from 'react';

interface Visionary {
  name: string;
  title: string; // Main title (bold)
  subtitle?: string; // Subtitle (normal)
  imageUrl: string;
  alt: string;
  fallbackUrl?: string;
  ariaLabel: string;
}

const visionaries: Visionary[] = [
  {
    name: 'Ethan Katsh',
    title: 'Father of ODR',
    subtitle: 'Founder of The National Center for Technology and Dispute Resolution',
    imageUrl: '/visionaries/ethan.jpg',
    fallbackUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9c5f16be-c5c4-495d-b531-2414378234cf.png',
    alt: 'Portrait of Ethan Katsh, Father of ODR and Founder of The National Center for Technology and Dispute Resolution',
    ariaLabel: 'Ethan Katsh, Father of ODR and Founder of The National Center for Technology and Dispute Resolution',
  },
  {
    name: 'Collin Rule',
    title: 'ODR Wizard',
    subtitle: 'CEO of ODR.COM',
    imageUrl: '/visionaries/collin.jpg',
    fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
    alt: 'Portrait of Collin Rule, ODR Wizard and CEO of ODR.COM',
    ariaLabel: 'Collin Rule, ODR Wizard and CEO of ODR.COM',
  },
  {
    name: 'Chittu Nagarajan',
    title: 'Global ODR Pioneer',
    subtitle: 'Co-Founder ODR.COM',
    imageUrl: '/visionaries/chittu.png',
    fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
    alt: 'Portrait of Chittu Nagarajan, Global ODR Pioneer and Co-Founder ODR.COM',
    ariaLabel: 'Chittu Nagarajan, Global ODR Pioneer and Co-Founder ODR.COM',
  },
  {
    name: 'Leah Wing',
    title: 'Director at The National Center for Technology and Dispute Resolution',
    subtitle: 'Founding Board Member – ICODR',
    imageUrl: '/visionaries/leah.jpg',
    fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
    alt: 'Portrait of Leah Wing, Director of The National Center for Technology and Dispute Resolution and Founding Board Member – ICODR',
    ariaLabel: 'Leah Wing, Director of The National Center for Technology and Dispute Resolution and Founding Board Member – ICODR',
  },
  {
    name: 'Amy J. Schmitz',
    title: 'Professor',
    subtitle: 'The Ohio State Moritz College of Law',
    imageUrl: '/visionaries/amy.jpg',
    fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
    alt: 'Portrait of Amy J. Schmitz, Professor at The Ohio State Moritz College of Law',
    ariaLabel: 'Amy J. Schmitz, Professor at The Ohio State Moritz College of Law',
  },
  {
    name: 'Suman Kalani',
    title: 'Associate Professor',
    subtitle: `SVKM's Pravin Gandhi College of Law`,
    imageUrl: '/visionaries/suman.jpg',
    fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
    alt: `Portrait of Suman Kalani, Associate Professor at SVKM's Pravin Gandhi College of Law, Mumbai, India`,
    ariaLabel: `Suman Kalani, Associate Professor at SVKM's Pravin Gandhi College of Law.`,
  },
];

const VisionariesGallery: React.FC = () => {
  // 3D tilt effect on mouse move
  React.useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.card');
    cards.forEach(card => {
      const cardInner = card.querySelector<HTMLElement>('.card-inner');
      if (!cardInner) return;
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * 7;
        const rotateY = ((x - centerX) / centerX) * 7;
        cardInner.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
      });
      card.addEventListener('mouseleave', () => {
        cardInner.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
      });
    });
    return () => {
      cards.forEach(card => {
        card.replaceWith(card.cloneNode(true));
      });
    };
  }, []);

  // Separate visionaries into rows as requested
  const firstRow = [visionaries[0]]; // Ethan Katsh
  const secondRow = [visionaries[1], visionaries[2], visionaries[3]]; // Collin, Chittu, Leah
  const thirdRow = [visionaries[4], visionaries[5]]; // Amy, Suman

  const renderCard = (v: Visionary, idx: number) => (
    <article
      className={
        `card cursor-pointer [perspective:1000px] animate-floatUpDown` +
        (idx ? ` [animation-delay:${idx * 0.2}s]` : '')
      }
      role="group"
      tabIndex={0}
      aria-label={v.ariaLabel}
      key={v.name}
    >
      <div className="card-inner transition-transform duration-500 ease-[ease] [transform-style:preserve-3d] will-change-transform ">
        <div className="relative p-4 flex flex-col items-center gap-4 rounded-2xl h-[21vw] w-[20vw] shadow-lg bg-white overflow-hidden [backface-visibility:hidden] ">
          <img
            src={v.imageUrl}
            alt={v.alt}
            loading="lazy"
            className="
              rounded-full border-4 border-blue-600
              w-[12vw] h-[12vw]
              object-cover flex-shrink-0 shadow-lg transition-transform duration-300 ease-[ease]"
            onError={e => {
              if (v.fallbackUrl) (e.currentTarget as HTMLImageElement).src = v.fallbackUrl;
            }}
          />
          <h3 className="name font-bold text-xl text-slate-800 text-center select-none">{v.name}</h3>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-base text-slate-700 text-center select-none">{v.title}</span>
            {v.subtitle && (
              <span className="font-normal text-base text-slate-600 text-center select-none">{v.subtitle}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <section className="py-16 bg-gradient-to-b from-gray-100 to-sky-100">
      <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[#0a1e42] sm:text-5xl md:text-6xl text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0a1e42] to-[#3a86ff]">
          ODR Lab Visionaries
        </span>
      </h2>
      <p className="mx-auto max-w-xl mb-12 text-lg text-gray-600 sm:text-xl md:text-2xl text-center font-medium">
        Pioneers of Collaborative ODR Innovation.
      </p>
      <div className="mt-2 mb-8 mx-auto w-24 h-1 bg-gradient-to-r from-[#3a86ff] to-indigo-600 rounded-full"></div>
      <div className="max-w-full mx-auto">
        {/* First Row - Ethan Katsh (centered) */}
        <div className="flex justify-center mb-8">
          <div className="">
            {renderCard(firstRow[0], 0)}
          </div>
        </div>

        {/* Second Row - Collin, Chittu, Leah (3 cards centered) */}
        <div className="flex justify-center mb-8">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-full">
            {secondRow.map((v, idx) => renderCard(v, idx + 1))}
          </div>
        </div>

        {/* Third Row - Amy, Suman (2 cards centered) */}
        <div className="flex justify-center">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 max-w-full">
            {thirdRow.map((v, idx) => renderCard(v, idx + 4))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionariesGallery;

// components/VisionariesGallery.tsx
// import React from 'react';

// interface Visionary {
//   name: string;
//   title: string;
//   imageUrl: string;
//   alt: string;
//   fallbackUrl?: string;
//   ariaLabel: string;
// }

// const visionaries: Visionary[] = [
//   {
//     name: 'Ethan Katsh',
//     title: 'Father of ODR, Founder of ODR Info',
//     imageUrl: '/visionaries/ethan.jpg',
//     fallbackUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9c5f16be-c5c4-495d-b531-2414378234cf.png',
//     alt: 'Portrait of Ethan Katsh, Father of Online Dispute Resolution, Founder of ODR Info, depicted with scholarly attire and thoughtful expression',
//     ariaLabel: 'Ethan Katsh, Father of ODR, Founder of ODR Info',
//   },
//   {
//     name:'Collin Rule',
//     title: 'CEO, ODR.com',
//     imageUrl: '/visionaries/collin.jpg',
//     fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
//     alt: 'Portrait of Collin Rule, CEO of ODR.com, with professional demeanor and engaging smile',
//     ariaLabel: 'Collin Rule, CEO of ODR.com',
//   },
//   {
//     name: 'Chittu Nagarajan',
//     title: 'Co-founder, odr.com',
//     imageUrl: '/visionaries/chittu.png',
//     fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
//     alt: 'Portrait of Chittu Nagarajan, co-founder of odr.com, with approachable expression and professional attire',
//     ariaLabel: 'Chittu Nagarajan, co-founder odr.com',
//   },
//   {
//     name: 'Leah Wing',
//     title: 'Senior Lecturer II, Legal Studies',
//     imageUrl: '/visionaries/leah.jpg',
//     fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
//     alt: 'Portrait of Leah Wing, Senior Lecturer II of Legal Studies',
//     ariaLabel: 'Leah Wing Senior Lecturer of Legal Studies, \nCollege of Social and Behavioral Sciences, University of Massachusetts',
//   },
//   {
//     name: 'Amy J. Schmitz',
//     title: 'Professor, \nThe Ohio State Moritz College of Law',
//     imageUrl: '/visionaries/amy.jpg',
//     fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
//     alt: 'Portrait of Amy J. Schmitz, Professor at The Ohio State Moritz College of Law, wearing professional attire with a confident smile',
//     ariaLabel: 'Amy J. Schmitz is a professor, The Ohio State Moritz College of Law',
//   },
//   {
//     name: 'Suman Kalani',
//     title: `Associate Professor,\nSVKM's Pravin Gandhi College of Law`,
//     imageUrl: '/visionaries/suman.jpg',
//     fallbackUrl: 'https://placehold.co/150x150?text=Image+Unavailable',
//     alt: `Portrait of Suman Kalani, Associate Professor at SVKM's Pravin Gandhi College of Law, portrayed with scholarly professionalism`,
//     ariaLabel: `Suman Kalani Associate professor at SVKM's Pravin Gandhi College of Law`,
//   },
// ];

// const VisionariesGallery: React.FC = () => {
//   // 3D tilt effect on mouse move
//   React.useEffect(() => {
//     const cards = document.querySelectorAll<HTMLElement>('.card');
//     cards.forEach(card => {
//       const cardInner = card.querySelector<HTMLElement>('.card-inner');
//       if (!cardInner) return;
//       card.addEventListener('mousemove', e => {
//         const rect = card.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const y = e.clientY - rect.top;
//         const centerX = rect.width / 2;
//         const centerY = rect.height / 2;
//         const rotateX = ((y - centerY) / centerY) * 7;
//         const rotateY = ((x - centerX) / centerX) * 7;
//         cardInner.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
//       });
//       card.addEventListener('mouseleave', () => {
//         cardInner.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
//       });
//     });
//     return () => {
//       cards.forEach(card => {
//         card.replaceWith(card.cloneNode(true));
//       });
//     };
//   }, []);

//   return (
//     <section className="py-16 bg-gradient-to-b from-gray-100 to-sky-100">
//       <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[#0a1e42] sm:text-5xl md:text-6xl text-center">
//         <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0a1e42] to-[#3a86ff]">
//           ODR Lab Visionaries
//         </span>
//       </h2>
//       <p className="mx-auto max-w-xl mb-12 text-lg text-gray-600 sm:text-xl md:text-2xl text-center font-medium">
//         Pioneers of Collaborative ODR Innovation.
//       </p>
//       <div className="mt-2 mb-8 mx-auto w-24 h-1 bg-gradient-to-r from-[#3a86ff] to-indigo-600 rounded-full"></div>
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
//           {visionaries.map((v, idx) => (
//             <article
//               className={
//                 `card cursor-pointer [perspective:1000px] animate-floatUpDown` +
//                 (idx ? ` [animation-delay:${idx * 0.2}s]` : '')
//               }
//               role="group"
//               tabIndex={0}
//               aria-label={v.ariaLabel}
//               key={v.name}
//             >
//               {/* Your existing card content */}
//               <div className="card-inner transition-transform duration-500 ease-[ease] [transform-style:preserve-3d] will-change-transform">
//                 <div className="relative p-8 flex flex-col items-center gap-4 h-5/12 w-full rounded-2xl shadow-lg bg-white overflow-hidden [backface-visibility:hidden]">
//                   <img
//                     src={v.imageUrl}
//                     alt={v.alt}
//                     loading="lazy"
//                     className="
//                       rounded-full border-4 border-blue-600
//                       w-[65%] h-[54%]
//                       sm:w-[120px] sm:h-[120px]
//                       md:w-[160px] md:h-[160px]
//                       lg:w-[180px] lg:h-[180px]
//                       object-cover flex-shrink-0 shadow-lg transition-transform duration-300 ease-[ease]"
//                     onError={e => {
//                       if (v.fallbackUrl) (e.currentTarget as HTMLImageElement).src = v.fallbackUrl;
//                     }}
//                   />
//                   <h3 className="name font-bold text-xl text-slate-800 text-center select-none">{v.name}</h3>
//                   <p className="title font-medium text-base text-slate-600 text-center leading-tight select-none" dangerouslySetInnerHTML={{ __html: v.title.replace(/\n/g, '<br/>') }} />
//                 </div>
//               </div>
//             </article>
//           ))}
//         </div>

       
//       </div >
//       {/* <style>{`
//         .card { perspective: 1000px; }
//         .card-inner {
//           transition: transform 0.5s ease;
//           transform-style: preserve-3d;
//           will-change: transform;
//         }
//         .card:hover .card-inner {
//           transform: rotateY(10deg) rotateX(5deg) translateZ(30px);
//           box-shadow: 0 20px 30px rgb(0 0 0 / 0.15);
//         }
//         .card-front, .card-back {
//           backface-visibility: hidden;
//           border-radius: 1rem;
//           box-shadow: 0 10px 20px rgb(0 0 0 / 0.1);
//           background: white;
//           overflow: hidden;
//         }
//         .card-front {
//           position: relative;
//           padding: 2rem 1.5rem 2.5rem;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 1rem;
//           min-height: 520px;
//           width: 20vw;
//         }
//         .card-front img {
//           border-radius: 50%;
//           border: 4px solid #2563EB;
//           width: 420px;
//           height: 320px;
//           object-fit: cover;
//           flex-shrink: 0;
//           box-shadow: 0 8px 15px rgb(37 99 235 / 0.3);
//           transition: transform 0.3s ease;
//         }
//         .card:hover .card-front img {
//           transform: scale(1.1);
//         }
//         .name {
//           font-weight: 700;
//           font-size: 1.25rem;
//           color: #1e293b;
//           text-align: center;
//           user-select: none;
//         }
//         .title {
//           font-weight: 500;
//           font-size: 1rem;
//           color: #475569;
//           text-align: center;
//           line-height: 1.3;
//           user-select: none;
//         }
//         .gallery-container {
//           max-width: 80vw;
//           margin-left: auto;
//           margin-right: auto;
//           padding: 2rem 1rem;
//           display: grid;
//           gap: 2rem;
//           grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
//         }
//         h2.section-title {
//           font-weight: 900;
//           font-size: 2.25rem;
//           color: #1e293b;
//           text-align: center;
//           margin-bottom: 0.25rem;
//           user-select: none;
//         }
//         p.section-subtitle {
//           text-align: center;
//           margin-bottom: 3rem;
//           color: #64748b;
//           user-select: none;
//           font-weight: 500;
//         }
//         @keyframes floatUpDown {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-8px); }
//         }
//       `}</style> */}
//     </section >
//   );
// };


// export default VisionariesGallery;