import React from 'react'

const Home = () => {
    return (
        <main id=''  className="relative h-screen w-full overflow-hidden mt-18">
            {/* Background Video */}
            <video
                className="absolute top-0 left-0 w-full h-full object-cover md:object-cover"
                src="/bg_vid_3.mp4"
                autoPlay
                muted
                loop
                playsInline
            />
            {/* Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/40 bg-opacity-50" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-white text-center mt-[60vh]">
                    <h1 className=" oi-regular text-4xl px-10 md:text-5xl uppercase tracking-widest font-extralight text-[#ffffff]">Exciting Events</h1>
                    <p className="mt-4 px-5 text-gray-200 text-md font-sans md:text-xl">Gear up for a journey through mind-bending tech quests and inventive showdowns!</p>
                </div>
            </div>
        </main>
    )
}

export default Home
