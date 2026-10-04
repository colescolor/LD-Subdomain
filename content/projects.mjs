export const drawings = [
  {slug:'boat-table', title:'The boat table', code:'LD-SHOW-T1200', kind:'Furniture', parts:4, locks:8, pages:6, size:'1200 × 720 × 600 mm', description:'A curved top, two bases, one stretcher. A simple place to see the connection.', source:'Lockdowel-Showcase-1-Simple-Table.pdf'},
  {slug:'open-cubby', title:'The open cubby', code:'LD-SHOW-C600', kind:'Cabinetry', parts:4, locks:8, pages:6, size:'600 × 600 × 320 mm', description:'An open cabinet that brings the shelf-to-side connections into view.', source:'Lockdowel-Showcase-02-Open-Cubby.pdf'},
  {slug:'angled-table', title:'The angled table', code:'LD-SHOW-A1800', kind:'Furniture', parts:9, locks:32, pages:9, size:'1800 × 760 × 700 mm', description:'Splayed legs and paired shelves make a more intricate connection study.', source:'Lockdowel-Showcase-3-Angled-Table.pdf'}
];

// Hand-authored presentation content. Add reviewed, authorized project material here.
export const project = {
  slug:'boat-table', title:'A better connection, from the first drawing.',
  name:'Boat table / connection study', reference:'LD-SHOW-T1200', revision:'A',
  status:'Demonstration project',
  summary:'Four panels come together around eight concealed connections. Explore the idea, open the drawing, and see a separate connector demonstration—all in one place.',
  notes:[
    'The tabletop receives four connections from the two bases.',
    'The center stretcher carries two connections at each end.',
    'The exploded model separates the parts for inspection. It does not show the validated assembly sequence.',
    'The E3259BM film is a separate connector example. It does not establish hardware compatibility with this Mini-based drawing.'
  ]
};
