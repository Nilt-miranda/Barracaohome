import Image from 'next/image';

/** Foto da página pública. Sem `src`, mostra o espaço reservado com o nome da foto que falta. */
export default function Foto({ src, alt, className = '', prioridade = false }: {
  src: string; alt: string; className?: string; prioridade?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-[#263D2D] ${className}`}>
      {src ? (
        <Image unoptimized fill src={src} alt={alt} loading={prioridade ? 'eager' : 'lazy'} className="object-cover" />
      ) : (
        <span className="absolute bottom-3 left-4 text-xs text-[#E7E0D2]/50">Foto: {alt}</span>
      )}
    </div>
  );
}
