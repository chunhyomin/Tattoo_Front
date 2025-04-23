import { css } from "styled-components";

const sizes = {
  mobile: "480px",
  tablet: "768px",
  laptop: "1024px",
};

const media = {
    mobile: `(max-width: ${size.mobile})`,
    tablet: `(max-width: ${size.tablet})`,
    laptop: `(max-width: ${size.laptop})`,
  };
  
  export default media;