import Image from 'next/image';

export default function Marca({ tamanho = 40 }: { tamanho?: number }) {
  return (
    <span className="flex items-center gap-3">
      <Image unoptimized loading="eager" width={tamanho} height={tamanho}
        src="/barracaologo.jpg"
        alt=""
        className="rounded-sm object-cover"
        style={{ width: tamanho, height: tamanho }}
      />
      <span className="text-lg font-medium leading-none text-[#F1E9D5] [font-family:Bitter,Georgia,serif]">
        Barracão da Praça
      </span>
    </span>
  );
}
