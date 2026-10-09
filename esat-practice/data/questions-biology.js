// Biology – original practice questions in the ESAT style (not official ESAT questions).
(function () {
  const R = String.raw;
  const Q = (id, spec, difficulty, stem, options, answer, solution) => ({ id, spec, difficulty, stem, options: options.split('\n').map((s) => s.trim()).filter(Boolean), answer, solution });
  window.ESAT_QUESTIONS = (window.ESAT_QUESTIONS || []).concat([

Q('b-001', 'B1.1', 1, R`Which of these structures are found in **both** a typical plant leaf cell and a typical animal cell?

1. cell wall
2. mitochondria
3. ribosomes
4. chloroplasts
5. cell membrane`, R`1 and 4 only
2 and 3 only
2, 3 and 5 only
1, 2, 3 and 5 only
2, 3, 4 and 5 only`, 'C', R`Both cell types have a nucleus, cytoplasm, cell membrane, mitochondria and ribosomes. Cell walls and chloroplasts are found in plant cells but not animal cells.

**Answer C.**`),

Q('b-002', 'B1.2', 1, R`Which structure is found in a typical bacterial cell but **not** in a typical animal cell?`, R`nucleus
mitochondrion
plasmid
ribosome
cell membrane`, 'C', R`Bacteria have no nucleus or mitochondria. Both bacteria and animal cells have ribosomes and a cell membrane. Plasmids (small extra rings of DNA) are found in bacteria but not animal cells.

**Answer C.**`),

Q('b-003', 'B2.1', 2, R`Cylinders of potato were weighed, left in sucrose solutions of different concentrations for an hour, and reweighed. The percentage change in mass was zero at a sucrose concentration of $0.30\ \text{mol dm}^{-3}$.

Which statement is correct?`, R`In $0.50\ \text{mol dm}^{-3}$ sucrose, the potato cells lose water by osmosis.
In $0.10\ \text{mol dm}^{-3}$ sucrose, the potato cylinders lose mass.
In pure water, the potato cells burst.
In $0.50\ \text{mol dm}^{-3}$ sucrose, sucrose molecules enter the cells by osmosis.
At $0.30\ \text{mol dm}^{-3}$, no water molecules move into or out of the cells.`, 'A', R`At 0.30 mol dm⁻³ the water potential of the solution equals that of the cells, so there is no **net** movement – water molecules still move in both directions. In 0.50 mol dm⁻³ the solution has a lower water potential, so water leaves the cells by osmosis.

Osmosis is the movement of water, not sucrose. In 0.10 mol dm⁻³ the cells gain water and mass, and in pure water plant cells swell but don't burst, thanks to the cell wall. **Answer A.**`),

Q('b-004', 'B2.1', 1, R`Which process requires energy from respiration?`, R`uptake of mineral ions into root hair cells from dilute soil water
osmosis of water into root hair cells
diffusion of oxygen into red blood cells in the lungs
movement of water out of a cell placed in concentrated salt solution
diffusion of carbon dioxide into a leaf through the stomata`, 'A', R`Taking up mineral ions from dilute soil water means moving them **against** a concentration gradient: active transport, which uses energy (ATP) from respiration. Diffusion and osmosis are passive.

**Answer A.**`),

Q('b-005', 'B3.1', 2, R`A human body cell (46 chromosomes) is at the end of interphase, about to start mitosis.

How many chromosomes and how many DNA molecules are in its nucleus, and how many chromosomes will each daughter cell have?`, R`46 chromosomes, 46 DNA molecules; daughters 23
46 chromosomes, 92 DNA molecules; daughters 46
92 chromosomes, 92 DNA molecules; daughters 46
46 chromosomes, 92 DNA molecules; daughters 23
23 chromosomes, 46 DNA molecules; daughters 23`, 'B', R`DNA is replicated during interphase, so each of the 46 chromosomes consists of two identical chromatids: 92 DNA molecules. Mitosis separates the chromatids, giving two genetically identical daughter cells with 46 chromosomes each.

**Answer B.**`),

Q('b-006', 'B3.2', 1, R`Which statements about meiosis in humans are correct?

1. It involves two divisions.
2. It produces four cells that are genetically different from each other.
3. The cells produced are diploid.
4. It occurs in the testes and ovaries.`, R`1 and 2 only
1, 2 and 4 only
2 and 3 only
3 and 4 only
1, 2, 3 and 4`, 'B', R`Meiosis has two divisions and produces four genetically different haploid cells (gametes), in the testes and ovaries. Statement 3 is wrong – gametes are haploid (23 chromosomes).

**Answer B.**`),

Q('b-007', 'B3.4', 2, R`A couple plan to have three children. Assume each child is equally likely to be a boy or a girl, independently.

What is the probability that they have exactly two girls?`, R`$\frac{1}{8}$
$\frac{1}{4}$
$\frac{1}{3}$
$\frac{3}{8}$
$\frac{1}{2}$
$\frac{2}{3}$`, 'D', R`Each child is XX or XY with probability $\frac{1}{2}$ (the father's sperm carries X or Y). The orders GGB, GBG and BGG each have probability $\left(\frac{1}{2}\right)^3 = \frac{1}{8}$.

Total $= \frac{3}{8}$. **Answer D.**`),

Q('b-008', 'B4.3', 2, R`In pea plants, the allele for tall stems (T) is dominant to the allele for short stems (t). Two heterozygous tall plants are crossed.

What fraction of the **tall** offspring would be expected to be heterozygous?`, R`$\frac{1}{4}$
$\frac{1}{3}$
$\frac{1}{2}$
$\frac{2}{3}$
$\frac{3}{4}$`, 'D', R`$\text{Tt} \times \text{Tt}$ gives TT : Tt : tt in the ratio 1 : 2 : 1.

The tall offspring are TT and Tt (3 parts), of which Tt is 2 parts: $\frac{2}{3}$. (The trap is answering $\frac{1}{2}$, the fraction of **all** offspring.)

**Answer D.**`),

Q('b-009', 'B4.3', 3, R`Cystic fibrosis is caused by a recessive allele of a single gene on an autosome. Two parents who do not have cystic fibrosis have a child who does.

What is the probability that their next child will be a boy **without** cystic fibrosis?`, R`$\frac{1}{8}$
$\frac{1}{4}$
$\frac{3}{8}$
$\frac{1}{2}$
$\frac{3}{4}$`, 'C', R`An affected child (ff) from unaffected parents means both parents are carriers (Ff).

$P(\text{not affected}) = \frac{3}{4}$ and $P(\text{boy}) = \frac{1}{2}$, independently (the gene is on an autosome).

$\frac{3}{4} \times \frac{1}{2} = \frac{3}{8}$. **Answer C.**`),

Q('b-010', 'B5.2', 1, R`A sample of double-stranded DNA contains 30% adenine.

What percentage of its bases are cytosine?`, R`20%
30%
35%
40%
70%`, 'A', R`A pairs with T, so T is also 30%, making 60% A + T. The remaining 40% is C + G, and C pairs with G, so C $= 20\%$.

**Answer A.**`),

Q('b-011', 'B5.3', 2, R`The coding region of an mRNA molecule, from the start codon to the stop codon inclusive, is 903 nucleotides long.

How many amino acids are in the polypeptide it codes for? (Assume no amino acids are removed after translation.)`, R`300
301
302
451
903`, 'A', R`903 nucleotides $= 301$ triplet codons. The final codon is the stop codon, which does not code for an amino acid, leaving 300.

**Answer A.**`),

Q('b-012', 'B5.4', 2, R`Which mutation in the coding region of a gene is most likely to have the **greatest** effect on the protein produced?`, R`insertion of one base near the start of the gene
deletion of one base just before the stop codon
insertion of three bases near the start of the gene
substitution of one base near the start of the gene
substitution of one base just before the stop codon`, 'A', R`Inserting a single base near the start shifts the reading frame for every following triplet (a frameshift), changing almost every amino acid after it. A substitution changes at most one triplet (and may not change the amino acid at all); three inserted bases add one amino acid but keep the frame; a change near the end affects only the last part.

**Answer A.**`),

Q('b-013', 'B5.3', 1, R`During protein synthesis, which statement is correct?`, R`The shape of a protein is determined by the order of its genes on the chromosome.
Each base in the gene codes for one amino acid.
Translation takes place in the nucleus.
Each gene codes for one specific type of carbohydrate.
The sequence of bases in the gene determines the sequence of amino acids, read three bases at a time.`, 'E', R`The base sequence is read in triplets, each coding for an amino acid; the amino acid sequence then determines how the protein folds into its 3D shape. Translation happens at ribosomes in the cytoplasm.

**Answer E.**`),

Q('b-014', 'B6.1', 2, R`Bacteria are genetically engineered to produce human insulin. The steps are listed below, out of order.

P. Insert the recombinant plasmid into a bacterium.
Q. Cut out the human insulin gene using an enzyme.
R. Grow the bacteria in a fermenter and extract the insulin.
S. Join the insulin gene into a bacterial plasmid that has been cut with the same enzyme.

What is the correct order?`, R`Q, P, S, R
Q, S, R, P
S, Q, P, R
P, Q, S, R
Q, S, P, R`, 'E', R`Cut the gene out (Q), insert it into a plasmid cut with the same enzyme so the ends match, sealing with ligase (S), put the plasmid into bacteria (P), then grow them and harvest the insulin (R).

**Answer E.**`),

Q('b-015', 'B6.2', 1, R`Which cells can develop into **any** type of cell, including the cells of the placenta?`, R`totipotent cells of a very early embryo
adult stem cells in bone marrow
meristem cells in a plant root tip
red blood cells
pluripotent cells of a blastocyst`, 'A', R`Totipotent cells (like the zygote and the first few cells of the embryo) can form every cell type, including the placenta. Pluripotent cells can form any body cell but not the placenta; adult stem cells are more limited still. Red blood cells don't divide at all.

**Answer A.**`),

Q('b-016', 'B7.1', 1, R`Which statement best explains how a population of bacteria becomes resistant to an antibiotic?`, R`Bacteria learn to avoid the antibiotic and pass this behaviour to their offspring.
The bacteria are damaged by the antibiotic and develop resistance so that they can survive.
The antibiotic causes the bacteria to mutate so that they become resistant.
The antibiotic kills all of the bacteria, so new resistant bacteria evolve.
A few bacteria already carry a mutation giving resistance; they survive the antibiotic, reproduce and pass on the allele.`, 'E', R`Natural selection: genetic variation (from random mutation) exists **before** the antibiotic is used. The antibiotic is the selection pressure – resistant bacteria survive and reproduce, so the resistance allele becomes more common. Organisms don't mutate "in order to" survive.

**Answer E.**`),

Q('b-017', 'B8.3', 1, R`An enzyme's rate of reaction increases with temperature up to 40 °C and then falls sharply.

Why does the rate fall above 40 °C?`, R`The active site changes shape so the substrate no longer fits.
The molecules have less kinetic energy, so there are fewer collisions.
The enzyme is used up in the reaction.
The substrate molecules are denatured.
The enzyme becomes more specific to its substrate.`, 'A', R`Above the optimum, bonds holding the enzyme's 3D shape break and the active site changes shape (the enzyme is denatured), so fewer enzyme–substrate complexes form. Particles have **more** kinetic energy at higher temperature, and enzymes are not used up.

**Answer A.**`),

Q('b-018', 'B8.2', 2, R`An enzyme-catalysed reaction is carried out with a high substrate concentration, so that every active site is occupied almost all the time.

Which change would increase the initial rate of reaction the most?`, R`doubling the substrate concentration
adding a second, different enzyme
lowering the temperature by 10 °C
doubling the enzyme concentration
halving the substrate concentration`, 'D', R`With every active site busy, the enzyme concentration is the limiting factor; adding more substrate has little effect. Doubling the enzyme doubles the number of active sites, roughly doubling the rate.

**Answer D.**`),

Q('b-019', 'B8.4', 1, R`Which row correctly matches a digestive enzyme with its substrate and product?`, R`protease: starch → amino acids
lipase: starch → glucose
amylase: protein → maltose
amylase: fats → fatty acids and glycerol
protease: protein → amino acids`, 'E', R`Amylase breaks starch into sugars (maltose), proteases break proteins into amino acids, and lipases break fats (lipids) into fatty acids and glycerol.

**Answer E.**`),

Q('b-020', 'B9.1', 1, R`Which is the word equation for anaerobic respiration in human muscle cells?`, R`glucose + oxygen → carbon dioxide + water
glucose → ethanol + carbon dioxide
lactic acid + oxygen → carbon dioxide + water
glucose → lactic acid
glucose → lactic acid + carbon dioxide`, 'D', R`In animal cells, anaerobic respiration converts glucose to lactic acid only. Ethanol + carbon dioxide is anaerobic respiration in yeast (and plants). The third equation is aerobic respiration.

**Answer D.**`),

Q('b-021', 'B9.2', 1, R`Which is the correct route for blood flowing from the vena cava to the aorta?`, R`left atrium → left ventricle → pulmonary vein → lungs → pulmonary artery → right atrium → right ventricle
right atrium → right ventricle → pulmonary vein → lungs → pulmonary artery → left atrium → left ventricle
right atrium → right ventricle → pulmonary artery → lungs → pulmonary vein → left atrium → left ventricle
right ventricle → right atrium → pulmonary artery → lungs → pulmonary vein → left ventricle → left atrium
left atrium → left ventricle → pulmonary artery → lungs → pulmonary vein → right atrium → right ventricle`, 'C', R`Deoxygenated blood returns via the vena cava to the right atrium, passes to the right ventricle, and is pumped through the pulmonary **artery** (arteries carry blood away from the heart) to the lungs. Oxygenated blood returns in the pulmonary vein to the left atrium, then the left ventricle, which pumps it into the aorta.

**Answer C.**`),

Q('b-022', 'B9.2', 1, R`What is the correct order of structures in a simple reflex arc?`, R`receptor → motor neurone → relay neurone → sensory neurone → effector
receptor → relay neurone → sensory neurone → motor neurone → effector
receptor → sensory neurone → motor neurone → relay neurone → effector
effector → sensory neurone → relay neurone → motor neurone → receptor
receptor → sensory neurone → relay neurone → motor neurone → effector`, 'E', R`A stimulus is detected by a receptor, an impulse passes along a sensory neurone to a relay neurone in the CNS (spinal cord), then along a motor neurone to an effector (muscle or gland).

**Answer E.**`),

Q('b-023', 'B9.3', 2, R`After a meal rich in carbohydrate, the blood glucose concentration of a healthy person rises.

Which sequence of events returns it to normal?`, R`The pancreas releases insulin; the liver converts glycogen into glucose.
The liver releases insulin; the pancreas stores glucose as glycogen.
The pancreas releases glucagon; the liver converts glycogen into glucose.
The pancreas releases insulin; liver and muscle cells take up glucose and the liver stores it as glycogen.
The adrenal glands release adrenaline; the liver stores glucose as glycogen.`, 'D', R`High blood glucose is detected by the pancreas, which secretes insulin. Insulin causes cells to take up glucose and the liver (and muscles) to convert it to glycogen. Glucagon does the opposite, raising blood glucose when it is too low.

**Answer D.**`),

Q('b-024', 'B9.4', 1, R`Which hormone, released by the pituitary gland, triggers ovulation in the menstrual cycle?`, R`insulin
progesterone
luteinising hormone (LH)
follicle-stimulating hormone (FSH)
oestrogen`, 'C', R`A surge of LH from the pituitary gland causes the release of an egg (ovulation) around the middle of the cycle. FSH stimulates follicle (egg) maturation; oestrogen and progesterone come from the ovaries.

**Answer C.**`),

Q('b-025', 'B9.5', 1, R`Why is a person who has been vaccinated against a disease less likely to become ill if they are later infected by the pathogen?`, R`The vaccine contains antibiotics that kill the pathogen when it enters.
Memory cells produce the specific antibodies faster and in larger amounts.
The vaccine contains antibodies that stay in the blood for life.
White blood cells produce antibodies that work against every pathogen.
The pathogen cannot enter the body of a vaccinated person.`, 'B', R`A vaccine contains antigens (e.g. dead or weakened pathogen) that stimulate lymphocytes to make specific antibodies and memory cells. On infection, the memory cells trigger a much faster and larger secondary response, destroying the pathogen before symptoms develop. Antibodies are specific to one antigen.

**Answer B.**`),

Q('b-026', 'B10.1', 1, R`In a food chain, the producers capture $20\,000\ \text{kJ m}^{-2}\,\text{year}^{-1}$ of energy. Assume 10% of the energy at each trophic level is passed on to the next level.

How much energy reaches the **tertiary** consumers?`, R`$2\ \text{kJ m}^{-2}\,\text{year}^{-1}$
$20\ \text{kJ m}^{-2}\,\text{year}^{-1}$
$200\ \text{kJ m}^{-2}\,\text{year}^{-1}$
$2000\ \text{kJ m}^{-2}\,\text{year}^{-1}$
$6000\ \text{kJ m}^{-2}\,\text{year}^{-1}$`, 'B', R`Producers → primary consumers: 2000; → secondary consumers: 200; → tertiary consumers: 20.

(Tertiary consumers are three steps from the producers.) **Answer B.**`),

Q('b-027', 'B10.3', 2, R`A field measures 50 m by 40 m. Ten quadrats, each 0.5 m by 0.5 m, are placed at random. A total of 30 daisy plants are counted in the ten quadrats.

What is the best estimate of the number of daisy plants in the field?`, R`600
6000
12 000
24 000
60 000`, 'D', R`Mean per quadrat $= 3$. Each quadrat is $0.25\ \text{m}^2$, so the density is $3 \div 0.25 = 12$ plants per m².

Field area $= 2000\ \text{m}^2$, so the estimate is $12 \times 2000 = 24\,000$.

(6000 forgets to scale the quadrat area to 1 m².) **Answer D.**`),

Q('b-028', 'B10.2', 1, R`Which process removes carbon dioxide from the atmosphere?`, R`decomposition by microorganisms
combustion of fossil fuels
photosynthesis
respiration
deforestation by burning`, 'C', R`Photosynthesis takes in CO₂ and fixes it as glucose. Respiration, combustion and decomposition all release CO₂, and burning forests releases it too (and removes the photosynthesising trees).

**Answer C.**`),

Q('b-029', 'B11.1', 2, R`At a high light intensity, increasing the light intensity further does not increase a plant's rate of photosynthesis, but increasing the carbon dioxide concentration does.

What was the limiting factor at the high light intensity?`, R`oxygen concentration
the amount of chlorophyll
carbon dioxide concentration
light intensity
water availability`, 'C', R`A limiting factor is the one in shortest supply: increasing it increases the rate. Since raising CO₂ increased the rate (and raising light did not), CO₂ concentration was limiting.

**Answer C.**`),

Q('b-030', 'B11.2', 1, R`Which change would **decrease** the rate of transpiration from a plant?`, R`an increase in temperature
an increase in light intensity
a decrease in air humidity
an increase in wind speed
an increase in air humidity`, 'E', R`Transpiration is evaporation of water from leaves and diffusion of the vapour out through the stomata. Humid air reduces the concentration gradient of water vapour, slowing it. Higher temperature, wind and light (stomata open) all speed it up.

**Answer E.**`),

Q('b-031', 'B7.2', 1, R`Which of these is an example of **continuous** variation in humans?`, R`blood group
height
whether earlobes are attached or free
ability to roll the tongue
biological sex`, 'B', R`Continuous variation can take any value in a range and is usually controlled by many genes plus the environment – like height or mass. The others fall into a few distinct categories (discontinuous variation).

**Answer B.**`),

Q('b-032', 'B1.3', 1, R`Which list is in order of increasing level of organisation?`, R`mesophyll tissue → palisade cell → leaf → shoot system
palisade cell → mesophyll tissue → leaf → shoot system
leaf → mesophyll tissue → palisade cell → shoot system
palisade cell → leaf → mesophyll tissue → shoot system
shoot system → leaf → mesophyll tissue → palisade cell`, 'B', R`Cells form tissues, tissues form organs and organs form organ systems: palisade cell → mesophyll tissue → leaf (an organ) → shoot system.

**Answer B.**`),

Q('b-033', 'B4.3', 3, R`In a family tree, two parents who both have a particular condition have a daughter who does not have it. The condition is controlled by a single gene on an autosome.

Which conclusion is correct?`, R`The allele causing the condition is dominant, and at least one parent is homozygous.
The allele causing the condition is recessive, and the daughter is a carrier.
It is not possible to say whether the allele is dominant or recessive.
The allele causing the condition is dominant, and both parents are heterozygous.
The allele causing the condition is recessive, and both parents are homozygous.`, 'D', R`If the condition were recessive, both affected parents would be homozygous recessive and **all** their children would be affected. So the allele must be dominant. For an unaffected (homozygous recessive) daughter, each parent must have passed on a recessive allele: both are heterozygous.

**Answer D.**`),

Q('b-034', 'B10.3', 2, R`Fertiliser runs off farmland into a lake. Which sequence describes the eutrophication that follows?`, R`algae die → bacteria release fertiliser → oxygen level rises → fish die from too much oxygen
algae grow rapidly → light is blocked and plants die → bacteria decompose dead matter using oxygen → oxygen level falls and fish die
fish die from fertiliser poisoning → algae grow on dead fish → oxygen level rises
plants absorb the fertiliser → plants photosynthesise more → oxygen level falls → fish die
bacteria grow rapidly → algae die → oxygen level rises → plants grow faster`, 'B', R`Nitrates and phosphates cause an algal bloom on the surface, blocking light from plants below, which die. Decomposing bacteria multiply and use up dissolved oxygen in respiration, so fish and other aerobic organisms die.

**Answer B.**`),

Q('b-035', 'B9.2', 2, R`Which statement about gas exchange in the human lungs is correct?`, R`Carbon dioxide diffuses from the alveoli into the blood.
The alveolar walls are thick to protect the capillaries.
Oxygen is actively transported from the alveoli into the blood.
Breathing in is caused by the diaphragm relaxing and moving upwards.
Oxygen diffuses from the alveoli into the blood because the alveoli have a higher concentration of oxygen than the blood arriving at the lungs.`, 'E', R`Blood arriving at the lungs is low in oxygen, so oxygen diffuses down its concentration gradient from the alveoli into the blood (CO₂ goes the other way). Alveolar walls are one cell thick for a short diffusion distance, and inhaling happens when the diaphragm **contracts** and flattens.

**Answer E.**`),
  ]);
})();
