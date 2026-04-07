import Image from "next/image";

export default function page() {
    return (
        <div className="bg-red-200 flex items-center justify-center">
            {/* <div className='goku-sprite' /> */}

            <Image
                src="/images/sprites/goku-attack.png"
                alt="goku attack"
                width={320}
                height={290}
                className="goku-sprite"
            />
        </div>
    );
}
