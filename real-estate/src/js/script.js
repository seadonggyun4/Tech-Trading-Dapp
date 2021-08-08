window.onload = function () {
  Particles.init({
    selector: ".background",
  });
};
var particles = Particles.init({
  selector: ".background",
  color: ["#73b4fe", "#347dff", "#f3f3f3"],
  connectParticles: true,
  responsive: [
    {
      breakpoint: 1000,
      options: {
        color: ["#f3f3f3", "#73b4fe", "#347dff"],
        maxParticles: 100,
        connectParticles: false,
      },
    },
  ],
});
