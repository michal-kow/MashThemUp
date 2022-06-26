import Slider from "@mui/material/Slider";
import { useEffect, useState } from "react";
import React from "react";
import './SliderComponent.css'

const SliderComponent = (props) => {

    const targetBpmRounded = Math.round(props.targetBpm);

    const [sliderValue, setSliderValue] = useState([Math.round(targetBpmRounded-0.2*targetBpmRounded), targetBpmRounded, Math.round(targetBpmRounded+0.2*targetBpmRounded)]);

    const handleChange = (event) => {
        setSliderValue([event.target.value[0], targetBpmRounded, event.target.value[2]]);
      };

    const valuetext = (value) => {
        return `${value}°C`;
    }

    useEffect(() => {
        props.sendData(sliderValue);
    }, [sliderValue])

    return (
        <Slider
            className="Slider"
            getAriaLabel={() => 'Tempo range'}
            value={sliderValue}
            onChange={handleChange}
            getAriaValueText={valuetext}
            step={1}
            min={50}
            max={250}
            valueLabelDisplay="on"
        />
    );
}
 
export default SliderComponent;