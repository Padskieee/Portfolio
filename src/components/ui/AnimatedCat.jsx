
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function AnimatedCat() {
  return (
    <div
      className="animated-cat orange-cat"
      style={{
        width: "220px",
        height: "220px",
        maxWidth: "100%",
      }}
    >
      <DotLottieReact
        src="https://lottie.host/8cf4ba71-e5fb-44f3-8134-178c4d389417/0CCsdcgNIP.json"
        loop
        autoplay
      />
    </div>
  );
}
