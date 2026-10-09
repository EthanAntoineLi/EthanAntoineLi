// Mathematics 2 – original practice questions in the ESAT style (not official ESAT questions).
(function () {
  const R = String.raw;
  const Q = (id, spec, difficulty, stem, options, answer, solution) => ({ id, spec, difficulty, stem, options: options.split('\n').map((s) => s.trim()).filter(Boolean), answer, solution });
  window.ESAT_QUESTIONS = (window.ESAT_QUESTIONS || []).concat([

Q('m2-001', 'MM1.1', 1, R`Simplify $\dfrac{\left(27x^6\right)^{\frac{2}{3}}}{9x^{-2}}$.`, R`$x^2$
$x^4$
$x^6$
$x^8$
$3x^6$
$9x^6$`, 'C', R`$(27x^6)^{2/3} = 27^{2/3}\,x^{4} = 9x^4$.

$$\frac{9x^4}{9x^{-2}} = x^{4 - (-2)} = x^6.$$

**Answer C.**`),

Q('m2-002', 'MM1.3', 2, R`Find all values of $k$ for which the equation $kx^2 + 4x + (k - 3) = 0$ has two distinct real roots.`, R`$-1 < k < 4$
$-1 < k < 4$ and $k \neq 0$
$k < -1$ or $k > 4$
$-4 < k < 1$
$0 < k < 4$
$k > -1$`, 'B', R`Two distinct real roots needs the discriminant positive:

$$16 - 4k(k - 3) > 0 \iff k^2 - 3k - 4 < 0 \iff (k - 4)(k + 1) < 0 \iff -1 < k < 4.$$

But if $k = 0$ the equation is linear ($4x - 3 = 0$) with only one root, so exclude it.

**Answer B.**`),

Q('m2-003', 'MM1.6', 2, R`$f(x) = 2x^3 + ax^2 + bx - 6$, where $a$ and $b$ are constants.

$(x - 1)$ is a factor of $f(x)$, and when $f(x)$ is divided by $(x + 1)$ the remainder is $-8$.

What is the remainder when $f(x)$ is divided by $(x - 2)$?`, R`0
10
18
22
26
30`, 'D', R`Factor theorem: $f(1) = 2 + a + b - 6 = 0$, so $a + b = 4$.

Remainder theorem: $f(-1) = -2 + a - b - 6 = -8$, so $a - b = 0$.

Hence $a = b = 2$ and $f(2) = 16 + 8 + 4 - 6 = 22$. **Answer D.**`),

Q('m2-004', 'MM1.5', 2, R`Which set of values of $x$ satisfies both $x^2 < 2x + 15$ and $3x - 1 > x + 3$?`, R`$2 < x < 5$
$-3 < x < 5$
$x > 2$
$-3 < x < 2$
$x > 5$
$2 < x < 3$`, 'A', R`$x^2 - 2x - 15 < 0 \iff (x - 5)(x + 3) < 0 \iff -3 < x < 5$.

$3x - 1 > x + 3 \iff x > 2$.

Both: $2 < x < 5$. **Answer A.**`),

Q('m2-005', 'MM1.4', 2, R`The line $y = mx + 2$ is a tangent to the curve $y = x^2 + 6$.

What are the possible values of $m$?`, R`$\pm 2$
$\pm 4$
$4$ only
$\pm 2\sqrt{2}$
$\pm 8$
$\pm 16$`, 'B', R`At intersections $x^2 + 6 = mx + 2$, i.e. $x^2 - mx + 4 = 0$.

A tangent touches once, so the discriminant is zero: $m^2 - 16 = 0$, giving $m = \pm 4$.

**Answer B.**`),

Q('m2-006', 'MM1.7', 2, R`How many real solutions does the equation $\left|x^2 - 4\right| = 3$ have?`, R`0
1
2
3
4
6`, 'E', R`Either $x^2 - 4 = 3$, giving $x = \pm\sqrt{7}$, or $x^2 - 4 = -3$, giving $x = \pm 1$.

That is 4 solutions. (Sketch: the graph of $|x^2 - 4|$ is a W shape whose middle bump reaches height 4, so the line $y = 3$ cuts it four times.)

**Answer E.**`),

Q('m2-007', 'MM2.2', 2, R`The 5th term of an arithmetic sequence is 17, and the sum of the first 10 terms is 185.

What is the sum of the first 20 terms?`, R`570
620
670
700
740
770`, 'C', R`$a + 4d = 17$ and $\frac{10}{2}(2a + 9d) = 185 \Rightarrow 2a + 9d = 37$.

Doubling the first: $2a + 8d = 34$, so $d = 3$ and $a = 5$.

$$S_{20} = \frac{20}{2}\big(2(5) + 19(3)\big) = 10 \times 67 = 670.$$

**Answer C.**`),

Q('m2-008', 'MM2.3', 2, R`A geometric series has second term 12 and sum to infinity 64.

What are the possible values of the common ratio?`, R`$\frac{1}{4}$ or $\frac{3}{4}$
$\frac{1}{4}$ only
$\frac{3}{4}$ only
$\frac{1}{2}$ only
$\frac{1}{3}$ or $\frac{2}{3}$
$\frac{3}{16}$ only`, 'A', R`$ar = 12$ and $\dfrac{a}{1 - r} = 64$, so $a = 64(1 - r)$ and $64r(1 - r) = 12$.

$16r^2 - 16r + 3 = 0 \Rightarrow (4r - 1)(4r - 3) = 0$, so $r = \frac{1}{4}$ or $\frac{3}{4}$.

Both have $|r| < 1$, so both are valid (with $a = 48$ or $a = 16$). **Answer A.**`),

Q('m2-009', 'MM2.4', 2, R`What is the coefficient of $x^3$ in the expansion of $\left(2 - \dfrac{x}{2}\right)^6$?`, R`$-160$
$-40$
$-20$
$-10$
$20$
$160$`, 'C', R`$$\binom{6}{3}\,2^3\left(-\frac{1}{2}\right)^3 = 20 \times 8 \times \left(-\frac{1}{8}\right) = -20.$$

**Answer C.**`),

Q('m2-010', 'MM2.4', 3, R`What is the term independent of $x$ in the expansion of $\left(x^2 - \dfrac{2}{x}\right)^6$?`, R`$-240$
$-160$
$60$
$160$
$240$
$480$`, 'E', R`General term: $\binom{6}{k}(x^2)^{6 - k}\left(-\frac{2}{x}\right)^k = \binom{6}{k}(-2)^k x^{12 - 3k}$.

Independent of $x$ when $12 - 3k = 0$, i.e. $k = 4$:

$$\binom{6}{4}(-2)^4 = 15 \times 16 = 240.$$

**Answer E.**`),

Q('m2-011', 'MM2.1', 2, R`A sequence is defined by $u_1 = 2$ and $u_{n+1} = k\,u_n - 3$, where $k$ is a constant. Given that $u_3 = 11$, what is the sum of the possible values of $k$?`, R`$-2$
$-\frac{3}{2}$
$\frac{3}{2}$
$\frac{7}{2}$
$5$
$\frac{11}{2}$`, 'C', R`$u_2 = 2k - 3$, so $u_3 = k(2k - 3) - 3 = 2k^2 - 3k - 3 = 11$.

$2k^2 - 3k - 14 = 0 \Rightarrow (2k - 7)(k + 2) = 0$, so $k = \frac{7}{2}$ or $-2$.

Sum $= \frac{3}{2}$ (or directly: sum of roots $= -\frac{-3}{2}$). **Answer C.**`),

Q('m2-012', 'MM3.1', 2, R`The line $L$ passes through $(4, 1)$ and is perpendicular to the line $2x + 3y = 7$.

What is the area of the triangle bounded by $L$ and the two coordinate axes?`, R`$\frac{25}{6}$
$\frac{15}{2}$
$\frac{25}{3}$
$10$
$\frac{50}{3}$
$\frac{75}{4}$`, 'C', R`$2x + 3y = 7$ has gradient $-\frac{2}{3}$, so $L$ has gradient $\frac{3}{2}$:

$y - 1 = \frac{3}{2}(x - 4) \Rightarrow y = \frac{3}{2}x - 5$.

Intercepts: $(0, -5)$ and $\left(\frac{10}{3}, 0\right)$. Area $= \frac{1}{2} \times 5 \times \frac{10}{3} = \frac{25}{3}$.

**Answer C.**`),

Q('m2-013', 'MM3.2', 2, R`The circle $x^2 + y^2 - 6x + 4y - 12 = 0$ cuts the $x$-axis at two points.

What is the distance between these two points?`, R`$8$
$10$
$\sqrt{21}$
$2\sqrt{21}$
$4\sqrt{6}$
$2\sqrt{13}$`, 'D', R`Completing the square: $(x - 3)^2 + (y + 2)^2 = 25$: centre $(3, -2)$, radius 5.

The centre is 2 units from the $x$-axis, so the half-chord is $\sqrt{5^2 - 2^2} = \sqrt{21}$ and the chord is $2\sqrt{21}$.

**Answer D.**`),

Q('m2-014', 'MM3.3', 2, R`A circle has centre $(1, 2)$ and radius 3. A tangent is drawn from the point $P(7, 10)$ to touch the circle at $T$.

What is the length $PT$?`, R`$7$
$9$
$10$
$\sqrt{73}$
$\sqrt{91}$
$\sqrt{109}$`, 'E', R`The radius to $T$ is perpendicular to the tangent, so triangle $C T P$ is right-angled at $T$.

$CP^2 = 6^2 + 8^2 = 100$, so $PT^2 = 100 - 3^2 = 91$ and $PT = \sqrt{91}$.

**Answer E.**`),

Q('m2-015', 'MM4.1', 2, R`A triangle has sides of length 5, 7 and 8.

What is its area?`, R`$10$
$20$
$5\sqrt{3}$
$10\sqrt{3}$
$14\sqrt{3}$
$20\sqrt{3}$`, 'D', R`Angle $\theta$ opposite the side 7: $\cos\theta = \dfrac{25 + 64 - 49}{2 \times 5 \times 8} = \dfrac{40}{80} = \dfrac{1}{2}$, so $\theta = 60°$.

$$\text{Area} = \frac{1}{2} \times 5 \times 8 \times \sin 60° = 20 \times \frac{\sqrt{3}}{2} = 10\sqrt{3}.$$

**Answer D.**`),

Q('m2-016', 'MM4.2', 1, R`A sector of a circle has area $12\ \text{cm}^2$ and arc length $6$ cm.

What is the angle of the sector, in radians?`, R`0.75
1
1.5
2
3
4`, 'C', R`$\frac{1}{2}r^2\theta = 12$ and $r\theta = 6$. Dividing: $\frac{1}{2}r = 2$, so $r = 4$ and $\theta = \frac{6}{4} = 1.5$.

**Answer C.**`),

Q('m2-017', 'MM4.6', 2, R`How many solutions does $2\sin^2 x = \sin x$ have in the interval $0 \le x \le 2\pi$?`, R`2
3
4
5
6
7`, 'D', R`$\sin x(2\sin x - 1) = 0$.

$\sin x = 0$: $x = 0, \pi, 2\pi$ (3 solutions – both ends are included).

$\sin x = \frac{1}{2}$: $x = \frac{\pi}{6}, \frac{5\pi}{6}$ (2 solutions).

Total 5. (Dividing by $\sin x$ loses three of them.) **Answer D.**`),

Q('m2-018', 'MM4.5', 3, R`What is the sum of all the solutions of $2\cos^2 x + 3\sin x = 3$ for $0° \le x < 360°$?`, R`$180°$
$240°$
$270°$
$300°$
$360°$
$450°$`, 'C', R`Use $\cos^2 x = 1 - \sin^2 x$: $2 - 2\sin^2 x + 3\sin x - 3 = 0$, i.e. $2\sin^2 x - 3\sin x + 1 = 0$.

$(2\sin x - 1)(\sin x - 1) = 0$:
- $\sin x = \frac{1}{2}$: $x = 30°, 150°$;
- $\sin x = 1$: $x = 90°$.

Sum $= 270°$. **Answer C.**`),

Q('m2-019', 'MM4.4', 3, R`For which values of $k$ does the equation $3\sin(2x) + 1 = k$ have exactly four solutions in the interval $0 < x < 2\pi$?`, R`$-2 < k < 4$
$-2 < k < 4$, $k \neq 1$
$-2 \le k \le 4$
$-3 < k < 3$
$1 < k < 4$
$-3 < k < 3$, $k \neq 0$`, 'B', R`Let $\theta = 2x$, so $\theta$ runs over $0 < \theta < 4\pi$ – two full periods of $\sin\theta$. We need $\sin\theta = c$ where $c = \frac{k - 1}{3}$.

- $0 < |c| < 1$: two solutions per period, so 4. ✓
- $c = 0$: $\theta = \pi, 2\pi, 3\pi$ only (the end points are excluded), so 3.
- $c = \pm 1$: one per period, so 2.

So $-1 < c < 1$, $c \ne 0$, i.e. $-2 < k < 4$ with $k \ne 1$. **Answer B.**`),

Q('m2-020', 'MM5.2', 1, R`Solve $\log_2 x + \log_2(x - 2) = 3$.`, R`$x = -2$
$x = 2$
$x = 4$
$x = -2$ or $x = 4$
$x = 6$
$x = 8$`, 'C', R`$\log_2\big(x(x - 2)\big) = 3 \Rightarrow x^2 - 2x = 8 \Rightarrow (x - 4)(x + 2) = 0$.

$x = -2$ is impossible (you can't take the log of a negative number), so $x = 4$. **Answer C.**`),

Q('m2-021', 'MM5.3', 2, R`What is the sum of the solutions of $4^x - 6 \times 2^x + 8 = 0$?`, R`1
2
3
6
8
$\log_2 6$`, 'C', R`Let $y = 2^x$, so $4^x = y^2$: $y^2 - 6y + 8 = 0 \Rightarrow y = 2$ or $y = 4$.

So $x = 1$ or $x = 2$, with sum 3. (6 is the sum of the values of $2^x$, not of $x$.)

**Answer C.**`),

Q('m2-022', 'MM5.2', 2, R`Given that $\log_a 2 = p$ and $\log_a 3 = q$, which of these is equal to $\log_a\!\left(18a^2\right)$?`, R`$2p + q$
$2 + p + 2q$
$2 + 2p + q$
$2(p + 2q)$
$4 + p + 2q$
$2 + p + q^2$`, 'B', R`$\log_a(18a^2) = \log_a 2 + \log_a 9 + \log_a a^2 = p + 2q + 2$.

**Answer B.**`),

Q('m2-023', 'MM5.1', 2, R`The curves $y = 2 \times 3^x$ and $y = 18 \times 3^{-x}$ intersect at a single point.

What are its coordinates?`, R`$(0, 2)$
$(1, 3)$
$(1, 6)$
$(1, 9)$
$(2, 18)$
$(-1, 6)$`, 'C', R`$2 \times 3^x = 18 \times 3^{-x} \Rightarrow 3^{2x} = 9 \Rightarrow x = 1$, and then $y = 2 \times 3 = 6$.

**Answer C.**`),

Q('m2-024', 'MM6.2', 2, R`$f(x) = \dfrac{(3x + 2)^2}{\sqrt{x}}$ for $x > 0$.

What is $f'(1)$?`, R`$15$
$\frac{25}{2}$
$\frac{35}{2}$
$\frac{43}{2}$
$25$
$30$`, 'C', R`Expand first: $f(x) = (9x^2 + 12x + 4)x^{-1/2} = 9x^{3/2} + 12x^{1/2} + 4x^{-1/2}$.

$$f'(x) = \frac{27}{2}x^{1/2} + 6x^{-1/2} - 2x^{-3/2}, \qquad f'(1) = \frac{27}{2} + 6 - 2 = \frac{35}{2}.$$

**Answer C.**`),

Q('m2-025', 'MM6.3', 2, R`The normal to the curve $y = x^3 - 3x^2 + 4$ at the point where $x = 3$ meets the $x$-axis at $P$.

What is the $x$-coordinate of $P$?`, R`$-33$
$3 - \frac{4}{9}$
$3 + \frac{4}{9}$
$27$
$33$
$39$`, 'F', R`At $x = 3$: $y = 27 - 27 + 4 = 4$ and $\dfrac{dy}{dx} = 3x^2 - 6x = 9$.

The normal has gradient $-\frac{1}{9}$: $y - 4 = -\frac{1}{9}(x - 3)$. Setting $y = 0$: $x - 3 = 36$, so $x = 39$.

($3 - \frac{4}{9}$ is where the *tangent* meets the axis.) **Answer F.**`),

Q('m2-026', 'MM6.3', 3, R`A closed cylinder has volume $16\pi\ \text{cm}^3$.

What is the smallest possible total surface area of the cylinder?`, R`$12\pi\ \text{cm}^2$
$16\pi\ \text{cm}^2$
$20\pi\ \text{cm}^2$
$24\pi\ \text{cm}^2$
$32\pi\ \text{cm}^2$
$48\pi\ \text{cm}^2$`, 'D', R`$\pi r^2 h = 16\pi \Rightarrow h = \frac{16}{r^2}$, so

$$S = 2\pi r^2 + 2\pi r h = 2\pi r^2 + \frac{32\pi}{r}.$$

$\frac{dS}{dr} = 4\pi r - \frac{32\pi}{r^2} = 0 \Rightarrow r^3 = 8 \Rightarrow r = 2$, $h = 4$ (a minimum, since $S \to \infty$ at both ends).

$S = 8\pi + 16\pi = 24\pi$. **Answer D.**`),

Q('m2-027', 'MM8.5', 1, R`For which values of $x$ is $f(x) = x^3 - 6x^2 + 9x + 1$ a decreasing function?`, R`$1 < x < 3$
$x < 1$ or $x > 3$
$0 < x < 3$
$x > 3$
$x < 1$
$-3 < x < -1$`, 'A', R`$f'(x) = 3x^2 - 12x + 9 = 3(x - 1)(x - 3)$, which is negative for $1 < x < 3$.

**Answer A.**`),

Q('m2-028', 'MM7.2', 2, R`Evaluate $\displaystyle\int_1^4 \left(3\sqrt{x} - \frac{2}{x^2}\right) dx$.`, R`$10$
$\frac{23}{2}$
$\frac{25}{2}$
$14$
$\frac{29}{2}$
$16$`, 'C', R`$$\int \left(3x^{1/2} - 2x^{-2}\right) dx = 2x^{3/2} + 2x^{-1}.$$

$\left[2x^{3/2} + \frac{2}{x}\right]_1^4 = \left(16 + \frac{1}{2}\right) - (2 + 2) = \frac{25}{2}$.

**Answer C.**`),

Q('m2-029', 'MM7.1', 3, R`What is the total area of the regions enclosed between the curve $y = x^2 - 4x$, the $x$-axis and the line $x = 5$, for $0 \le x \le 5$?`, R`$-\frac{25}{3}$
$\frac{25}{3}$
$\frac{32}{3}$
$11$
$13$
$\frac{39}{2}$`, 'E', R`The curve is below the axis for $0 < x < 4$ and above it for $4 < x < 5$, so split the integral. With $F(x) = \frac{x^3}{3} - 2x^2$:

$\int_0^4 = F(4) - F(0) = \frac{64}{3} - 32 = -\frac{32}{3}$ (area $\frac{32}{3}$).

$\int_4^5 = \left(\frac{125}{3} - 50\right) - \left(\frac{64}{3} - 32\right) = \frac{7}{3}$.

Total area $= \frac{32}{3} + \frac{7}{3} = 13$. (Integrating straight from 0 to 5 gives $-\frac{25}{3}$, which is not an area.)

**Answer E.**`),

Q('m2-030', 'MM7.4', 2, R`Given that $\displaystyle\int_1^3 f(x)\,dx = 5$ and $\displaystyle\int_1^6 f(x)\,dx = 2$, what is $\displaystyle\int_3^6 \big(2f(x) + 1\big)\,dx$?`, R`$-9$
$-6$
$-5$
$-3$
$3$
$9$`, 'D', R`$\int_3^6 f = \int_1^6 f - \int_1^3 f = 2 - 5 = -3$.

$$\int_3^6 (2f + 1)\,dx = 2(-3) + (6 - 3) = -3.$$

**Answer D.**`),

Q('m2-031', 'MM7.5', 2, R`The trapezium rule with 4 strips of equal width is used to estimate $\displaystyle\int_0^2 2^x\,dx$.

Which of the following is correct?`, R`The estimate is $\frac{9 + 6\sqrt{2}}{4}$, an overestimate
The estimate is $\frac{9 + 6\sqrt{2}}{4}$, an underestimate
The estimate is $\frac{9 + 6\sqrt{2}}{2}$, an overestimate
The estimate is $\frac{9 + 6\sqrt{2}}{2}$, an underestimate
The estimate is $\frac{5 + 6\sqrt{2}}{4}$, an overestimate
The estimate is $\frac{5 + 6\sqrt{2}}{4}$, an underestimate`, 'A', R`Width $h = 0.5$; values at $x = 0, 0.5, 1, 1.5, 2$: $1, \sqrt{2}, 2, 2\sqrt{2}, 4$.

$$\frac{h}{2}\left[1 + 4 + 2(\sqrt{2} + 2 + 2\sqrt{2})\right] = \frac{1}{4}(9 + 6\sqrt{2}).$$

$y = 2^x$ curves upwards (convex), so each chord lies above the curve: an **overestimate**. **Answer A.**`),

Q('m2-032', 'MM7.6', 1, R`A curve has $\dfrac{dy}{dx} = 6x^2 - 4x$ and passes through the point $(1, 3)$.

What is the value of $y$ when $x = 2$?`, R`3
8
11
14
19
27`, 'C', R`$y = 2x^3 - 2x^2 + c$. At $(1, 3)$: $2 - 2 + c = 3$, so $c = 3$.

At $x = 2$: $y = 16 - 8 + 3 = 11$. **Answer C.**`),

Q('m2-033', 'MM7.3', 3, R`$F(x) = \displaystyle\int_0^x \left(t^2 - 4\right) dt$.

At which point does the graph of $y = F(x)$ have a local minimum?`, R`$\left(2, -\frac{16}{3}\right)$
$\left(-2, \frac{16}{3}\right)$
$\left(2, 0\right)$
$\left(2, \frac{16}{3}\right)$
$\left(0, 0\right)$
$\left(-2, -\frac{16}{3}\right)$`, 'A', R`By the Fundamental Theorem of Calculus, $F'(x) = x^2 - 4$, which is zero at $x = \pm 2$. $F''(x) = 2x > 0$ at $x = 2$, so that is the minimum.

$F(2) = \left[\frac{t^3}{3} - 4t\right]_0^2 = \frac{8}{3} - 8 = -\frac{16}{3}$.

**Answer A.**`),

Q('m2-034', 'MM8.2', 1, R`The graph of $y = f(x)$ has a maximum point at $(2, 5)$.

Where is the maximum point of the graph of $y = 3f(x - 1) - 2$?`, R`$(1, 13)$
$(3, 13)$
$(3, 15)$
$(3, 17)$
$(6, 13)$
$(1, 7)$`, 'B', R`$f(x - 1)$ shifts right by 1: $(3, 5)$. Multiplying by 3 stretches vertically: $(3, 15)$. Subtracting 2 shifts down: $(3, 13)$.

**Answer B.**`),

Q('m2-035', 'MM8.4', 2, R`Which sequence of transformations maps the graph of $y = x^2$ onto the graph of $y = 2x^2 - 12x + 13$?`, R`A stretch parallel to the $y$-axis, scale factor 2, then a translation by $\begin{pmatrix} 3 \\ -5 \end{pmatrix}$
A translation by $\begin{pmatrix} 3 \\ -5 \end{pmatrix}$, then a stretch parallel to the $y$-axis, scale factor 2
A stretch parallel to the $y$-axis, scale factor 2, then a translation by $\begin{pmatrix} -3 \\ -5 \end{pmatrix}$
A stretch parallel to the $x$-axis, scale factor 2, then a translation by $\begin{pmatrix} 3 \\ -5 \end{pmatrix}$
A translation by $\begin{pmatrix} 6 \\ 13 \end{pmatrix}$, then a stretch parallel to the $y$-axis, scale factor 2`, 'A', R`Complete the square: $2x^2 - 12x + 13 = 2(x - 3)^2 - 18 + 13 = 2(x - 3)^2 - 5$.

Start with $y = x^2$, stretch vertically by 2 to get $y = 2x^2$, then translate right 3 and down 5 to get $y = 2(x - 3)^2 - 5$.

(Translating first and then stretching would also double the $-5$, giving a minimum at $(3, -10)$.) **Answer A.**`),

Q('m2-036', 'MM8.6', 2, R`How many real roots does the equation $x^3 - 3x + 1 = 0$ have?`, R`0
1
2
3`, 'D', R`$f'(x) = 3x^2 - 3 = 0$ at $x = \pm 1$.

$f(-1) = 3 > 0$ (local maximum) and $f(1) = -1 < 0$ (local minimum). A cubic whose local max is above the axis and local min below it crosses the axis three times.

**Answer D.**`),

Q('m2-037', 'MM8.7', 2, R`For which values of the constant $k$ does the line $y = k$ meet the curve $y = x^3 - 3x$ at exactly three points?`, R`$-2 < k < 2$
$-2 \le k \le 2$
$0 < k < 2$
$-1 < k < 1$
$k < -2$ or $k > 2$
$k > 2$`, 'A', R`$\frac{dy}{dx} = 3x^2 - 3 = 0$ at $x = \pm 1$: local maximum $(-1, 2)$ and local minimum $(1, -2)$.

A horizontal line meets the curve three times exactly when it lies strictly between these: $-2 < k < 2$. (At $k = \pm 2$ it is tangent, giving only two points.)

**Answer A.**`),

Q('m2-038', 'MM4.3', 1, R`What is the exact value of $\sin 60° \cos 30° + \tan 45° - \cos 60°$?`, R`$\frac{1}{4}$
$\frac{3}{4}$
$1$
$\frac{5}{4}$
$\frac{3}{2}$
$\frac{\sqrt{3} + 1}{2}$`, 'D', R`$$\frac{\sqrt{3}}{2} \cdot \frac{\sqrt{3}}{2} + 1 - \frac{1}{2} = \frac{3}{4} + \frac{1}{2} = \frac{5}{4}.$$

**Answer D.**`),

Q('m2-039', 'MM1.2', 2, R`Express $\dfrac{5 + \sqrt{3}}{2 - \sqrt{3}}$ in the form $a + b\sqrt{3}$, where $a$ and $b$ are integers.

What is $a + b$?`, R`$6$
$13$
$16$
$20$
$-4$
$7$`, 'D', R`Multiply top and bottom by $2 + \sqrt{3}$; the denominator becomes $4 - 3 = 1$:

$$(5 + \sqrt{3})(2 + \sqrt{3}) = 10 + 5\sqrt{3} + 2\sqrt{3} + 3 = 13 + 7\sqrt{3}.$$

$a + b = 20$. **Answer D.**`),

Q('m2-040', 'MM2.3', 3, R`The sum of the first $n$ terms of the series $1 + \frac{1}{3} + \frac{1}{9} + \cdots$ differs from its sum to infinity by less than $\frac{1}{1000}$.

What is the smallest possible value of $n$?`, R`5
6
7
8
9
10`, 'C', R`$S_\infty = \dfrac{1}{1 - \frac{1}{3}} = \dfrac{3}{2}$, and $S_\infty - S_n = \dfrac{3}{2}\left(\frac{1}{3}\right)^n$.

We need $\frac{3}{2} \cdot 3^{-n} < \frac{1}{1000}$, i.e. $3^n > 1500$.

$3^6 = 729$, $3^7 = 2187$, so $n = 7$. **Answer C.**`),

Q('m2-041', 'MM6.1', 2, R`The curve $y = ax^3 + bx$ has a stationary point at $(1, -4)$.

What is the value of $\dfrac{d^2y}{dx^2}$ at this point?`, R`$-12$
$-6$
$0$
$6$
$12$
$24$`, 'E', R`$\frac{dy}{dx} = 3ax^2 + b = 0$ at $x = 1$: $3a + b = 0$. Through $(1, -4)$: $a + b = -4$.

So $2a = 4$, $a = 2$, $b = -6$, and $\frac{d^2y}{dx^2} = 6ax = 12$ at $x = 1$ (a minimum).

**Answer E.**`),

Q('m2-042', 'MM4.6', 2, R`How many solutions does $\tan 3x = 1$ have for $0° \le x \le 180°$?`, R`1
2
3
4
6`, 'C', R`Let $\theta = 3x$, so $0° \le \theta \le 540°$. $\tan\theta = 1$ at $\theta = 45°, 225°, 405°$ (the next, $585°$, is too big).

So $x = 15°, 75°, 135°$: three solutions. **Answer C.**`),
  ]);
})();
