import Image from "next/image";

export default function Home() {
  return (
      <div>
          <div>
              <Image src={'/logo.svg'} height={50} width={50} alt={'Logo'}/>
              <p className="text-xl font-semibold tracking-tight">EngTube</p>
          </div>
      </div>
  )
}
