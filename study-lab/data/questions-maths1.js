// Mathematics 1 – original practice questions in the ESAT style (not official ESAT questions).
// Q(id, spec, difficulty 1–3, stem, options (one per line), answer letter, worked solution)
(function () {
  const R = String.raw;
  const Q = (id, spec, difficulty, stem, options, answer, solution) => ({ id, spec, difficulty, stem, options: options.split('\n').map((s) => s.trim()).filter(Boolean), answer, solution });
  window.ESAT_QUESTIONS = (window.ESAT_QUESTIONS || []).concat([

Q('m1-001', 'M1.2', 2, R`A cyclist travels $d$ metres in $t$ minutes.

Which expression gives the cyclist's average speed in kilometres per hour?`, R`$\dfrac{3d}{50t}$
$\dfrac{50d}{3t}$
$\dfrac{60d}{t}$
$\dfrac{d}{60t}$
$\dfrac{3t}{50d}$
$\dfrac{d}{1000t}$`, 'A', R`Distance $= \dfrac{d}{1000}$ km and time $= \dfrac{t}{60}$ h, so

$$\text{speed} = \frac{d/1000}{t/60} = \frac{60d}{1000t} = \frac{3d}{50t}\ \text{km/h}.$$

**Answer A.**`),

Q('m1-002', 'M1.1', 1, R`Water flows into an empty tank at a constant rate of 3 litres per second. The tank is a cuboid measuring 2 m by 1.5 m by 0.9 m.

How many minutes does it take to fill the tank?`, R`0.9
1.5
9
15
45
150`, 'D', R`Volume $= 2 \times 1.5 \times 0.9 = 2.7\ \text{m}^3 = 2700$ litres (1 m³ = 1000 litres).

Time $= 2700 \div 3 = 900$ s $= 15$ minutes.

**Answer D.**`),

Q('m1-003', 'M2.3', 2, R`$N = 2^4 \times 3^2 \times 5$.

How many of the positive factors of $N$ are even?`, R`6
12
15
20
24
30`, 'E', R`Every factor has the form $2^a 3^b 5^c$ with $0 \le a \le 4$, $0 \le b \le 2$, $0 \le c \le 1$.

A factor is even exactly when $a \ge 1$: 4 choices for $a$, 3 for $b$, 2 for $c$, giving $4 \times 3 \times 2 = 24$.

(Check: there are $5 \times 3 \times 2 = 30$ factors altogether, of which $3 \times 2 = 6$ are odd.)

**Answer E.**`),

Q('m1-004', 'M2.3', 3, R`The lowest common multiple of 18, 24 and $n$ is 360, where $n$ is a positive integer.

How many possible values of $n$ are there?`, R`4
6
8
12
15
24`, 'D', R`$\text{LCM}(18, 24) = 2^3 \times 3^2 = 72$ and $360 = 2^3 \times 3^2 \times 5$.

So $n$ must contain exactly one factor of 5 (to bring in the 5) and may contain $2^a$ with $0 \le a \le 3$ and $3^b$ with $0 \le b \le 2$, but nothing else.

Number of choices: $4 \times 3 = 12$.

**Answer D.**`),

Q('m1-005', 'M2.7', 1, R`What is the value of $\dfrac{8^{\frac{2}{3}} \times 4^{-\frac{1}{2}}}{16^{\frac{3}{4}}}$?`, R`$\frac{1}{8}$
$\frac{1}{4}$
$\frac{1}{2}$
$1$
$2$
$4$`, 'B', R`$8^{2/3} = (\sqrt[3]{8})^2 = 4$, $\;4^{-1/2} = \frac{1}{2}$, $\;16^{3/4} = (\sqrt[4]{16})^3 = 8$.

$$\frac{4 \times \frac{1}{2}}{8} = \frac{2}{8} = \frac{1}{4}.$$

**Answer B.**`),

Q('m1-006', 'M2.8', 1, R`What is $\left(3 \times 10^{-4}\right)^2 \div \left(6 \times 10^{-9}\right)$ in standard form?`, R`$1.5 \times 10^{-17}$
$1.5 \times 10^{-1}$
$1.5 \times 10^{1}$
$5 \times 10^{0}$
$5 \times 10^{-2}$
$1.5 \times 10^{2}$`, 'C', R`$(3 \times 10^{-4})^2 = 9 \times 10^{-8}$.

$$\frac{9 \times 10^{-8}}{6 \times 10^{-9}} = 1.5 \times 10^{1}.$$

**Answer C.**`),

Q('m1-007', 'M2.9', 2, R`The recurring decimal $0.1\dot{3}\dot{6} = 0.136363636\ldots$

What is this as a fraction in its lowest terms?`, R`$\frac{3}{22}$
$\frac{136}{999}$
$\frac{15}{110}$
$\frac{9}{66}$
$\frac{27}{200}$
$\frac{1}{7}$`, 'A', R`Let $x = 0.13636\ldots$ Then $100x = 13.63636\ldots$

Subtracting: $99x = 13.5$, so $x = \dfrac{13.5}{99} = \dfrac{27}{198} = \dfrac{3}{22}$.

($\frac{15}{110}$ and $\frac{9}{66}$ are equal to this but are not in lowest terms.)

**Answer A.**`),

Q('m1-008', 'M2.11', 2, R`Simplify $\dfrac{\sqrt{75} - \sqrt{12}}{\sqrt{3}} + \dfrac{6}{\sqrt{3}}$.`, R`$5$
$9$
$2\sqrt{3}$
$3 + 2\sqrt{3}$
$3 + 6\sqrt{3}$
$1 + 2\sqrt{3}$`, 'D', R`$\sqrt{75} = 5\sqrt{3}$ and $\sqrt{12} = 2\sqrt{3}$, so the first fraction is $\dfrac{3\sqrt{3}}{\sqrt{3}} = 3$.

$\dfrac{6}{\sqrt{3}} = \dfrac{6\sqrt{3}}{3} = 2\sqrt{3}$.

Total: $3 + 2\sqrt{3}$. **Answer D.**`),

Q('m1-009', 'M2.11', 2, R`What is the value of $\dfrac{2}{3 - \sqrt{5}} - \dfrac{2}{3 + \sqrt{5}}$?`, R`$0$
$\frac{3}{2}$
$\frac{\sqrt{5}}{2}$
$\sqrt{5}$
$2\sqrt{5}$
$3$`, 'D', R`Use the common denominator $(3 - \sqrt{5})(3 + \sqrt{5}) = 9 - 5 = 4$:

$$\frac{2(3 + \sqrt{5}) - 2(3 - \sqrt{5})}{4} = \frac{4\sqrt{5}}{4} = \sqrt{5}.$$

**Answer D.**`),

Q('m1-010', 'M2.12', 3, R`$x = 6$, correct to 1 significant figure, and $y = 0.2$, correct to 1 significant figure.

What is the upper bound of $\dfrac{x}{y}$?`, R`$26$
$30$
$32.5$
$\frac{130}{3}$
$43$
$65$`, 'D', R`$5.5 \le x < 6.5$ and $0.15 \le y < 0.25$.

$\dfrac{x}{y}$ is largest when $x$ is as large and $y$ as small as possible:

$$\frac{6.5}{0.15} = \frac{650}{15} = \frac{130}{3}.$$

(A common slip is $0.2 \pm 0.05$ being taken as $0.2 \pm 0.005$, or using $y = 0.25$.)

**Answer D.**`),

Q('m1-011', 'M2.5', 2, R`A 4-digit PIN uses the digits 0–9, and digits may repeat.

How many possible PINs contain at least one 7?`, R`1000
2916
3439
3600
4000
6561`, 'C', R`Count the complement. PINs with **no** 7: $9^4 = 6561$. All PINs: $10^4 = 10\,000$.

At least one 7: $10\,000 - 6561 = 3439$.

**Answer C.**`),

Q('m1-012', 'M2.5', 3, R`How many three-digit positive integers have digits that are strictly increasing from left to right (for example, 147)?`, R`36
72
84
120
504
729`, 'C', R`Choose any 3 different digits; there is exactly one way to arrange them in increasing order.

The digit 0 can never appear (it would have to be first). So choose 3 digits from $\{1, \ldots, 9\}$:

$$\binom{9}{3} = \frac{9 \times 8 \times 7}{6} = 84.$$

**Answer C.**`),

Q('m1-013', 'M2.14', 1, R`Which of the following is the best estimate of $\dfrac{\sqrt{48.7} \times 3.03^2}{0.198}$?`, R`3.2
32
320
3200
32 000`, 'C', R`$\sqrt{48.7} \approx 7$, $\;3.03^2 \approx 9$, $\;0.198 \approx 0.2$:

$$\frac{7 \times 9}{0.2} = 63 \times 5 = 315 \approx 320.$$

**Answer C.**`),

Q('m1-014', 'M3.8', 2, R`A shop increases all its prices by $x\%$. Later it reduces all the new prices by $x\%$. The final prices are 4% lower than the original prices.

What is $x$?`, R`2
4
10
16
20
40`, 'E', R`$$\left(1 + \frac{x}{100}\right)\left(1 - \frac{x}{100}\right) = 0.96 \;\Rightarrow\; 1 - \frac{x^2}{10\,000} = 0.96$$

so $x^2 = 400$ and $x = 20$.

**Answer E.**`),

Q('m1-015', 'M3.11', 2, R`Bacteria in a dish are counted every 4 hours. Each count is three times the previous count, and the first count is 200.

How many hours after the first count is the first count of more than 100 000?`, R`16
20
24
28
32`, 'C', R`After $n$ further counts the number is $200 \times 3^n$. We need $3^n > 500$.

$3^5 = 243 < 500$ but $3^6 = 729 > 500$, so it is the 6th count after the first: $6 \times 4 = 24$ hours.

**Answer C.**`),

Q('m1-016', 'M3.4', 1, R`Some sweets are shared between Ali, Ben and Cat in the ratio $2 : 3 : 5$. Cat gets 36 more sweets than Ali.

How many sweets are there altogether?`, R`60
96
108
120
144
180`, 'D', R`Let the shares be $2k, 3k, 5k$. Then $5k - 2k = 3k = 36$, so $k = 12$.

Total $= 10k = 120$. **Answer D.**`),

Q('m1-017', 'M3.7', 2, R`In a club, the ratio of boys to girls is $3 : 5$. Eight more boys join and nobody leaves. The ratio of boys to girls is now $1 : 1$.

How many members does the club have now?`, R`32
36
40
48
56
64`, 'C', R`Originally $3k$ boys and $5k$ girls. Then $3k + 8 = 5k$, so $k = 4$.

Now: $12 + 8 = 20$ boys and $20$ girls, so $40$ members.

**Answer C.**`),

Q('m1-018', 'M3.9', 2, R`$y$ is inversely proportional to the square of $x$.

When $x$ increases by 25%, what is the percentage change in $y$?`, R`20% decrease
25% decrease
36% decrease
44% decrease
56.25% decrease
64% decrease`, 'C', R`$y = \dfrac{k}{x^2}$. Replacing $x$ by $1.25x = \frac{5}{4}x$:

$$y_{\text{new}} = \frac{k}{\frac{25}{16}x^2} = \frac{16}{25}\,y = 0.64y.$$

That is a decrease of 36%. **Answer C.**`),

Q('m1-019', 'M5.17', 2, R`Two bottles are mathematically similar. Their surface areas are $75\ \text{cm}^2$ and $108\ \text{cm}^2$. The larger bottle holds 432 ml.

How much does the smaller bottle hold?`, R`250 ml
300 ml
360 ml
375 ml
518.4 ml`, 'A', R`Area ratio $75 : 108 = 25 : 36$, so the length ratio is $5 : 6$ and the volume ratio is $125 : 216$.

$$432 \times \frac{125}{216} = 2 \times 125 = 250\ \text{ml}.$$

(360 ml comes from using the area ratio for volume.) **Answer A.**`),

Q('m1-020', 'M3.6', 1, R`Six identical printers, working together, print 4800 pages in 40 minutes.

How long would four of these printers take to print 6000 pages?`, R`50 minutes
60 minutes
75 minutes
80 minutes
90 minutes
100 minutes`, 'C', R`One printer prints $\dfrac{4800}{6 \times 40} = 20$ pages per minute, so four print 80 pages per minute.

$6000 \div 80 = 75$ minutes. **Answer C.**`),

Q('m1-021', 'M4.5', 2, R`Given that $6x^2 + x - 15 = 0$ and $x > 0$, what is the value of $4x^2 - 9$?`, R`$-9$
$0$
$\frac{3}{2}$
$\frac{9}{4}$
$6$
$16$`, 'B', R`$6x^2 + x - 15 = (2x - 3)(3x + 5)$, so the positive root is $x = \frac{3}{2}$.

Then $4x^2 - 9 = (2x - 3)(2x + 3) = 0$.

**Answer B.**`),

Q('m1-022', 'M4.6', 2, R`Simplify $\dfrac{x^2 - 9}{x^2 + 5x + 6} \div \dfrac{x - 3}{2x + 4}$.`, R`$\frac{1}{2}$
$2$
$\frac{x + 3}{x + 2}$
$\frac{2(x - 3)}{x + 2}$
$x - 3$
$\frac{(x - 3)^2}{2(x + 2)^2}$`, 'B', R`$$\frac{(x - 3)(x + 3)}{(x + 2)(x + 3)} \times \frac{2(x + 2)}{x - 3} = 2.$$

**Answer B.**`),

Q('m1-023', 'M4.7', 2, R`Make $x$ the subject of $y = \dfrac{2x + 3}{x - 1}$.`, R`$x = \frac{y + 3}{y - 2}$
$x = \frac{y - 3}{y + 2}$
$x = \frac{y + 3}{2 - y}$
$x = \frac{3 - y}{y - 2}$
$x = \frac{y - 3}{y - 2}$`, 'A', R`$y(x - 1) = 2x + 3 \Rightarrow yx - y = 2x + 3 \Rightarrow x(y - 2) = y + 3$, so

$$x = \frac{y + 3}{y - 2}.$$

**Answer A.**`),

Q('m1-024', 'M4.10', 2, R`Line $L$ passes through $(1, 5)$ and $(4, -1)$. Line $M$ is perpendicular to $L$ and passes through $(2, 3)$.

Where does $M$ cross the $x$-axis?`, R`$(-4, 0)$
$(-1, 0)$
$(0, 2)$
$(3.5, 0)$
$(4, 0)$
$(8, 0)$`, 'A', R`Gradient of $L$: $\dfrac{-1 - 5}{4 - 1} = -2$, so $M$ has gradient $\frac{1}{2}$.

$M$: $y - 3 = \frac{1}{2}(x - 2)$. Setting $y = 0$: $-6 = x - 2$, so $x = -4$.

(Using gradient $-2$ by mistake gives $(3.5, 0)$.) **Answer A.**`),

Q('m1-025', 'M4.11', 2, R`The curve $y = x^2 - 6x + k$ has its minimum point on the line $y = 2x$.

What is the value of $k$?`, R`3
6
9
12
15
21`, 'E', R`Completing the square: $y = (x - 3)^2 + k - 9$, so the minimum is at $(3, k - 9)$.

On $y = 2x$: $k - 9 = 6$, so $k = 15$. **Answer E.**`),

Q('m1-026', 'M4.15', 3, R`The line $y = x + 1$ meets the circle $x^2 + y^2 = 13$ at two points.

What is the distance between these two points?`, R`$5$
$5\sqrt{2}$
$\sqrt{26}$
$2\sqrt{13}$
$5\sqrt{3}$
$10$`, 'B', R`Substitute: $x^2 + (x + 1)^2 = 13 \Rightarrow 2x^2 + 2x - 12 = 0 \Rightarrow x^2 + x - 6 = 0$, so $x = 2$ or $x = -3$.

Points: $(2, 3)$ and $(-3, -2)$. Distance $= \sqrt{5^2 + 5^2} = 5\sqrt{2}$.

**Answer B.**`),

Q('m1-027', 'M4.16', 1, R`What are the solutions of $2x^2 - 4x - 3 = 0$?`, R`$x = 1 \pm \frac{\sqrt{10}}{2}$
$x = 2 \pm \sqrt{10}$
$x = 1 \pm \sqrt{10}$
$x = -1 \pm \frac{\sqrt{10}}{2}$
$x = \frac{1 \pm \sqrt{10}}{2}$
$x = 1 \pm \frac{\sqrt{2}}{2}$`, 'A', R`$$x = \frac{4 \pm \sqrt{16 + 24}}{4} = \frac{4 \pm 2\sqrt{10}}{4} = 1 \pm \frac{\sqrt{10}}{2}.$$

**Answer A.**`),

Q('m1-028', 'M4.17', 2, R`How many integers $n$ satisfy both $3 - 2n < 11$ and $5n + 2 \le 3n + 14$?`, R`8
9
10
11
12
infinitely many`, 'C', R`$3 - 2n < 11 \Rightarrow -2n < 8 \Rightarrow n > -4$ (the inequality flips when dividing by $-2$).

$5n + 2 \le 3n + 14 \Rightarrow 2n \le 12 \Rightarrow n \le 6$.

Integers $-3, -2, \ldots, 6$: that is 10 integers. **Answer C.**`),

Q('m1-029', 'M4.19', 2, R`The first five terms of a sequence are 3, 8, 15, 24, 35.

Which term of the sequence is 399?`, R`the 18th
the 19th
the 20th
the 21st
the 199th
399 is not a term`, 'B', R`Differences 5, 7, 9, 11: second difference 2, so the $n$th term is $n^2 + bn + c$. Fitting: $n^2 + 2n$ (check: $1 + 2 = 3$, $4 + 4 = 8$).

$n^2 + 2n = 399 \Rightarrow n^2 + 2n - 399 = 0 \Rightarrow (n + 21)(n - 19) = 0$, so $n = 19$.

**Answer B.**`),

Q('m1-030', 'M4.8', 2, R`For all values of $x$,
$$(x + a)(x^2 + bx + 4) \equiv x^3 + 5x^2 + 10x + 8.$$

What is the value of $ab$?`, R`2
3
5
6
8
10`, 'D', R`Expanding: $x^3 + (a + b)x^2 + (ab + 4)x + 4a$.

Comparing constants: $4a = 8$, so $a = 2$. Comparing $x^2$: $a + b = 5$, so $b = 3$. Check $x$: $ab + 4 = 10$ ✓.

$ab = 6$. **Answer D.**`),

Q('m1-031', 'M4.14', 1, R`A car starts from rest and accelerates uniformly to 20 m/s in 8 s. It then travels at 20 m/s for 12 s, before decelerating uniformly to rest in 5 s.

How far does the car travel altogether?`, R`290 m
330 m
370 m
400 m
500 m`, 'C', R`Distance is the area under the speed–time graph:

$$\tfrac{1}{2}(8)(20) + (12)(20) + \tfrac{1}{2}(5)(20) = 80 + 240 + 50 = 370\ \text{m}.$$

**Answer C.**`),

Q('m1-032', 'M5.2', 1, R`Each interior angle of a regular polygon is 7 times as large as each exterior angle.

How many sides does the polygon have?`, R`8
14
15
16
18`, 'D', R`Interior $+$ exterior $= 180°$, so $8e = 180°$ and $e = 22.5°$.

Number of sides $= 360° \div 22.5° = 16$. **Answer D.**`),

Q('m1-033', 'M5.7', 2, R`The edges of a cuboid are in the ratio $1 : 2 : 2$. The distance between opposite corners of the cuboid (the space diagonal) is 12 cm.

What is the volume of the cuboid?`, R`$64\ \text{cm}^3$
$128\ \text{cm}^3$
$192\ \text{cm}^3$
$256\ \text{cm}^3$
$432\ \text{cm}^3$
$512\ \text{cm}^3$`, 'D', R`Edges $k, 2k, 2k$: space diagonal $= \sqrt{k^2 + 4k^2 + 4k^2} = 3k = 12$, so $k = 4$.

Volume $= 4 \times 8 \times 8 = 256\ \text{cm}^3$. **Answer D.**`),

Q('m1-034', 'M5.9', 2, R`Points $A$, $B$ and $C$ lie on a circle with centre $O$, and $O$ lies inside triangle $ABC$.

Angle $OAB = 25°$ and angle $OCB = 35°$.

What is the size of angle $AOC$?`, R`$60°$
$100°$
$110°$
$120°$
$130°$
$240°$`, 'D', R`$OA = OB$ (radii), so triangle $OAB$ is isosceles and $\angle OBA = 25°$. Similarly $\angle OBC = 35°$.

So $\angle ABC = 25° + 35° = 60°$. The angle at the centre is twice the angle at the circumference: $\angle AOC = 120°$.

**Answer D.**`),

Q('m1-035', 'M5.16', 2, R`A sector of a circle has radius 6 cm and perimeter 20 cm.

What is the area of the sector?`, R`$18\ \text{cm}^2$
$24\ \text{cm}^2$
$30\ \text{cm}^2$
$36\ \text{cm}^2$
$48\ \text{cm}^2$
$12\pi\ \text{cm}^2$`, 'B', R`The perimeter is two radii plus the arc, so the arc length is $20 - 12 = 8$ cm.

A sector is the fraction $\frac{\text{arc}}{2\pi r}$ of the circle, so its area is $\frac{8}{12\pi} \times 36\pi = 24\ \text{cm}^2$ (equivalently, $\frac{1}{2} \times r \times \text{arc}$).

**Answer B.**`),

Q('m1-036', 'M5.18', 2, R`From a point on level ground, the angle of elevation of the top of a vertical tower is $30°$. After walking 20 m directly towards the tower, the angle of elevation is $60°$.

How tall is the tower?`, R`10 m
$10\sqrt{2}$ m
$10\sqrt{3}$ m
20 m
$20\sqrt{3}$ m
30 m`, 'C', R`Let the height be $h$. Horizontal distances: $\dfrac{h}{\tan 30°} = h\sqrt{3}$ and $\dfrac{h}{\tan 60°} = \dfrac{h}{\sqrt{3}}$.

$$h\sqrt{3} - \frac{h}{\sqrt{3}} = \frac{2h}{\sqrt{3}} = 20 \;\Rightarrow\; h = 10\sqrt{3}.$$

(Quick check: the triangle formed by the two sight lines is isosceles, so the far sight line is 20 m, giving $h = 20\sin 60° = 10\sqrt{3}$.) **Answer C.**`),

Q('m1-037', 'M5.19', 3, R`$\overrightarrow{OA} = \mathbf{a}$ and $\overrightarrow{OB} = \mathbf{b}$. $M$ is the midpoint of $AB$, and $N$ lies on $OB$ with $ON : NB = 1 : 2$.

What is $\overrightarrow{MN}$?`, R`$-\frac{1}{2}\mathbf{a} - \frac{1}{6}\mathbf{b}$
$\frac{1}{2}\mathbf{a} - \frac{1}{6}\mathbf{b}$
$-\frac{1}{2}\mathbf{a} + \frac{1}{6}\mathbf{b}$
$\frac{1}{2}\mathbf{a} + \frac{1}{6}\mathbf{b}$
$-\frac{1}{2}\mathbf{a} - \frac{1}{3}\mathbf{b}$
$\frac{1}{2}\mathbf{a} + \frac{1}{3}\mathbf{b}$`, 'A', R`$\overrightarrow{OM} = \frac{1}{2}(\mathbf{a} + \mathbf{b})$ and $\overrightarrow{ON} = \frac{1}{3}\mathbf{b}$.

$$\overrightarrow{MN} = \overrightarrow{ON} - \overrightarrow{OM} = \frac{1}{3}\mathbf{b} - \frac{1}{2}\mathbf{a} - \frac{1}{2}\mathbf{b} = -\frac{1}{2}\mathbf{a} - \frac{1}{6}\mathbf{b}.$$

**Answer A.**`),

Q('m1-038', 'M5.10', 1, R`A triangle has vertices $A(1, 1)$, $B(7, 1)$ and $C(4, 5)$.

What is its perimeter?`, R`14
15
16
17
$6 + 2\sqrt{13}$`, 'C', R`$AB = 6$. $AC = \sqrt{3^2 + 4^2} = 5$ and $BC = \sqrt{3^2 + 4^2} = 5$.

Perimeter $= 16$. **Answer C.**`),

Q('m1-039', 'M6.3', 2, R`The mean of five numbers is 12. One number is removed and the mean of the remaining four numbers is 10. A new number $x$ is then added, and the mean of these five numbers is 13.

What is $x$?`, R`13
20
23
25
27
33`, 'D', R`The five numbers total 60; the remaining four total 40, so the removed number was 20.

$\dfrac{40 + x}{5} = 13 \Rightarrow x = 25$. **Answer D.**`),

Q('m1-040', 'M6.3', 3, R`A list of seven positive integers has median 6, mean 6, and a unique mode of 8.

What is the largest possible range of the list?`, R`7
10
12
13
14
15`, 'D', R`In order: $a_1 \le a_2 \le a_3 \le 6 \le a_5 \le a_6 \le a_7$, total $42$.

8 must appear at least twice, and any other value at most once (otherwise the mode isn't unique). The 8s must be above the median, and to leave room for a large $a_7$ take $a_5 = a_6 = 8$ (if $a_7 = 8$ too, the maximum is only 8).

Then $a_1 + a_2 + a_3 + a_7 = 42 - 6 - 16 = 20$. To maximise $a_7 - a_1$, make $a_1, a_2, a_3$ as small as possible and distinct: $1, 2, 3$. Then $a_7 = 14$.

List: 1, 2, 3, 6, 8, 8, 14 — range $= 13$. **Answer D.**`),

Q('m1-041', 'M7.7', 2, R`A bag contains 5 red counters and 3 blue counters. Two counters are taken at random, without replacement.

What is the probability that they are the same colour?`, R`$\frac{3}{7}$
$\frac{13}{28}$
$\frac{1}{2}$
$\frac{17}{32}$
$\frac{15}{28}$`, 'B', R`$$P(\text{RR}) + P(\text{BB}) = \frac{5}{8} \cdot \frac{4}{7} + \frac{3}{8} \cdot \frac{2}{7} = \frac{20 + 6}{56} = \frac{13}{28}.$$

($\frac{17}{32}$ is what you get *with* replacement.) **Answer B.**`),

Q('m1-042', 'M7.7', 3, R`2% of a population have a certain condition. A test gives a positive result for 90% of people who have the condition and for 5% of people who do not.

A person chosen at random tests positive. What is the probability that they have the condition?`, R`$\frac{2}{100}$
$\frac{18}{100}$
$\frac{18}{67}$
$\frac{1}{2}$
$\frac{49}{67}$
$\frac{9}{10}$`, 'C', R`Imagine 10 000 people: 200 have the condition, of whom 180 test positive. Of the 9800 without it, 490 test positive.

$$P(\text{condition} \mid \text{positive}) = \frac{180}{180 + 490} = \frac{180}{670} = \frac{18}{67}.$$

**Answer C.**`),

Q('m1-043', 'M7.5', 2, R`In a class of 30 students, 18 study physics, 15 study chemistry and 4 study neither.

A student is chosen at random. What is the probability that they study exactly one of the two subjects?`, R`$\frac{7}{30}$
$\frac{4}{15}$
$\frac{11}{30}$
$\frac{1}{2}$
$\frac{19}{30}$
$\frac{13}{15}$`, 'E', R`26 students study at least one subject, so $18 + 15 - \text{both} = 26$, giving both $= 7$.

Exactly one: $(18 - 7) + (15 - 7) = 11 + 8 = 19$. Probability $\frac{19}{30}$.

**Answer E.**`),

Q('m1-044', 'M7.6', 2, R`Two fair six-sided dice are rolled.

What is the probability that the product of the two scores is a multiple of 4?`, R`$\frac{1}{4}$
$\frac{1}{3}$
$\frac{7}{18}$
$\frac{5}{12}$
$\frac{1}{2}$`, 'D', R`Count the 36 outcomes where the product is **not** a multiple of 4:
- both odd: $3 \times 3 = 9$;
- one score is 2 or 6 (even but not a multiple of 4) and the other is odd: $2 \times 2 \times 3 = 12$.

So $36 - 21 = 15$ outcomes work, giving $\frac{15}{36} = \frac{5}{12}$. **Answer D.**`),

Q('m1-045', 'M2.7', 2, R`Which of these numbers is the largest?`, R`$2^{50}$
$3^{30}$
$5^{20}$
$6^{20}$
$10^{15}$`, 'D', R`Write each as a power of something to the 10th:

$2^{50} = 32^{10}$, $\;3^{30} = 27^{10}$, $\;5^{20} = 25^{10}$, $\;6^{20} = 36^{10}$, $\;10^{15} = (10^{1.5})^{10} \approx 31.6^{10}$.

The largest base is 36, so $6^{20}$ is largest. **Answer D.**`),

Q('m1-046', 'M6.2', 2, R`The table shows the lengths, $x$ cm, of some leaves.

| Length $x$ (cm) | $0 < x \le 10$ | $10 < x \le 15$ | $15 < x \le 30$ | $30 < x \le 50$ |
|---|---|---|---|---|
| Frequency | 8 | 12 | 15 | 10 |

The data are drawn as a histogram. The bar for $10 < x \le 15$ is 6 cm tall.

How tall is the bar for $30 < x \le 50$?`, R`0.5 cm
1.25 cm
2.5 cm
3 cm
5 cm
12.5 cm`, 'B', R`Bar height is proportional to frequency density = frequency ÷ class width.

$10 < x \le 15$: $12 \div 5 = 2.4$, drawn 6 cm tall, so 1 unit of density is 2.5 cm.

$30 < x \le 50$: $10 \div 20 = 0.5$, so the bar is $0.5 \times 2.5 = 1.25$ cm.

**Answer B.**`),

Q('m1-047', 'M3.5', 2, R`Paint A is a mixture of blue and yellow in the ratio $1 : 3$. Paint B is a mixture of blue and yellow in the ratio $3 : 2$.

Equal volumes of A and B are mixed. What is the ratio of blue to yellow in the new mixture?`, R`$1 : 1$
$4 : 5$
$17 : 23$
$13 : 17$
$2 : 3$
$8 : 7$`, 'C', R`Take 20 units of each (20 is a multiple of 4 and 5).

A: 5 blue, 15 yellow. B: 12 blue, 8 yellow. Total: 17 blue, 23 yellow.

(Adding the ratios directly to get $4 : 5$ is the trap – the parts are different sizes.) **Answer C.**`),

Q('m1-048', 'M4.13', 2, R`A tank holds 40 litres of water. Water drains out so that after $t$ minutes the volume is $V = 40 \times 0.8^t$ litres.

After how many whole minutes does the tank first hold less than half of its original volume?`, R`2
3
4
5
6`, 'C', R`We need $0.8^t < 0.5$.

$0.8^2 = 0.64$, $0.8^3 = 0.512$, $0.8^4 = 0.4096$.

So the volume first drops below 20 litres after 4 minutes. **Answer C.**`),

Q('m1-049', 'M2.2', 1, R`What is the value of $\left(2\frac{1}{3} - 1\frac{3}{4}\right) \div 1\frac{1}{6}$?`, R`$\frac{1}{2}$
$\frac{7}{12}$
$\frac{2}{3}$
$\frac{49}{72}$
$\frac{6}{7}$`, 'A', R`$2\frac{1}{3} - 1\frac{3}{4} = \frac{28}{12} - \frac{21}{12} = \frac{7}{12}$.

$\frac{7}{12} \div \frac{7}{6} = \frac{7}{12} \times \frac{6}{7} = \frac{1}{2}$. **Answer A.**`),

Q('m1-050', 'M5.14', 2, R`A trapezium has parallel sides of lengths $x$ cm and $(x + 6)$ cm, and the perpendicular distance between them is $x$ cm. Its area is $56\ \text{cm}^2$.

What is $x$?`, R`4
6
7
8
$-3 + \sqrt{65}$`, 'C', R`$$\text{Area} = \frac{1}{2}(x + x + 6)\,x = x^2 + 3x = 56 \;\Rightarrow\; x^2 + 3x - 56 = 0.$$

$(x + 8)(x - 7) = 0$ and $x > 0$, so $x = 7$. **Answer C.**`),
  ]);
})();
