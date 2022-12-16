const max = 101
let p
const inset = {
  auto: 'auto',
  'full': '100%',
  '1/2': '50%',
  '0p5': '1px',
  '1.5': '3px',
  '1p5': '3px',
  '2p5':'5px',
  '3p5':'7px',
  '5p5':'11px',
  '12p5':'25px',
  '13p5':'27px',
  '28p5': '57px',
  '17p5':'35px',
  '30p5': '61px',
  '129': '129%',
  '111': '111px',
  '142': '284px',
  '162': '162px',
  '225': '225px',
  '235': '235px',
  '255': '255px',
  '258': '258px',
  '334': '334px',
  '370': '370px',
  '145p5': '291px',
  '295': '295px',
  '-56p5': '-113px',
  '-60p5': '-121px',
  '-104': '-208px',
  '-114': '-228px',
  '-119': '-238px',
  '-124': '-248px',
  '-142': '-284px',
  '-166': '-322px',
  '-173': '-346px',
  '-235': '-470px',
  '-327': '-654px',
  '-100-per': '-100%',
  '101per': '101%',
  '103per': '103%',
  '104per': '104%',
  '112per': '112%',
  '131p': '131%',
  '132per': '132%',
  '137per': '137%',
  '138per': '138%',
  '143per': '143%',
  '156per': '156%',
  '162per': '162%',
  '163per': '163%',
  '173per': '173%',
  '183per': '183%',
  '196per': '196%',
  '210per': '210%',
  '211per': '211%',
  '222per': '222%',
  '225per': '225%',
  '239per': '239%',
  '245per': '245%',
  '287per': '287%',
  '325per': '325%',
  '315per': '315%',
  '527per': '527%',
  '588per': '588%',
  '600per': '600%'
}

for (let i = 0; i < max; i++) {
  inset[i] = `${i * 2 }px`
  p = i + 'p'
  inset[p] = i + '%'
}
for (let i = -(max); i < 0; i++) {
  inset[i] = `${i * 2}px`
  p = i + 'p'
  inset[p] = i + '%'
}

module.exports = {
  inset
}
