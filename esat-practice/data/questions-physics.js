// Physics – original practice questions in the ESAT style (not official ESAT questions).
// As in the ESAT, take g = 10 N/kg.
(function () {
  const R = String.raw;
  const Q = (id, spec, difficulty, stem, options, answer, solution) => ({ id, spec, difficulty, stem, options: options.split('\n').map((s) => s.trim()).filter(Boolean), answer, solution });
  window.ESAT_QUESTIONS = (window.ESAT_QUESTIONS || []).concat([

Q('p-001', 'P1.2', 2, R`A 6 Ω resistor is connected in series with a parallel combination of a 3 Ω resistor and a 6 Ω resistor. The arrangement is connected to a 12 V battery of negligible internal resistance.

What is the current in the 3 Ω resistor?`, R`0.5 A
1.0 A
1.5 A
2.0 A
3.0 A
4.0 A`, 'B', R`$3\,\Omega \parallel 6\,\Omega = \dfrac{3 \times 6}{3 + 6} = 2\,\Omega$, so the total resistance is $8\,\Omega$ and the battery current is $\dfrac{12}{8} = 1.5$ A.

The p.d. across the parallel pair is $1.5 \times 2 = 3$ V, so the current in the 3 Ω resistor is $\dfrac{3}{3} = 1.0$ A.

**Answer B.**`),

Q('p-002', 'P1.2', 1, R`Two identical resistors connected in series to a supply of constant voltage $V$ dissipate a total power $P$.

The same two resistors are then connected in parallel to the same supply. What total power do they now dissipate?`, R`$\frac{P}{4}$
$\frac{P}{2}$
$P$
$2P$
$4P$
$8P$`, 'E', R`Series: $R_{\text{total}} = 2R$, so $P = \dfrac{V^2}{2R}$. Parallel: $R_{\text{total}} = \dfrac{R}{2}$, so the power is $\dfrac{V^2}{R/2} = \dfrac{2V^2}{R} = 4P$.

**Answer E.**`),

Q('p-003', 'P1.2', 1, R`A 9.0 V battery supplies a steady current of 0.20 A for 5.0 minutes.

How much charge flows, and how much energy does the battery transfer?`, R`1.0 C and 9.0 J
60 C and 6.7 J
60 C and 540 J
1.0 C and 540 J
300 C and 2700 J
60 C and 9.0 J`, 'C', R`$Q = It = 0.20 \times 300 = 60$ C.

$E = QV = 60 \times 9.0 = 540$ J.

(Using 5 s instead of 300 s gives the 1.0 C options.) **Answer C.**`),

Q('p-004', 'P1.2', 2, R`A potential divider consists of a fixed 2.0 kΩ resistor in series with an NTC thermistor, connected across a 6.0 V supply. The output voltage is measured across the fixed resistor.

At 60 °C the output voltage is 4.0 V. What is the resistance of the thermistor at 60 °C?`, R`0.5 kΩ
1.0 kΩ
2.0 kΩ
3.0 kΩ
4.0 kΩ
8.0 kΩ`, 'B', R`The current is the same in both components. $V_{\text{out}} = 6.0 \times \dfrac{2.0}{2.0 + R_T} = 4.0$, so $2.0 + R_T = 3.0$ and $R_T = 1.0$ kΩ.

(Equivalently: 4.0 V across 2.0 kΩ and 2.0 V across the thermistor, so it has half the resistance.) **Answer B.**`),

Q('p-005', 'P1.1', 1, R`A polythene rod is rubbed with a dry woollen cloth and the rod becomes negatively charged.

Which statement is correct?`, R`Electrons moved from the cloth to the rod, and the cloth becomes positive.
Protons moved from the rod to the cloth, and the cloth becomes positive.
Electrons moved from the rod to the cloth, and the cloth becomes negative.
Electrons were created on the rod by friction, and the cloth stays neutral.
Positive charge moved from the cloth to the rod, and the cloth becomes negative.`, 'A', R`Charging by friction transfers electrons; protons are fixed in nuclei and charge is not created. The rod gains electrons, so the cloth loses the same number and is left equally positive.

**Answer A.**`),

Q('p-006', 'P2.3', 2, R`A straight horizontal wire of length 0.25 m and mass 20 g carries a current of 4.0 A. It lies at right angles to a horizontal uniform magnetic field.

What magnetic flux density is needed for the magnetic force on the wire to balance its weight?`, R`0.02 T
0.05 T
0.20 T
0.50 T
2.0 T
5.0 T`, 'C', R`Weight $= mg = 0.020 \times 10 = 0.20$ N. Set $BIL = 0.20$:

$$B = \frac{0.20}{4.0 \times 0.25} = 0.20\ \text{T}.$$

(Forgetting to convert 20 g to 0.020 kg gives a value 1000 times too large.) **Answer C.**`),

Q('p-007', 'P2.5', 2, R`An ideal transformer steps 230 V down to 11.5 V. The secondary coil has 60 turns and delivers a current of 4.6 A.

How many turns are on the primary coil, and what is the primary current?`, R`1200 turns, 0.23 A
3 turns, 92 A
1200 turns, 92 A
3 turns, 0.23 A
2400 turns, 0.115 A
600 turns, 0.46 A`, 'A', R`Turns ratio: $\dfrac{n_p}{n_s} = \dfrac{V_p}{V_s} = \dfrac{230}{11.5} = 20$, so $n_p = 1200$.

Ideal: $V_pI_p = V_sI_s$, so $I_p = \dfrac{4.6}{20} = 0.23$ A (the step-down side has the larger current).

**Answer A.**`),

Q('p-008', 'P2.5', 3, R`A power station sends 100 kW to a town through cables with a total resistance of 5.0 Ω. The power is transmitted at 10 kV.

What percentage of the transmitted power is lost as heat in the cables?`, R`0.005%
0.05%
0.5%
1%
5%
50%`, 'C', R`Current in the cables: $I = \dfrac{P}{V} = \dfrac{100\,000}{10\,000} = 10$ A.

Power lost: $I^2R = 100 \times 5.0 = 500$ W, which is $\dfrac{500}{100\,000} = 0.5\%$.

(Using $V^2/R$ with the 10 kV supply voltage is a classic mistake – that voltage is not across the cables.) **Answer C.**`),

Q('p-009', 'P2.4', 2, R`When a bar magnet is pushed into a coil at a steady speed, the maximum induced e.m.f. is 2 mV.

Which change would give a maximum induced e.m.f. of 8 mV?`, R`Pushing the magnet in twice as fast
Using a coil with twice as many turns
Reversing the magnet so the south pole enters first
Pushing the magnet in twice as fast into a coil with twice as many turns
Pushing the magnet in four times as fast into a coil with half as many turns
Using a coil with four times as many turns and pushing the magnet in half as fast`, 'D', R`The induced e.m.f. is proportional to the rate of cutting field lines, which scales with both the speed and the number of turns.

$2 \times 2 = 4$ times bigger: 8 mV. (Options E and F give $4 \times \frac{1}{2} = 2$ times; reversing the magnet only reverses the direction.)

**Answer D.**`),

Q('p-010', 'P3.1', 2, R`A car travelling at 30 m/s brakes with a constant deceleration and stops in a distance of 75 m.

With the same deceleration, what would the braking distance be from 15 m/s?`, R`9.4 m
15 m
18.75 m
25 m
37.5 m
56.25 m`, 'C', R`$v^2 - u^2 = 2as$ with $v = 0$: braking distance $\propto u^2$.

Halving the speed quarters the distance: $\dfrac{75}{4} = 18.75$ m.

(The deceleration is $\frac{900}{150} = 6\ \text{m/s}^2$, but you don't need it.) **Answer C.**`),

Q('p-011', 'P3.1', 3, R`An object moves in a straight line. It travels at a constant velocity of $+10$ m/s for 4.0 s. Its velocity then changes uniformly from $+10$ m/s to $-6$ m/s over the next 8.0 s.

What are the total distance travelled and the final displacement from the start, over the whole 12 s?`, R`distance 74 m, displacement 56 m
distance 74 m, displacement 74 m
distance 72 m, displacement 40 m
distance 65 m, displacement 56 m
distance 56 m, displacement 74 m
distance 56 m, displacement 56 m`, 'A', R`The acceleration is $\frac{-16}{8} = -2\ \text{m/s}^2$, so the velocity reaches zero 5 s after the change starts (at $t = 9$ s).

- $0$–$4$ s: $10 \times 4 = 40$ m forwards.
- $4$–$9$ s: $\frac{1}{2} \times 5 \times 10 = 25$ m forwards.
- $9$–$12$ s: $\frac{1}{2} \times 3 \times 6 = 9$ m backwards.

Distance $= 40 + 25 + 9 = 74$ m; displacement $= 40 + 25 - 9 = 56$ m. **Answer A.**`),

Q('p-012', 'P3.4', 2, R`Blocks of mass 3.0 kg and 2.0 kg rest on a smooth horizontal table, joined by a light inextensible string. A horizontal force of 20 N pulls the 3.0 kg block away from the 2.0 kg block.

What is the tension in the string?`, R`4.0 N
8.0 N
10 N
12 N
20 N`, 'B', R`Whole system: $a = \dfrac{20}{3.0 + 2.0} = 4.0\ \text{m/s}^2$.

The string is the only horizontal force on the 2.0 kg block: $T = 2.0 \times 4.0 = 8.0$ N.

(12 N is the net force on the 3.0 kg block, $20 - 8$.) **Answer B.**`),

Q('p-013', 'P3.4', 2, R`A person of mass 60 kg stands on bathroom scales in a lift. The lift is accelerating downwards at $2.0\ \text{m/s}^2$.

What force do the scales exert on the person?`, R`120 N
480 N
600 N
720 N
48 N
72 N`, 'B', R`Taking downwards as positive: $mg - R = ma$, so $R = m(g - a) = 60 \times (10 - 2.0) = 480$ N.

(Accelerating upwards would give 720 N.) **Answer B.**`),

Q('p-014', 'P3.6', 2, R`A trolley of mass 2.0 kg moving at 6.0 m/s collides with a stationary trolley of mass 4.0 kg. The trolleys stick together.

How much kinetic energy is lost in the collision?`, R`0 J
12 J
24 J
36 J
48 J`, 'C', R`Momentum: $2.0 \times 6.0 = 6.0v$, so $v = 2.0$ m/s.

KE before $= \frac{1}{2}(2.0)(6.0)^2 = 36$ J; after $= \frac{1}{2}(6.0)(2.0)^2 = 12$ J. Lost: 24 J.

**Answer C.**`),

Q('p-015', 'P3.6', 2, R`A ball of mass 0.20 kg hits a wall at 15 m/s and rebounds along the same line at 10 m/s. It is in contact with the wall for 0.050 s.

What is the average force exerted on the ball by the wall?`, R`20 N
40 N
60 N
100 N
150 N
250 N`, 'D', R`Velocity changes from $+15$ to $-10$ m/s, a change of 25 m/s, so $\Delta p = 0.20 \times 25 = 5.0$ kg m/s.

$F = \dfrac{\Delta p}{\Delta t} = \dfrac{5.0}{0.050} = 100$ N.

(Subtracting the speeds gives 20 N – direction matters.) **Answer D.**`),

Q('p-016', 'P3.7', 2, R`A cyclist and bicycle have a combined mass of 50 kg. Starting from rest, they freewheel down a hill, descending a vertical height of 20 m, and reach a speed of 15 m/s at the bottom.

How much energy is dissipated by friction and air resistance on the way down?`, R`2200 J
4375 J
5625 J
10 000 J
15 625 J`, 'B', R`GPE lost $= mgh = 50 \times 10 \times 20 = 10\,000$ J.

KE gained $= \frac{1}{2} \times 50 \times 15^2 = 5625$ J.

Dissipated $= 10\,000 - 5625 = 4375$ J. **Answer B.**`),

Q('p-017', 'P3.7', 2, R`An electric motor lifts a load of mass 120 kg through a height of 15 m in 30 s. The motor is 60% efficient.

What is the electrical power input to the motor?`, R`360 W
600 W
1000 W
1200 W
1800 W`, 'C', R`Useful power $= \dfrac{mgh}{t} = \dfrac{120 \times 10 \times 15}{30} = 600$ W.

Input $= \dfrac{600}{0.60} = 1000$ W. (360 W comes from multiplying by 0.6 instead of dividing.)

**Answer C.**`),

Q('p-018', 'P3.3', 3, R`Two identical springs, each of spring constant 400 N/m, are joined end to end and hung vertically. A 6.0 kg mass hangs from the bottom and is at rest. The springs obey Hooke's law and have negligible mass.

What is the total extension, and the total elastic energy stored?`, R`0.15 m and 4.5 J
0.30 m and 9.0 J
0.30 m and 18 J
0.075 m and 2.25 J
0.60 m and 36 J`, 'B', R`Each spring carries the full weight, 60 N, so each extends $\dfrac{60}{400} = 0.15$ m: total 0.30 m.

Energy in each spring $= \frac{1}{2}kx^2 = \frac{1}{2}(400)(0.15)^2 = 4.5$ J, so 9.0 J in total.

(Check: $\frac{1}{2}Fx = \frac{1}{2}(60)(0.30) = 9.0$ J.) **Answer B.**`),

Q('p-019', 'P3.5', 1, R`A skydiver is falling at terminal velocity and then opens her parachute.

Which statement describes what happens immediately after the parachute opens?`, R`The air resistance becomes less than her weight, so she accelerates downwards.
Her weight decreases, so she slows down.
The air resistance becomes greater than her weight, so she moves upwards.
The resultant force is zero, so she continues at the same speed.
The air resistance becomes greater than her weight, so she decelerates.`, 'E', R`Opening the parachute suddenly increases the air resistance, which is now bigger than her (unchanged) weight. The resultant force is upwards, so she slows down – she keeps moving downwards, just more slowly – until a new, lower terminal velocity is reached.

**Answer E.**`),

Q('p-020', 'P4.4', 2, R`An electric kettle has a power of 2.0 kW and is 80% efficient. It heats 1.5 kg of water from 20 °C to 100 °C.

How long does this take? (Specific heat capacity of water $= 4200\ \text{J kg}^{-1}\,°\text{C}^{-1}$.)`, R`252 s
315 s
394 s
504 s
630 s`, 'B', R`Energy needed $= mc\Delta T = 1.5 \times 4200 \times 80 = 504\,000$ J.

Useful power $= 0.80 \times 2000 = 1600$ W, so $t = \dfrac{504\,000}{1600} = 315$ s.

**Answer B.**`),

Q('p-021', 'P5.3', 3, R`How much energy is needed to turn 0.50 kg of ice at $-10$ °C into water at 20 °C?

Specific heat capacity of ice $= 2100\ \text{J kg}^{-1}\,°\text{C}^{-1}$; of water $= 4200\ \text{J kg}^{-1}\,°\text{C}^{-1}$. Specific latent heat of fusion of ice $= 3.4 \times 10^5\ \text{J kg}^{-1}$.`, R`52 500 J
170 000 J
212 000 J
222 500 J
233 000 J`, 'D', R`Three stages:
- warm the ice to 0 °C: $0.50 \times 2100 \times 10 = 10\,500$ J;
- melt it: $0.50 \times 3.4 \times 10^5 = 170\,000$ J;
- warm the water to 20 °C: $0.50 \times 4200 \times 20 = 42\,000$ J.

Total $= 222\,500$ J. **Answer D.**`),

Q('p-022', 'P5.2', 2, R`An air bubble of volume $2.0\ \text{cm}^3$ is released at the bottom of a lake 20 m deep and rises to the surface. The temperature stays constant.

Atmospheric pressure $= 100$ kPa, density of water $= 1000\ \text{kg m}^{-3}$.

What is the volume of the bubble at the surface?`, R`$0.67\ \text{cm}^3$
$2.0\ \text{cm}^3$
$4.0\ \text{cm}^3$
$6.0\ \text{cm}^3$
$8.0\ \text{cm}^3$
$20\ \text{cm}^3$`, 'D', R`The water adds $\rho g h = 1000 \times 10 \times 20 = 200\,000$ Pa $= 200$ kPa, so the pressure at the bottom is $100 + 200 = 300$ kPa.

At constant temperature $pV$ is constant: $300 \times 2.0 = 100 \times V$, so $V = 6.0\ \text{cm}^3$.

(Forgetting atmospheric pressure at the bottom gives $4.0\ \text{cm}^3$.) **Answer D.**`),

Q('p-023', 'P5.5', 2, R`A solid block of concrete (density $2500\ \text{kg m}^{-3}$) is a cuboid 0.40 m tall. It stands upright on level ground.

What pressure does it exert on the ground?`, R`1000 Pa
2500 Pa
10 000 Pa
25 000 Pa
100 000 Pa
It cannot be found without knowing the base area`, 'C', R`$$p = \frac{F}{A} = \frac{mg}{A} = \frac{\rho (Ah) g}{A} = \rho g h = 2500 \times 10 \times 0.40 = 10\,000\ \text{Pa}.$$

The base area cancels. **Answer C.**`),

Q('p-024', 'P5.4', 2, R`A 200 cm³ block is made of an alloy of gold (density $19\ \text{g cm}^{-3}$) and copper (density $9\ \text{g cm}^{-3}$). Its mass is 2.8 kg. Assume the volume of the alloy equals the sum of the volumes of the metals.

What mass of gold does it contain?`, R`0.9 kg
1.4 kg
1.9 kg
2.0 kg
2.4 kg`, 'C', R`Let the gold have volume $V$ cm³. Then $19V + 9(200 - V) = 2800$, so $10V = 1000$ and $V = 100$ cm³.

Mass of gold $= 19 \times 100 = 1900$ g $= 1.9$ kg. **Answer C.**`),

Q('p-025', 'P6.1', 2, R`A sound wave of frequency 750 Hz travels from air, where its speed is 340 m/s, into water, where its speed is 1500 m/s.

What are the frequency and wavelength of the sound in the water?`, R`750 Hz and 2.0 m
750 Hz and 0.45 m
170 Hz and 2.0 m
3300 Hz and 2.0 m
750 Hz and 0.50 m
3300 Hz and 0.45 m`, 'A', R`The frequency is set by the source and does not change at a boundary: 750 Hz.

$\lambda = \dfrac{v}{f} = \dfrac{1500}{750} = 2.0$ m. **Answer A.**`),

Q('p-026', 'P6.3', 1, R`A ray of light passes from glass into air, meeting the boundary at an angle (not along the normal).

Which row correctly describes what happens to the light?

| | speed | wavelength | frequency | direction |
|---|---|---|---|---|
| A | increases | increases | unchanged | bends away from the normal |
| B | increases | unchanged | increases | bends away from the normal |
| C | decreases | decreases | unchanged | bends towards the normal |
| D | increases | increases | unchanged | bends towards the normal |
| E | unchanged | increases | decreases | bends away from the normal |`, R`A
B
C
D
E`, 'A', R`Light travels faster in air than in glass. The frequency is unchanged, so $\lambda = v/f$ increases too. Speeding up as it crosses the boundary, the ray bends away from the normal.

**Answer A.**`),

Q('p-027', 'P6.5', 1, R`Which list puts these types of electromagnetic radiation in order of **increasing frequency**?`, R`radio, visible, infrared, ultraviolet, X-rays
X-rays, ultraviolet, visible, infrared, radio
radio, infrared, ultraviolet, visible, X-rays
infrared, radio, visible, X-rays, ultraviolet
radio, infrared, visible, ultraviolet, X-rays`, 'E', R`In order of increasing frequency (decreasing wavelength): radio, microwaves, infrared, visible, ultraviolet, X-rays, gamma.

**Answer E.**`),

Q('p-028', 'P6.4', 2, R`An ultrasound pulse travels through soft tissue at 1500 m/s and reflects from a boundary 6.0 cm below the surface of the skin.

How long after it is sent does the echo arrive back at the probe?`, R`$0.8\ \mu\text{s}$
$40\ \mu\text{s}$
$80\ \mu\text{s}$
$40$ ms
$80$ ms`, 'C', R`The pulse travels down and back: $2 \times 0.060 = 0.12$ m.

$t = \dfrac{0.12}{1500} = 8.0 \times 10^{-5}$ s $= 80\ \mu\text{s}$. **Answer C.**`),

Q('p-029', 'P6.2', 1, R`An ambulance with its siren sounding drives towards a stationary observer, passes her, and drives away at constant speed.

Compared with the frequency emitted by the siren, the frequency heard by the observer is:`, R`higher as it approaches and lower as it moves away
higher as it approaches, and the same as it moves away
lower as it approaches and higher as it moves away
higher both as it approaches and as it moves away
the same throughout, but louder as it approaches`, 'A', R`This is the Doppler effect: waves are bunched up ahead of a moving source (shorter wavelength, higher frequency) and stretched out behind it (lower frequency).

**Answer A.**`),

Q('p-030', 'P7.2', 2, R`A nucleus of uranium-238 ($Z = 92$) decays through a series of alpha and beta-minus emissions to a stable nucleus of lead-206 ($Z = 82$).

How many alpha particles and how many beta-minus particles are emitted?`, R`4 alpha and 2 beta
8 alpha and 4 beta
10 alpha and 6 beta
6 alpha and 8 beta
8 alpha and 6 beta
8 alpha and 10 beta`, 'E', R`Only alpha decay changes the mass number (by 4 each time): $\dfrac{238 - 206}{4} = 8$ alpha particles.

8 alpha decays reduce $Z$ by 16, from 92 to 76. Each beta-minus raises $Z$ by 1, so $82 - 76 = 6$ beta particles.

**Answer E.**`),

Q('p-031', 'P7.4', 2, R`The activity of a radioactive sample falls from 6400 Bq to 400 Bq in 24 hours.

What is the half-life of the sample?`, R`1.5 hours
3 hours
4 hours
6 hours
8 hours
12 hours`, 'D', R`$6400 \to 3200 \to 1600 \to 800 \to 400$: four half-lives in 24 hours, so the half-life is 6 hours.

**Answer D.**`),

Q('p-032', 'P7.4', 2, R`A sample is initially pure radioactive isotope X, which decays to a stable daughter isotope Y.

After three half-lives, what is the ratio (number of Y nuclei) : (number of X nuclei)?`, R`1 : 7
1 : 8
3 : 1
7 : 1
8 : 1`, 'D', R`After three half-lives, $\left(\frac{1}{2}\right)^3 = \frac{1}{8}$ of X remains, so $\frac{7}{8}$ has become Y.

$\text{Y} : \text{X} = \frac{7}{8} : \frac{1}{8} = 7 : 1$. **Answer D.**`),

Q('p-033', 'P7.3', 1, R`A radioactive source emits a type of radiation that passes through a sheet of paper but is almost completely stopped by 5 mm of aluminium. It is deflected by a magnetic field.

What is the radiation?`, R`beta particles
alpha particles
gamma rays
X-rays
neutrons`, 'A', R`Alpha is stopped by paper; gamma passes through aluminium and is not deflected by fields (neither are X-rays or neutrons, which are uncharged). Beta particles get through paper, are stopped by a few mm of aluminium, and are deflected because they are charged.

**Answer A.**`),

Q('p-034', 'P4.1', 1, R`A vacuum flask keeps hot drinks hot. Which statement about the flask is **incorrect**?`, R`The vacuum between the walls reduces heat transfer by conduction.
The vacuum between the walls reduces heat transfer by convection.
The silvered surfaces reduce heat transfer by radiation.
The stopper reduces heat loss by convection and evaporation.
The vacuum between the walls stops heat transfer by radiation.`, 'E', R`Conduction and convection both need a medium, so the vacuum stops them. Radiation is electromagnetic and **can** cross a vacuum – it is reduced by the shiny silvered surfaces, not by the vacuum.

**Answer E.**`),

Q('p-035', 'P3.1', 2, R`A ball is dropped from rest from a height of 45 m. Air resistance is negligible.

How long does it take to fall the final 25 m?`, R`0.5 s
1.0 s
1.5 s
2.0 s
2.2 s
3.0 s`, 'B', R`Using $s = \frac{1}{2}gt^2$ with $g = 10$:

Whole 45 m: $45 = 5t^2 \Rightarrow t = 3.0$ s. First 20 m: $20 = 5t^2 \Rightarrow t = 2.0$ s.

So the last 25 m takes $1.0$ s. **Answer B.**`),

Q('p-036', 'P3.4', 1, R`A car is travelling along a straight, level road at a constant velocity. The engine provides a driving force of 2000 N.

Which statement is correct?`, R`The resultant force on the car is 2000 N forwards.
The resultant force is zero, so the engine could be switched off without any change in motion.
The total resistive force must be less than 2000 N, otherwise the car would stop.
The car needs no resultant force because its weight balances the driving force.
The total resistive force on the car is 2000 N and the resultant force is zero.`, 'E', R`Constant velocity means zero acceleration, so by Newton's first law the resultant force is zero: the resistive forces must exactly balance the 2000 N driving force. (Switch the engine off and the resistive forces would decelerate the car.)

**Answer E.**`),

Q('p-037', 'P1.2', 2, R`A lamp rated "6.0 V, 3.0 W" is connected in series with a resistor $R$ to a 9.0 V supply of negligible internal resistance. The lamp works at its rated power.

What is $R$, and what power is dissipated in it?`, R`6.0 Ω and 3.0 W
12 Ω and 1.5 W
18 Ω and 4.5 W
3.0 Ω and 0.75 W
6.0 Ω and 1.5 W`, 'E', R`Lamp current $= \dfrac{P}{V} = \dfrac{3.0}{6.0} = 0.50$ A, and the resistor has $9.0 - 6.0 = 3.0$ V across it.

$R = \dfrac{3.0}{0.50} = 6.0\ \Omega$ and $P = 3.0 \times 0.50 = 1.5$ W. **Answer E.**`),

Q('p-038', 'P2.2', 1, R`Which change would **not** increase the strength of the magnetic field produced by a current-carrying solenoid?`, R`Increasing the current
Increasing the number of turns per metre
Putting an iron core inside the solenoid
Reversing the direction of the current
Replacing a steel core with an iron core of the same size`, 'D', R`Reversing the current reverses the direction of the field (the poles swap) but not its strength. More current, more turns per metre or a (soft) iron core all strengthen it; iron is magnetised more easily than steel.

**Answer D.**`),

Q('p-039', 'P3.2', 2, R`A box of weight 200 N rests on a slope. It does not move.

Which statement must be true?`, R`The resultant of the normal contact force and the friction force is 200 N vertically upwards.
The friction force on the box acts down the slope.
The normal contact force on the box is 200 N.
There is no friction force, because the box is not moving.
The friction force equals the weight of the box.`, 'A', R`The box is in equilibrium under three forces: weight, normal contact force and friction. So the normal force and friction together must exactly cancel the weight: 200 N vertically upwards.

The normal force alone is less than 200 N on a slope, and friction acts **up** the slope to stop it sliding down. **Answer A.**`),

Q('p-040', 'P6.1', 2, R`A water wave has a wavelength of 1.2 m. A cork floating on the water takes 0.50 s to move from its highest position to its lowest position.

What is the speed of the wave?`, R`0.30 m/s
0.60 m/s
1.2 m/s
1.8 m/s
2.4 m/s`, 'C', R`Highest to lowest is half an oscillation, so the period is $T = 1.0$ s and $f = 1.0$ Hz.

$v = f\lambda = 1.0 \times 1.2 = 1.2$ m/s. (Taking $T = 0.50$ s gives 2.4 m/s.)

**Answer C.**`),

Q('p-041', 'P7.1', 1, R`Which row describes the nucleus of an atom of $^{40}_{19}\text{K}$?`, R`21 protons and 19 neutrons
19 protons and 40 neutrons
19 protons, 21 neutrons and 19 electrons
19 protons and 21 neutrons
40 protons and 19 neutrons`, 'D', R`The lower number (atomic number) is the number of protons: 19. Neutrons $= 40 - 19 = 21$.

(Electrons are not in the nucleus.) **Answer D.**`),

Q('p-042', 'P2.1', 1, R`An unmagnetised iron nail is placed near the north pole of a bar magnet, without touching it. The nail is attracted to the magnet.

Which statement explains this?`, R`The nail is charged by the magnet and is attracted electrostatically.
The nail becomes an induced magnet with a north pole nearest the magnet's north pole.
The nail becomes a permanent magnet whose poles depend on how it is held.
Iron is a permanent magnet, so it always attracts magnets.
The nail becomes an induced magnet with a south pole nearest the magnet's north pole.`, 'E', R`The magnet induces magnetism in the soft iron: the end nearest the magnet's north pole becomes a south pole, and opposite poles attract. (That is why an unmagnetised piece of iron is attracted to either pole.)

**Answer E.**`),
  ]);
})();
