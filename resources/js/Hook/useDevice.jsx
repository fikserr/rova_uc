// useDevice.jsx
import { useEffect, useState } from "react";

const useDevice = () => {
    const [device, setDevice] = useState("desktop");

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setDevice(width <= 768 ? "mobile" : "desktop"); // mobile breakpoint <= 768px
        };

        checkDevice(); // check initially

        window.addEventListener("resize", checkDevice); // update on resize
        return () => window.removeEventListener("resize", checkDevice); // cleanup
    }, []);

    return device;
};

export default useDevice;
