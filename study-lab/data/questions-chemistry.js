// Chemistry – original practice questions in the ESAT style (not official ESAT questions).
(function () {
  const R = String.raw;
  const Q = (id, spec, difficulty, stem, options, answer, solution) => ({ id, spec, difficulty, stem, options: options.split('\n').map((s) => s.trim()).filter(Boolean), answer, solution });
  window.ESAT_QUESTIONS = (window.ESAT_QUESTIONS || []).concat([

Q('c-001', 'C1.3', 1, R`How many protons, neutrons and electrons are there in the ion $^{37}_{17}\text{Cl}^-$?`, R`17 protons, 20 neutrons, 18 electrons
18 protons, 19 neutrons, 17 electrons
20 protons, 17 neutrons, 18 electrons
17 protons, 20 neutrons, 16 electrons
17 protons, 37 neutrons, 18 electrons`, 'A', R`Atomic number 17 → 17 protons. Neutrons $= 37 - 17 = 20$. A 1− ion has one extra electron: $17 + 1 = 18$.

**Answer A.**`),

Q('c-002', 'C1.6', 2, R`Boron has two naturally occurring isotopes, $^{10}\text{B}$ and $^{11}\text{B}$. Its relative atomic mass is 10.8.

What percentage of boron atoms are $^{10}\text{B}$?`, R`8%
20%
25%
75%
80%`, 'B', R`Let $x\%$ be $^{10}\text{B}$: $\dfrac{10x + 11(100 - x)}{100} = 10.8$, so $1100 - x = 1080$ and $x = 20$.

(10.8 is much closer to 11, so most atoms must be $^{11}\text{B}$.) **Answer B.**`),

Q('c-003', 'C1.4', 1, R`Which of these species does **not** have the electron configuration 2,8,8?`, R`$\text{Ar}$
$\text{K}^+$
$\text{Ca}^{2+}$
$\text{S}^{2-}$
$\text{Na}^+$
$\text{Cl}^-$`, 'E', R`Ar has 18 electrons; K⁺ ($19 - 1$), Ca²⁺ ($20 - 2$), S²⁻ ($16 + 2$) and Cl⁻ ($17 + 1$) all have 18 too: 2,8,8.

Na⁺ has $11 - 1 = 10$ electrons: 2,8. **Answer E.**`),

Q('c-004', 'C2.4', 1, R`An element X forms an ion $\text{X}^{3+}$ that has 10 electrons.

In which group and period of the Periodic Table is X?`, R`Group 3, Period 2
Group 13, Period 2
Group 13, Period 3
Group 3, Period 3
Group 15, Period 2
Group 18, Period 2`, 'C', R`X has $10 + 3 = 13$ electrons: aluminium, configuration 2,8,3.

Three shells → Period 3. Three outer electrons in the p-block → Group 13 (IUPAC numbering 1–18). **Answer C.**`),

Q('c-005', 'C3.4', 2, R`Butane burns completely in oxygen:

$$\_\,\text{C}_4\text{H}_{10} + \_\,\text{O}_2 \rightarrow \_\,\text{CO}_2 + \_\,\text{H}_2\text{O}$$

When the equation is balanced using the smallest whole numbers, what is the sum of all four coefficients?`, R`13
17
21
29
33
37`, 'E', R`Per C₄H₁₀: 4 CO₂ and 5 H₂O, needing $4 + 2.5 = 6.5$ O₂. Doubling to clear the half:

$$2\text{C}_4\text{H}_{10} + 13\text{O}_2 \rightarrow 8\text{CO}_2 + 10\text{H}_2\text{O}$$

Sum $= 2 + 13 + 8 + 10 = 33$. **Answer E.**`),

Q('c-006', 'C3.4', 3, R`Acidified manganate(VII) ions oxidise iron(II) ions:

$$\text{MnO}_4^- + \_\,\text{H}^+ + \_\,\text{Fe}^{2+} \rightarrow \text{Mn}^{2+} + \_\,\text{Fe}^{3+} + \_\,\text{H}_2\text{O}$$

When the equation is balanced with one $\text{MnO}_4^-$, what are the coefficients of $\text{H}^+$ and $\text{Fe}^{2+}$?`, R`$\text{H}^+$: 4, $\text{Fe}^{2+}$: 5
$\text{H}^+$: 8, $\text{Fe}^{2+}$: 5
$\text{H}^+$: 8, $\text{Fe}^{2+}$: 1
$\text{H}^+$: 8, $\text{Fe}^{2+}$: 7
$\text{H}^+$: 16, $\text{Fe}^{2+}$: 5
$\text{H}^+$: 4, $\text{Fe}^{2+}$: 3`, 'B', R`Mn goes from +7 to +2, gaining 5 electrons, so 5 Fe²⁺ must each lose one.

The 4 O atoms in MnO₄⁻ become 4 H₂O, which needs 8 H⁺:

$$\text{MnO}_4^- + 8\text{H}^+ + 5\text{Fe}^{2+} \rightarrow \text{Mn}^{2+} + 5\text{Fe}^{3+} + 4\text{H}_2\text{O}$$

Charge check: left $-1 + 8 + 10 = +17$; right $+2 + 15 = +17$ ✓. **Answer B.**`),

Q('c-007', 'C4.2', 2, R`How many atoms in total are there in 9.0 g of water?

($A_r$: H = 1, O = 16; Avogadro constant $= 6.0 \times 10^{23}\ \text{mol}^{-1}$)`, R`$3.0 \times 10^{23}$
$6.0 \times 10^{23}$
$9.0 \times 10^{23}$
$1.8 \times 10^{24}$
$5.4 \times 10^{24}$`, 'C', R`$M_r(\text{H}_2\text{O}) = 18$, so 9.0 g is 0.50 mol of molecules. Each molecule has 3 atoms: 1.5 mol of atoms.

$1.5 \times 6.0 \times 10^{23} = 9.0 \times 10^{23}$. **Answer C.**`),

Q('c-008', 'C4.4', 1, R`What is the percentage by mass of nitrogen in ammonium nitrate, $\text{NH}_4\text{NO}_3$?

($A_r$: H = 1, N = 14, O = 16)`, R`17.5%
28%
35%
50%
70%`, 'C', R`$M_r = 14 + 4 + 14 + 48 = 80$. There are **two** N atoms: $28$.

$\dfrac{28}{80} \times 100 = 35\%$. (17.5% counts only one N.) **Answer C.**`),

Q('c-009', 'C4.5', 1, R`A compound contains 40.0% carbon, 6.7% hydrogen and 53.3% oxygen by mass. Its relative molecular mass is 180.

What is its molecular formula? ($A_r$: H = 1, C = 12, O = 16)`, R`$\text{CH}_2\text{O}$
$\text{C}_2\text{H}_4\text{O}_2$
$\text{C}_3\text{H}_6\text{O}_3$
$\text{C}_6\text{H}_{12}\text{O}_6$
$\text{C}_6\text{H}_6\text{O}_6$`, 'D', R`Moles in 100 g: C $\frac{40.0}{12} = 3.33$, H $\frac{6.7}{1} = 6.7$, O $\frac{53.3}{16} = 3.33$. Ratio $1 : 2 : 1$: empirical formula CH₂O ($M_r = 30$).

$180 \div 30 = 6$, so the molecular formula is C₆H₁₂O₆. **Answer D.**`),

Q('c-010', 'C4.6', 2, R`4.8 g of magnesium is added to a solution containing 0.30 mol of hydrochloric acid:

$$\text{Mg} + 2\text{HCl} \rightarrow \text{MgCl}_2 + \text{H}_2$$

What mass of hydrogen is produced? ($A_r$: H = 1, Mg = 24)`, R`0.15 g
0.20 g
0.30 g
0.40 g
0.60 g`, 'C', R`Mg: $\frac{4.8}{24} = 0.20$ mol, which would need 0.40 mol HCl. Only 0.30 mol is available, so HCl is limiting.

H₂ $= \frac{0.30}{2} = 0.15$ mol $= 0.15 \times 2 = 0.30$ g.

(0.40 g assumes Mg is limiting.) **Answer C.**`),

Q('c-011', 'C4.8', 1, R`What volume of carbon dioxide, measured at room temperature and pressure, is produced when 25 g of calcium carbonate is completely decomposed by heating?

$\text{CaCO}_3 \rightarrow \text{CaO} + \text{CO}_2$

($A_r$: C = 12, O = 16, Ca = 40; one mole of gas occupies 24 dm³ at rtp)`, R`2.4 dm³
6.0 dm³
12 dm³
24 dm³
60 dm³`, 'B', R`$M_r(\text{CaCO}_3) = 100$, so 25 g is 0.25 mol, giving 0.25 mol CO₂.

$0.25 \times 24 = 6.0\ \text{dm}^3$. **Answer B.**`),

Q('c-012', 'C4.10', 2, R`25.0 cm³ of sodium hydroxide solution is exactly neutralised by 20.0 cm³ of $0.150\ \text{mol dm}^{-3}$ sulfuric acid.

$$2\text{NaOH} + \text{H}_2\text{SO}_4 \rightarrow \text{Na}_2\text{SO}_4 + 2\text{H}_2\text{O}$$

What is the concentration of the sodium hydroxide solution?`, R`$0.060\ \text{mol dm}^{-3}$
$0.120\ \text{mol dm}^{-3}$
$0.188\ \text{mol dm}^{-3}$
$0.240\ \text{mol dm}^{-3}$
$0.375\ \text{mol dm}^{-3}$`, 'D', R`Moles of H₂SO₄ $= 0.150 \times 0.0200 = 0.00300$ mol, so NaOH $= 0.00600$ mol (2 : 1).

Concentration $= \dfrac{0.00600}{0.0250} = 0.240\ \text{mol dm}^{-3}$.

(0.120 ignores the 2 : 1 ratio.) **Answer D.**`),

Q('c-013', 'C4.9', 1, R`What volume of water must be added to 50 cm³ of $2.0\ \text{mol dm}^{-3}$ hydrochloric acid to dilute it to $0.50\ \text{mol dm}^{-3}$?`, R`100 cm³
150 cm³
200 cm³
250 cm³
400 cm³`, 'B', R`The moles of HCl stay the same, so the concentration falls by a factor of 4 when the volume rises by a factor of 4: final volume 200 cm³.

Water to add $= 200 - 50 = 150$ cm³. **Answer B.**`),

Q('c-014', 'C4.11', 2, R`Iron is extracted in a blast furnace:

$$\text{Fe}_2\text{O}_3 + 3\text{CO} \rightarrow 2\text{Fe} + 3\text{CO}_2$$

32 kg of iron(III) oxide produces 16.8 kg of iron. What is the percentage yield? ($A_r$: O = 16, Fe = 56)`, R`52.5%
70%
75%
80%
133%`, 'C', R`$M_r(\text{Fe}_2\text{O}_3) = 160$, so 32 kg is 200 mol, giving 400 mol Fe $= 400 \times 56 = 22\,400$ g $= 22.4$ kg.

Yield $= \dfrac{16.8}{22.4} \times 100 = 75\%$. (52.5% forgets the 2 Fe per Fe₂O₃.) **Answer C.**`),

Q('c-015', 'C4.7', 3, R`12 cm³ of a gaseous hydrocarbon reacts completely with exactly 60 cm³ of oxygen, producing 36 cm³ of carbon dioxide. All volumes are measured at the same temperature and pressure.

What is the formula of the hydrocarbon?`, R`$\text{C}_2\text{H}_6$
$\text{C}_3\text{H}_4$
$\text{C}_3\text{H}_6$
$\text{C}_3\text{H}_8$
$\text{C}_6\text{H}_{12}$`, 'D', R`Equal volumes of gas contain equal numbers of moles, so the reacting ratio is hydrocarbon : O₂ : CO₂ $= 12 : 60 : 36 = 1 : 5 : 3$.

$\text{C}_x\text{H}_y + \left(x + \frac{y}{4}\right)\text{O}_2 \rightarrow x\text{CO}_2 + \frac{y}{2}\text{H}_2\text{O}$: $x = 3$ and $x + \frac{y}{4} = 5$, so $y = 8$.

The hydrocarbon is C₃H₈. **Answer D.**`),

Q('c-016', 'C5.3', 2, R`What are the oxidation states of chromium in $\text{K}_2\text{Cr}_2\text{O}_7$ and of sulfur in $\text{Na}_2\text{S}_2\text{O}_3$?`, R`Cr: +6, S: +2
Cr: +3, S: +2
Cr: +12, S: +4
Cr: +7, S: +2
Cr: +6, S: +4
Cr: +6, S: +3`, 'A', R`K₂Cr₂O₇: $2(+1) + 2x + 7(-2) = 0 \Rightarrow x = +6$.

Na₂S₂O₃: $2(+1) + 2y + 3(-2) = 0 \Rightarrow y = +2$.

**Answer A.**`),

Q('c-017', 'C5.5', 2, R`Which of these reactions is a disproportionation?`, R`$\text{Cl}_2 + 2\text{NaOH} \rightarrow \text{NaCl} + \text{NaClO} + \text{H}_2\text{O}$
$2\text{Mg} + \text{O}_2 \rightarrow 2\text{MgO}$
$\text{HCl} + \text{NaOH} \rightarrow \text{NaCl} + \text{H}_2\text{O}$
$\text{CaCO}_3 \rightarrow \text{CaO} + \text{CO}_2$
$\text{Zn} + \text{CuSO}_4 \rightarrow \text{ZnSO}_4 + \text{Cu}$`, 'A', R`In disproportionation one element is simultaneously oxidised and reduced. In the first reaction chlorine goes from 0 (Cl₂) to −1 (NaCl) **and** to +1 (NaClO).

The zinc and magnesium reactions are ordinary redox (one species oxidised, a different one reduced); neutralisation and the decomposition of calcium carbonate involve no change in oxidation state. **Answer A.**`),

Q('c-018', 'C5.6', 1, R`Consider the reaction $2\text{Fe}^{3+} + 2\text{I}^- \rightarrow 2\text{Fe}^{2+} + \text{I}_2$.

Which statement is correct?`, R`$\text{Fe}^{3+}$ is the oxidising agent and $\text{I}^-$ is oxidised.
Neither species is oxidised; this is not a redox reaction.
$\text{I}^-$ is the oxidising agent and $\text{Fe}^{3+}$ is reduced.
$\text{I}^-$ is the reducing agent and $\text{Fe}^{3+}$ is oxidised.
$\text{Fe}^{3+}$ is the reducing agent and $\text{I}^-$ is reduced.`, 'A', R`Fe³⁺ gains an electron (reduced, +3 → +2), so it is the oxidising agent. I⁻ loses electrons (oxidised, −1 → 0), so it is the reducing agent.

**Answer A.**`),

Q('c-019', 'C6.7', 1, R`Substance X has a very high melting point. It does not conduct electricity when solid or when molten, and it is insoluble in water.

What could X be?`, R`sodium chloride
silicon dioxide
magnesium
sulfur
glucose
graphite`, 'B', R`A very high melting point suggests a giant structure. It isn't ionic (NaCl conducts when molten) or metallic (Mg conducts), and graphite conducts when solid. Silicon dioxide is giant covalent with no free charged particles.

Sulfur and glucose are simple molecular, with low melting points. **Answer B.**`),

Q('c-020', 'C6.4', 2, R`How many lone pairs of electrons are there in total in one molecule of nitrogen trifluoride, $\text{NF}_3$? (Count lone pairs on every atom.)`, R`1
3
9
10
12`, 'D', R`N (5 outer electrons) forms 3 bonds, leaving 1 lone pair. Each F (7 outer electrons) forms 1 bond, leaving 3 lone pairs: $3 \times 3 = 9$.

Total $= 1 + 9 = 10$. **Answer D.**`),

Q('c-021', 'C6.6', 1, R`Why do the boiling points of the alkanes increase as the carbon chain gets longer?`, R`Longer molecules have more covalent bonds to break when they boil.
The intermolecular forces between molecules get stronger.
Longer molecules form ionic bonds with each other.
The C–H bonds get stronger as the chain gets longer.
Longer molecules have stronger double bonds.`, 'B', R`Boiling a simple molecular substance separates whole molecules – no covalent bonds break. Bigger molecules have more electrons and more surface contact, so the intermolecular forces between them are stronger and more energy is needed.

**Answer B.**`),

Q('c-022', 'C7.3', 1, R`Which pair of substances would react when mixed?`, R`bromine water and potassium bromide solution
iodine solution and potassium chloride solution
bromine water and potassium chloride solution
iodine solution and potassium bromide solution
chlorine water and potassium bromide solution`, 'E', R`A more reactive halogen displaces a less reactive one from its salts. Reactivity decreases down Group 17: Cl > Br > I.

Only chlorine can displace bromide: $\text{Cl}_2 + 2\text{KBr} \rightarrow 2\text{KCl} + \text{Br}_2$ (the solution turns orange). **Answer E.**`),

Q('c-023', 'C7.2', 1, R`Rubidium is below potassium in Group 1.

Which prediction about rubidium is correct?`, R`It reacts with water more vigorously than potassium, forming an alkaline solution and hydrogen.
It reacts with water to produce oxygen.
It forms ions with a 2+ charge.
It has a higher melting point than potassium.
It reacts with water less vigorously than potassium, forming an acidic solution.`, 'A', R`Down Group 1 the outer electron is further from the nucleus and more shielded, so it is lost more easily: reactivity increases and melting point decreases. Group 1 metals form 1+ ions and react with water to give the hydroxide (alkaline) and hydrogen.

**Answer A.**`),

Q('c-024', 'C10.1', 1, R`Marble chips (calcium carbonate) react with excess dilute hydrochloric acid. The experiment is repeated with the same mass of marble, but as a fine powder.

What happens to the initial rate and to the total volume of carbon dioxide produced?`, R`Rate increases; total volume decreases.
Rate stays the same; total volume increases.
Rate decreases; total volume stays the same.
Rate increases; total volume increases.
Rate increases; total volume stays the same.`, 'E', R`Powder has a much larger surface area, so collisions with acid particles are more frequent and the rate increases. The amount of CaCO₃ (the limiting reactant, since acid is in excess) is unchanged, so the same total volume of CO₂ forms.

**Answer E.**`),

Q('c-025', 'C11.3', 2, R`For a reaction, the activation energy of the forward reaction is $+120\ \text{kJ mol}^{-1}$ and the enthalpy change is $-40\ \text{kJ mol}^{-1}$.

What is the activation energy of the reverse reaction?`, R`$40\ \text{kJ mol}^{-1}$
$80\ \text{kJ mol}^{-1}$
$120\ \text{kJ mol}^{-1}$
$160\ \text{kJ mol}^{-1}$
$200\ \text{kJ mol}^{-1}$`, 'D', R`On the energy level diagram the products are 40 kJ mol⁻¹ below the reactants, and the peak is 120 kJ mol⁻¹ above the reactants. So the peak is $120 + 40 = 160$ kJ mol⁻¹ above the products.

**Answer D.**`),

Q('c-026', 'C11.5', 2, R`Use the bond energies below to calculate the enthalpy change for the complete combustion of methane:

$$\text{CH}_4 + 2\text{O}_2 \rightarrow \text{CO}_2 + 2\text{H}_2\text{O}$$

| Bond | C–H | O=O | C=O | O–H |
|---|---|---|---|---|
| Bond energy / kJ mol⁻¹ | 413 | 498 | 805 | 464 |`, R`$-2648\ \text{kJ mol}^{-1}$
$-1110\ \text{kJ mol}^{-1}$
$-818\ \text{kJ mol}^{-1}$
$-409\ \text{kJ mol}^{-1}$
$+818\ \text{kJ mol}^{-1}$`, 'C', R`Bonds broken: $4(413) + 2(498) = 1652 + 996 = 2648$ kJ.

Bonds made: $2(805) + 4(464) = 1610 + 1856 = 3466$ kJ.

$\Delta H = 2648 - 3466 = -818$ kJ mol⁻¹ (more energy released making bonds, so exothermic). **Answer C.**`),

Q('c-027', 'C11.4', 2, R`0.64 g of methanol ($M_r = 32$) is burned. The heat released raises the temperature of 200 g of water by 12.5 °C.

Assuming all the heat goes into the water, what is the enthalpy change of combustion of methanol?

(Specific heat capacity of water $= 4.2\ \text{J g}^{-1}\,°\text{C}^{-1}$)`, R`$-10.5\ \text{kJ mol}^{-1}$
$-210\ \text{kJ mol}^{-1}$
$-262.5\ \text{kJ mol}^{-1}$
$-525\ \text{kJ mol}^{-1}$
$-1050\ \text{kJ mol}^{-1}$
$+525\ \text{kJ mol}^{-1}$`, 'D', R`Heat $= mc\Delta T = 200 \times 4.2 \times 12.5 = 10\,500$ J $= 10.5$ kJ.

Moles of methanol $= \frac{0.64}{32} = 0.020$ mol.

$\Delta H = -\dfrac{10.5}{0.020} = -525$ kJ mol⁻¹ (negative because heat is released). **Answer D.**`),

Q('c-028', 'C12.4', 1, R`Concentrated aqueous sodium chloride is electrolysed using inert electrodes.

What is formed at the cathode, at the anode, and what is left in solution?`, R`hydrogen; chlorine; sodium hydroxide
chlorine; hydrogen; sodium hydroxide
sodium; oxygen; hydrochloric acid
sodium; chlorine; water
hydrogen; oxygen; sodium chloride`, 'A', R`At the cathode, H⁺ (from water) is discharged rather than the much more reactive Na⁺: hydrogen. At the anode, concentrated Cl⁻ is discharged: chlorine. Na⁺ and OH⁻ remain, so the solution becomes sodium hydroxide.

**Answer A.**`),

Q('c-029', 'C12.5', 3, R`Aluminium is extracted by electrolysis of molten aluminium oxide. The electrode reactions are:

$$\text{Al}^{3+} + 3\text{e}^- \rightarrow \text{Al} \qquad 2\text{O}^{2-} \rightarrow \text{O}_2 + 4\text{e}^-$$

When 54 kg of aluminium is produced, how many moles of oxygen gas are formed? ($A_r$: Al = 27)`, R`1000 mol
1500 mol
2000 mol
3000 mol
6000 mol`, 'B', R`$54\,000 \div 27 = 2000$ mol Al, which needs $3 \times 2000 = 6000$ mol of electrons.

The same electrons are released at the anode: 4 electrons per O₂, so $6000 \div 4 = 1500$ mol O₂.

**Answer B.**`),

Q('c-030', 'C13.3', 1, R`Which of the following would decolourise bromine water?

1. propene, $\text{C}_3\text{H}_6$
2. propane, $\text{C}_3\text{H}_8$
3. ethanol, $\text{C}_2\text{H}_5\text{OH}$
4. but-1-ene, $\text{C}_4\text{H}_8$`, R`1 only
1 and 4 only
2 and 3 only
1, 3 and 4 only
1, 2, 3 and 4`, 'B', R`Bromine water is decolourised by C=C double bonds (an addition reaction). Propene and but-1-ene are alkenes; propane is a saturated alkane and ethanol has no C=C.

**Answer B.**`),

Q('c-031', 'C13.6', 2, R`Ethanoic acid reacts with excess ethanol to form the ester ethyl ethanoate, $\text{CH}_3\text{COOC}_2\text{H}_5$, and water.

What is the maximum mass of ester that can be made from 6.0 g of ethanoic acid?

($A_r$: H = 1, C = 12, O = 16)`, R`4.6 g
6.0 g
8.8 g
10.6 g
17.6 g`, 'C', R`$M_r(\text{CH}_3\text{COOH}) = 60$, so 6.0 g is 0.10 mol. The reaction is 1 : 1, giving 0.10 mol of ester.

$M_r(\text{CH}_3\text{COOC}_2\text{H}_5) = 4(12) + 8(1) + 2(16) = 88$, so 8.8 g. **Answer C.**`),

Q('c-032', 'C14.2', 2, R`Four metals W, X, Y and Z were tested with solutions of each other's sulfates.

- W reacts with $\text{XSO}_4$ solution.
- X reacts with $\text{YSO}_4$ solution.
- Y does not react with $\text{WSO}_4$ solution.
- Z reacts with $\text{WSO}_4$ solution.

What is the order of reactivity, most reactive first?`, R`W, Z, X, Y
Z, X, W, Y
Y, X, W, Z
W, X, Y, Z
Z, W, X, Y`, 'E', R`A metal displaces a less reactive metal from its salt.

W > X (W displaces X), X > Y, Z > W. Y not displacing W is consistent. So Z > W > X > Y.

**Answer E.**`),

Q('c-033', 'C16.2', 2, R`A white solid gives a lilac flame test. When its solution is acidified with dilute nitric acid and silver nitrate solution is added, a cream precipitate forms.

What is the solid?`, R`potassium bromide
potassium iodide
potassium chloride
lithium iodide
sodium bromide
calcium bromide`, 'A', R`A lilac flame shows potassium (Na is yellow-orange, Li crimson, Ca orange-red). With silver nitrate, chloride gives a white precipitate, bromide cream and iodide yellow.

So it is potassium bromide. **Answer A.**`),

Q('c-034', 'C9.1', 2, R`The pH of a solution of an acid changes from 2 to 5 when it is diluted.

By what factor has the concentration of $\text{H}^+(\text{aq})$ ions changed?`, R`It has decreased by a factor of 3.
It has decreased by a factor of 2.5.
It has decreased by a factor of 30.
It has decreased by a factor of 1000.
It has increased by a factor of 1000.`, 'D', R`Each increase of 1 in pH is a tenfold **decrease** in $[\text{H}^+]$. An increase of 3 means $10^3 = 1000$ times smaller.

**Answer D.**`),

Q('c-035', 'C3.5', 1, R`Ammonia is made in a reversible reaction:

$$\text{N}_2(\text{g}) + 3\text{H}_2(\text{g}) \rightleftharpoons 2\text{NH}_3(\text{g}) \qquad \Delta H = -92\ \text{kJ mol}^{-1}$$

What is the effect of increasing the temperature on the equilibrium yield of ammonia and on the rate of reaction?`, R`yield unchanged; rate increases
yield increases; rate increases
yield increases; rate decreases
yield decreases; rate decreases
yield decreases; rate increases`, 'E', R`The forward reaction is exothermic, so raising the temperature shifts the equilibrium to the left (the endothermic direction): lower yield. Higher temperature always increases the rate.

**Answer E.**`),

Q('c-036', 'C8.3', 1, R`Which method is most suitable for separating each mixture?

| | mixture |
|---|---|
| 1 | pure water from sea water |
| 2 | ethanol from a mixture of ethanol and water |
| 3 | sand from a mixture of sand and water |`, R`1 simple distillation, 2 fractional distillation, 3 filtration
1 simple distillation, 2 chromatography, 3 filtration
1 evaporation, 2 filtration, 3 chromatography
1 filtration, 2 fractional distillation, 3 simple distillation
1 fractional distillation, 2 simple distillation, 3 filtration`, 'A', R`Water can be boiled off sea water and condensed (simple distillation: the salt doesn't evaporate). Ethanol and water are miscible liquids with different boiling points: fractional distillation. Insoluble sand is removed by filtration.

**Answer A.**`),

Q('c-037', 'C17.3', 1, R`Which gas is produced by the incomplete combustion of fuels and is toxic because it reduces the blood's ability to carry oxygen?`, R`carbon dioxide
carbon monoxide
sulfur dioxide
nitrogen dioxide
methane`, 'B', R`Incomplete combustion (too little oxygen) produces carbon monoxide, which binds to haemoglobin in place of oxygen.

**Answer B.**`),

Q('c-038', 'C13.1', 2, R`How many structural isomers have the molecular formula $\text{C}_5\text{H}_{12}$?`, R`1
2
3
4
5`, 'C', R`Pentane (straight chain), 2-methylbutane and 2,2-dimethylpropane. (Drawing "3-methylbutane" or bending the chain gives the same molecules again.)

**Answer C.**`),

Q('c-039', 'C4.3', 2, R`Which sample contains the greatest number of molecules?

($A_r$: H = 1, C = 12, N = 14, O = 16)`, R`66 g of carbon dioxide, $\text{CO}_2$
17 g of ammonia, $\text{NH}_3$
48 g of oxygen gas, $\text{O}_2$
27 g of water, $\text{H}_2\text{O}$
4.0 g of hydrogen gas, $\text{H}_2$`, 'E', R`Equal numbers of moles mean equal numbers of molecules, so compare moles:

H₂ $4.0 \div 2 = 2.0$; O₂ $48 \div 32 = 1.5$; CO₂ $66 \div 44 = 1.5$; NH₃ $17 \div 17 = 1.0$; H₂O $27 \div 18 = 1.5$.

Despite having the smallest mass, the hydrogen sample has the most molecules, because H₂ molecules are so light. **Answer E.**`),
  ]);
})();
