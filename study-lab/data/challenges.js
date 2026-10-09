// Challenge problems: longer, interview-style problems with hints and a mark scheme.
// answer: {type: 'numeric', value, tol (relative)} | {type: 'order', value, factor} | {type: 'text', accept: [...]} | null (marked by AI / yourself)
(function () {
  const R = String.raw;
  window.ESAT_CHALLENGES = [

{ id: 'cm-zeros', subject: 'maths', difficulty: 2, title: 'Zeros at the end of 100!',
  statement: R`How many zeros are there at the end of $100! = 1 \times 2 \times 3 \times \cdots \times 100$?`,
  hints: [R`Each trailing zero comes from a factor of 10, i.e. a pair $2 \times 5$.`, R`There are far more factors of 2 than of 5, so just count the factors of 5.`, R`Multiples of 25 contribute **two** factors of 5.`],
  answer: { type: 'numeric', value: 24, tol: 0 },
  solution: R`Trailing zeros come from factors of $10 = 2 \times 5$. Factors of 2 are plentiful, so count factors of 5.

Multiples of 5 up to 100: 20. Multiples of 25 (each gives an extra 5): 4.

Total $= 20 + 4 = 24$ zeros.`,
  markScheme: [{ marks: 1, criterion: 'Links trailing zeros to factors of 10 = 2 × 5' }, { marks: 1, criterion: 'Argues factors of 5 are the limiting factor' }, { marks: 1, criterion: 'Counts multiples of 5 (20)' }, { marks: 1, criterion: 'Accounts for multiples of 25 giving an extra factor' }, { marks: 1, criterion: 'Correct answer 24' }] },

{ id: 'cm-telescope', subject: 'maths', difficulty: 2, title: 'A collapsing sum',
  statement: R`Find the exact value of
$$\frac{1}{1 \times 2} + \frac{1}{2 \times 3} + \frac{1}{3 \times 4} + \cdots + \frac{1}{99 \times 100}.$$`,
  hints: [R`Work out the first few partial sums. Do you see a pattern?`, R`Try writing $\dfrac{1}{k(k+1)}$ as the difference of two simpler fractions.`, R`$\dfrac{1}{k(k+1)} = \dfrac{1}{k} - \dfrac{1}{k+1}$.`],
  answer: { type: 'numeric', value: 0.99, tol: 1e-9 },
  solution: R`Since $\dfrac{1}{k(k+1)} = \dfrac{1}{k} - \dfrac{1}{k+1}$, the sum is
$$\left(1 - \tfrac{1}{2}\right) + \left(\tfrac{1}{2} - \tfrac{1}{3}\right) + \cdots + \left(\tfrac{1}{99} - \tfrac{1}{100}\right) = 1 - \frac{1}{100} = \frac{99}{100}.$$

All the middle terms cancel ("telescope").`,
  markScheme: [{ marks: 2, criterion: 'Splits $\\frac{1}{k(k+1)}$ into partial fractions $\\frac{1}{k} - \\frac{1}{k+1}$ (or spots the pattern $\\frac{n}{n+1}$ from partial sums)' }, { marks: 1, criterion: 'Shows the cancellation clearly' }, { marks: 1, criterion: 'Correct answer $\\frac{99}{100}$' }] },

{ id: 'cm-last-digits', subject: 'maths', difficulty: 3, title: 'The last two digits of 7²⁰²⁶',
  statement: R`What are the last two digits of $7^{2026}$?`,
  hints: [R`Work out the last two digits of $7^1, 7^2, 7^3, 7^4, \ldots$`, R`$7^4 = 2401$. What does that tell you about $7^8$, $7^{12}$, …?`, R`$2026 = 4 \times 506 + 2$.`],
  answer: { type: 'numeric', value: 49, tol: 0 },
  solution: R`$7^4 = 2401$ ends in 01, so every $7^{4k}$ ends in 01 (multiplying numbers ending in 01 gives a number ending in 01).

$7^{2026} = (7^4)^{506} \times 7^2$, which ends in the same two digits as $01 \times 49$: **49**.`,
  markScheme: [{ marks: 1, criterion: 'Computes small powers of 7 modulo 100 / looks for a cycle' }, { marks: 2, criterion: 'Identifies that $7^4$ ends in 01 and uses it to reduce the power' }, { marks: 1, criterion: 'Writes 2026 = 4 × 506 + 2' }, { marks: 1, criterion: 'Correct answer 49' }] },

{ id: 'cm-semicircle', subject: 'maths', difficulty: 3, title: 'Largest rectangle in a semicircle',
  statement: R`A rectangle is drawn inside a semicircle of radius 1, with one side lying along the diameter and the two other corners on the arc.

What is the largest possible area of the rectangle?`,
  hints: [R`Put the centre of the diameter at the origin. If a top corner is at $(x, y)$, what are the rectangle's width and height?`, R`Area $= 2x\sqrt{1 - x^2}$. Maximise it – it's easier to maximise its square.`, R`Alternatively use an angle: corner at $(\cos\theta, \sin\theta)$ gives area $2\sin\theta\cos\theta = \sin 2\theta$.`],
  answer: { type: 'numeric', value: 1, tol: 0.001 },
  solution: R`Let a top corner be $(\cos\theta, \sin\theta)$. The rectangle is $2\cos\theta$ wide and $\sin\theta$ tall, so

$$A = 2\sin\theta\cos\theta = \sin 2\theta \le 1,$$

with equality at $\theta = 45°$. The maximum area is **1** (a $\sqrt{2} \times \frac{1}{\sqrt{2}}$ rectangle).`,
  markScheme: [{ marks: 1, criterion: 'Sets up a variable for a corner on the arc' }, { marks: 1, criterion: 'Correct expression for the area' }, { marks: 2, criterion: 'Valid maximisation (calculus, completing the square on $x^2(1-x^2)$, or $\\sin 2\\theta$)' }, { marks: 1, criterion: 'Correct maximum area 1' }] },

{ id: 'cm-stick', subject: 'maths', difficulty: 4, title: 'Breaking a stick into a triangle',
  statement: R`A stick of length 1 is broken at two points chosen independently and uniformly at random along its length.

What is the probability that the three pieces can form a triangle?`,
  hints: [R`Three lengths form a triangle exactly when the longest piece is less than half the total length.`, R`Let the break points be $x$ and $y$. Draw the unit square of all possible $(x, y)$ and shade the good region.`, R`By symmetry, look only at $x < y$: you need $x < \frac{1}{2}$, $y - x < \frac{1}{2}$ and $y > \frac{1}{2}$.`],
  answer: { type: 'numeric', value: 0.25, tol: 0.001 },
  solution: R`The pieces form a triangle iff each is shorter than $\frac{1}{2}$ (triangle inequality with total length 1).

Take $x < y$ (half of the unit square). The conditions $x < \frac{1}{2}$, $y > \frac{1}{2}$, $y - x < \frac{1}{2}$ cut out a triangle of area $\frac{1}{8}$ inside the half-square of area $\frac{1}{2}$.

Probability $= \frac{1/8}{1/2} = \frac{1}{4}$.`,
  markScheme: [{ marks: 1, criterion: 'States the triangle condition: every piece shorter than half the stick' }, { marks: 1, criterion: 'Represents outcomes as points in the unit square' }, { marks: 2, criterion: 'Correctly identifies and measures the favourable region' }, { marks: 1, criterion: 'Correct probability $\\frac{1}{4}$' }] },

{ id: 'cm-sinx', subject: 'maths', difficulty: 3, title: 'How many solutions of sin x = x/10?',
  statement: R`How many real solutions does the equation $\sin x = \dfrac{x}{10}$ have? ($x$ is in radians.)`,
  hints: [R`Sketch $y = \sin x$ and $y = \frac{x}{10}$ on the same axes.`, R`Solutions can only occur where $\left|\frac{x}{10}\right| \le 1$, i.e. $-10 \le x \le 10$.`, R`Both sides are odd functions, so solutions come in $\pm$ pairs, plus $x = 0$. Count the positive ones: how many humps of $\sin x$ start before $x = 10$?`],
  answer: { type: 'numeric', value: 7, tol: 0 },
  solution: R`Only $|x| \le 10$ can work. For $x > 0$: the line starts below $\sin x$ (gradient $\frac{1}{10} < 1$) and crosses once in $(0, \pi)$. The next positive hump is on $(2\pi, 3\pi) \approx (6.3, 9.4)$, where $\sin x$ reaches 1 at $x \approx 7.9$ while the line is only at about 0.79, so there are two crossings. The following hump starts at $4\pi \approx 12.6 > 10$.

So 3 positive solutions, 3 negative (by symmetry) and $x = 0$: **7**.`,
  markScheme: [{ marks: 1, criterion: 'Sketches both graphs / restricts to $|x| \\le 10$' }, { marks: 1, criterion: 'Uses odd symmetry and includes $x = 0$' }, { marks: 2, criterion: 'Correctly counts 3 positive solutions with justification for each hump' }, { marks: 1, criterion: 'Correct total 7' }] },

{ id: 'cm-dominoes', subject: 'maths', difficulty: 3, title: 'Tiling with dominoes',
  statement: R`In how many ways can a $2 \times 10$ rectangle be completely covered by ten $1 \times 2$ dominoes?`,
  hints: [R`Let $T_n$ be the number of tilings of a $2 \times n$ strip. Find $T_1$, $T_2$, $T_3$ by hand.`, R`Look at the left-hand end: either one vertical domino, or two horizontal dominoes stacked.`, R`$T_n = T_{n-1} + T_{n-2}$.`],
  answer: { type: 'numeric', value: 89, tol: 0 },
  solution: R`At the left end there is either a vertical domino (leaving a $2 \times (n-1)$ strip) or two stacked horizontal dominoes (leaving $2 \times (n-2)$). So $T_n = T_{n-1} + T_{n-2}$ with $T_1 = 1$, $T_2 = 2$.

$1, 2, 3, 5, 8, 13, 21, 34, 55, 89$: $T_{10} = 89$.`,
  markScheme: [{ marks: 1, criterion: 'Finds small cases correctly' }, { marks: 2, criterion: 'Derives the recurrence $T_n = T_{n-1} + T_{n-2}$ with justification' }, { marks: 1, criterion: 'Uses correct starting values' }, { marks: 1, criterion: 'Correct answer 89' }] },

{ id: 'cm-root2', subject: 'maths', difficulty: 2, title: 'Prove that √2 is irrational',
  statement: R`Prove that $\sqrt{2}$ cannot be written as a fraction $\dfrac{p}{q}$ where $p$ and $q$ are integers.

(There's no single numerical answer – write out your proof and use **Mark with AI** to have it marked against the mark scheme.)`,
  hints: [R`Try proof by contradiction: suppose $\sqrt{2} = \frac{p}{q}$ in lowest terms.`, R`Square both sides: $p^2 = 2q^2$. What does that tell you about $p$?`, R`If $p$ is even, write $p = 2k$ and substitute back.`],
  answer: null,
  solution: R`Suppose $\sqrt{2} = \frac{p}{q}$ with $p, q$ integers and the fraction in lowest terms. Then $p^2 = 2q^2$, so $p^2$ is even and hence $p$ is even (the square of an odd number is odd). Write $p = 2k$: $4k^2 = 2q^2$, so $q^2 = 2k^2$ and $q$ is even too. Then $p$ and $q$ share the factor 2, contradicting lowest terms. So $\sqrt{2}$ is irrational.`,
  markScheme: [{ marks: 1, criterion: 'Assumes $\\sqrt{2} = p/q$ in lowest terms (sets up contradiction)' }, { marks: 1, criterion: 'Derives $p^2 = 2q^2$' }, { marks: 1, criterion: 'Justifies that $p$ is even (odd squared is odd)' }, { marks: 1, criterion: 'Shows $q$ is even' }, { marks: 1, criterion: 'States the contradiction and conclusion clearly' }] },

{ id: 'cm-min', subject: 'maths', difficulty: 2, title: 'A minimum without a graph',
  statement: R`Find the minimum value of $x^2 + \dfrac{16}{x}$ for $x > 0$, and justify that it is a minimum.`,
  hints: [R`Differentiate and set the derivative equal to zero.`, R`$2x - \dfrac{16}{x^2} = 0$.`, R`Check the second derivative, or think about what happens as $x \to 0^+$ and $x \to \infty$.`],
  answer: { type: 'numeric', value: 12, tol: 0.001 },
  solution: R`$f'(x) = 2x - \dfrac{16}{x^2} = 0 \Rightarrow x^3 = 8 \Rightarrow x = 2$.

$f''(x) = 2 + \dfrac{32}{x^3} > 0$ for $x > 0$, so it is a minimum: $f(2) = 4 + 8 = \mathbf{12}$.`,
  markScheme: [{ marks: 1, criterion: 'Correct derivative' }, { marks: 1, criterion: 'Solves to get $x = 2$' }, { marks: 1, criterion: 'Justifies minimum (second derivative or behaviour at the ends)' }, { marks: 1, criterion: 'Correct minimum value 12' }] },

{ id: 'cm-heartbeats', subject: 'maths', difficulty: 1, title: 'Estimate: heartbeats in a lifetime',
  statement: R`Estimate how many times a human heart beats in a typical lifetime. Give your answer to the nearest power of ten (or as a number), and explain your assumptions.`,
  hints: [R`What is a typical resting heart rate per minute?`, R`How many minutes are there in a year? ($\approx 5 \times 10^5$)`, R`Multiply by a typical lifespan.`],
  answer: { type: 'order', value: 3e9, factor: 3 },
  solution: R`About 70 beats per minute $\times$ $60 \times 24 \times 365 \approx 5.3 \times 10^5$ minutes per year $\approx 3.7 \times 10^7$ beats per year. Over about 80 years: $\approx 3 \times 10^9$ beats – **a few billion**.

Interviewers care about clear assumptions and sensible rounding more than the exact number.`,
  markScheme: [{ marks: 1, criterion: 'Sensible heart rate (≈ 60–80 per minute)' }, { marks: 1, criterion: 'Correct minutes (or seconds) per year' }, { marks: 1, criterion: 'Sensible lifespan and multiplication' }, { marks: 1, criterion: 'Final answer of order $10^9$ (a few billion) with assumptions stated' }] },

{ id: 'cp-well', subject: 'physics', difficulty: 3, title: 'How deep is the well?',
  statement: R`A stone is dropped from rest into a well. The splash is heard 4.25 s after the stone is released.

Taking $g = 10\ \text{m s}^{-2}$, the speed of sound as $320\ \text{m s}^{-1}$, and ignoring air resistance, how deep is the well (in metres)?`,
  hints: [R`The 4.25 s is made of two parts: the time for the stone to fall, and the time for the sound to come back up.`, R`If the fall takes $t$ seconds, the depth is $d = 5t^2$ and the sound takes $\frac{d}{320}$ seconds.`, R`Solve $t + \frac{5t^2}{320} = 4.25$, i.e. $t^2 + 64t - 272 = 0$.`],
  answer: { type: 'numeric', value: 80, tol: 0.01 },
  solution: R`Let the fall time be $t$. Then $d = 5t^2$ and $t + \dfrac{5t^2}{320} = 4.25$.

Multiply by 64: $t^2 + 64t - 272 = 0$, so $t = \dfrac{-64 + \sqrt{4096 + 1088}}{2} = \dfrac{-64 + 72}{2} = 4$ s.

Depth $= 5 \times 4^2 = \mathbf{80}$ **m**. (Check: sound takes $80/320 = 0.25$ s.)`,
  markScheme: [{ marks: 1, criterion: 'Splits total time into fall time + sound time' }, { marks: 1, criterion: 'Uses $d = \\frac{1}{2}gt^2$ for the fall' }, { marks: 1, criterion: 'Forms a correct equation in one unknown' }, { marks: 1, criterion: 'Solves the quadratic, rejecting the negative root' }, { marks: 1, criterion: 'Correct depth 80 m' }] },

{ id: 'cp-bungee', subject: 'physics', difficulty: 3, title: 'Bungee jump',
  statement: R`A bungee jumper of mass 60 kg steps off a platform. The cord has natural length 20 m and obeys Hooke's law with stiffness $k = 120\ \text{N m}^{-1}$.

Ignoring air resistance and the mass of the cord, and with $g = 10\ \text{N kg}^{-1}$, how far below the platform is the lowest point of the jump?`,
  hints: [R`At the platform and at the lowest point, the jumper is momentarily at rest.`, R`So all the gravitational potential energy lost is stored as elastic energy in the cord.`, R`If the extension at the bottom is $x$: $mg(20 + x) = \frac{1}{2}kx^2$.`],
  answer: { type: 'numeric', value: 40, tol: 0.01 },
  solution: R`Energy: $mg(20 + x) = \tfrac{1}{2}kx^2 \Rightarrow 600(20 + x) = 60x^2 \Rightarrow x^2 - 10x - 200 = 0$.

$(x - 20)(x + 10) = 0$, so $x = 20$ m and the lowest point is $20 + 20 = \mathbf{40}$ **m** below the platform.

(Note it is not where the forces balance – that's at $x = 5$ m, where the jumper is moving fastest.)`,
  markScheme: [{ marks: 1, criterion: 'Recognises KE is zero at top and bottom' }, { marks: 1, criterion: 'GPE lost includes the 20 m free fall plus the extension' }, { marks: 1, criterion: 'Elastic energy $\\frac{1}{2}kx^2$' }, { marks: 1, criterion: 'Solves the quadratic for $x = 20$ m' }, { marks: 1, criterion: 'Correct total 40 m' }] },

{ id: 'cp-cube', subject: 'physics', difficulty: 4, title: 'A cube of resistors',
  statement: R`Twelve identical 1 Ω resistors form the edges of a cube. What is the resistance between two diagonally opposite corners of the cube?`,
  hints: [R`Use symmetry: from the starting corner, current splits equally into three edges.`, R`The three corners next to the start are all at the same potential, so you could join them with a wire without changing anything. Same for the three corners next to the finish.`, R`That turns the cube into three groups in series: 3 resistors in parallel, 6 in parallel, 3 in parallel.`],
  answer: { type: 'numeric', value: 5 / 6, tol: 0.01 },
  solution: R`By symmetry, the three neighbours of the start corner are at one potential, and the three neighbours of the end corner at another. Joining equal-potential points changes nothing, so the network becomes:

3 edges in parallel ($\frac{1}{3}\,\Omega$) + 6 middle edges in parallel ($\frac{1}{6}\,\Omega$) + 3 edges in parallel ($\frac{1}{3}\,\Omega$) $= \frac{5}{6}\,\Omega$.

(Alternatively: send in current $I$; it splits $\frac{I}{3}$, then $\frac{I}{6}$, then $\frac{I}{3}$; the p.d. along any path is $\frac{I}{3} + \frac{I}{6} + \frac{I}{3} = \frac{5I}{6}$.)`,
  markScheme: [{ marks: 2, criterion: 'Uses symmetry to identify equipotential corners (or symmetric current split)' }, { marks: 2, criterion: 'Reduces to series/parallel groups 3–6–3 (or sums p.d. along a path)' }, { marks: 1, criterion: 'Correct answer $\\frac{5}{6}\\,\\Omega$' }] },

{ id: 'cp-boat', subject: 'physics', difficulty: 3, title: 'The stone and the boat',
  statement: R`You are sitting in a small boat floating on a pond, holding a heavy stone. You throw the stone into the pond and it sinks to the bottom.

Does the water level of the pond **rise, fall or stay the same**? Explain your reasoning.`,
  hints: [R`When the stone is in the boat, how much water is displaced on its account? (Think about floating.)`, R`When the stone is on the bottom, how much water does it displace?`, R`Compare: water of the stone's **mass** vs water of the stone's **volume**. The stone is denser than water.`],
  answer: { type: 'text', accept: ['falls', 'fall', 'it falls', 'goes down', 'decreases', 'drops', 'lower', 'it goes down', 'falls slightly'] },
  solution: R`In the boat, the stone is part of a floating object, so it displaces its own **weight** of water: volume $\frac{m}{\rho_{\text{water}}}$.

On the bottom it displaces only its own **volume**: $\frac{m}{\rho_{\text{stone}}}$, which is smaller because $\rho_{\text{stone}} > \rho_{\text{water}}$.

Less water is displaced, so the level **falls** (slightly).`,
  markScheme: [{ marks: 2, criterion: 'Floating: the stone (via the boat) displaces water equal to its weight/mass' }, { marks: 1, criterion: 'Sunk: it displaces water equal to its volume' }, { marks: 1, criterion: 'Compares using stone denser than water' }, { marks: 1, criterion: 'Correct conclusion: the level falls' }] },

{ id: 'cp-dating', subject: 'physics', difficulty: 2, title: 'How old is the rock?',
  statement: R`When a rock formed it contained a radioactive isotope but none of its stable decay product. Now there are 3 atoms of the decay product for every 1 atom of the isotope.

The half-life of the isotope is 1.3 billion years. How old is the rock, in billions of years?`,
  hints: [R`What fraction of the original isotope atoms is left?`, R`Each half-life halves what remains.`, R`$\frac{1}{4} = \left(\frac{1}{2}\right)^2$.`],
  answer: { type: 'numeric', value: 2.6, tol: 0.01 },
  solution: R`1 parent : 3 daughter means $\frac{1}{4}$ of the original parent atoms remain (every daughter atom was once a parent atom).

$\frac{1}{4} = \left(\frac{1}{2}\right)^2$: two half-lives, so the rock is $2 \times 1.3 = \mathbf{2.6}$ **billion years** old.`,
  markScheme: [{ marks: 1, criterion: 'Each daughter atom came from a parent atom, so total original = 4 parts' }, { marks: 1, criterion: 'Fraction remaining $\\frac{1}{4}$' }, { marks: 1, criterion: 'Two half-lives' }, { marks: 1, criterion: 'Correct age 2.6 billion years' }] },

{ id: 'cp-explosion', subject: 'physics', difficulty: 3, title: 'An explosion at rest',
  statement: R`A 3.0 kg object at rest explodes into two pieces of mass 2.0 kg and 1.0 kg, which fly apart in opposite directions. The explosion releases 300 J of kinetic energy.

What is the speed of the 1.0 kg piece (in m/s)?`,
  hints: [R`Total momentum before is zero. What does that say about the two pieces' momenta?`, R`$2.0\,v_2 = 1.0\,v_1$, so $v_1 = 2v_2$.`, R`Now use $\frac{1}{2}(2.0)v_2^2 + \frac{1}{2}(1.0)v_1^2 = 300$.`],
  answer: { type: 'numeric', value: 20, tol: 0.01 },
  solution: R`Momentum: $2.0v_2 = 1.0v_1 \Rightarrow v_1 = 2v_2$.

Energy: $\frac{1}{2}(2.0)v_2^2 + \frac{1}{2}(1.0)(2v_2)^2 = v_2^2 + 2v_2^2 = 3v_2^2 = 300$, so $v_2 = 10$ m/s and $v_1 = \mathbf{20}$ **m/s**.

(The lighter piece gets twice the speed and two-thirds of the energy.)`,
  markScheme: [{ marks: 1, criterion: 'Conservation of momentum with zero initial momentum' }, { marks: 1, criterion: 'Relates the speeds $v_1 = 2v_2$' }, { marks: 1, criterion: 'Total kinetic energy equation' }, { marks: 1, criterion: 'Correct speed 20 m/s' }] },

{ id: 'cp-battery', subject: 'engineering', difficulty: 2, title: 'Lifting a car with its own battery',
  statement: R`A car battery is rated at 12 V and 60 A h (amp-hours). If all of its stored energy could be used to lift the 1000 kg car, how high would the car rise (in metres)? Take $g = 10\ \text{N kg}^{-1}$.`,
  hints: [R`An amp-hour is a unit of charge: $1\ \text{A h} = 3600$ C.`, R`Energy $= QV$.`, R`Set the energy equal to $mgh$.`],
  answer: { type: 'numeric', value: 259.2, tol: 0.02 },
  solution: R`Charge $= 60 \times 3600 = 216\,000$ C. Energy $= QV = 216\,000 \times 12 = 2.59 \times 10^6$ J.

$h = \dfrac{E}{mg} = \dfrac{2.59 \times 10^6}{10\,000} \approx \mathbf{260}$ **m**.

(A surprisingly large height – but it is the same energy as only about 60 g of petrol.)`,
  markScheme: [{ marks: 1, criterion: 'Converts A h to coulombs' }, { marks: 1, criterion: 'Uses $E = QV$' }, { marks: 1, criterion: 'Uses $E = mgh$' }, { marks: 1, criterion: 'Correct height ≈ 260 m' }] },

{ id: 'ce-bike', subject: 'engineering', difficulty: 2, title: 'Bicycle gears',
  statement: R`A bicycle has a 48-tooth front chainring and a 16-tooth rear sprocket. Its wheels have diameter 0.70 m. The rider turns the pedals at 60 revolutions per minute.

How fast does the bicycle travel, in m/s? (You may give an exact answer in terms of $\pi$.)`,
  hints: [R`Each turn of the pedals moves the chain by 48 teeth. How many turns of the rear sprocket is that?`, R`The rear wheel turns with the rear sprocket.`, R`Distance per wheel turn is the circumference, $\pi d$.`],
  answer: { type: 'numeric', value: 2.1 * Math.PI, tol: 0.01, unit: 'm/s' },
  solution: R`Gear ratio $= \frac{48}{16} = 3$, so the wheel turns 3 times per pedal turn: $3 \times 1 = 3$ rev/s.

Speed $= 3 \times \pi \times 0.70 = 2.1\pi \approx \mathbf{6.6}$ **m/s**.`,
  markScheme: [{ marks: 1, criterion: 'Gear ratio 48/16 = 3' }, { marks: 1, criterion: 'Wheel revolutions per second = 3' }, { marks: 1, criterion: 'Uses circumference $\\pi d$' }, { marks: 1, criterion: 'Correct speed $2.1\\pi \\approx 6.6$ m/s' }] },

{ id: 'ce-hydro', subject: 'engineering', difficulty: 2, title: 'Pumped storage',
  statement: R`A pumped-storage power station has an upper reservoir holding $1.0 \times 10^{9}\ \text{m}^3$ of water, on average 500 m above the turbines.

Ignoring losses, how much energy can it store, in gigawatt-hours (GWh)? ($\rho_{\text{water}} = 1000\ \text{kg m}^{-3}$, $g = 10\ \text{N kg}^{-1}$, 1 GWh $= 3.6 \times 10^{12}$ J)`,
  hints: [R`Find the mass of water first.`, R`Energy $= mgh$.`, R`Divide by $3.6 \times 10^{12}$ to convert joules to GWh.`],
  answer: { type: 'numeric', value: 1388.9, tol: 0.02, unit: 'GWh' },
  solution: R`Mass $= 1.0 \times 10^{9} \times 1000 = 1.0 \times 10^{12}$ kg.

$E = mgh = 1.0 \times 10^{12} \times 10 \times 500 = 5.0 \times 10^{15}$ J $= \dfrac{5.0 \times 10^{15}}{3.6 \times 10^{12}} \approx \mathbf{1400}$ **GWh**.`,
  markScheme: [{ marks: 1, criterion: 'Mass from density × volume' }, { marks: 1, criterion: 'Uses $mgh$' }, { marks: 1, criterion: 'Correct unit conversion' }, { marks: 1, criterion: 'Answer ≈ 1400 GWh' }] },

{ id: 'cc-combustion', subject: 'chemistry', difficulty: 3, title: 'Identify the compound',
  statement: R`0.30 g of an organic compound containing only carbon, hydrogen and oxygen burns completely to give 0.44 g of carbon dioxide and 0.18 g of water. Its relative molecular mass is 60.

What is its molecular formula? ($A_r$: H = 1, C = 12, O = 16)`,
  hints: [R`All the carbon ends up in the CO₂ and all the hydrogen in the H₂O.`, R`Find the masses of C and H in the compound; the rest is oxygen.`, R`Convert to moles to get the empirical formula, then use $M_r = 60$.`],
  answer: { type: 'text', accept: ['C2H4O2', 'CH3COOH', 'HCOOCH3', 'C2H4O2.'] },
  solution: R`C: $\frac{0.44}{44} = 0.010$ mol (0.12 g). H: $\frac{0.18}{18} = 0.010$ mol H₂O, so 0.020 mol H (0.020 g). O: $0.30 - 0.12 - 0.02 = 0.16$ g $= 0.010$ mol.

C : H : O $= 1 : 2 : 1$, empirical formula CH₂O ($M_r = 30$). $60 \div 30 = 2$: **C₂H₄O₂** (e.g. ethanoic acid).`,
  markScheme: [{ marks: 1, criterion: 'Moles/mass of C from CO₂' }, { marks: 1, criterion: 'Moles/mass of H from H₂O (×2)' }, { marks: 1, criterion: 'Mass of O by difference' }, { marks: 1, criterion: 'Empirical formula CH₂O' }, { marks: 1, criterion: 'Molecular formula C₂H₄O₂' }] },

{ id: 'cc-purity', subject: 'chemistry', difficulty: 3, title: 'A back titration',
  statement: R`A 1.25 g sample of impure calcium carbonate is added to 50.0 cm³ of $1.00\ \text{mol dm}^{-3}$ hydrochloric acid (an excess). The impurities do not react. The excess acid then needs 30.0 cm³ of $1.00\ \text{mol dm}^{-3}$ sodium hydroxide to neutralise it.

What is the percentage by mass of calcium carbonate in the sample? ($M_r$ of CaCO₃ = 100)`,
  hints: [R`How many moles of HCl were added in total, and how many were left over (from the NaOH)?`, R`$\text{CaCO}_3 + 2\text{HCl} \rightarrow \text{CaCl}_2 + \text{H}_2\text{O} + \text{CO}_2$ – watch the 1 : 2 ratio.`, R`Moles of HCl that reacted with the carbonate $= 0.050 - 0.030$.`],
  answer: { type: 'numeric', value: 80, tol: 0.01, unit: '%' },
  solution: R`HCl added: 0.0500 mol. Left over: 0.0300 mol (1 : 1 with NaOH). Reacted with CaCO₃: 0.0200 mol.

CaCO₃ $= \frac{0.0200}{2} = 0.0100$ mol $= 1.00$ g. Purity $= \frac{1.00}{1.25} \times 100 = \mathbf{80\%}$.`,
  markScheme: [{ marks: 1, criterion: 'Total moles of HCl' }, { marks: 1, criterion: 'Excess HCl from NaOH' }, { marks: 1, criterion: 'Moles reacted with CaCO₃ by difference' }, { marks: 1, criterion: 'Uses the 1 : 2 ratio' }, { marks: 1, criterion: 'Correct purity 80%' }] },

{ id: 'cc-chlorine', subject: 'chemistry', difficulty: 3, title: 'Masses of chlorine molecules',
  statement: R`Chlorine consists of 75% $^{35}\text{Cl}$ atoms and 25% $^{37}\text{Cl}$ atoms. Molecules of $\text{Cl}_2$ can therefore have masses of 70, 72 or 74.

What fraction of $\text{Cl}_2$ molecules have a mass of 72?`,
  hints: [R`Treat each atom in the molecule as independently ³⁵Cl (probability ¾) or ³⁷Cl (probability ¼).`, R`Mass 72 means one of each isotope.`, R`There are two ways to have one of each.`],
  answer: { type: 'numeric', value: 0.375, tol: 0.001 },
  solution: R`$P(\text{mass } 72) = P(35, 37) + P(37, 35) = 2 \times \frac{3}{4} \times \frac{1}{4} = \frac{3}{8}$.

(Masses 70 : 72 : 74 occur in the ratio $9 : 6 : 1$.)`,
  markScheme: [{ marks: 1, criterion: 'Treats the two atoms independently' }, { marks: 2, criterion: 'Includes both orders for one of each isotope' }, { marks: 1, criterion: 'Correct fraction $\\frac{3}{8}$' }] },

{ id: 'cc-ice', subject: 'chemistry', difficulty: 2, title: 'Why does ice float?',
  statement: R`Most substances are denser as solids than as liquids, but ice floats on water. Explain, in terms of particles and bonding, why ice is less dense than liquid water, and suggest one consequence of this for life in ponds in winter.

(Write your answer and use **Mark with AI**.)`,
  hints: [R`Think about the forces between water molecules – what is special about them?`, R`In ice, the molecules are held in a fixed, regular arrangement by these forces.`, R`An open lattice takes up more space than the more disordered liquid.`],
  answer: null,
  solution: R`Water molecules attract each other strongly (hydrogen bonds – an especially strong intermolecular force between an H on one molecule and an O on another). In ice each molecule is held in a regular, open hexagonal lattice by these bonds, with lots of empty space. On melting, some of these bonds break and the molecules can pack more closely, so liquid water is denser.

Consequence: ice forms on the **surface** of ponds and insulates the water below, which stays liquid (densest at about 4 °C) so organisms can survive.`,
  markScheme: [{ marks: 1, criterion: 'Identifies strong intermolecular forces / hydrogen bonds between water molecules' }, { marks: 1, criterion: 'Ice has a regular, open structure with more space between molecules' }, { marks: 1, criterion: 'In liquid water molecules can pack more closely, so it is denser' }, { marks: 1, criterion: 'Consequence: ice forms on top and insulates the water beneath' }] },

{ id: 'cb-carriers', subject: 'biology', difficulty: 3, title: 'At least one affected child',
  statement: R`Two parents are both carriers of a recessive allele for an inherited condition (they are heterozygous and unaffected). They have four children.

What is the probability that **at least one** of the children has the condition? Give your answer as a decimal to 3 significant figures, or as a fraction.`,
  hints: [R`What is the probability that one child of two carriers is unaffected?`, R`"At least one" is easiest via the complement: none affected.`, R`$1 - \left(\frac{3}{4}\right)^4$.`],
  answer: { type: 'numeric', value: 175 / 256, tol: 0.002 },
  solution: R`Each child is affected with probability $\frac{1}{4}$ (Aa × Aa gives aa a quarter of the time), independently.

$P(\text{none affected}) = \left(\frac{3}{4}\right)^4 = \frac{81}{256}$, so $P(\text{at least one}) = 1 - \frac{81}{256} = \frac{175}{256} \approx \mathbf{0.684}$.

(A common mistake is $4 \times \frac{1}{4} = 1$, which double-counts families with more than one affected child.)`,
  markScheme: [{ marks: 1, criterion: 'Probability ¼ of an affected child from the cross' }, { marks: 1, criterion: 'Treats children as independent' }, { marks: 1, criterion: 'Uses the complement' }, { marks: 1, criterion: 'Correct answer $\\frac{175}{256} \\approx 0.684$' }] },

{ id: 'cb-cells', subject: 'biology', difficulty: 2, title: 'Estimate: cells in a human body',
  statement: R`Estimate the number of cells in an adult human body. State your assumptions.`,
  hints: [R`Estimate the volume of a person (their mass and density help).`, R`A typical human cell is about 10 µm across. What is its volume?`, R`Divide one volume by the other. ($1\ \mu\text{m} = 10^{-6}$ m)`],
  answer: { type: 'order', value: 3e13, factor: 10 },
  solution: R`Mass ≈ 70 kg and density ≈ that of water, so volume ≈ $0.07\ \text{m}^3$. A cell ≈ $(10^{-5}\ \text{m})^3 = 10^{-15}\ \text{m}^3$.

Number ≈ $\frac{0.07}{10^{-15}} \approx 7 \times 10^{13}$ – **tens of trillions**. (Careful counts give about $3 \times 10^{13}$, most of them red blood cells, which are smaller than average.)`,
  markScheme: [{ marks: 1, criterion: 'Sensible body volume (≈ 0.05–0.1 m³) with reasoning' }, { marks: 1, criterion: 'Sensible cell size (≈ 10 µm) and volume' }, { marks: 1, criterion: 'Correct powers of ten in the division' }, { marks: 1, criterion: 'Final estimate of order $10^{13}$–$10^{14}$' }] },

{ id: 'cb-magnification', subject: 'biology', difficulty: 1, title: 'Magnification',
  statement: R`In a micrograph, a cell that is actually 15 µm wide appears 30 mm wide.

What is the magnification of the image?`,
  hints: [R`Magnification $= \dfrac{\text{image size}}{\text{actual size}}$.`, R`Convert to the same units: 30 mm $= 30\,000$ µm.`],
  answer: { type: 'numeric', value: 2000, tol: 0.001 },
  solution: R`$\dfrac{30\ \text{mm}}{15\ \mu\text{m}} = \dfrac{30\,000\ \mu\text{m}}{15\ \mu\text{m}} = \mathbf{2000}$ (×2000).`,
  markScheme: [{ marks: 1, criterion: 'Correct formula' }, { marks: 1, criterion: 'Consistent units' }, { marks: 1, criterion: 'Magnification ×2000' }] },

{ id: 'cb-sa-volume', subject: 'biology', difficulty: 2, title: 'Why are cells small?',
  statement: R`A cube-shaped cell of side 2 µm grows into a cube of side 4 µm.

(a) By what factor does its surface area to volume ratio change?
(b) Use this to explain why cells divide rather than growing very large.

Enter your answer to (a) as a number (e.g. 0.5 for "halves"), and write your explanation for (b) in the box below for AI marking.`,
  hints: [R`For a cube of side $s$: area $6s^2$, volume $s^3$, ratio $\frac{6}{s}$.`, R`Doubling the side halves the ratio.`, R`Substances (oxygen, nutrients, waste) cross the membrane – the surface – but are used/made by the whole volume.`],
  answer: { type: 'numeric', value: 0.5, tol: 0.001 },
  solution: R`(a) SA : V for a cube is $\frac{6s^2}{s^3} = \frac{6}{s}$: from $3\ \mu\text{m}^{-1}$ to $1.5\ \mu\text{m}^{-1}$ – it **halves** (factor 0.5).

(b) Exchange of oxygen, glucose and wastes happens across the surface, but demand scales with volume. As a cell grows, its volume rises faster than its surface, so diffusion across the membrane can no longer supply the whole cell quickly enough (and distances to the centre get longer). Dividing restores a large SA : V ratio.`,
  markScheme: [{ marks: 1, criterion: 'Correct SA:V ratios or the formula $6/s$' }, { marks: 1, criterion: 'Ratio halves (factor 0.5)' }, { marks: 1, criterion: 'Exchange happens across the surface; demand depends on volume' }, { marks: 1, criterion: 'Large cells could not exchange materials fast enough by diffusion' }] },
  ];
})();
