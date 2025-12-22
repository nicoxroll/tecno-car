import React from "react";

const BRANDS = [
  {
    name: "BMW",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/512px-BMW.svg.png",
  },
  {
    name: "Tesla",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.png/512px-Tesla_logo.png",
  },
  {
    name: "Audi",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Audi_logo_detail.svg/512px-Audi_logo_detail.svg.png",
  },
  {
    name: "Mercedes-Benz",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/512px-Mercedes-Logo.svg.png",
  },
  {
    name: "Porsche",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Porsche_Logo.svg/512px-Porsche_Logo.svg.png",
  },
  {
    name: "Ferrari",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Ferrari-Logo.svg/512px-Ferrari-Logo.svg.png",
  },
  {
    name: "Lamborghini",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Lamborghini_Logo.svg/512px-Lamborghini_Logo.svg.png",
  },
  {
    name: "Volkswagen",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/512px-Volkswagen_logo_2019.svg.png",
  },
  {
    name: "Toyota",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/512px-Toyota_carlogo.svg.png",
  },
  {
    name: "Honda",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/512px-Honda.svg.png",
  },
];

const Brands: React.FC = () => {
  // Duplicate brands for seamless loop
  const brandsRow1 = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];
  const brandsRow2 = [...BRANDS].reverse();
  const brandsRow2Duplicated = [
    ...brandsRow2,
    ...brandsRow2,
    ...brandsRow2,
    ...brandsRow2,
  ];

  return (
    <section className="py-16 bg-black border-b border-zinc-900 overflow-hidden relative z-20">
      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

      <div className="flex flex-col gap-12 opacity-50 hover:opacity-100 transition-opacity duration-500">
        {/* Row 1 */}
        <div className="flex gap-24 animate-marquee whitespace-nowrap w-max items-center">
          {brandsRow1.map((brand, index) => (
            <div
              key={`r1-${index}`}
              className="h-12 md:h-16 w-auto flex items-center justify-center grayscale brightness-0 invert opacity-50 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                crossOrigin="anonymous"
                className="h-full w-auto object-contain"
                onError={(e) => {
                  // Fallback to text if image fails
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerText = brand.name;
                  e.currentTarget.parentElement!.className =
                    "text-3xl md:text-5xl font-bold text-zinc-800 uppercase tracking-tighter hover:text-white transition-colors cursor-default select-none";
                }}
              />
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex gap-24 animate-marquee-reverse whitespace-nowrap w-max -ml-12 items-center">
          {brandsRow2Duplicated.map((brand, index) => (
            <div
              key={`r2-${index}`}
              className="h-12 md:h-16 w-auto flex items-center justify-center grayscale brightness-0 invert opacity-50 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                crossOrigin="anonymous"
                className="h-full w-auto object-contain"
                onError={(e) => {
                  // Fallback to text if image fails
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerText = brand.name;
                  e.currentTarget.parentElement!.className =
                    "text-3xl md:text-5xl font-bold text-zinc-800 uppercase tracking-tighter hover:text-white transition-colors cursor-default select-none";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;
