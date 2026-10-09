// ESAT module requirements by course, from the UAT-UK "Course List 2027 Entry" (updated April 2026).
// Always double-check your own course page before booking: module choices can't be changed after booking.
// modules: fixed list, or {fixed: [...], chooseFrom: [...], choose: n} when you pick some yourself.
(function () {
  const MP = ['maths1', 'maths2', 'physics'];
  const MCB = ['maths1', 'chemistry', 'biology'];
  const ANY2 = { fixed: ['maths1'], chooseFrom: ['biology', 'chemistry', 'physics', 'maths2'], choose: 2 };

  window.ESAT_COURSES = [
    { uni: 'University of Cambridge', courses: [
      { id: 'cam-eng', name: 'Engineering (H100)', modules: MP },
      { id: 'cam-cebt', name: 'Chemical Engineering and Biotechnology (H810)', modules: ANY2 },
      { id: 'cam-natsci', name: 'Natural Sciences (BCF0)', modules: ANY2 },
      { id: 'cam-vet', name: 'Veterinary Medicine (D100)', modules: ANY2 },
    ]},
    { uni: 'University of Oxford', courses: [
      { id: 'ox-engsci', name: 'Engineering Science (H100)', modules: MP },
      { id: 'ox-biomedeng', name: 'Biomedical Engineering (H811)', modules: MP },
      { id: 'ox-chemeng', name: 'Chemical Engineering (H800)', modules: MP },
      { id: 'ox-civil', name: 'Civil Engineering (H200)', modules: MP },
      { id: 'ox-elec', name: 'Electrical Engineering (H620)', modules: MP },
      { id: 'ox-info', name: 'Information Engineering (H630)', modules: MP },
      { id: 'ox-mech', name: 'Mechanical Engineering (H300)', modules: MP },
      { id: 'ox-physics', name: 'Physics (F303)', modules: MP },
      { id: 'ox-pp', name: 'Physics and Philosophy (VF53)', modules: MP },
      { id: 'ox-biomedsci', name: 'Biomedical Sciences (BC98)', modules: ANY2 },
    ]},
    { uni: 'Imperial College London', courses: [
      { id: 'ic-aero', name: 'Aeronautical Engineering (H401)', modules: MP },
      { id: 'ic-chemeng', name: 'Chemical Engineering (H801)', modules: ['maths1', 'maths2', 'chemistry'] },
      { id: 'ic-civil', name: 'Civil Engineering (H201/H202)', modules: MP },
      { id: 'ic-design', name: 'Design Engineering (28G3) – two modules only', modules: ['maths1', 'maths2'] },
      { id: 'ic-eee', name: 'Electrical & Electronic Engineering (H600/H604/H6N2)', modules: MP },
      { id: 'ic-eie', name: 'Electronic and Information Engineering (HG65/GH56)', modules: MP },
      { id: 'ic-mech', name: 'Mechanical Engineering (H301)', modules: MP },
      { id: 'ic-physics', name: 'Physics (F300/F303/F309/F325/F390)', modules: MP },
      { id: 'ic-biochem', name: 'Biochemistry (C700/C703 and language variants)', modules: MCB },
      { id: 'ic-biosci', name: 'Biological Sciences (C100/C103 and language variants)', modules: MCB },
      { id: 'ic-biotech', name: 'Biotechnology (J700/J703 and language variants)', modules: MCB },
      { id: 'ic-ecology', name: 'Ecology and Environmental Biology (C180)', modules: MCB },
      { id: 'ic-micro', name: 'Microbiology (C500)', modules: MCB },
    ]},
    { uni: 'UCL', courses: [
      { id: 'ucl-eee', name: 'Electronic and Electrical Engineering (H600/H601)', modules: ANY2 },
    ]},
    { uni: 'Other', courses: [
      { id: 'custom', name: 'Custom – choose my own modules', modules: ANY2 },
    ]},
  ];

  // The order modules appear in the real test.
  window.ESAT_MODULE_ORDER = ['maths1', 'biology', 'chemistry', 'physics', 'maths2'];
})();
